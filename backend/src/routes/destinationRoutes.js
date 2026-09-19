const express = require("express");
const router = express.Router();
const destinationController = require("../controllers/destinationController");

// Destination catalog & Indian tourist cities
router.get("/", destinationController.getAllDestinations);
router.get("/cities", destinationController.getIndianTouristCities);
router.get("/search", destinationController.searchPlaces);
router.get("/:id/weather", destinationController.getDestinationWeather);
router.get("/:id/disaster-risk", destinationController.getDestinationDisasterRisk);
router.get("/:id/hidden-gems", destinationController.getDestinationHiddenGems);
router.post("/sync-all-cities", destinationController.syncAllCitiesToDatabase);

module.exports = router;
