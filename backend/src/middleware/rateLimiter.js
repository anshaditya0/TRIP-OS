const rateLimit = require("express-rate-limit");

// Sensitive auth routes limiter (login / register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 attempts per 15 min
    message: {
        error: "Too many authentication attempts. Please try again in 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false
});

// General API routes limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: {
        error: "Too many requests. Please slow down."
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { authLimiter, apiLimiter };
