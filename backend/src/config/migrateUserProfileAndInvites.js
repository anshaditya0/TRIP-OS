const pool = require("./db");
const logger = require("../utils/logger");

async function runUserProfileAndInvitesMigration() {
    try {
        // 1. Add username, avatar_url, bio to users table if not exists
        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

            CREATE INDEX IF NOT EXISTS idx_users_username ON users(LOWER(username));
        `);

        // 2. Create trip_invitations table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS trip_invitations (
                id SERIAL PRIMARY KEY,
                trip_id INT REFERENCES trips(id) ON DELETE CASCADE,
                inviter_id VARCHAR(255) NOT NULL,
                inviter_name VARCHAR(255),
                invitee_id VARCHAR(255),
                invitee_email VARCHAR(255),
                invitee_username VARCHAR(100),
                invite_code VARCHAR(100),
                status VARCHAR(50) DEFAULT 'PENDING',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_trip_invitations_invitee_id ON trip_invitations(invitee_id);
            CREATE INDEX IF NOT EXISTS idx_trip_invitations_email ON trip_invitations(LOWER(invitee_email));
            CREATE INDEX IF NOT EXISTS idx_trip_invitations_username ON trip_invitations(LOWER(invitee_username));
            CREATE INDEX IF NOT EXISTS idx_trip_invitations_trip ON trip_invitations(trip_id);
        `);

        logger.info("User profile & trip invitations database migration completed successfully 🚀");
    } catch (err) {
        logger.warn("User profile / trip invitations migration notice:", err.message);
    }
}

module.exports = { runUserProfileAndInvitesMigration };
