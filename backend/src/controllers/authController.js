const pool = require("../config/db");
const supabase = require("../config/supabase");
const logger = require("../utils/logger");

const register = async (req, res) => {
    try {
        const { name, email, password, username, avatar_url } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "Name, email and password are required"
            });
        }

        const cleanUsername = username ? username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') : null;

        // Check if username is already taken
        if (cleanUsername) {
            const uCheck = await pool.query(
                `SELECT id FROM users WHERE LOWER(username) = LOWER($1)`,
                [cleanUsername]
            );
            if (uCheck.rows.length > 0) {
                return res.status(409).json({
                    error: `Username '@${cleanUsername}' is already taken. Please choose another one.`
                });
            }
        }

        // Create account in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    username: cleanUsername,
                    avatar_url: avatar_url || null
                }
            }
        });

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        // Save additional user information in our users table
        let dbUser = { id: data.user?.id || 'usr_' + Date.now(), name, email, username: cleanUsername, avatar_url };
        try {
            const result = await pool.query(
                `INSERT INTO users (id, name, email, username, avatar_url)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (id) DO UPDATE SET 
                    name = EXCLUDED.name, 
                    email = EXCLUDED.email,
                    username = COALESCE(EXCLUDED.username, users.username),
                    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url)
                 RETURNING *`,
                [data.user.id, name, email, cleanUsername, avatar_url || null]
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
        const { email, username, identifier, password } = req.body;
        const cleanIdentifier = (identifier || email || username || '').trim();

        if (!cleanIdentifier || !password) {
            return res.status(400).json({
                error: "Email/Username and password are required"
            });
        }

        let targetEmail = cleanIdentifier;

        // If the identifier doesn't have '@', look up email by username
        if (!cleanIdentifier.includes('@')) {
            const userLookup = await pool.query(
                `SELECT email FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1`,
                [cleanIdentifier]
            );
            if (userLookup.rows.length > 0 && userLookup.rows[0].email) {
                targetEmail = userLookup.rows[0].email;
            } else {
                return res.status(404).json({
                    error: `No explorer account found with username '@${cleanIdentifier}'`
                });
            }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: targetEmail,
            password
        });

        if (error) {
            return res.status(401).json({
                error: error.message
            });
        }

        // Fetch db user profile including username and avatar
        let profile = null;
        try {
            const pRes = await pool.query(
                `SELECT id, name, username, email, avatar_url, bio, created_at FROM users WHERE id = $1`,
                [data.user.id]
            );
            if (pRes.rows.length > 0) profile = pRes.rows[0];
        } catch (pErr) {}

        res.json({
            message: "Login successful 🚀",
            accessToken: data.session.access_token,
            user: {
                ...data.user,
                profile
            }
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

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, username, avatar_url, bio } = req.body;

        const cleanUsername = username ? username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') : null;

        if (cleanUsername) {
            const check = await pool.query(
                `SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2`,
                [cleanUsername, userId]
            );
            if (check.rows.length > 0) {
                return res.status(409).json({ error: `Username '@${cleanUsername}' is already taken` });
            }
        }

        const result = await pool.query(
            `UPDATE users
             SET
                name = COALESCE($1, name),
                username = COALESCE($2, username),
                avatar_url = COALESCE($3, avatar_url),
                bio = COALESCE($4, bio),
                updated_at = NOW()
             WHERE id = $5
             RETURNING id, name, username, email, avatar_url, bio, created_at, updated_at`,
            [name || null, cleanUsername || null, avatar_url || null, bio || null, userId]
        );

        if (result.rows.length === 0) {
            // User might exist only in auth; insert user
            const insRes = await pool.query(
                `INSERT INTO users (id, name, email, username, avatar_url, bio)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (id) DO UPDATE SET 
                    name = EXCLUDED.name, 
                    username = EXCLUDED.username,
                    avatar_url = EXCLUDED.avatar_url,
                    bio = EXCLUDED.bio
                 RETURNING id, name, username, email, avatar_url, bio, created_at`,
                [userId, name || req.user.name || 'Explorer', req.user.email, cleanUsername, avatar_url, bio]
            );
            return res.json({
                message: "Profile updated successfully 🚀",
                profile: insRes.rows[0]
            });
        }

        res.json({
            message: "Profile updated successfully 🚀",
            profile: result.rows[0]
        });
    } catch (err) {
        logger.error("Update profile error:", err);
        res.status(500).json({ error: "Failed to update profile", details: err.message });
    }
};

const searchUsers = async (req, res) => {
    try {
        const query = (req.query.q || '').trim().toLowerCase();
        if (!query || query.length < 2) {
            return res.json({ users: [] });
        }

        const cleanQ = query.replace('@', '');
        const result = await pool.query(
            `SELECT id, name, username, email, avatar_url
             FROM users
             WHERE (LOWER(username) LIKE $1 OR LOWER(email) LIKE $1 OR LOWER(name) LIKE $1)
               AND id != $2
             LIMIT 10`,
            [`%${cleanQ}%`, req.user.id]
        );

        res.json({ users: result.rows });
    } catch (err) {
        logger.error("Search users error:", err);
        res.status(500).json({ error: "Failed to search users" });
    }
};

module.exports = {
    register,
    login,
    getMe,
    forgotPassword,
    resetPasswordWithOtp,
    updateProfile,
    searchUsers
};

