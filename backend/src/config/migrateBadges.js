const fs = require("fs");
const path = require("path");
const pool = require("./db");
const logger = require("../utils/logger");

async function runBadgeMigration() {
    try {
        const sqlPath = path.resolve(__dirname, "../../sql/add_badge_allocations.sql");
        const sql = fs.readFileSync(sqlPath, "utf-8");
        await pool.query(sql);
        logger.info("✅ public.user_badges table migration applied successfully.");

        // Check or create demo user for guest/demo sessions
        const demoUserId = "00000000-0000-0000-0000-000000000001";
        await pool.query(`
            INSERT INTO public.users (id, name, email)
            VALUES ($1, 'SOUMYA RANJAN', 'traveler@tripos.live')
            ON CONFLICT (id) DO UPDATE
            SET name = EXCLUDED.name, email = EXCLUDED.email
        `, [demoUserId]).catch(err => {
            // If auth.users foreign key constraint fails, we log and proceed
            logger.warn("Demo user note:", err.message);
        });

    } catch (error) {
        logger.warn("Badge migration notice:", error.message);
    }
}

module.exports = { runBadgeMigration };
