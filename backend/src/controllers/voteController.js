const pool = require("../config/db");
const logger = require("../utils/logger");

const castVote = async (req, res) => {
    try {
        const tripId = req.params.id;
        const { targetType, targetId, voteType } = req.body;

        if (!targetType || !targetId || !voteType) {
            return res.status(400).json({
                error: "targetType (DESTINATION/ACTIVITY), targetId, and voteType (YES/NO/FAVORITE) are required"
            });
        }

        const validTargets = ["DESTINATION", "ACTIVITY"];
        const validVotes = ["YES", "NO", "FAVORITE"];

        if (!validTargets.includes(targetType) || !validVotes.includes(voteType)) {
            return res.status(400).json({ error: "Invalid targetType or voteType" });
        }

        const result = await pool.query(
            `INSERT INTO trip_votes (trip_id, user_id, target_type, target_id, vote)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (trip_id, user_id, target_type, target_id)
             DO UPDATE SET vote = EXCLUDED.vote, updated_at = NOW()
             RETURNING *`,
            [tripId, req.user.id, targetType, String(targetId), voteType]
        );

        res.status(200).json({
            message: "Vote recorded successfully 🚀",
            vote: result.rows[0]
        });

    } catch (err) {
        logger.error("Cast vote error:", err);
        res.status(500).json({ error: "Failed to record vote" });
    }
};

const getVoteResults = async (req, res) => {
    try {
        const tripId = req.params.id;

        const results = await pool.query(
            `SELECT
                target_type,
                target_id,
                COUNT(CASE WHEN vote = 'YES' THEN 1 END) as yes_count,
                COUNT(CASE WHEN vote = 'NO' THEN 1 END) as no_count,
                COUNT(CASE WHEN vote = 'FAVORITE' THEN 1 END) as favorite_count,
                COUNT(*) as total_votes
             FROM trip_votes
             WHERE trip_id = $1
             GROUP BY target_type, target_id`,
            [tripId]
        );

        res.json({
            tripId,
            voteResults: results.rows
        });

    } catch (err) {
        logger.error("Get vote results error:", err);
        res.status(500).json({ error: "Failed to get vote results" });
    }
};

module.exports = {
    castVote,
    getVoteResults
};
