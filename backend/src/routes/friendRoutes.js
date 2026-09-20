const express = require("express");
const router = express.Router();
const friendController = require("../controllers/friendController");
const authMiddleware = require("../middleware/authMiddleware");

// Friends Management Routes (Protected by Auth)
router.get("/", authMiddleware, friendController.getFriends);
router.post("/request", authMiddleware, friendController.sendFriendRequest);
router.patch("/requests/:requestId/respond", authMiddleware, friendController.respondToFriendRequest);
router.post("/invite-trip", authMiddleware, friendController.inviteFriendToTrip);
router.delete("/:friendId", authMiddleware, friendController.removeFriend);

module.exports = router;
