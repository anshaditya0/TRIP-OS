/**
 * TRIP//OS Drive Folder & QR Code Controller
 * Handles Group Shared Album (Leader managed) & Member Private Image Dumps
 */

const googleDriveService = require("../services/googleDriveService");
const logger = require("../utils/logger");

/**
 * 1. Create or Link Group Shared Google Drive Folder (Leader only)
 */
const createGroupDriveFolder = async (req, res) => {
    try {
        const tripId = req.params.id;
        const userId = req.user.id;
        const { folderName, customDriveUrl, permissionLevel } = req.body;

        const folder = await googleDriveService.createOrLinkGroupFolder(tripId, userId, {
            folderName,
            customDriveUrl,
            permissionLevel
        });

        res.status(201).json({
            message: "Google Drive group album created and synced successfully 🚀",
            folder
        });
    } catch (err) {
        logger.error("Create group drive folder error:", err);
        res.status(err.statusCode || 500).json({
            error: err.message || "Failed to create group Google Drive folder"
        });
    }
};

/**
 * 2. Get Group Shared Album Details & QR Code (All Approved Members)
 */
const getGroupDriveFolder = async (req, res) => {
    try {
        const tripId = req.params.id;
        const folder = await googleDriveService.getGroupFolderDetails(tripId);

        if (!folder) {
            return res.status(200).json({
                initialized: false,
                message: "No shared Google Drive album has been created yet. Trip Leader can initialize one.",
                canInitialize: req.tripMembership?.role === "LEADER"
            });
        }

        res.status(200).json({
            initialized: true,
            folder
        });
    } catch (err) {
        logger.error("Get group drive folder error:", err);
        res.status(500).json({
            error: err.message || "Failed to retrieve group Google Drive folder"
        });
    }
};

/**
 * 3. Delete / Unlink Group Shared Folder (Leader only)
 */
const deleteGroupDriveFolder = async (req, res) => {
    try {
        const tripId = req.params.id;
        const userId = req.user.id;

        const currentFolder = await googleDriveService.getGroupFolderDetails(tripId);
        if (!currentFolder) {
            return res.status(404).json({ error: "No active group drive album found to remove" });
        }

        const result = await googleDriveService.deleteDriveFolder(currentFolder.id, tripId, userId, true);
        res.status(200).json(result);
    } catch (err) {
        logger.error("Delete group drive folder error:", err);
        res.status(err.statusCode || 500).json({
            error: err.message || "Failed to delete group drive album"
        });
    }
};

/**
 * 4. Upload / Register Photo into Group Shared Album (All Approved Members)
 */
const uploadToGroupFolder = async (req, res) => {
    try {
        const tripId = req.params.id;
        const userId = req.user.id;
        const { fileName, fileUrl, driveFileId, mimeType, fileSizeBytes, caption } = req.body;

        const currentFolder = await googleDriveService.getGroupFolderDetails(tripId);
        if (!currentFolder) {
            return res.status(400).json({
                error: "Group Google Drive album has not been initialized yet. Ask the trip leader to create it."
            });
        }

        const photo = await googleDriveService.recordPhotoUpload(tripId, currentFolder.id, userId, {
            fileName,
            fileUrl,
            driveFileId,
            mimeType,
            fileSizeBytes,
            caption
        });

        res.status(201).json({
            message: "Photo uploaded to group album successfully 📸",
            photo
        });
    } catch (err) {
        logger.error("Upload to group folder error:", err);
        res.status(err.statusCode || 500).json({
            error: err.message || "Failed to upload photo to group album"
        });
    }
};

/**
 * 5. Get Photos from Group Shared Album (All Approved Members)
 */
