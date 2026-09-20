const pool = require("../config/db");
const logger = require("../utils/logger");

/**
 * Get all friends (accepted) and incoming/outgoing pending friend requests
 */
const getFriends = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get accepted friends
        let friends = [];
        try {
            const friendsRes = await pool.query(
                `SELECT f.id as friendship_id, f.friend_id, f.created_at,
                        COALESCE(u.name, 'Explorer Friend') as name,
                        COALESCE(u.email, 'explorer@tripos.world') as email
                 FROM friends f
                 LEFT JOIN users u ON u.id = f.friend_id
                 WHERE f.user_id = $1 AND f.status = 'ACCEPTED'
                 ORDER BY f.created_at DESC`,
                [userId]
            );
            friends = friendsRes.rows;
        } catch (dbErr) {
            logger.warn("Query friends notice:", dbErr.message);
        }

        // 2. Get incoming pending requests
        let incomingRequests = [];
        try {
            const incRes = await pool.query(
                `SELECT fr.id, fr.sender_id, fr.created_at,
                        COALESCE(u.name, 'Fellow Explorer') as sender_name,
                        COALESCE(u.email, 'explorer@tripos.world') as sender_email
                 FROM friend_requests fr
                 LEFT JOIN users u ON u.id = fr.sender_id
                 WHERE fr.receiver_id = $1 AND fr.status = 'PENDING'
                 ORDER BY fr.created_at DESC`,
                [userId]
            );
            incomingRequests = incRes.rows;
        } catch (dbErr) {
            logger.warn("Query incoming friend requests notice:", dbErr.message);
        }

        // 3. Get outgoing requests
        let outgoingRequests = [];
        try {
            const outRes = await pool.query(
                `SELECT fr.id, fr.receiver_id, fr.created_at,
                        COALESCE(u.name, 'Explorer') as receiver_name,
                        COALESCE(u.email, 'explorer@tripos.world') as receiver_email
                 FROM friend_requests fr
                 LEFT JOIN users u ON u.id = fr.receiver_id
                 WHERE fr.sender_id = $1 AND fr.status = 'PENDING'
                 ORDER BY fr.created_at DESC`,
                [userId]
            );
            outgoingRequests = outRes.rows;
        } catch (dbErr) {
            logger.warn("Query outgoing friend requests notice:", dbErr.message);
        }

        res.json({
            friends,
            incomingRequests,
            outgoingRequests,
            totalFriends: friends.length,
            pendingCount: incomingRequests.length
        });

    } catch (err) {
        logger.error("Get friends error:", err);
        res.status(500).json({ error: "Failed to fetch friends", details: err.message });
    }
};

/**
 * Send a Friend Request by email or username
 */
const sendFriendRequest = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { email, name } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Friend email is required" });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Prevent adding yourself
        if (cleanEmail === req.user.email?.toLowerCase()) {
            return res.status(400).json({ error: "You cannot send a friend request to yourself" });
        }

        // Check if receiver exists in users table
        let receiverId;
        const userRes = await pool.query(
            `SELECT id, name, email FROM users WHERE LOWER(email) = $1`,
            [cleanEmail]
        );

        if (userRes.rows.length > 0) {
            receiverId = userRes.rows[0].id;
        } else {
            // Create user placeholder so they can receive and accept later
            receiverId = `usr_fr_${Date.now()}`;
            try {
                await pool.query(
                    `INSERT INTO users (id, name, email)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (id) DO NOTHING`,
                    [receiverId, name || cleanEmail.split('@')[0].toUpperCase(), cleanEmail]
                );
            } catch (uErr) {
                logger.warn("Create placeholder user notice:", uErr.message);
            }
        }

        if (receiverId === senderId) {
            return res.status(400).json({ error: "You cannot add yourself as a friend" });
        }

        // Check if already friends
        const existingFriend = await pool.query(
            `SELECT id FROM friends WHERE user_id = $1 AND friend_id = $2 AND status = 'ACCEPTED'`,
            [senderId, receiverId]
        );
        if (existingFriend.rows.length > 0) {
            return res.status(409).json({ error: "You are already friends with this explorer" });
        }

        // Insert or update request
        const requestRes = await pool.query(
            `INSERT INTO friend_requests (sender_id, receiver_id, status, updated_at)
             VALUES ($1, $2, 'PENDING', NOW())
             ON CONFLICT (sender_id, receiver_id)
             DO UPDATE SET status = 'PENDING', updated_at = NOW()
             RETURNING *`,
            [senderId, receiverId]
        );

        res.status(201).json({
            message: "Friend request transmitted across telemetry channels 🚀",
            request: requestRes.rows[0]
        });

    } catch (err) {
        logger.error("Send friend request error:", err);
        res.status(500).json({ error: "Failed to send friend request", details: err.message });
    }
};

