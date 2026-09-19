const pool = require("../config/db");
const { calculateGroupDNA } = require("../services/scoringEngine");
const logger = require("../utils/logger");

const savePreferences = async (req, res) => {
    try {
        const tripId = req.params.id;
        const {
            adventure,
            nature,
            food,
            photography,
            nightlife,
            relaxation,
            budgetSensitivity,
            walkingTolerance,
            crowdTolerance
        } = req.body;

        const preferences = [
            adventure,
            nature,
            food,
            photography,
            nightlife,
            relaxation,
            budgetSensitivity,
            walkingTolerance,
            crowdTolerance
        ];

        if (preferences.some(value => value === undefined || value === null)) {
            return res.status(400).json({
                error: "All 9 preference values are required"
            });
        }

        if (preferences.some(value => !Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > 100)) {
            return res.status(400).json({
                error: "All preferences must be integers between 0 and 100"
            });
        }

        // Verify approved membership
        const memberCheck = await pool.query(
            `SELECT id FROM trip_members WHERE trip_id = $1 AND user_id = $2 AND status = 'APPROVED'`,
            [tripId, req.user.id]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({
                error: "You must be an approved trip member"
            });
        }

        const result = await pool.query(
            `INSERT INTO preferences
            (
                trip_id,
                user_id,
                adventure,
                nature,
                food,
                photography,
                nightlife,
                relaxation,
                budget_sensitivity,
                walking_tolerance,
                crowd_tolerance
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (trip_id, user_id)
            DO UPDATE SET
                adventure = EXCLUDED.adventure,
                nature = EXCLUDED.nature,
                food = EXCLUDED.food,
                photography = EXCLUDED.photography,
                nightlife = EXCLUDED.nightlife,
                relaxation = EXCLUDED.relaxation,
                budget_sensitivity = EXCLUDED.budget_sensitivity,
                walking_tolerance = EXCLUDED.walking_tolerance,
                crowd_tolerance = EXCLUDED.crowd_tolerance,
                updated_at = NOW()
            RETURNING *`,
            [
                tripId,
                req.user.id,
                adventure,
                nature,
                food,
                photography,
                nightlife,
                relaxation,
                budgetSensitivity,
                walkingTolerance,
                crowdTolerance
            ]
        );

        res.status(201).json({
            message: "Vibe Profile saved successfully 🚀",
            preferences: result.rows[0]
        });

    } catch (error) {
        logger.error("Save preferences error:", error);
        res.status(500).json({
            error: "Failed to save Vibe Profile"
        });
    }
};

const getPreferences = async (req, res) => {
    try {
        const tripId = req.params.id;

        const memberCheck = await pool.query(
            `SELECT id FROM trip_members WHERE trip_id = $1 AND user_id = $2 AND status = 'APPROVED'`,
            [tripId, req.user.id]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({
                error: "You must be an approved trip member"
            });
        }

        const result = await pool.query(
            `SELECT
                p.user_id,
                u.name,
                p.adventure,
                p.nature,
                p.food,
                p.photography,
                p.nightlife,
                p.relaxation,
                p.budget_sensitivity,
                p.walking_tolerance,
                p.crowd_tolerance
             FROM preferences p
             JOIN users u ON p.user_id = u.id
             JOIN trip_members tm ON tm.trip_id = p.trip_id AND tm.user_id = p.user_id
             WHERE p.trip_id = $1 AND tm.status = 'APPROVED'
             ORDER BY u.name`,
            [tripId]
        );

        res.json({
            tripId,
            memberCount: result.rows.length,
            preferences: result.rows
        });

    } catch (error) {
        logger.error("Get preferences error:", error);
        res.status(500).json({
            error: "Failed to get Vibe Profiles"
        });
    }
};

const getGroupDNA = async (req, res) => {
    try {
        const tripId = req.params.id;

        const memberCheck = await pool.query(
            `SELECT id FROM trip_members WHERE trip_id = $1 AND user_id = $2 AND status = 'APPROVED'`,
            [tripId, req.user.id]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({
                error: "You must be an approved trip member"
            });
        }

        const result = await pool.query(
            `SELECT
                p.adventure,
                p.nature,
                p.food,
                p.photography,
                p.nightlife,
                p.relaxation,
                p.budget_sensitivity,
                p.walking_tolerance,
                p.crowd_tolerance
             FROM preferences p
             JOIN trip_members tm ON tm.trip_id = p.trip_id AND tm.user_id = p.user_id
             WHERE p.trip_id = $1 AND tm.status = 'APPROVED'`,
            [tripId]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                error: "No Vibe Profiles found for this trip"
            });
        }

        const dnaResult = calculateGroupDNA(result.rows);

        res.json({
            tripId,
            memberCount: result.rows.length,
            groupDNA: dnaResult.rounded,
            rawDNA: dnaResult.raw
        });

    } catch (error) {
        logger.error("Group DNA error:", error);
        res.status(500).json({
            error: "Failed to calculate Group DNA"
        });
    }
};

module.exports = {
    savePreferences,
    getPreferences,
    getGroupDNA
};
