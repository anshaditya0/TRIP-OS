const express = require("express");
const router = express.Router();
const badgeController = require("../controllers/badgeController");
const authMiddleware = require("../middleware/authMiddleware");

// Public rules
router.get("/rules", badgeController.getBadgeRules);

// Badges with user context (supports authenticated users + guest fallback)
router.get("/my-badges", authMiddleware, badgeController.getMyBadges);
router.post("/claim", authMiddleware, badgeController.claimBadge);
router.post("/evaluate-trip", authMiddleware, badgeController.evaluateTripBadge);

module.exports = router;
