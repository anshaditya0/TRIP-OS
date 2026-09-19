const pool = require("../config/db");
const { generateInviteCode } = require("../utils/inviteCode");
const { calculateJourneyTiming } = require("../services/journeyTimingService");
const { getTripAlerts } = require("../services/disasterAlertService");
const { generateOfflineSyncPackage } = require("../services/offlineSyncService");
const logger = require("../utils/logger");

const createTrip = async (req, res) => {
    try {
        const {
            name,
            startDate,
            startTime,
            startLocation,
            endDate,
            endTime,
            endLocation,
            budget,
            transportMode
        } = req.body;

        if (!name || !startDate || !startTime || !startLocation || !endDate || !endTime || !endLocation || budget === undefined) {
            return res.status(400).json({
                error: "Missing required trip information"
            });
        }

        const inviteCode = generateInviteCode();

        // Insert trip
        const result = await pool.query(
            `INSERT INTO trips
            (
                name,
                start_date,
                start_time,
                start_location,
                end_date,
                end_time,
                end_location,
                budget,
                transport_mode,
                invite_code
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`,
            [
                name,
                startDate,
                startTime,
                startLocation,
                endDate,
                endTime,
                endLocation,
                budget,
                transportMode,
                inviteCode
            ]
        );

        const trip = result.rows[0];

        // Add creator as the trip leader
        await pool.query(
            `INSERT INTO trip_members
            (
                trip_id,
                user_id,
                role,
                status,
                joined_via,
                approved_at
            )
            VALUES ($1, $2, 'LEADER', 'APPROVED', 'DIRECT', NOW())`,
            [trip.id, req.user.id]
        );

        res.status(201).json({
            message: "Trip created successfully 🚀",
            trip
        });

    } catch (error) {
        logger.error("Create trip error:", error);
        res.status(500).json({
            error: "Failed to create trip"
        });
    }
};

const getAllTrips = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.*, 
                (SELECT COUNT(*) FROM trip_members tm WHERE tm.trip_id = t.id AND tm.status = 'APPROVED') as member_count
             FROM trips t
             ORDER BY t.created_at DESC`
        );

        res.json({
            message: "Trips fetched successfully 🚀",
            trips: result.rows
        });

    } catch (error) {
        logger.error("Fetch trips error:", error);
        res.status(500).json({
            error: "Failed to fetch trips"
        });
    }
};

const getTripById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT t.*, 
                (SELECT COUNT(*) FROM trip_members tm WHERE tm.trip_id = t.id AND tm.status = 'APPROVED') as member_count
             FROM trips t
             WHERE t.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Trip not found"
            });
        }

        res.json({
            message: "Trip fetched successfully 🚀",
            trip: result.rows[0]
        });

    } catch (error) {
        logger.error("Fetch trip error:", error);
        res.status(500).json({
            error: "Failed to fetch trip"
        });
    }
};

const updateTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            startDate,
            startTime,
            startLocation,
            endDate,
            endTime,
            endLocation,
            budget,
            transportMode
        } = req.body;

        const result = await pool.query(
            `UPDATE trips
             SET
                name = COALESCE($1, name),
                start_date = COALESCE($2, start_date),
                start_time = COALESCE($3, start_time),
                start_location = COALESCE($4, start_location),
                end_date = COALESCE($5, end_date),
                end_time = COALESCE($6, end_time),
                end_location = COALESCE($7, end_location),
                budget = COALESCE($8, budget),
                transport_mode = COALESCE($9, transport_mode)
             WHERE id = $10
             RETURNING *`,
            [
                name,
                startDate,
                startTime,
                startLocation,
                endDate,
                endTime,
                endLocation,
                budget,
                transportMode,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Trip not found"
            });
        }

        res.json({
            message: "Trip updated successfully 🚀",
            trip: result.rows[0]
        });

    } catch (error) {
        logger.error("Update trip error:", error);
        res.status(500).json({
            error: "Failed to update trip"
        });
    }
};

const deleteTrip = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM trips WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Trip not found"
            });
        }

        res.json({
            message: "Trip deleted successfully 🚀",
            trip: result.rows[0]
        });

    } catch (error) {
        logger.error("Delete trip error:", error);
        res.status(500).json({
            error: "Failed to delete trip"
        });
    }
};

/**
 * Smart Journey Timing: Calculates travel distance, duration, and optimal Time to Begin Journey
 */
const getTripJourneyTiming = async (req, res) => {
    try {
        const { id } = req.params;
        const timingResult = await calculateJourneyTiming(id);
        res.json(timingResult);
    } catch (error) {
        logger.error("Get journey timing error:", error);
        res.status(500).json({ error: error.message || "Failed to calculate journey timing" });
    }
};

/**
 * Natural Disaster & Route Hazard Alerts for Trip
 */
const getTripDisasterAlerts = async (req, res) => {
    try {
        const { id } = req.params;
        const alertsResult = await getTripAlerts(id);
        res.json(alertsResult);
    } catch (error) {
        logger.error("Get trip alerts error:", error);
        res.status(500).json({ error: error.message || "Failed to get trip alerts" });
    }
};

/**
 * Offline Sync & Emergency Safety Pack for Remote / Low-Connectivity Zones
 */
const getOfflinePack = async (req, res) => {
    try {
        const { id } = req.params;
        const offlinePack = await generateOfflineSyncPackage(id, req.user ? req.user.id : null);
        res.json(offlinePack);
    } catch (error) {
        logger.error("Get offline pack error:", error);
        res.status(500).json({ error: error.message || "Failed to generate offline pack" });
    }
};

module.exports = {
    createTrip,
    getAllTrips,
    getTripById,
    updateTrip,
    deleteTrip,
    getTripJourneyTiming,
    getTripDisasterAlerts,
    getOfflinePack
};
