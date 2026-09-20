const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const pool = require("./config/db");
const { apiLimiter } = require("./middleware/rateLimiter");
const { notFoundHandler, globalErrorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const badgeRoutes = require("./routes/badgeRoutes");
const friendRoutes = require("./routes/friendRoutes");
const { runBadgeMigration } = require("./config/migrateBadges");
const { runFriendsMigration } = require("./config/migrateFriends");
const { runUserProfileAndInvitesMigration } = require("./config/migrateUserProfileAndInvites");

// Run migrations asynchronously on startup
runBadgeMigration().catch(console.warn);
runFriendsMigration().catch(console.warn);
runUserProfileAndInvitesMigration().catch(console.warn);

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
    origin: true, // Allow frontend during development
    credentials: true
}));

// Body Parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiting
app.use("/api/", apiLimiter);

// Health Check
app.get(["/", "/api/health"], (req, res) => {
    res.json({
        status: "TRIP//OS backend is alive 🚀",
        timestamp: new Date().toISOString(),
        version: "2.0.0"
    });
});

// Database connectivity test
app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW() as now");
        res.json({
            message: "Database connected successfully 🚀",
            time: result.rows[0].now
        });
    } catch (error) {
        res.status(500).json({
            error: "Database connection failed",
            details: error.message
        });
    }
});

// Mount Routes — support both /api/... and root /... paths for seamless Vercel serverless proxying
app.use(["/api/auth", "/auth"], authRoutes);
app.use(["/api/trips", "/trips"], tripRoutes);
app.use(["/api/destinations", "/destinations"], destinationRoutes);
app.use(["/api/badges", "/badges"], badgeRoutes);
app.use(["/api/friends", "/friends"], friendRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
