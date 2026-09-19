const pool = require("../config/db");

/**
 * Middleware: Verify user is an approved member of the trip
 */
const requireTripMember = async (req, res, next) => {
    try {
        const tripId = req.params.tripId || req.params.id;
        const userId = req.user?.id;

        if (!tripId || !userId) {
            return res.status(400).json({ error: "Trip ID and user context required" });
        }

        const memberCheck = await pool.query(
            `SELECT id, role, status
             FROM trip_members
             WHERE trip_id = $1 AND user_id = $2 AND status = 'APPROVED'`,
            [tripId, userId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({
                error: "Access denied. You must be an approved trip member."
            });
        }

        req.tripMembership = memberCheck.rows[0];
        next();
    } catch (err) {
        console.error("requireTripMember error:", err);
        res.status(500).json({ error: "Failed to verify trip membership" });
    }
};

/**
 * Middleware: Verify user is an approved LEADER of the trip
 */
const requireTripLeader = async (req, res, next) => {
    try {
        const tripId = req.params.tripId || req.params.id;
        const userId = req.user?.id;

        if (!tripId || !userId) {
            return res.status(400).json({ error: "Trip ID and user context required" });
        }

        const leaderCheck = await pool.query(
            `SELECT id, role, status
             FROM trip_members
             WHERE trip_id = $1 AND user_id = $2 AND role = 'LEADER' AND status = 'APPROVED'`,
            [tripId, userId]
        );

        if (leaderCheck.rows.length === 0) {
            return res.status(403).json({
                error: "Access denied. Only the trip leader can perform this action."
            });
        }

        req.tripMembership = leaderCheck.rows[0];
        next();
    } catch (err) {
        console.error("requireTripLeader error:", err);
        res.status(500).json({ error: "Failed to verify trip leader permissions" });
    }
};

module.exports = { requireTripMember, requireTripLeader };
