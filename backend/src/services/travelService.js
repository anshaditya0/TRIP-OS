/**
 * TRIP//OS Step 6 — Travel Discovery & POI Service
 * Enables searching external locations & enriching destination activities
 */

const pool = require("../config/db");
const logger = require("../utils/logger");

/**
 * Search places externally or in local destinations cache
 */
async function searchDestinations(query) {
    if (!query || query.trim().length === 0) {
        return [];
    }

    const cleanQuery = query.trim().toLowerCase();

    // 1. First check local database cache
    try {
        const dbResult = await pool.query(
            `SELECT * FROM destinations
             WHERE LOWER(name) LIKE $1 OR LOWER(state) LIKE $1 OR LOWER(description) LIKE $1
             LIMIT 15`,
            [`%${cleanQuery}%`]
        );

        if (dbResult.rows.length > 0) {
            return dbResult.rows;
        }
    } catch (e) {
        logger.warn("DB search failed, falling back to external:", e.message);
    }

    // 2. Query Nominatim / OpenStreetMap for geolocation
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(url, {
            headers: { "User-Agent": "TripOS-Backend/1.0" },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const places = await res.json();
            return places.map((p, idx) => ({
                id: 1000 + idx,
                name: p.display_name.split(",")[0],
                state: p.address?.state || p.address?.country || "Global",
                country: p.address?.country || "Global",
                latitude: parseFloat(p.lat),
                longitude: parseFloat(p.lon),
                description: p.display_name,
                nature_score: 70,
                adventure_score: 65,
                food_score: 70,
                photography_score: 75,
                nightlife_score: 50,
                relaxation_score: 65,
                budget_score: 60,
                walking_requirement: 50,
                crowd_level: 50,
                source: "OPENSTREETMAP"
            }));
        }
    } catch (err) {
        logger.warn("External travel search failed:", err.message);
    }

    return [];
}

module.exports = {
    searchDestinations
};
