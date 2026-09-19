const badgeService = require("../services/badgeService");
const logger = require("../utils/logger");

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

const getMyBadges = async (req, res) => {
    try {
        const userId = req.user?.id || DEMO_USER_ID;
        const badges = await badgeService.getUserBadges(userId);
        res.json({
            success: true,
            badges,
            totalCount: badges.length
        });
    } catch (err) {
        logger.error("getMyBadges error:", err);
        res.status(500).json({ error: "Failed to load badges" });
    }
};

const claimBadge = async (req, res) => {
    try {
        const userId = req.user?.id || DEMO_USER_ID;
        const badgeData = req.body;

        if (!badgeData.badgeTitle) {
            return res.status(400).json({ error: "badgeTitle is required" });
        }

        const newBadge = await badgeService.claimBadge(userId, badgeData);
        res.status(201).json({
            success: true,
            message: "Badge claimed and allocated successfully! 🎖️",
            badge: newBadge
        });
    } catch (err) {
        logger.error("claimBadge error:", err);
        res.status(500).json({ error: "Failed to claim badge" });
    }
};

const evaluateTripBadge = async (req, res) => {
    try {
        const { destination, distanceKm, transportMode, disruptionResolved, autoClaim } = req.body;
        const userId = req.user?.id || DEMO_USER_ID;

        const evaluated = badgeService.evaluateBadgeForTrip(
            destination || "Incredible India",
            distanceKm || 0,
            transportMode || "CAR",
            disruptionResolved || false
        );

        let claimedBadge = null;
        if (autoClaim) {
            claimedBadge = await badgeService.claimBadge(userId, evaluated);
        }

        res.json({
            success: true,
            badge: claimedBadge || evaluated,
            wasClaimed: !!claimedBadge
        });
    } catch (err) {
        logger.error("evaluateTripBadge error:", err);
        res.status(500).json({ error: "Failed to evaluate badge" });
    }
};

const getBadgeRules = (req, res) => {
    res.json({
        success: true,
        rules: badgeService.BADGE_RULES
    });
};

module.exports = {
    getMyBadges,
    claimBadge,
    evaluateTripBadge,
    getBadgeRules
};
