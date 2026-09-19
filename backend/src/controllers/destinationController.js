const pool = require("../config/db");
const { calculateGroupDNA, rankDestinations } = require("../services/scoringEngine");
const { getWeather } = require("../services/weatherService");
const { searchDestinations } = require("../services/travelService");
const { assessDisasterRisk } = require("../services/disasterAlertService");
const { getHiddenGemsForDestination } = require("../services/hiddenGemsService");
const { INDIAN_TOURIST_CITIES } = require("../data/indianTouristCities");
const logger = require("../utils/logger");

/**
 * Step 5D — Explainable Recommendations Endpoint
 */
const getRecommendations = async (req, res) => {
    try {
        const tripId = req.params.id;

        // 1. Check approved member
        const memberCheck = await pool.query(
            `SELECT id FROM trip_members WHERE trip_id = $1 AND user_id = $2 AND status = 'APPROVED'`,
            [tripId, req.user.id]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({
                error: "You must be an approved trip member"
            });
        }

        // 2. Get approved members' preferences
        const prefRes = await pool.query(
            `SELECT p.*
             FROM preferences p
             JOIN trip_members tm ON tm.trip_id = p.trip_id AND tm.user_id = p.user_id
             WHERE p.trip_id = $1 AND tm.status = 'APPROVED'`,
            [tripId]
        );

        if (prefRes.rows.length === 0) {
            return res.status(400).json({
                error: "No Vibe Profiles found for this trip. Have members submit preferences first."
            });
        }

        // 3. Calculate Group DNA
        const dnaCalc = calculateGroupDNA(prefRes.rows);
        const dna = dnaCalc.raw;

        // 4. Get approved members' constraints
        const constRes = await pool.query(
            `SELECT c.*
             FROM constraints c
             JOIN trip_members tm ON tm.trip_id = c.trip_id AND tm.user_id = c.user_id
             WHERE c.trip_id = $1 AND tm.status = 'APPROVED'`,
            [tripId]
        );

        const constraints = constRes.rows;

        // 5. Get destinations (from DB or fallback to Indian tourist cities dataset)
        let destinations = [];
        try {
            const destRes = await pool.query(`SELECT * FROM destinations ORDER BY id`);
            destinations = destRes.rows;
        } catch (e) {
            logger.warn("DB destinations query failed, using in-memory dataset:", e.message);
        }

        if (destinations.length < 20) {
            // Combine with comprehensive dataset
            const existingNames = new Set(destinations.map(d => d.name.toLowerCase()));
            const missing = INDIAN_TOURIST_CITIES.filter(c => !existingNames.has(c.name.toLowerCase()));
            destinations = [...destinations, ...missing.map((c, i) => ({ id: 100 + i, ...c }))];
        }

        // 6. Step 5D: Score, explain, and rank destinations
        const recommendations = rankDestinations(destinations, dna, constraints);

        res.json({
            tripId,
            memberCount: prefRes.rows.length,
            groupDNA: dnaCalc.rounded,
            totalDestinations: recommendations.length,
            recommendedCount: recommendations.filter(d => d.status === "RECOMMENDED").length,
            rejectedCount: recommendations.filter(d => d.status === "REJECTED").length,
            recommendations
        });

    } catch (error) {
        logger.error("Step 5D recommendation error:", error);
        res.status(500).json({
            error: "Failed to generate recommendations"
        });
    }
};

/**
 * Get all popular Indian tourist cities with filtering
 */
const getIndianTouristCities = async (req, res) => {
    try {
        const { state, tag, vibe, maxCrowd, minBudget } = req.query;

        let list = [...INDIAN_TOURIST_CITIES];

        // Filter by state
        if (state) {
            list = list.filter(c => c.state.toLowerCase().includes(state.toLowerCase()));
        }

        // Filter by tag
        if (tag) {
            list = list.filter(c => c.tags.toLowerCase().includes(tag.toLowerCase()));
        }

        // Filter by vibe
        if (vibe) {
            const v = vibe.toLowerCase();
            if (v === "nature") list = list.filter(c => c.nature_score >= 80);
            if (v === "adventure") list = list.filter(c => c.adventure_score >= 80);
            if (v === "food") list = list.filter(c => c.food_score >= 80);
            if (v === "nightlife") list = list.filter(c => c.nightlife_score >= 60);
            if (v === "relaxation") list = list.filter(c => c.relaxation_score >= 80);
            if (v === "photography") list = list.filter(c => c.photography_score >= 85);
        }

        // Filter by crowd level
        if (maxCrowd) {
            list = list.filter(c => c.crowd_level <= Number(maxCrowd));
        }

        // Filter by budget score (higher = cheaper)
        if (minBudget) {
            list = list.filter(c => c.budget_score >= Number(minBudget));
        }

        res.json({
            totalCount: list.length,
            filtersApplied: { state, tag, vibe, maxCrowd, minBudget },
            cities: list
        });
    } catch (err) {
        logger.error("Get Indian cities error:", err);
        res.status(500).json({ error: "Failed to fetch Indian tourist cities" });
    }
};

