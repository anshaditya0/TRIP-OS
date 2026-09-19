/**
 * TRIP//OS AI Helper — Gemini & Rule-based Unstructured Disruption Parser
 * Converts news text, chat alerts, or weather warning strings into structured disruption events
 */

const env = require("../config/env");
const logger = require("../utils/logger");

/**
 * Parse an unstructured text alert into a structured disruption event
 */
async function parseDisruptionAlert(text) {
    if (!text || typeof text !== "string") {
        return {
            eventType: "WEATHER_ALERT",
            severity: "MEDIUM",
            location: "Destination",
            confidence: 0.5,
            suggestedAction: "Replan outdoor activities"
        };
    }

    const lower = text.toLowerCase();

    // 1. If Gemini API key is configured, can use Gemini models
    if (env.GEMINI_API_KEY) {
        try {
            const prompt = `Analyze this travel alert and return ONLY a JSON object with keys: eventType (one of HEAVY_RAIN, ROAD_BLOCKED, VENUE_CLOSED, TIME_DELAY), severity (LOW, MEDIUM, HIGH), and suggestedAction:\n\n"${text}"`;
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
            if (res.ok) {
                const data = await res.json();
                const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                const jsonMatch = replyText?.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            }
        } catch (e) {
            logger.warn("Gemini API call failed, using rule-based parser:", e.message);
        }
    }

    // 2. High-accuracy rule-based parser fallback
    let eventType = "WEATHER_ALERT";
    let severity = "MEDIUM";
    let suggestedAction = "Review itinerary";

    if (lower.includes("rain") || lower.includes("flood") || lower.includes("storm") || lower.includes("shower") || lower.includes("thunder")) {
        eventType = "HEAVY_RAIN";
        severity = lower.includes("heavy") || lower.includes("warning") ? "HIGH" : "MEDIUM";
        suggestedAction = "Swap outdoor adventures with indoor activities";
    } else if (lower.includes("landslide") || lower.includes("road block") || lower.includes("traffic") || lower.includes("highway closed")) {
        eventType = "ROAD_BLOCKED";
        severity = "HIGH";
        suggestedAction = "Delay morning departure and find alternate routes";
    } else if (lower.includes("closed") || lower.includes("renovation") || lower.includes("shut down") || lower.includes("strike")) {
        eventType = "VENUE_CLOSED";
        severity = "MEDIUM";
        suggestedAction = "Substitute venue with nearby recommended alternative";
    }

    return {
        eventType,
        severity,
        originalText: text,
        suggestedAction,
        parsedVia: "TRIP//OS Event Engine"
    };
}

module.exports = {
    parseDisruptionAlert
};
