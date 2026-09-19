const pool = require("../config/db");
const supabase = require("../config/supabase");
const logger = require("../utils/logger");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "Name, email and password are required"
            });
        }

        // Create account in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        // Save additional user information in our users table
        const result = await pool.query(
            `INSERT INTO users (id, name, email)
             VALUES ($1, $2, $3)
             ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email
             RETURNING *`,
            [data.user.id, name, email]
        );

        res.status(201).json({
            message: "User registered successfully 🚀",
            user: result.rows[0]
        });

    } catch (error) {
        logger.error("Registration error:", error.message);
        res.status(500).json({
            error: "Failed to register user"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({
                error: error.message
            });
        }

        res.json({
            message: "Login successful 🚀",
            accessToken: data.session.access_token,
            user: data.user
        });

    } catch (error) {
        logger.error("Login error:", error.message);
        res.status(500).json({
            error: "Failed to login"
        });
    }
};

const getMe = async (req, res) => {
    try {
        const userRes = await pool.query(
            `SELECT id, name, email, created_at FROM users WHERE id = $1`,
            [req.user.id]
        );

        res.json({
            message: "You are authenticated 🚀",
            user: {
                ...req.user,
                profile: userRes.rows[0] || null
            }
        });
    } catch (e) {
        res.json({
            message: "You are authenticated 🚀",
            user: req.user
        });
    }
};

module.exports = {
    register,
    login,
    getMe
};
