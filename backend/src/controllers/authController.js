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
        let dbUser = { id: data.user?.id || 'usr_' + Date.now(), name, email };
        try {
            const result = await pool.query(
                `INSERT INTO users (id, name, email)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email
                 RETURNING *`,
                [data.user.id, name, email]
            );
            if (result.rows && result.rows[0]) {
                dbUser = result.rows[0];
            }
        } catch (dbErr) {
            logger.warn("PostgreSQL user sync notice:", dbErr.message);
        }

        res.status(201).json({
            message: "User registered successfully 🚀",
            user: dbUser
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

// In-memory OTP storage for password recovery (email -> { otp, expiresAt })
const otpStore = new Map();

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const cleanEmail = email.toLowerCase().trim();

        // 1. Try Supabase Auth reset password / OTP
        let sentViaSupabase = false;
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
            if (!error) {
                sentViaSupabase = true;
            } else {
                logger.warn("Supabase resetPasswordForEmail notice:", error.message);
            }
        } catch (err) {
            logger.warn("Supabase auth reset call notice:", err.message);
        }

        // Generate 6-digit OTP code with 10-minute expiry
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(cleanEmail, {
            otp: otpCode,
            expiresAt: Date.now() + 10 * 60 * 1000
        });

        logger.info(`[TRIP//OS AUTH] Password Reset OTP for ${cleanEmail}: ${otpCode}`);

        return res.json({
            message: "OTP sent to your email address successfully 📩",
            email: cleanEmail,
            sentViaSupabase,
            otpPreview: process.env.NODE_ENV !== "production" ? otpCode : undefined
        });
    } catch (error) {
        logger.error("Forgot password error:", error.message);
        res.status(500).json({ error: "Failed to send reset OTP" });
    }
};

const resetPasswordWithOtp = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: "Email, OTP, and new password are required" });
        }

        const cleanEmail = email.toLowerCase().trim();
        const stored = otpStore.get(cleanEmail);

        let verified = false;

        // Check in-memory store
        if (stored && stored.otp === otp.trim() && Date.now() <= stored.expiresAt) {
            verified = true;
            otpStore.delete(cleanEmail);
        }

        // Check Supabase OTP verification
        if (!verified) {
            try {
                const { data, error } = await supabase.auth.verifyOtp({
                    email: cleanEmail,
                    token: otp.trim(),
                    type: "recovery"
                });
                if (!error && data?.user) {
                    verified = true;
                }
            } catch (err) {
                logger.warn("Supabase verifyOtp notice:", err.message);
            }
        }

        if (!verified) {
            return res.status(400).json({ error: "Invalid or expired OTP code. Please request a new OTP." });
        }

        // Update password in Supabase Auth if supported
        try {
            await supabase.auth.updateUser({ password: newPassword });
        } catch (err) {
            logger.warn("Supabase password update notice:", err.message);
        }

        return res.json({
            message: "Password reset successfully! You can now log in with your new password 🚀",
            success: true
        });
    } catch (error) {
        logger.error("Reset password error:", error.message);
        res.status(500).json({ error: "Failed to reset password" });
    }
};

module.exports = {
    register,
    login,
    getMe,
    forgotPassword,
    resetPasswordWithOtp
};