const getAllDestinations = async (req, res) => {
    try {
        let destinations = [];
        try {
            const result = await pool.query("SELECT * FROM destinations ORDER BY id");
            destinations = result.rows;
        } catch (e) {
            logger.warn("Query destinations error, fallback to Indian cities:", e.message);
        }

        if (destinations.length === 0) {
            destinations = INDIAN_TOURIST_CITIES.map((c, i) => ({ id: i + 1, ...c }));
        }

        res.json({
            count: destinations.length,
            destinations
        });
    } catch (err) {
        logger.error("Fetch destinations error:", err);
        res.status(500).json({ error: "Failed to fetch destinations" });
    }
};

const searchPlaces = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: "Query parameter 'q' is required" });
        }

        // First check in-memory Indian tourist cities
        const matches = INDIAN_TOURIST_CITIES.filter(c =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.state.toLowerCase().includes(query.toLowerCase()) ||
            c.tags.toLowerCase().includes(query.toLowerCase())
        );

        if (matches.length > 0) {
            return res.json({
                count: matches.length,
                source: "TRIP//OS Curated Indian Cities Knowledge Base",
                results: matches
            });
        }

        const externalResults = await searchDestinations(query);
        res.json({ count: externalResults.length, source: "External Search", results: externalResults });
    } catch (err) {
        logger.error("Search places error:", err);
        res.status(500).json({ error: "Failed to search places" });
    }
};

const getDestinationWeather = async (req, res) => {
    try {
        const { id } = req.params;
        let dest = null;

        try {
            const result = await pool.query("SELECT * FROM destinations WHERE id = $1", [id]);
            if (result.rows.length > 0) dest = result.rows[0];
        } catch (e) {
            logger.warn("DB query failed, checking in-memory:", e.message);
        }

        if (!dest) {
            dest = INDIAN_TOURIST_CITIES[Number(id) - 1] || INDIAN_TOURIST_CITIES[0];
        }

        const weather = await getWeather(dest.latitude || 28.6139, dest.longitude || 77.2090);

        res.json({
            destination: dest.name,
            state: dest.state,
            weather
        });
    } catch (err) {
        logger.error("Get destination weather error:", err);
        res.status(500).json({ error: "Failed to fetch weather" });
    }
};

const getDestinationDisasterRisk = async (req, res) => {
    try {
        const { id } = req.params;
        let dest = null;

        try {
            const result = await pool.query("SELECT * FROM destinations WHERE id = $1", [id]);
            if (result.rows.length > 0) dest = result.rows[0];
        } catch (e) {
            logger.warn("DB query failed, checking in-memory:", e.message);
        }

        if (!dest) {
            dest = INDIAN_TOURIST_CITIES[Number(id) - 1] || INDIAN_TOURIST_CITIES[0];
        }

        const risk = await assessDisasterRisk(dest.name, dest.state, dest.latitude, dest.longitude);

        res.json(risk);
    } catch (err) {
        logger.error("Get disaster risk error:", err);
        res.status(500).json({ error: "Failed to assess disaster risk" });
    }
};

/**
 * Seed all 45+ tourist cities directly into PostgreSQL database
 */
const syncAllCitiesToDatabase = async (req, res) => {
    try {
        let insertedCount = 0;
        for (const c of INDIAN_TOURIST_CITIES) {
            const check = await pool.query("SELECT id FROM public.destinations WHERE name ILIKE $1", [c.name]);
            if (check.rows.length === 0) {
                await pool.query(
                    `INSERT INTO public.destinations 
                    (name, state, country, latitude, longitude, nature_score, adventure_score, food_score, photography_score, nightlife_score, relaxation_score, budget_score, walking_requirement, crowd_level, description, tags)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
                    [
                        c.name, c.state, c.country, c.latitude, c.longitude,
                        c.nature_score, c.adventure_score, c.food_score, c.photography_score,
                        c.nightlife_score, c.relaxation_score, c.budget_score,
                        c.walking_requirement, c.crowd_level, c.description, c.tags
                    ]
                );
                insertedCount++;
            }
        }

        res.json({
            message: `Successfully synced ${insertedCount} top Indian tourist cities into database! 🚀`,
            totalCities: INDIAN_TOURIST_CITIES.length
        });
    } catch (err) {
        logger.error("Sync cities error:", err);
        res.status(500).json({ error: "Failed to sync cities to database: " + err.message });
    }
};

/**
 * Get Less Popular / Offbeat / Hidden Gems for a Destination (B + C Engine)
 */
const getDestinationHiddenGems = async (req, res) => {
    try {
        const { id } = req.params;
        const { maxCrowd = 35, category } = req.query;

        const result = await getHiddenGemsForDestination(id, { maxCrowd, category });
        res.json(result);
    } catch (err) {
        logger.error("Get destination hidden gems error:", err);
        res.status(500).json({ error: "Failed to fetch hidden gems: " + err.message });
    }
};

module.exports = {
    getRecommendations,
    getAllDestinations,
    getIndianTouristCities,
    searchPlaces,
    getDestinationWeather,
    getDestinationDisasterRisk,
    getDestinationHiddenGems,
    syncAllCitiesToDatabase
};
