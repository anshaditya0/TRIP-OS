const pool = require("../config/db");
const logger = require("../utils/logger");

const BADGE_RULES = [
    {
        pattern: /manali|ladakh|kasol|spiti|rishikesh|shimla|dharamshala|nainital|mussoorie/i,
        badgeTitle: "🏔️ HIMALAYAN SUMMITEER",
        iconEmoji: "🏔️",
        rarity: "LEGENDARY",
        earnedReason: "Conquered high-altitude Himalayan mountain passes and rugged trails.",
        bgGradient: "from-amber-500 to-red-500"
    },
    {
        pattern: /goa|pondicherry|gokarna|varkala|alappuzha|daman|puri|andaman/i,
        badgeTitle: "🌊 OCEAN CONQUEROR",
        iconEmoji: "🌊",
        rarity: "RARE",
        earnedReason: "Explored golden coastlines, surf beaches, and maritime heritage.",
        bgGradient: "from-sky-500 to-emerald-400"
    },
    {
        pattern: /jaipur|udaipur|jodhpur|varanasi|agra|hampi|khajuraho|mysore|amritsar/i,
        badgeTitle: "👑 ROYAL HERITAGE ROVER",
        iconEmoji: "👑",
        rarity: "RARE",
        earnedReason: "Immersed in centuries of historic palaces, forts, and cultural landmarks.",
        bgGradient: "from-purple-600 to-pink-500"
    },
    {
        pattern: /munnar|coorg|ooty|wayanad|chikmagalur|darjeeling|shillong/i,
        badgeTitle: "🌿 MIST VALLEY ROVER",
        iconEmoji: "🌿",
        rarity: "UNCOMMON",
        earnedReason: "Trekked through lush tea estates, coffee plantations, and cloud valleys.",
        bgGradient: "from-emerald-500 to-teal-400"
    }
];

async function getUserBadges(userId) {
    try {
        const res = await pool.query(
            `SELECT * FROM public.user_badges 
             WHERE user_id = $1 
             ORDER BY unlocked_at DESC`,
            [userId]
        );
        return res.rows;
    } catch (err) {
        logger.error("getUserBadges query error:", err.message);
        return [];
    }
}

async function claimBadge(userId, badgeData) {
    const { destination, badgeTitle, iconEmoji, rarity, earnedReason, bgGradient } = badgeData;
    
    try {
        const res = await pool.query(
            `INSERT INTO public.user_badges 
             (user_id, destination, badge_title, icon_emoji, rarity, earned_reason, bg_gradient, unlocked_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
             RETURNING *`,
            [
                userId,
                destination || "Incredible India",
                badgeTitle || "🏆 VOYAGE EXPLORER",
                iconEmoji || "🏆",
                rarity || "RARE",
                earnedReason || "Unlocked for completing a TRIP//OS expedition.",
                bgGradient || "from-amber-500 to-orange-500"
            ]
        );
        return res.rows[0];
    } catch (err) {
        logger.error("claimBadge insert error:", err.message);
        throw err;
    }
}

function evaluateBadgeForTrip(destinationName, travelDistanceKm = 0, transportMode = "CAR", disruptionResolved = false) {
    let matchedRule = BADGE_RULES.find(rule => rule.pattern.test(destinationName));

    if (!matchedRule) {
        if (travelDistanceKm >= 1000) {
            matchedRule = {
                badgeTitle: "🛣️ GRAND EXPEDITIONER",
                iconEmoji: "🛣️",
                rarity: "LEGENDARY",
                earnedReason: `Completed an epic ${travelDistanceKm} KM cross-country expedition.`,
                bgGradient: "from-indigo-600 to-blue-500"
            };
        } else {
            matchedRule = {
                badgeTitle: `🌟 ${destinationName.toUpperCase()} PIONEER`,
                iconEmoji: "🌟",
                rarity: "RARE",
                earnedReason: `Successfully designed and planned an expedition to ${destinationName}.`,
                bgGradient: "from-amber-500 to-orange-500"
            };
        }
    }

    if (disruptionResolved) {
        return {
            badgeTitle: "🛡️ ALL-WEATHER NOMAD",
            iconEmoji: "🛡️",
            rarity: "LEGENDARY",
            earnedReason: "Successfully auto-replanned and survived live weather/road disruptions without losing a day.",
            bgGradient: "from-rose-600 to-amber-500",
            destination: destinationName
        };
    }

    return {
        ...matchedRule,
        destination: destinationName
    };
}

module.exports = {
    getUserBadges,
    claimBadge,
    evaluateBadgeForTrip,
    BADGE_RULES
};
