const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/forgot-password", authLimiter, authController.forgotPassword);
router.post("/reset-password", authLimiter, authController.resetPasswordWithOtp);
router.get("/me", authMiddleware, authController.getMe);
router.patch("/profile", authMiddleware, authController.updateProfile);
router.get("/users/search", authMiddleware, authController.searchUsers);

module.exports = router;
