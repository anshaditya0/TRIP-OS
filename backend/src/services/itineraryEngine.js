/**
 * TRIP//OS Step 7 — Dynamic Itinerary Compiler Engine
 * Automatically generates, organizes, and manages day-by-day trip itineraries
 */

const pool = require("../config/db");
const logger = require("../utils/logger");
const { calculateTransitFatigue } = require("./journeyTimingService");

// Activity pool templates tailored to dimensions
const ACTIVITY_TEMPLATES = {
    nature: [
        { title: "Sunrise Viewpoint & Nature Walk", category: "NATURE", indoor_outdoor: "OUTDOOR", weather_dependent: true, walking_intensity: 60, cost: 200, durationHours: 2 },
        { title: "Forest Trail & Waterfall Hike", category: "NATURE", indoor_outdoor: "OUTDOOR", weather_dependent: true, walking_intensity: 75, cost: 300, durationHours: 3 },
        { title: "Botanical Garden & Eco Park Tour", category: "NATURE", indoor_outdoor: "OUTDOOR", weather_dependent: true, walking_intensity: 40, cost: 150, durationHours: 2 }
    ],
    adventure: [
        { title: "River Rafting & Cliff Jump", category: "ADVENTURE", indoor_outdoor: "OUTDOOR", weather_dependent: true, walking_intensity: 80, cost: 1200, durationHours: 3 },
        { title: "Zipline & Canopy High Ropes", category: "ADVENTURE", indoor_outdoor: "OUTDOOR", weather_dependent: true, walking_intensity: 70, cost: 900, durationHours: 2 },
        { title: "Mountain Bike Trail Ride", category: "ADVENTURE", indoor_outdoor: "OUTDOOR", weather_dependent: true, walking_intensity: 75, cost: 600, durationHours: 2.5 }
    ],
    food: [
        { title: "Old Market Heritage Street Food Crawl", category: "FOOD", indoor_outdoor: "INDOOR", weather_dependent: false, walking_intensity: 35, cost: 500, durationHours: 2 },
        { title: "Authentic Regional Cooking Experience", category: "FOOD", indoor_outdoor: "INDOOR", weather_dependent: false, walking_intensity: 15, cost: 800, durationHours: 2.5 },
        { title: "Scenic Rooftop Sunset Cafe", category: "FOOD", indoor_outdoor: "INDOOR", weather_dependent: false, walking_intensity: 10, cost: 600, durationHours: 2 }
    ],
    relaxation: [
        { title: "Ayurvedic Spa & Wellness Session", category: "RELAXATION", indoor_outdoor: "INDOOR", weather_dependent: false, walking_intensity: 5, cost: 1500, durationHours: 2 },
        { title: "Riverside Sunset Picnic & Hammocks", category: "RELAXATION", indoor_outdoor: "OUTDOOR", weather_dependent: true, walking_intensity: 20, cost: 250, durationHours: 2.5 },
        { title: "Leisurely Boardwalk Stroll", category: "RELAXATION", indoor_outdoor: "OUTDOOR", weather_dependent: false, walking_intensity: 30, cost: 100, durationHours: 1.5 }
    ],
    photography: [
        { title: "Golden Hour Monument Photography", category: "PHOTOGRAPHY", indoor_outdoor: "OUTDOOR", weather_dependent: true, walking_intensity: 45, cost: 150, durationHours: 2 },
        { title: "Valley Panorama & Suspension Bridge", category: "PHOTOGRAPHY", indoor_outdoor: "OUTDOOR", weather_dependent: true, walking_intensity: 50, cost: 200, durationHours: 2 }
    ],
    nightlife: [
        { title: "Live Music Club & Social Lounge", category: "NIGHTLIFE", indoor_outdoor: "INDOOR", weather_dependent: false, walking_intensity: 15, cost: 1000, durationHours: 3 },
        { title: "Bonfire, Acoustic Jam & Stargazing", category: "NIGHTLIFE", indoor_outdoor: "OUTDOOR", weather_dependent: true, walking_intensity: 10, cost: 400, durationHours: 2.5 }
    ],
    indoor_alternatives: [
        { title: "Art Gallery & Local Crafts Museum", category: "CULTURE", indoor_outdoor: "INDOOR", weather_dependent: false, walking_intensity: 25, cost: 250, durationHours: 2 },
        { title: "Indoor Board Game Lounge & Specialty Coffee", category: "RELAXATION", indoor_outdoor: "INDOOR", weather_dependent: false, walking_intensity: 5, cost: 350, durationHours: 2 },
        { title: "Heritage Palace & Indoor History Exhibit", category: "CULTURE", indoor_outdoor: "INDOOR", weather_dependent: false, walking_intensity: 30, cost: 400, durationHours: 2.5 }
    ]
};

/**
 * Generate a dynamic itinerary compiler
 */
/**
 * Generate a dynamic itinerary compiler
 * Supports Adaptive Fatigue Pacing for Day 1 based on transit duration & mode
 */
