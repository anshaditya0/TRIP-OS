const supabase = require("../config/supabase");
const logger = require("../utils/logger");

const DEMO_USER = {
    id: "00000000-0000-0000-0000-000000000001",
    email: "traveler@tripos.live",
    name: "SOUMYA RANJAN"
};

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // If no auth header or demo token requested, use guest demo user
        if (!authHeader || authHeader === "Bearer demo-token" || authHeader === "Bearer guest-demo-token") {
            req.user = DEMO_USER;
            return next();
        }

        if (!authHeader.startsWith("Bearer ")) {
            req.user = DEMO_USER;
            return next();
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            req.user = DEMO_USER;
            return next();
        }

        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data || !data.user) {
            // Fall back to demo user gracefully in demo/development mode
            req.user = DEMO_USER;
            return next();
        }

        req.user = data.user;
        next();

    } catch (error) {
        logger.warn("Auth token check notice, using guest session:", error.message);
        req.user = DEMO_USER;
        next();
    }
};

module.exports = authMiddleware;
