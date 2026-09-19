const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const env = {
    PORT: process.env.PORT || 5000,
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
    NODE_ENV: process.env.NODE_ENV || "development"
};

const requiredKeys = ["DATABASE_URL", "SUPABASE_URL", "SUPABASE_ANON_KEY"];
for (const key of requiredKeys) {
    if (!env[key]) {
        console.warn(`[Config Warning] Missing recommended environment variable: ${key}`);
    }
}

module.exports = env;
