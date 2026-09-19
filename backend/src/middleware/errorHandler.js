const logger = require("../utils/logger");

const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        error: `Route not found: ${req.method} ${req.originalUrl}`
    });
};

const globalErrorHandler = (err, req, res, next) => {
    logger.error(`[Unhandled Error] ${req.method} ${req.url}:`, err.stack || err.message);

    const status = err.statusCode || err.status || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
    });
};

module.exports = { notFoundHandler, globalErrorHandler };
