const pool = require("../config/db");
const { replanItinerary } = require("../services/replanningEngine");
const { parseDisruptionAlert } = require("../services/geminiService");
const logger = require("../utils/logger");

/**
 * Report disruption (structured or raw text via AI/Gemini parser) & trigger replan
 */
const reportDisruption = async (req, res) => {
    try {
        const tripId = req.params.id;
        const { eventType, severity, dayNumber, description, rawAlertText } = req.body;

        let parsedEvent = {
            eventType: eventType || "WEATHER_ALERT",
            severity: severity || "HIGH",
            dayNumber: dayNumber || 1,
            description: description || "Reported disruption"
        };

        // If raw alert text was provided, parse with AI/rule parser
        if (rawAlertText) {
            const aiParsed = await parseDisruptionAlert(rawAlertText);
            parsedEvent.eventType = aiParsed.eventType;
            parsedEvent.severity = aiParsed.severity;
            parsedEvent.description = `${aiParsed.suggestedAction}: ${rawAlertText}`;
        }

        const replanResult = await replanItinerary(tripId, parsedEvent);

        res.status(200).json({
            message: "Disruption resolved and itinerary dynamically replanned 🚀",
            disruption: replanResult
        });

    } catch (err) {
        logger.error("Report disruption error:", err);
        res.status(500).json({ error: err.message || "Failed to process disruption" });
    }
};

/**
 * Simulate disruption for quick demos (e.g. rain, road block)
 */
const simulateDisruption = async (req, res) => {
    try {
        const tripId = req.params.id;
        const { scenario = "HEAVY_RAIN", dayNumber = 1 } = req.body;

        const disruptionData = {
            eventType: scenario,
            severity: "HIGH",
            dayNumber: Number(dayNumber),
            description: `Simulated ${scenario} alert on Day ${dayNumber}`
        };

        const replanResult = await replanItinerary(tripId, disruptionData);

        res.status(200).json({
            message: "Simulation executed: Itinerary repaired automatically 🚀",
            scenario,
            dayNumber,
            replanResult
        });

    } catch (err) {
        logger.error("Simulate disruption error:", err);
        res.status(500).json({ error: err.message || "Failed to simulate disruption" });
    }
};

const getTripDisruptions = async (req, res) => {
    try {
        const tripId = req.params.id;

        const result = await pool.query(
            `SELECT * FROM trip_disruptions WHERE trip_id = $1 ORDER BY created_at DESC`,
            [tripId]
        );

        res.json({
            tripId,
            count: result.rows.length,
            disruptions: result.rows
        });
    } catch (err) {
        logger.error("Get disruptions error:", err);
        res.status(500).json({ error: "Failed to get disruptions" });
    }
};

module.exports = {
    reportDisruption,
    simulateDisruption,
    getTripDisruptions
};