/**
 * Respond to an incoming friend request (ACCEPT / REJECT)
 */
const respondToFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { requestId } = req.params;
        const { action } = req.body; // 'ACCEPT' or 'REJECT'

        const reqRes = await pool.query(
            `SELECT * FROM friend_requests WHERE id = $1 AND receiver_id = $2`,
            [requestId, userId]
        );

        if (reqRes.rows.length === 0) {
            return res.status(404).json({ error: "Friend request not found or unauthorized" });
        }

        const request = reqRes.rows[0];

        if (action === "ACCEPT") {
            // Update request status
            await pool.query(
                `UPDATE friend_requests SET status = 'ACCEPTED', updated_at = NOW() WHERE id = $1`,
                [requestId]
            );

            // Insert bidirectional friendship
            await pool.query(
                `INSERT INTO friends (user_id, friend_id, status)
                 VALUES ($1, $2, 'ACCEPTED'), ($2, $1, 'ACCEPTED')
                 ON CONFLICT (user_id, friend_id) DO UPDATE SET status = 'ACCEPTED'`,
                [request.receiver_id, request.sender_id]
            );

            return res.json({
                message: "Friend request accepted! Explorer added to your squad 🚀",
                status: "ACCEPTED"
            });
        } else {
            // REJECT
            await pool.query(
                `UPDATE friend_requests SET status = 'REJECTED', updated_at = NOW() WHERE id = $1`,
                [requestId]
            );

            return res.json({
                message: "Friend request declined",
                status: "REJECTED"
            });
        }

    } catch (err) {
        logger.error("Respond friend request error:", err);
        res.status(500).json({ error: "Failed to process response", details: err.message });
    }
};

/**
 * Direct Invite Friend to a Trip
 */
const inviteFriendToTrip = async (req, res) => {
    try {
        const { tripId, friendId, friendEmail, friendName } = req.body;

        if (!tripId) {
            return res.status(400).json({ error: "tripId is required" });
        }

        // Verify trip exists
        const tripRes = await pool.query("SELECT id, name, invite_code FROM trips WHERE id = $1", [tripId]);
        if (tripRes.rows.length === 0) {
            return res.status(404).json({ error: "Trip not found" });
        }

        const trip = tripRes.rows[0];

        let targetUserId = friendId;
        if (!targetUserId && friendEmail) {
            const u = await pool.query("SELECT id FROM users WHERE LOWER(email) = $1", [friendEmail.toLowerCase().trim()]);
            if (u.rows.length > 0) {
                targetUserId = u.rows[0].id;
            } else {
                targetUserId = `usr_inv_${Date.now()}`;
                await pool.query(
                    `INSERT INTO users (id, name, email) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
                    [targetUserId, friendName || "Invited Friend", friendEmail.toLowerCase().trim()]
                );
            }
        }

        if (!targetUserId) {
            return res.status(400).json({ error: "Valid friendId or friendEmail required" });
        }

        // Add to trip_members with APPROVED status (direct invite by squad leader)
        await pool.query(
            `INSERT INTO trip_members (trip_id, user_id, role, status, joined_via, approved_at)
             VALUES ($1, $2, 'MEMBER', 'APPROVED', 'DIRECT_FRIEND_INVITE', NOW())
             ON CONFLICT (trip_id, user_id)
             DO UPDATE SET status = 'APPROVED', approved_at = NOW()`,
            [trip.id, targetUserId]
        );

        res.status(201).json({
            message: `Friend directly invited & approved to expedition: ${trip.name} 🚀`,
            tripId: trip.id,
            friendId: targetUserId
        });

    } catch (err) {
        logger.error("Invite friend to trip error:", err);
        res.status(500).json({ error: "Failed to invite friend to trip", details: err.message });
    }
};

/**
 * Remove an existing friend
 */
const removeFriend = async (req, res) => {
    try {
        const userId = req.user.id;
        const { friendId } = req.params;

        await pool.query(
            `DELETE FROM friends WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
            [userId, friendId]
        );

        res.json({ message: "Friend removed from roster" });
    } catch (err) {
        logger.error("Remove friend error:", err);
        res.status(500).json({ error: "Failed to remove friend" });
    }
};

module.exports = {
    getFriends,
    sendFriendRequest,
    respondToFriendRequest,
    inviteFriendToTrip,
    removeFriend
};
