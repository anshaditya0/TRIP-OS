const pool = require("../config/db");
const { generateItinerary, getFullItinerary } = require("../services/itineraryEngine");
const { calculateGroupDNA } = require("../services/scoringEngine");
const { calculateJourneyTiming } = require("../services/journeyTimingService");
const logger = require("../utils/logger");

const createOrGenerateItinerary = async (req, res) => {
    try {
        const tripId = req.params.id;
        const { destinationId, pacingMode, travelDurationHours, fatigueOverride } = req.body;

        // 1. Verify trip exists
        const tripRes = await pool.query("SELECT * FROM trips WHERE id = $1", [tripId]);
        if (tripRes.rows.length === 0) {
            return res.status(404).json({ error: "Trip not found" });
        }
        const trip = tripRes.rows[0];

        // 2. Fetch Group DNA
        const prefRes = await pool.query(
            `SELECT p.* FROM preferences p
             JOIN trip_members tm ON tm.trip_id = p.trip_id AND tm.user_id = p.user_id
             WHERE p.trip_id = $1 AND tm.status = 'APPROVED'`,
            [tripId]
        );

        let groupDNA = { nature: 70, adventure: 70, food: 70, photography: 70, relaxation: 70, nightlife: 50 };
        if (prefRes.rows.length > 0) {
            groupDNA = calculateGroupDNA(prefRes.rows).rounded;
        }

        // 3. Attempt to fetch Journey Timing & Travel Fatigue Index
        let fatigueProfile = fatigueOverride || null;
        if (!fatigueProfile) {
            try {
                const timingData = await calculateJourneyTiming(tripId);
                if (timingData && timingData.fatigueAnalysis) {
                    fatigueProfile = timingData.fatigueAnalysis;
                }
            } catch (timingErr) {
                logger.warn("Could not auto-calculate journey timing for trip, will use default estimates:", timingErr.message);
            }
        }

        const generated = await generateItinerary(tripId, destinationId || null, groupDNA, trip, {
            fatigueProfile,
            pacingMode,
            travelDurationHours
        });

        res.status(201).json({
            message: "Dynamic itinerary generated successfully 🚀",
            itinerary: generated.itinerary,
            days: generated.days,
            fatigueAnalysis: generated.fatigueAnalysis,
            activePacing: generated.activePacing
        });

    } catch (err) {
        logger.error("Generate itinerary error:", err);
        res.status(500).json({ error: "Failed to generate dynamic itinerary" });
    }
};

const getItinerary = async (req, res) => {
    try {
        const tripId = req.params.id;
        const itinerary = await getFullItinerary(tripId);

        if (!itinerary) {
            return res.status(404).json({
                error: "No active itinerary found for this trip. Generate one using POST /api/trips/:id/itinerary/generate"
            });
        }

        res.json(itinerary);
    } catch (err) {
        logger.error("Get itinerary error:", err);
        res.status(500).json({ error: "Failed to retrieve itinerary" });
    }
};

const addCustomActivity = async (req, res) => {
    try {
        const { dayId, title, category, indoorOutdoor, start_time, end_time, estimated_cost } = req.body;

        if (!dayId || !title) {
            return res.status(400).json({ error: "dayId and title are required" });
        }

        const result = await pool.query(
            `INSERT INTO itinerary_activities
             (itinerary_day_id, title, category, indoor_outdoor, start_time, end_time, estimated_cost, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'CUSTOM_ADDED')
             RETURNING *`,
            [dayId, title, category || "CUSTOM", indoorOutdoor || "INDOOR", start_time || "14:00", end_time || "16:00", estimated_cost || 0]
        );

        res.status(201).json({
            message: "Activity added successfully 🚀",
            activity: result.rows[0]
        });
    } catch (err) {
        logger.error("Add activity error:", err);
        res.status(500).json({ error: "Failed to add activity" });
    }
};

const updateActivity = async (req, res) => {
    try {
        const { activityId } = req.params;
        const { title, start_time, end_time, status, estimated_cost } = req.body;

        const result = await pool.query(
            `UPDATE itinerary_activities
             SET
                title = COALESCE($1, title),
                start_time = COALESCE($2, start_time),
                end_time = COALESCE($3, end_time),
                status = COALESCE($4, status),
                estimated_cost = COALESCE($5, estimated_cost)
             WHERE id = $6
             RETURNING *`,
            [title, start_time, end_time, status, estimated_cost, activityId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Activity not found" });
        }

        res.json({
            message: "Activity updated successfully 🚀",
            activity: result.rows[0]
        });
    } catch (err) {
        logger.error("Update activity error:", err);
        res.status(500).json({ error: "Failed to update activity" });
    }
};

const deleteActivity = async (req, res) => {
    try {
        const { activityId } = req.params;

        const result = await pool.query(
            `DELETE FROM itinerary_activities WHERE id = $1 RETURNING *`,
            [activityId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Activity not found" });
        }

        res.json({
            message: "Activity removed from itinerary 🚀"
        });
    } catch (err) {
        logger.error("Delete activity error:", err);
        res.status(500).json({ error: "Failed to delete activity" });
    }
};

/**
 * Get Offbeat / Hidden Gem alternatives for this trip's destination
 */
const getOffbeatAlternatives = async (req, res) => {
    try {
        const tripId = req.params.id;
        const { maxCrowd = 35 } = req.query;

        const itinRes = await pool.query("SELECT * FROM itineraries WHERE trip_id = $1", [tripId]);
        let destinationId = itinRes.rows.length > 0 ? itinRes.rows[0].destination_id : 1;

        const { getHiddenGemsForDestination } = require("../services/hiddenGemsService");
        const gems = await getHiddenGemsForDestination(destinationId, { maxCrowd });

        res.json({
            tripId,
            destinationId,
            ...gems
        });
    } catch (err) {
        logger.error("Get offbeat alternatives error:", err);
        res.status(500).json({ error: "Failed to fetch offbeat alternatives: " + err.message });
    }
};

module.exports = {
    createOrGenerateItinerary,
    getItinerary,
    addCustomActivity,
    updateActivity,
    deleteActivity,
    getOffbeatAlternatives
};