const getGroupPhotos = async (req, res) => {
    try {
        const tripId = req.params.id;
        const currentFolder = await googleDriveService.getGroupFolderDetails(tripId);
        if (!currentFolder) {
            return res.status(200).json({ photos: [], totalCount: 0 });
        }

        const photos = await googleDriveService.getFolderPhotos(currentFolder.id, tripId);
        res.status(200).json({
            folderId: currentFolder.id,
            folderName: currentFolder.folder_name,
            totalCount: photos.length,
            photos
        });
    } catch (err) {
        logger.error("Get group photos error:", err);
        res.status(500).json({
            error: err.message || "Failed to retrieve group photos"
        });
    }
};

/**
 * 6. Create Private Image Dump with Dedicated QR (Any Approved Member)
 */
const createPrivateDump = async (req, res) => {
    try {
        const tripId = req.params.id;
        const userId = req.user.id;
        const { dumpName, customDriveUrl, permissionLevel } = req.body;

        const dump = await googleDriveService.createPrivateDump(tripId, userId, {
            dumpName,
            customDriveUrl,
            permissionLevel
        });

        res.status(201).json({
            message: "Private Image Dump created with dedicated QR code 🔒",
            dump
        });
    } catch (err) {
        logger.error("Create private dump error:", err);
        res.status(err.statusCode || 500).json({
            error: err.message || "Failed to create private image dump"
        });
    }
};

/**
 * 7. List User's Private Image Dumps for Trip (Approved Member)
 */
const getUserPrivateDumps = async (req, res) => {
    try {
        const tripId = req.params.id;
        const userId = req.user.id;

        const dumps = await googleDriveService.getUserPrivateDumps(tripId, userId);
        res.status(200).json({
            tripId,
            totalDumps: dumps.length,
            dumps
        });
    } catch (err) {
        logger.error("Get user private dumps error:", err);
        res.status(500).json({
            error: err.message || "Failed to retrieve private dumps"
        });
    }
};

/**
 * 8. Get Private Image Dump Details & Dedicated QR Code (Approved Member)
 */
const getPrivateDumpDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const dumpId = req.params.dumpId;

        const dump = await googleDriveService.getPrivateDumpById(dumpId, userId);
        if (!dump) {
            return res.status(404).json({ error: "Private image dump not found" });
        }

        res.status(200).json({ dump });
    } catch (err) {
        logger.error("Get private dump details error:", err);
        res.status(err.statusCode || 500).json({
            error: err.message || "Failed to retrieve private dump details"
        });
    }
};

/**
 * 9. Upload Photo to Private Image Dump (Owner Approved Member)
 */
const uploadToPrivateDump = async (req, res) => {
    try {
        const tripId = req.params.id;
        const userId = req.user.id;
        const dumpId = req.params.dumpId;
        const { fileName, fileUrl, driveFileId, mimeType, fileSizeBytes, caption } = req.body;

        const photo = await googleDriveService.recordPhotoUpload(tripId, dumpId, userId, {
            fileName,
            fileUrl,
            driveFileId,
            mimeType,
            fileSizeBytes,
            caption
        });

        res.status(201).json({
            message: "Photo uploaded to private dump successfully 🔒📸",
            photo
        });
    } catch (err) {
        logger.error("Upload to private dump error:", err);
        res.status(err.statusCode || 500).json({
            error: err.message || "Failed to upload photo to private dump"
        });
    }
};

/**
 * 10. Delete Private Image Dump (Owner Approved Member)
 */
const deletePrivateDump = async (req, res) => {
    try {
        const tripId = req.params.id;
        const userId = req.user.id;
        const dumpId = req.params.dumpId;

        const result = await googleDriveService.deleteDriveFolder(dumpId, tripId, userId, false);
        res.status(200).json(result);
    } catch (err) {
        logger.error("Delete private dump error:", err);
        res.status(err.statusCode || 500).json({
            error: err.message || "Failed to delete private image dump"
        });
    }
};

module.exports = {
    createGroupDriveFolder,
    getGroupDriveFolder,
    deleteGroupDriveFolder,
    uploadToGroupFolder,
    getGroupPhotos,
    createPrivateDump,
    getUserPrivateDumps,
    getPrivateDumpDetails,
    uploadToPrivateDump,
    deletePrivateDump
};
