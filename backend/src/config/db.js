const { Pool } = require("pg");
const env = require("./env");

const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});

pool.on("error", (err) => {
    console.error("[PostgreSQL Pool Error]:", err.message);
});

module.exports = pool;
