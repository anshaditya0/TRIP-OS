/**
 * TRIP//OS Natural Disaster & Environmental Route Alert Service
 * Monitors and detects active natural hazards: landslides, heavy rains, flash floods, storms
 */

const { getWeather } = require("./weatherService");
const pool = require("../config/db");
const logger = require("../utils/logger");

// Hilly / Landslide prone states in India
const HILLY_STATES = ["Uttarakhand", "Himachal Pradesh", "Jammu and Kashmir", "Ladakh", "Sikkim", "Arunachal Pradesh", "Meghalaya"];

// Flood prone coastal & river basin states
const FLOOD_PRONE_STATES = ["Kerala", "Assam", "Bihar", "Odisha", "West Bengal", "Maharashtra"];

/**
 * Check natural disaster and weather hazards for a destination
 */
async function assessDisasterRisk(destinationName, state, latitude, longitude) {
    const liveWeather = await getWeather(latitude, longitude);
    const alerts = [];
    let overallRiskLevel = "LOW";

    const isHilly = HILLY_STATES.some(s => (state || "").toLowerCase().includes(s.toLowerCase()));
    const isFloodProne = FLOOD_PRONE_STATES.some(s => (state || "").toLowerCase().includes(s.toLowerCase()));

    // 1. Landslide Risk Evaluation (Hilly regions + Rain)
    if (isHilly && (liveWeather.isRaining || liveWeather.precipitationProbability > 60)) {
        overallRiskLevel = "HIGH";
        alerts.push({
            hazard: "LANDSLIDE_WARNING",
            severity: "HIGH",
            headline: `Elevated Landslide Risk in ${destinationName} Ghats`,
            description: `Heavy rainfall detected (${liveWeather.precipitationProbability}% precipitation). Mountain roads and ghat passes may experience active rockfalls or temporary blockages.`,
            recommendedAction: "Avoid driving after sunset. Keep Day 1/Day 2 schedules flexible and favor indoor activities.",
            source: "TRIP//OS Disaster Assessment Engine"
        });
    }

    // 2. Flash Flood / Waterbody Risk
    if (isFloodProne && liveWeather.precipitationProbability > 80) {
        overallRiskLevel = "HIGH";
        alerts.push({
            hazard: "FLASH_FLOOD_ADVISORY",
            severity: "HIGH",
            headline: `Waterbody Overflow Warning in ${destinationName}`,
            description: `Continuous rainfall may cause river currents and backwaters to surge. River rafting and boating operations may be restricted.`,
            recommendedAction: "Check with local authorities before heading near waterfalls or riverbanks.",
            source: "TRIP//OS Disaster Assessment Engine"
        });
    }

    // 3. Thunderstorm & High Wind Risk
    if (liveWeather.weatherCode === 95 || liveWeather.windSpeed > 45) {
        overallRiskLevel = "CRITICAL";
        alerts.push({
            hazard: "SEVERE_THUNDERSTORM",
            severity: "CRITICAL",
            headline: `Severe Thunderstorm & High Winds in ${destinationName}`,
            description: `Wind gusts exceeding ${liveWeather.windSpeed} km/h with active lightning. Outdoor ropeways, paragliding, and camping suspended.`,
            recommendedAction: "Seek shelter indoors. Delay outdoor treks until weather clears.",
            source: "Open-Meteo Live Signal"
        });
    }

    // 4. If weather is safe
    if (alerts.length === 0) {
        alerts.push({
            hazard: "NONE",
            severity: "LOW",
            headline: `Conditions Normal in ${destinationName}`,
            description: `Current temperature is ${liveWeather.temperature}°C with ${liveWeather.condition}. No natural disaster alerts active along major tourist routes.`,
            recommendedAction: "Proceed with scheduled itinerary as planned.",
            source: "TRIP//OS Live Monitoring"
        });
    }

    return {
        destination: destinationName,
        state,
        overallRiskLevel,
        liveWeather,
        activeAlertsCount: alerts.filter(a => a.hazard !== "NONE").length,
        alerts,
        assessedAt: new Date().toISOString()
    };
}

/**
 * Get active alerts for an entire trip (based on its destination and dates)
 */
async function getTripAlerts(tripId) {
    const tripRes = await pool.query(
        `SELECT t.*, i.destination_id, d.name as destination_name, d.state as destination_state, d.latitude, d.longitude
         FROM trips t
         LEFT JOIN itineraries i ON i.trip_id = t.id
         LEFT JOIN destinations d ON d.id = i.destination_id
         WHERE t.id = $1`,
        [tripId]
    );

    if (tripRes.rows.length === 0) {
        throw new Error("Trip not found");
    }

    const trip = tripRes.rows[0];
    const destName = trip.destination_name || trip.end_location || "Destination";
    const destState = trip.destination_state || "";
    const lat = trip.latitude || 28.6139;
    const lon = trip.longitude || 77.2090;

    const assessment = await assessDisasterRisk(destName, destState, lat, lon);

    // Also fetch logged user-reported disruptions
    const loggedDisruptions = await pool.query(
        `SELECT * FROM trip_disruptions WHERE trip_id = $1 ORDER BY created_at DESC LIMIT 5`,
        [tripId]
    );

    return {
        tripId,
        tripName: trip.name,
        startLocation: trip.start_location,
        destination: destName,
        startDate: trip.start_date,
        startTime: trip.start_time,
        environmentalAssessment: assessment,
        historicalDisruptions: loggedDisruptions.rows
    };
}

module.exports = {
    assessDisasterRisk,
    getTripAlerts
};