async function generateItinerary(tripId, destinationId, groupDNA, tripDetails, customOptions = {}) {
    const startDate = new Date(tripDetails.start_date || Date.now());
    const endDate = new Date(tripDetails.end_date || Date.now() + 2 * 24 * 60 * 60 * 1000);
    
    // Calculate total days (min 1, max 14)
    const diffTime = Math.abs(endDate - startDate);
    const dayCount = Math.max(1, Math.min(14, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1));

    // Determine top 2 preferences for the group
    const preferenceRanking = Object.entries(groupDNA)
        .filter(([k]) => !["budgetSensitivity", "walkingTolerance", "crowdTolerance"].includes(k))
        .sort((a, b) => b[1] - a[1]);

    const primaryVibe = preferenceRanking[0] ? preferenceRanking[0][0] : "nature";
    const secondaryVibe = preferenceRanking[1] ? preferenceRanking[1][0] : "food";

    // Transit Fatigue & Day 1 Pacing Analysis
    let fatigueProfile = customOptions.fatigueProfile;
    if (!fatigueProfile) {
        const mode = (tripDetails.transport_mode || "CAR").toUpperCase();
        const arrTime = tripDetails.start_time?.slice(0, 5) || "10:00";
        const arrHour = parseInt(arrTime.split(":")[0], 10);
        const estDuration = customOptions.travelDurationHours || (mode === "BUS" ? 11 : mode === "CAR" ? 9 : mode === "TRAIN" ? 12 : 2.5);
        
        fatigueProfile = calculateTransitFatigue({
            transportMode: mode,
            travelDurationHours: estDuration,
            targetArrivalTime: arrTime,
            depDayOffset: customOptions.depDayOffset !== undefined ? customOptions.depDayOffset : (arrHour < 8 ? -1 : 0),
            distanceKm: customOptions.distanceKm || 450
        });
    }

    // User manual pacing override if provided ('REST_MORNING', 'GENTLE_START', 'ENERGIZED')
    const activePacing = customOptions.pacingMode || fatigueProfile?.pacingMode || "ENERGIZED";

    // Create or find itinerary record in database
    const itinRes = await pool.query(
        `INSERT INTO itineraries (trip_id, destination_id, title, status, version)
         VALUES ($1, $2, $3, 'ACTIVE', 1)
         ON CONFLICT (trip_id)
         DO UPDATE SET
            destination_id = EXCLUDED.destination_id,
            version = itineraries.version + 1,
            updated_at = NOW()
         RETURNING *`,
        [tripId, destinationId, `${tripDetails.name} Itinerary`]
    );

    const itinerary = itinRes.rows[0];

    // Clean old days and activities for re-generation
    await pool.query(
        `DELETE FROM itinerary_days WHERE itinerary_id = $1`,
        [itinerary.id]
    );

    const createdDays = [];

    for (let dayNum = 1; dayNum <= dayCount; dayNum++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (dayNum - 1));
        const dateStr = currentDate.toISOString().split("T")[0];

        let daySummary = `Day ${dayNum}: ${primaryVibe.toUpperCase()} Discovery`;
        if (dayNum === 1) {
            if (activePacing === "DEEP_RECOVERY" || activePacing === "REST_MORNING") {
                daySummary = "Day 1: Arrival & Deep Recovery Window (Post-Transit Nap)";
            } else if (activePacing === "GENTLE_START") {
                daySummary = "Day 1: Arrival & Leisurely Orientation";
            } else {
                daySummary = "Day 1: Arrival & Welcome Vibe";
            }
        } else if (dayNum === dayCount) {
            daySummary = "Relaxation & Departure";
        }

        const dayRes = await pool.query(
            `INSERT INTO itinerary_days (itinerary_id, day_number, date, summary)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [itinerary.id, dayNum, dateStr, daySummary]
        );
        const dayRecord = dayRes.rows[0];

        // Slot Activities
        let morningActivity;
        let afternoonActivity;
        let eveningActivity;

        if (dayNum === 1) {
            if (activePacing === "DEEP_RECOVERY" || activePacing === "REST_MORNING") {
                // High Fatigue Day 1: Morning blocked for sleep & recovery buffer
                morningActivity = {
                    title: "🛏️ Arrival Recovery, Nap & Freshen Up",
                    category: "RELAXATION",
                    indoor_outdoor: "INDOOR",
                    weather_dependent: false,
                    walking_intensity: 0,
                    cost: 0,
                    start_time: "06:00",
                    end_time: "12:00"
                };
                afternoonActivity = {
                    title: "☕ Recovery Brunch & Relaxed Rooftop Orientation",
                    category: "FOOD",
                    indoor_outdoor: "INDOOR",
                    weather_dependent: false,
                    walking_intensity: 15,
                    cost: 400,
                    start_time: "12:30",
                    end_time: "15:30"
                };
                eveningActivity = {
                    title: "🌅 Sunset Lake Stroll & Gentle Welcome Dinner",
                    category: "RELAXATION",
                    indoor_outdoor: "OUTDOOR",
                    weather_dependent: false,
                    walking_intensity: 20,
                    cost: 500,
                    start_time: "17:30",
                    end_time: "20:30"
                };
            } else if (activePacing === "GENTLE_START") {
                // Moderate Fatigue Day 1: Late morning brunch, gentle exploration
                morningActivity = {
                    title: "🥐 Hotel Check-in, Refresh & Late Brunch",
                    category: "FOOD",
                    indoor_outdoor: "INDOOR",
                    weather_dependent: false,
                    walking_intensity: 10,
                    cost: 300,
                    start_time: "10:00",
                    end_time: "12:30"
                };
                afternoonActivity = (ACTIVITY_TEMPLATES[secondaryVibe] || ACTIVITY_TEMPLATES.food)[0];
                eveningActivity = (ACTIVITY_TEMPLATES.nightlife || ACTIVITY_TEMPLATES.relaxation)[0];
            } else {
                // Low Fatigue Day 1: Standard start
                morningActivity = {
                    title: "Check-in, Refresh & Local Orientation Walk",
                    category: "RELAXATION",
                    indoor_outdoor: "INDOOR",
                    weather_dependent: false,
                    walking_intensity: 15,
                    cost: 0,
                    start_time: "09:00",
                    end_time: "12:00"
                };
                afternoonActivity = (ACTIVITY_TEMPLATES[secondaryVibe] || ACTIVITY_TEMPLATES.food)[0];
                eveningActivity = (ACTIVITY_TEMPLATES.nightlife || ACTIVITY_TEMPLATES.relaxation)[0];
            }
        } else {
            // Days 2+ : Full energetic programming
            const cycleIndex = (dayNum - 2);
            morningActivity = (ACTIVITY_TEMPLATES[primaryVibe] || ACTIVITY_TEMPLATES.nature)[cycleIndex % (ACTIVITY_TEMPLATES[primaryVibe] || ACTIVITY_TEMPLATES.nature).length];
            afternoonActivity = (ACTIVITY_TEMPLATES[secondaryVibe] || ACTIVITY_TEMPLATES.food)[(dayNum - 1) % (ACTIVITY_TEMPLATES[secondaryVibe] || ACTIVITY_TEMPLATES.food).length];
            eveningActivity = dayNum === dayCount
                ? { title: "Souvenir Shopping & Farewell Dinner", category: "FOOD", indoor_outdoor: "INDOOR", weather_dependent: false, walking_intensity: 20, cost: 500, start_time: "18:00", end_time: "20:30" }
                : (ACTIVITY_TEMPLATES.nightlife || ACTIVITY_TEMPLATES.relaxation)[(dayNum - 1) % 2];
        }

        const activitiesToInsert = [
            { ...morningActivity, start_time: morningActivity.start_time || "09:00", end_time: morningActivity.end_time || "12:00", order_index: 1 },
            { ...afternoonActivity, start_time: afternoonActivity.start_time || "13:30", end_time: afternoonActivity.end_time || "16:30", order_index: 2 },
            { ...eveningActivity, start_time: eveningActivity.start_time || "18:00", end_time: eveningActivity.end_time || "21:00", order_index: 3 }
        ];

        const insertedActivities = [];
        for (const act of activitiesToInsert) {
            const actRes = await pool.query(
                `INSERT INTO itinerary_activities
                 (itinerary_day_id, title, category, indoor_outdoor, weather_dependent, walking_intensity, estimated_cost, start_time, end_time, order_index, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'SCHEDULED')
                 RETURNING *`,
                [
                    dayRecord.id,
                    act.title,
                    act.category,
                    act.indoor_outdoor,
                    act.weather_dependent || false,
                    act.walking_intensity || 30,
                    act.cost || act.estimated_cost || 0,
                    act.start_time,
                    act.end_time,
                    act.order_index
                ]
            );
            insertedActivities.push(actRes.rows[0]);
        }

        createdDays.push({
            ...dayRecord,
            activities: insertedActivities
        });
    }

    return {
        itinerary,
        days: createdDays,
        fatigueAnalysis: fatigueProfile,
        activePacing
    };
}

/**
 * Get full itinerary with days and activities
 */
async function getFullItinerary(tripId) {
    const itinRes = await pool.query(
        `SELECT * FROM itineraries WHERE trip_id = $1`,
        [tripId]
    );

    if (itinRes.rows.length === 0) return null;

    const itinerary = itinRes.rows[0];

    const daysRes = await pool.query(
        `SELECT * FROM itinerary_days
         WHERE itinerary_id = $1
         ORDER BY day_number ASC`,
        [itinerary.id]
    );

    const days = daysRes.rows;
    for (const day of days) {
        const actsRes = await pool.query(
            `SELECT * FROM itinerary_activities
             WHERE itinerary_day_id = $1
             ORDER BY order_index ASC, start_time ASC`,
            [day.id]
        );
        day.activities = actsRes.rows;
    }

    return {
        itinerary,
        days
    };
}

module.exports = {
    generateItinerary,
    getFullItinerary,
    ACTIVITY_TEMPLATES
};
