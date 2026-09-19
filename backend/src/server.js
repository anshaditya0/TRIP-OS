const app = require("./app");
const env = require("./config/env");
const pool = require("./config/db");
const logger = require("./utils/logger");

const port = env.PORT || 5000;

const server = app.listen(port, () => {
    logger.info(`🚀 TRIP//OS backend is running on port ${port}`);
    logger.info(`📍 Health check: http://localhost:${port}/api/health`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
    logger.info("Gracefully shutting down TRIP//OS backend...");
    server.close(async () => {
        await pool.end();
        logger.info("Closed PostgreSQL pool. Exiting process.");
        process.exit(0);
    });
});

process.on("SIGTERM", async () => {
    logger.info("SIGTERM received. Shutting down...");
    server.close(async () => {
        await pool.end();
        process.exit(0);
    });
});

module.exports = server;
