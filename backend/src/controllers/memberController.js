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

const getUserTripInvitations = async (req, res) => {
    try {
        const userId = req.user.id;
        const userEmail = (req.user.email || '').toLowerCase().trim();
        const userUsername = (req.user.username || '').toLowerCase().trim();

        const result = await pool.query(
            `SELECT 
                ti.id,
                ti.trip_id,
                ti.inviter_id,
                ti.inviter_name,
                ti.invite_code,
                ti.status,
                ti.created_at,
                t.name as trip_name,
                t.start_location,
                t.end_location,
                t.start_date,
                t.end_date,
                t.budget,
                t.transport_mode,
                u.name as leader_name,
                u.email as leader_email
             FROM trip_invitations ti
             JOIN trips t ON t.id = ti.trip_id
             LEFT JOIN users u ON u.id = ti.inviter_id
             WHERE (ti.invitee_id = $1 OR LOWER(ti.invitee_email) = $2 OR (ti.invitee_username IS NOT NULL AND LOWER(ti.invitee_username) = $3))
               AND ti.status = 'PENDING'
             ORDER BY ti.created_at DESC`,
            [userId, userEmail, userUsername || '__none__']
        );

        res.json({
            invitations: result.rows
        });
    } catch (err) {
        logger.error("Get user trip invitations error:", err);
        res.status(500).json({ error: "Failed to fetch trip invitations" });
    }
};

const respondToTripInvitation = async (req, res) => {
    try {
        const invitationId = req.params.id;
        const { action } = req.body; // 'ACCEPT' or 'DECLINE'
        const userId = req.user.id;
        const userEmail = (req.user.email || '').toLowerCase().trim();
        const userUsername = (req.user.username || '').toLowerCase().trim();

        const invCheck = await pool.query(
            `SELECT ti.*, t.name as trip_name, t.invite_code
             FROM trip_invitations ti
             JOIN trips t ON t.id = ti.trip_id
             WHERE ti.id = $1 AND (ti.invitee_id = $2 OR LOWER(ti.invitee_email) = $3 OR (ti.invitee_username IS NOT NULL AND LOWER(ti.invitee_username) = $4))`,
            [invitationId, userId, userEmail, userUsername || '__none__']
        );

        if (invCheck.rows.length === 0) {
            return res.status(404).json({ error: "Trip invitation not found" });
        }

        const invitation = invCheck.rows[0];

        if (action === 'ACCEPT') {
            await pool.query(
                `UPDATE trip_invitations
                 SET status = 'ACCEPTED', invitee_id = $1, updated_at = NOW()
                 WHERE id = $2`,
                [userId, invitationId]
            );

            // Add or approve member in trip_members
            await pool.query(
                `INSERT INTO trip_members (trip_id, user_id, role, status, joined_via, approved_at)
                 VALUES ($1, $2, 'MEMBER', 'APPROVED', 'INVITATION', NOW())
                 ON CONFLICT (trip_id, user_id)
                 DO UPDATE SET status = 'APPROVED', approved_at = NOW()`,
                [invitation.trip_id, userId]
            );

            return res.json({
                message: `You have successfully joined ${invitation.trip_name}! 🚀`,
                tripId: invitation.trip_id,
                status: 'APPROVED'
            });
        } else {
            await pool.query(
                `UPDATE trip_invitations
                 SET status = 'DECLINED', updated_at = NOW()
                 WHERE id = $1`,
                [invitationId]
            );

            await pool.query(
                `DELETE FROM trip_members WHERE trip_id = $1 AND user_id = $2`,
                [invitation.trip_id, userId]
            );

            return res.json({
                message: "Trip invitation declined"
            });
        }
    } catch (err) {
        logger.error("Respond to trip invitation error:", err);
        res.status(500).json({ error: "Failed to respond to trip invitation" });
    }
};

const createTripInvitation = async (req, res) => {
    try {
        const tripId = req.params.id;
        const { email, username, friendId } = req.body;
        const inviterId = req.user.id;
        const inviterName = req.user.user_metadata?.name || req.user.name || "Trip Leader";

        // Verify trip exists
        const tripRes = await pool.query(
            `SELECT id, name, invite_code FROM trips WHERE id = $1`,
            [tripId]
        );
        if (tripRes.rows.length === 0) {
            return res.status(404).json({ error: "Trip not found" });
        }
        const trip = tripRes.rows[0];

        let targetUserId = friendId || null;
        let targetEmail = (email || '').trim().toLowerCase() || null;
        let targetUsername = (username || '').trim().toLowerCase().replace('@', '') || null;

        // If username or email provided, lookup user
        if (!targetUserId && (targetEmail || targetUsername)) {
            const u = await pool.query(
                `SELECT id, email, username FROM users 
                 WHERE (LOWER(email) = $1 OR LOWER(username) = $2) LIMIT 1`,
                [targetEmail || '', targetUsername || '']
            );
            if (u.rows.length > 0) {
                targetUserId = u.rows[0].id;
                if (!targetEmail) targetEmail = u.rows[0].email;
                if (!targetUsername) targetUsername = u.rows[0].username;
            }
        }

        // Insert invitation
        const invRes = await pool.query(
            `INSERT INTO trip_invitations 
                (trip_id, inviter_id, inviter_name, invitee_id, invitee_email, invitee_username, invite_code, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
             RETURNING *`,
            [trip.id, inviterId, inviterName, targetUserId, targetEmail, targetUsername, trip.invite_code]
        );

        // Also create pending member record
        if (targetUserId) {
            await pool.query(
                `INSERT INTO trip_members (trip_id, user_id, role, status, joined_via)
                 VALUES ($1, $2, 'MEMBER', 'PENDING', 'DIRECT_INVITE')
                 ON CONFLICT (trip_id, user_id) DO NOTHING`,
                [trip.id, targetUserId]
            );
        }

        res.status(201).json({
            message: `Invitation to ${trip.name} sent successfully 🚀`,
            invitation: invRes.rows[0]
        });

    } catch (err) {
        logger.error("Create trip invitation error:", err);
        res.status(500).json({ error: "Failed to create trip invitation" });
    }
};

module.exports = {
    joinTrip,
    getTripMembers,
    approveMember,
    getUserTripInvitations,
    respondToTripInvitation,
    createTripInvitation
};
