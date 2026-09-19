/**
 * TRIP//OS Smart Journey Timing & Optimal Departure Engine
 * "The trip begins when you leave, not when you arrive."
 * Computes travel durations, traffic/weather buffers, and optimal time to begin journey.
 */

const pool = require("../config/db");
const { assessDisasterRisk } = require("./disasterAlertService");

// Approximate coordinates for major transit hubs / starting locations in India
const CITY_COORDINATES = {
    "delhi": { lat: 28.6139, lon: 77.2090 },
    "new delhi": { lat: 28.6139, lon: 77.2090 },
    "mumbai": { lat: 19.0760, lon: 72.8777 },
    "bengaluru": { lat: 12.9716, lon: 77.5946 },
    "bangalore": { lat: 12.9716, lon: 77.5946 },
    "hyderabad": { lat: 17.3850, lon: 78.4867 },
    "chennai": { lat: 13.0827, lon: 80.2707 },
    "kolkata": { lat: 22.5726, lon: 88.3639 },
    "pune": { lat: 18.5204, lon: 73.8567 },
    "ahmedabad": { lat: 23.0225, lon: 72.5714 },
    "jaipur": { lat: 26.9124, lon: 75.7873 },
    "chandigarh": { lat: 30.7333, lon: 76.7794 },
    "lucknow": { lat: 26.8467, lon: 80.9462 },
    "dehradun": { lat: 30.3165, lon: 78.0322 }
};

/**
 * Calculate Great Circle distance between two coordinates in kilometers (Haversine Formula)
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

/**
 * Determine coordinates for a city query
 */
function resolveCoords(cityName, fallbackLat, fallbackLon) {
    if (!cityName) return { lat: fallbackLat || 28.6139, lon: fallbackLon || 77.2090 };
    const lower = cityName.trim().toLowerCase();
    for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
        if (lower.includes(city)) return coords;
    }
    return { lat: fallbackLat || 28.6139, lon: fallbackLon || 77.2090 };
}

/**
 * Calculate comprehensive journey timing, optimal departure time, and buffers
 */
