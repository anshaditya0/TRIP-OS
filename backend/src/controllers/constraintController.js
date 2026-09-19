const pool = require("../config/db");
const logger = require("../utils/logger");

const addConstraint = async (req, res) => {
    try {
        const tripId = req.params.id;
        const { category, item, constraintType } = req.body;

        if (!category || !item || !constraintType) {
            return res.status(400).json({
                error: "Category, item and constraint type are required"
            });
        }

        const validTypes = ["MUST_GO", "DONT_WANT", "DEAL_BREAKER"];
        if (!validTypes.includes(constraintType)) {
            return res.status(400).json({
                error: "Invalid constraint type. Must be MUST_GO, DONT_WANT, or DEAL_BREAKER"
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
            `INSERT INTO constraints
            (
                trip_id,
                user_id,
                category,
                item,
                constraint_type
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [tripId, req.user.id, category, item, constraintType]
        );

        res.status(201).json({
            message: "Constraint added successfully 🚀",
            constraint: result.rows[0]
        });

    } catch (error) {
        logger.error("Add constraint error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                error: "This constraint already exists"
            });
        }

        res.status(500).json({
            error: "Failed to add constraint"
        });
    }
};

const getConstraints = async (req, res) => {
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
                c.id,
                c.user_id,
                u.name,
                c.category,
                c.item,
                c.constraint_type,
                c.created_at
             FROM constraints c
             JOIN users u ON c.user_id = u.id
             JOIN trip_members tm ON tm.trip_id = c.trip_id AND tm.user_id = c.user_id
             WHERE c.trip_id = $1 AND tm.status = 'APPROVED'
             ORDER BY c.created_at ASC`,
            [tripId]
        );

        res.json({
            tripId,
            constraintCount: result.rows.length,
            constraints: result.rows
        });

    } catch (error) {
        logger.error("Get constraints error:", error);
        res.status(500).json({
            error: "Failed to get constraints"
        });
    }
};

module.exports = {
    addConstraint,
    getConstraints
};
