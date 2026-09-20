const express = require("express");
const router = express.Router();

const tripController = require("../controllers/tripController");
const memberController = require("../controllers/memberController");
const preferenceController = require("../controllers/preferenceController");
const constraintController = require("../controllers/constraintController");
const destinationController = require("../controllers/destinationController");
const itineraryController = require("../controllers/itineraryController");
const disruptionController = require("../controllers/disruptionController");
const voteController = require("../controllers/voteController");
const driveFolderController = require("../controllers/driveFolderController");

const authMiddleware = require("../middleware/authMiddleware");
const { requireTripMember, requireTripLeader } = require("../middleware/rbacMiddleware");

// Base Trip CRUD
router.post("/", authMiddleware, tripController.createTrip);
router.get("/", tripController.getAllTrips);

// Trip Invitations (for logged in members) - must precede /:id
router.get("/invitations", authMiddleware, memberController.getUserTripInvitations);
router.patch("/invitations/:id/respond", authMiddleware, memberController.respondToTripInvitation);

router.get("/:id", tripController.getTripById);
router.patch("/:id", authMiddleware, tripController.updateTrip);
router.delete("/:id", authMiddleware, tripController.deleteTrip);

// Smart Journey Timing ("Time to Begin Journey") & Distance
router.get("/:id/journey/timing", tripController.getTripJourneyTiming);

// Natural Disaster & Environmental Route Alerts
router.get("/:id/alerts", tripController.getTripDisasterAlerts);

// Offline Sync & Emergency Safety Pack (Low Connectivity / Mountains)
router.get("/:id/offline-pack", tripController.getOfflinePack);

// Group & Invite System
router.post("/join", authMiddleware, memberController.joinTrip);
router.post("/:id/invitations", authMiddleware, memberController.createTripInvitation);
router.get("/:id/members", authMiddleware, memberController.getTripMembers);
router.patch("/:id/members/:memberId/approve", authMiddleware, memberController.approveMember);

// Vibe Profiles & Group DNA (Step 3)
router.post("/:id/preferences", authMiddleware, preferenceController.savePreferences);
router.get("/:id/preferences", authMiddleware, preferenceController.getPreferences);
router.get("/:id/group-dna", authMiddleware, preferenceController.getGroupDNA);

// Constraints Engine (Step 4)
router.post("/:id/constraints", authMiddleware, constraintController.addConstraint);
router.get("/:id/constraints", authMiddleware, constraintController.getConstraints);

// Explainable Destination Recommendations (Step 5D)
router.get("/:id/destinations/recommend", authMiddleware, destinationController.getRecommendations);

// Dynamic Itinerary Engine (Step 7)
router.post("/:id/itinerary/generate", authMiddleware, itineraryController.createOrGenerateItinerary);
router.get("/:id/itinerary", authMiddleware, itineraryController.getItinerary);
router.get("/:id/itinerary/offbeat-alternatives", authMiddleware, itineraryController.getOffbeatAlternatives);
router.post("/:id/itinerary/activities", authMiddleware, itineraryController.addCustomActivity);
router.patch("/:id/itinerary/activities/:activityId", authMiddleware, itineraryController.updateActivity);
router.delete("/:id/itinerary/activities/:activityId", authMiddleware, itineraryController.deleteActivity);

// Disruption & Automatic Replanning Engine (Step 8)
router.post("/:id/disruptions/report", authMiddleware, disruptionController.reportDisruption);
router.post("/:id/disruptions/simulate", authMiddleware, disruptionController.simulateDisruption);
router.get("/:id/disruptions", authMiddleware, disruptionController.getTripDisruptions);

// Group Consensus & Voting
router.post("/:id/votes", authMiddleware, voteController.castVote);
router.get("/:id/votes/results", authMiddleware, voteController.getVoteResults);

// Step 9: Collaborative Google Drive Shared Album & QR Code Generator
router.post("/:id/drive-folder", authMiddleware, requireTripLeader, driveFolderController.createGroupDriveFolder);
router.get("/:id/drive-folder", authMiddleware, requireTripMember, driveFolderController.getGroupDriveFolder);
router.delete("/:id/drive-folder", authMiddleware, requireTripLeader, driveFolderController.deleteGroupDriveFolder);
router.post("/:id/drive-folder/upload", authMiddleware, requireTripMember, driveFolderController.uploadToGroupFolder);
router.get("/:id/drive-folder/photos", authMiddleware, requireTripMember, driveFolderController.getGroupPhotos);

// Step 9B: Member Private Image Dumps & Dedicated QR Sharing
router.post("/:id/drive-folder/private-dumps", authMiddleware, requireTripMember, driveFolderController.createPrivateDump);
router.get("/:id/drive-folder/private-dumps", authMiddleware, requireTripMember, driveFolderController.getUserPrivateDumps);
router.get("/:id/drive-folder/private-dumps/:dumpId", authMiddleware, requireTripMember, driveFolderController.getPrivateDumpDetails);
router.post("/:id/drive-folder/private-dumps/:dumpId/upload", authMiddleware, requireTripMember, driveFolderController.uploadToPrivateDump);
router.delete("/:id/drive-folder/private-dumps/:dumpId", authMiddleware, requireTripMember, driveFolderController.deletePrivateDump);

module.exports = router;
