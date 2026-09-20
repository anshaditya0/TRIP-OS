const pool = require("./db");
const logger = require("../utils/logger");

async function runFriendsMigration() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS friends (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                friend_id VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'ACCEPTED',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(user_id, friend_id)
            );

            CREATE TABLE IF NOT EXISTS friend_requests (
                id SERIAL PRIMARY KEY,
                sender_id VARCHAR(255) NOT NULL,
                receiver_id VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'PENDING',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(sender_id, receiver_id)
            );
        `);
        logger.info("Friends database migration completed successfully 🚀");
    } catch (err) {
        logger.warn("Friends table migration notice:", err.message);
    }
}

module.exports = { runFriendsMigration };
