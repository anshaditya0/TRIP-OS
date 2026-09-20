const pool = require("../config/db");
const logger = require("../utils/logger");

const joinTrip = async (req, res) => {
    try {
        const { inviteCode } = req.body;

        if (!inviteCode) {
            return res.status(400).json({
                error: "Invite code is required"
            });
        }

        // Find the trip
        const tripResult = await pool.query(
            `SELECT id, name
             FROM trips
             WHERE invite_code = $1`,
            [inviteCode.trim()]
        );

        if (tripResult.rows.length === 0) {
            return res.status(404).json({
                error: "Invalid invite code"
            });
        }

        const trip = tripResult.rows[0];

        // Check if user is already a member
        const memberResult = await pool.query(
            `SELECT id, status
             FROM trip_members
             WHERE trip_id = $1 AND user_id = $2`,
            [trip.id, req.user.id]
        );

        if (memberResult.rows.length > 0) {
            return res.status(409).json({
                error: "You have already joined or requested to join this trip",
                status: memberResult.rows[0].status
            });
        }

        // Ensure user exists in users table
        try {
            await pool.query(
                `INSERT INTO users (id, name, email)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (id) DO NOTHING`,
                [
                    req.user.id,
                    req.user.user_metadata?.name || req.user.name || "Explorer",
                    req.user.email || "member@tripos.world"
                ]
            );
        } catch (uErr) {
            logger.warn("Ensure user exists notice in joinTrip:", uErr.message);
        }

        // Create pending membership
        await pool.query(
            `INSERT INTO trip_members
            (
                trip_id,
                user_id,
                role,
                status,
                joined_via
            )
            VALUES ($1, $2, 'MEMBER', 'PENDING', 'INVITE_CODE')`,
            [trip.id, req.user.id]
        );

        res.status(201).json({
            message: "Join request sent successfully 🚀",
            trip: trip,
            status: "PENDING"
        });

    } catch (error) {
        logger.error("Join trip error:", error);
        res.status(500).json({
            error: "Failed to join trip"
        });
    }
};

const getTripMembers = async (req, res) => {
    try {
        const tripId = req.params.id;

        // Verify user is an approved member or the leader
        const memberCheck = await pool.query(
            `SELECT id, role, status
             FROM trip_members
             WHERE trip_id = $1 AND user_id = $2 AND status = 'APPROVED'`,
            [tripId, req.user.id]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({
                error: "Only approved trip members can view member lists"
            });
        }

        const isLeader = memberCheck.rows[0].role === "LEADER";

        const result = await pool.query(
            `SELECT
                tm.id,
                tm.user_id,
                tm.role,
                tm.status,
                tm.joined_via,
                tm.requested_at,
                tm.approved_at,
                u.name,
                u.email
             FROM trip_members tm
             JOIN users u ON tm.user_id = u.id
             WHERE tm.trip_id = $1
             ${!isLeader ? "AND tm.status = 'APPROVED'" : ""}
             ORDER BY tm.requested_at ASC`,
            [tripId]
        );

        res.json({
            tripId,
            members: result.rows
        });

    } catch (error) {
        logger.error("Get members error:", error);
        res.status(500).json({
            error: "Failed to get trip members"
        });
    }
};

const approveMember = async (req, res) => {
    try {
        const tripId = req.params.id;
        const memberId = req.params.memberId;

        // Check leader
        const leaderCheck = await pool.query(
            `SELECT id
             FROM trip_members
             WHERE trip_id = $1 AND user_id = $2 AND role = 'LEADER' AND status = 'APPROVED'`,
            [tripId, req.user.id]
        );

        if (leaderCheck.rows.length === 0) {
            return res.status(403).json({
                error: "Only the trip leader can approve members"
            });
        }

        const memberCheck = await pool.query(
            `SELECT id, user_id, status
             FROM trip_members
             WHERE id = $1 AND trip_id = $2`,
            [memberId, tripId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(404).json({
                error: "Member request not found"
            });
        }

        if (memberCheck.rows[0].status !== "PENDING") {
            return res.status(400).json({
                error: "This member request is not pending"
            });
        }

        const result = await pool.query(
            `UPDATE trip_members
             SET status = 'APPROVED',
                 approved_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [memberId]
        );

        res.json({
            message: "Member approved successfully 🚀",
            member: result.rows[0]
        });

    } catch (error) {
        logger.error("Approve member error:", error);
        res.status(500).json({
            error: "Failed to approve member"
        });
    }
};

module.exports = {
    joinTrip,
    getTripMembers,
    approveMember
};
