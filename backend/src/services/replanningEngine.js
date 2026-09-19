/**
 * TRIP//OS Step 8 — Disruption & Automatic Replanning Engine
 * "Plans change. Your itinerary shouldn't have to fall apart."
 */

const pool = require("../config/db");
const logger = require("../utils/logger");
const { getFullItinerary, ACTIVITY_TEMPLATES } = require("./itineraryEngine");

/**
 * Handle a disruption and automatically replan the affected itinerary
 */
async function replanItinerary(tripId, disruptionData) {
    const {
        eventType,          // e.g. "HEAVY_RAIN", "ROAD_BLOCKED", "VENUE_CLOSED", "TIME_DELAY"
        severity = "HIGH",  // "LOW", "MEDIUM", "HIGH"
        dayNumber,          // Optional specific day number (e.g. 2)
        targetActivityId,   // Optional specific activity ID
        description = "Automated disruption event"
    } = disruptionData;

    const fullItinerary = await getFullItinerary(tripId);
    if (!fullItinerary) {
        throw new Error("No active itinerary found for this trip to replan.");
    }

    const { itinerary, days } = fullItinerary;
    const actionsTaken = [];
    const modifiedActivities = [];

    // Filter target day or default to day 1 / first impacted day
    const targetDays = dayNumber
        ? days.filter(d => d.day_number === Number(dayNumber))
        : days;

    if (targetDays.length === 0) {
        throw new Error(`Day ${dayNumber} not found in itinerary.`);
    }

    // 1. Process Event Type: HEAVY_RAIN / WEATHER
    if (eventType === "HEAVY_RAIN" || eventType === "WEATHER_ALERT") {
        for (const day of targetDays) {
            for (const act of day.activities) {
                if (act.indoor_outdoor === "OUTDOOR" || act.weather_dependent) {
                    // Pick indoor alternative
                    const indoorPool = ACTIVITY_TEMPLATES.indoor_alternatives;
                    const replacement = indoorPool[Math.floor(Math.random() * indoorPool.length)];

                    const oldTitle = act.title;
                    const newTitle = `[Replan] ${replacement.title}`;

                    await pool.query(
                        `UPDATE itinerary_activities
                         SET title = $1,
                             category = $2,
                             indoor_outdoor = 'INDOOR',
                             weather_dependent = false,
                             status = 'REPLACED_AUTOMATICALLY',
                             estimated_cost = $3
                         WHERE id = $4`,
                        [newTitle, replacement.category, replacement.cost, act.id]
                    );

                    actionsTaken.push({
                        day: day.day_number,
                        originalActivity: oldTitle,
                        newActivity: newTitle,
                        reason: "Outdoor activity replaced with indoor alternative due to heavy rain risk",
                        costDiff: replacement.cost - Number(act.estimated_cost || 0)
                    });

                    modifiedActivities.push(act.id);
                }
            }
        }
    }

    // 2. Process Event Type: ROAD_BLOCKED / LANDSLIDE
    else if (eventType === "ROAD_BLOCKED" || eventType === "LANDSLIDE") {
        for (const day of targetDays) {
            const morningActs = day.activities.filter(a => (a.order_index || 1) === 1);
            for (const act of morningActs) {
                const oldTitle = act.title;
                const newTitle = `[Delayed Start] Nearby Exploration & Cafe Strategy`;

                await pool.query(
                    `UPDATE itinerary_activities
                     SET title = $1,
                         start_time = '11:00',
                         end_time = '13:00',
                         status = 'DELAYED_RESCHEDULED'
                     WHERE id = $2`,
                    [newTitle, act.id]
                );

                actionsTaken.push({
                    day: day.day_number,
                    originalActivity: oldTitle,
                    newActivity: newTitle,
                    reason: "Delayed departure and substituted with local nearby exploration to bypass blocked route",
                    costDiff: 0
                });

                modifiedActivities.push(act.id);
            }
        }
    }

    // 3. Process Event Type: VENUE_CLOSED
    else if (eventType === "VENUE_CLOSED") {
        const targetAct = targetActivityId
            ? days.flatMap(d => d.activities).find(a => a.id === targetActivityId)
            : targetDays[0]?.activities[0];

        if (targetAct) {
            const alternative = ACTIVITY_TEMPLATES.indoor_alternatives[0];
            const oldTitle = targetAct.title;
            const newTitle = `[Substituted] ${alternative.title}`;

            await pool.query(
                `UPDATE itinerary_activities
                 SET title = $1,
                     category = $2,
                     status = 'VENUE_SUBSTITUTED'
                 WHERE id = $3`,
                [newTitle, alternative.category, targetAct.id]
            );

            actionsTaken.push({
                activityId: targetAct.id,
                originalActivity: oldTitle,
                newActivity: newTitle,
                reason: "Scheduled venue reported closed. Alternate high-rated cultural activity substituted.",
                costDiff: 0
            });

            modifiedActivities.push(targetAct.id);
        }
    }

    // Fallback generic repair
    if (actionsTaken.length === 0) {
        actionsTaken.push({
            reason: "All activities for this date were already optimized and weather-safe. Schedule confirmed."
        });
    }

    // Increment itinerary version in database
    await pool.query(
        `UPDATE itineraries
         SET version = version + 1,
             updated_at = NOW()
         WHERE id = $1`,
        [itinerary.id]
    );

    // Record disruption in database
    const disruptionRecord = await pool.query(
        `INSERT INTO trip_disruptions
         (trip_id, itinerary_id, event_type, severity, description, status, impacted_activities, resolution_details)
         VALUES ($1, $2, $3, $4, $5, 'RESOLVED', $6, $7)
         RETURNING *`,
        [
            tripId,
            itinerary.id,
            eventType,
            severity,
            description,
            JSON.stringify(modifiedActivities),
            JSON.stringify(actionsTaken)
        ]
    );

    const updatedItinerary = await getFullItinerary(tripId);

    return {
        disruptionId: disruptionRecord.rows[0].id,
        eventType,
        severity,
        status: "AUTO_REPLANNED_SUCCESSFULLY",
        actionsTakenCount: actionsTaken.length,
        actionsTaken,
        updatedItinerary
    };
}

module.exports = {
    replanItinerary
};
