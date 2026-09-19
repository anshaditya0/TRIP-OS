const crypto = require("crypto");

/**
 * Generate a unique, readable invite code (e.g. TRIP-8X42K)
 */
function generateInviteCode(prefix = "TRIP") {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude confusing 0/O, 1/I
    let code = "";
    const bytes = crypto.randomBytes(5);
    for (let i = 0; i < 5; i++) {
        code += chars[bytes[i] % chars.length];
    }
    return `${prefix}-${code}`;
}

module.exports = { generateInviteCode };