async function calculateJourneyTiming(tripId) {
    const tripRes = await pool.query(
        `SELECT t.*, i.destination_id, d.name as destination_name, d.state as destination_state, d.latitude as dest_lat, d.longitude as dest_lon
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
    const startLoc = trip.start_location || "Delhi";
    const destLoc = trip.destination_name || trip.end_location || "Destination";
    const transportMode = (trip.transport_mode || "CAR").toUpperCase();

    // Resolve starting and ending coordinates
    const startCoords = resolveCoords(startLoc, 28.6139, 77.2090);
    const endCoords = {
        lat: Number(trip.dest_lat || resolveCoords(destLoc).lat),
        lon: Number(trip.dest_lon || resolveCoords(destLoc).lon)
    };

    // Calculate aerial and driving road distance (typically aerial * 1.3 for winding roads)
    const aerialKm = calculateDistanceKm(startCoords.lat, startCoords.lon, endCoords.lat, endCoords.lon);
    const roadKm = Math.round(aerialKm * 1.3);

    // Calculate transit speeds & durations
    const transitModes = {
        "CAR": { speedKmh: 60, baseRestStopsMinutes: Math.floor(roadKm / 200) * 30 },
        "CAB": { speedKmh: 65, baseRestStopsMinutes: Math.floor(roadKm / 200) * 20 },
        "BUS": { speedKmh: 45, baseRestStopsMinutes: Math.floor(roadKm / 150) * 40 },
        "TRAIN": { speedKmh: 75, baseRestStopsMinutes: 0 },
        "FLIGHT": { speedKmh: 500, baseRestStopsMinutes: 120 } // includes airport security
    };

    const chosenMode = transitModes[transportMode] || transitModes.CAR;
    let travelDurationHours = transportMode === "FLIGHT"
        ? Number((aerialKm / chosenMode.speedKmh + 2).toFixed(1))
        : Number(((roadKm / chosenMode.speedKmh) + (chosenMode.baseRestStopsMinutes / 60)).toFixed(1));

    if (travelDurationHours < 1) travelDurationHours = 1;

    // Check hazard risks along destination to add safety buffer
    const riskAssessment = await assessDisasterRisk(destLoc, trip.destination_state, endCoords.lat, endCoords.lon);
    let riskBufferMinutes = 30; // standard traffic buffer

    if (riskAssessment.overallRiskLevel === "HIGH" || riskAssessment.overallRiskLevel === "CRITICAL") {
        riskBufferMinutes = 90; // extra 1.5 hr buffer for weather/landslide/waterlogging delays
    } else if (roadKm > 400) {
        riskBufferMinutes = 60;
    }

    // Determine target arrival time at destination:
    // If start_time in trip is set (e.g. 10:00 AM on start_date)
    const [targetHour, targetMin] = (trip.start_time || "10:00:00").split(":").map(Number);
    const totalMinutesNeeded = Math.round(travelDurationHours * 60) + riskBufferMinutes;

    // Calculate departure time by subtracting minutes from target arrival
    let depHour = targetHour - Math.floor(totalMinutesNeeded / 60);
    let depMin = targetMin - (totalMinutesNeeded % 60);

    let depDayOffset = 0;
    while (depMin < 0) {
        depMin += 60;
        depHour -= 1;
    }
    while (depHour < 0) {
        depHour += 24;
        depDayOffset -= 1;
    }

    const pad = (n) => String(n).padStart(2, "0");
    const departureTimeStr = `${pad(depHour)}:${pad(depMin)}`;

    const departureDate = new Date(trip.start_date);
    departureDate.setDate(departureDate.getDate() + depDayOffset);
    const departureDateStr = departureDate.toISOString().split("T")[0];

    const startDateStr = new Date(trip.start_date).toISOString().split("T")[0];

    const recommendationText = depDayOffset < 0
        ? `Night journey required: Depart ${startLoc} at ${departureTimeStr} on ${departureDateStr} (the previous evening) to arrive safely in ${destLoc} by ${trip.start_time.slice(0, 5)} on ${startDateStr}.`
        : `Optimal departure time: Leave ${startLoc} at ${departureTimeStr} on ${startDateStr} to beat highway traffic and reach ${destLoc} comfortably.`;

    // Compute Travel Fatigue Index (TFI) & Day 1 Recovery Window
    const fatigueAnalysis = calculateTransitFatigue({
        transportMode,
        travelDurationHours,
        departureTimeStr,
        targetArrivalTime: trip.start_time?.slice(0, 5) || "10:00",
        depDayOffset,
        distanceKm: roadKm
    });

    return {
        tripId,
        journey: {
            origin: startLoc,
            destination: destLoc,
            distanceRoadKm: roadKm,
            distanceAerialKm: aerialKm,
            transportMode
        },
        timing: {
            targetArrivalTime: trip.start_time?.slice(0, 5) || "10:00",
            targetArrivalDate: trip.start_date,
            estimatedTravelDurationHours: travelDurationHours,
            recommendedSafetyBufferMinutes: riskBufferMinutes,
            optimalDepartureTime: departureTimeStr,
            optimalDepartureDate: departureDateStr,
            depDayOffset
        },
        fatigueAnalysis,
        advice: {
            recommendation: recommendationText,
            trafficPeakWarning: (depHour >= 8 && depHour <= 10) || (depHour >= 17 && depHour <= 20)
                ? "Warning: Your departure falls during morning/evening city rush hours. Leaving 30 minutes earlier is strongly recommended."
                : "Good departure window: Low expected highway congestion.",
            weatherSafetyAdvice: riskAssessment.overallRiskLevel !== "LOW"
                ? `Route caution: ${riskAssessment.alerts[0]?.headline || "Hazard detected"}. Keep extra emergency fuel and tire chains for ghats.`
                : "Weather along the route is currently clear.",
            recoveryAdvice: fatigueAnalysis.day1MorningRecommendation
        },
        modeComparison: Object.keys(transitModes).map(mode => ({
            mode,
            durationHours: mode === "FLIGHT"
                ? Number((aerialKm / 500 + 2).toFixed(1))
                : Number(((roadKm / transitModes[mode].speedKmh) + (transitModes[mode].baseRestStopsMinutes / 60)).toFixed(1))
        }))
    };
}

/**
 * Step 3.5 — Calculate Transit Fatigue Index (TFI) & Day 1 Recovery Pacing
 * Prevents Day 1 burnout by computing physical exhaustion from transit mode and duration.
 */
function calculateTransitFatigue({ transportMode = "CAR", travelDurationHours = 4, departureTimeStr = "08:00", targetArrivalTime = "12:00", depDayOffset = 0, distanceKm = 300 }) {
    const modeUpper = (transportMode || "CAR").toUpperCase();

    // Mode strain multipliers reflecting physical stress & vibration
    const modeMultipliers = {
        "BUS": 1.45,   // Highest vibration, rigid seats, motion sickness risk
        "CAR": 1.25,   // Driver exhaustion, sitting stiffness
        "CAB": 1.15,   // Moderate road stress
        "TRAIN": 0.70, // Berths allow sleeping flat, freedom to walk
        "FLIGHT": 0.40 // Fast transit, primarily airport security friction
    };

    const multiplier = modeMultipliers[modeUpper] || 1.2;

    // Overnight / Red-eye penalty
    const isOvernight = depDayOffset < 0;
    const arrHour = parseInt(targetArrivalTime.split(":")[0], 10) || 10;
    const arrivesEarlyMorning = arrHour >= 3 && arrHour <= 8;

    let overnightPenalty = 0;
    if (isOvernight || arrivesEarlyMorning) {
        overnightPenalty = (modeUpper === "TRAIN") ? 12 : 25; // Train berths accommodate sleep better than buses/cars
    }

    // Long distance physical strain factor
    let distanceFactor = 0;
    if (distanceKm > 750) distanceFactor = 15;
    else if (distanceKm > 400) distanceFactor = 8;

    // Base score calculation: duration * 4.5 * multiplier + penalties
    const rawScore = (travelDurationHours * 4.5 * multiplier) + overnightPenalty + distanceFactor;
    const fatigueScore = Math.min(100, Math.max(5, Math.round(rawScore)));

    let fatigueLevel = "LOW";
    let recoveryWindowHours = 1.0;
    let suggestedFirstActivityTime = "09:30";
    let pacingMode = "ENERGIZED";
    let day1MorningRecommendation = "Fresh arrival: The group is energized for full morning sightseeing and activities.";

    if (fatigueScore >= 70) {
        fatigueLevel = "EXTREME";
        recoveryWindowHours = 4.5;
        suggestedFirstActivityTime = arrivesEarlyMorning ? "12:00" : "13:30";
        pacingMode = "DEEP_RECOVERY";
        day1MorningRecommendation = `Heavy travel exhaustion detected (${travelDurationHours}h by ${modeUpper}). Arriving around ${targetArrivalTime} requires a mandatory hotel nap buffer. Day 1 morning is reserved for rest; first exploration starts at ${suggestedFirstActivityTime}.`;
    } else if (fatigueScore >= 45) {
        fatigueLevel = "MODERATE";
        recoveryWindowHours = 2.5;
        suggestedFirstActivityTime = "11:00";
        pacingMode = "GENTLE_START";
        day1MorningRecommendation = `Moderate transit fatigue (${travelDurationHours}h by ${modeUpper}). Leisurely start with brunch or relaxed cafe orientation around ${suggestedFirstActivityTime}. High-exertion treks are deferred to Day 2.`;
    }

    return {
        fatigueScore,
        fatigueLevel,
        pacingMode,
        recoveryWindowHours,
        suggestedFirstActivityTime,
        isOvernightJourney: isOvernight || arrivesEarlyMorning,
        metrics: {
            durationHours: travelDurationHours,
            transportMode: modeUpper,
            distanceKm,
            modeMultiplier: multiplier,
            overnightPenalty
        },
        day1MorningRecommendation
    };
}

module.exports = {
    calculateJourneyTiming,
    calculateTransitFatigue,
    calculateDistanceKm
};
