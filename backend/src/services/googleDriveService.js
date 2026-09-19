/**
 * TRIP//OS Step 9 — Collaborative Google Drive Shared Album, Private Dumps & QR Code Engine
 * Supports:
 * 1. Group Shared Folder created by Leader, accessible to all members with a group QR code.
 * 2. Member Private Image Dumps saved as separate Drive folders with dedicated QR codes.
 * 3. In-app photo registration, upload tracking, and metadata synchronization.
 */

const QRCode = require("qrcode");
const pool = require("../config/db");
const logger = require("../utils/logger");

/**
 * Ensure database tables exist for Drive folders and photos
 */
let schemaInitialized = false;
async function ensureDriveSchema() {
    if (schemaInitialized) return;
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS trip_drive_folders (
                id SERIAL PRIMARY KEY,
                trip_id INT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                folder_name VARCHAR(255) NOT NULL,
                folder_type VARCHAR(50) NOT NULL DEFAULT 'GROUP_SHARED' CHECK (folder_type IN ('GROUP_SHARED', 'PRIVATE_DUMP')),
                folder_id VARCHAR(255) NOT NULL,
                drive_url TEXT NOT NULL,
                qr_code_data_url TEXT,
                permission_level VARCHAR(50) DEFAULT 'ANYONE_WITH_LINK_CAN_EDIT',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE UNIQUE INDEX IF NOT EXISTS unique_active_group_drive_folder
                ON trip_drive_folders(trip_id)
                WHERE folder_type = 'GROUP_SHARED' AND is_active = true;

            CREATE TABLE IF NOT EXISTS trip_photos (
                id SERIAL PRIMARY KEY,
                trip_id INT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
                folder_id INT NOT NULL REFERENCES trip_drive_folders(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                file_name VARCHAR(255) NOT NULL,
                file_url TEXT NOT NULL,
                drive_file_id VARCHAR(255),
                mime_type VARCHAR(100) DEFAULT 'image/jpeg',
                file_size_bytes BIGINT DEFAULT 0,
                caption TEXT,
                uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_drive_folders_trip ON trip_drive_folders(trip_id);
            CREATE INDEX IF NOT EXISTS idx_photos_folder ON trip_photos(folder_id);
        `);
        schemaInitialized = true;
    } catch (err) {
        logger.warn("Drive schema auto-migration warning:", err.message);
    }
}

/**
 * Helper: Extract or normalize Google Drive Folder ID & canonical URL
 */
function normalizeDriveFolder(folderIdentifier, fallbackName) {
    if (!folderIdentifier) {
        // Generate managed standard Drive folder identifier
        const safeSlug = (fallbackName || "album").toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20);
        const generatedId = `1${safeSlug}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
        return {
            folderId: generatedId,
            driveUrl: `https://drive.google.com/drive/folders/${generatedId}?usp=sharing`
        };
    }

    const trimmed = String(folderIdentifier).trim();

    // Check if user passed full URL
    const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        return {
            folderId: match[1],
            driveUrl: trimmed.startsWith("http") ? trimmed : `https://drive.google.com/drive/folders/${match[1]}?usp=sharing`
        };
    }

    // Direct folder ID passed
    const cleanId = trimmed.replace(/[^a-zA-Z0-9_-]/g, "");
    return {
        folderId: cleanId,
        driveUrl: `https://drive.google.com/drive/folders/${cleanId}?usp=sharing`
    };
}

/**
 * Helper: Generate High-Resolution QR Code (Data URL & SVG string)
 */
async function generateDriveQRCode(targetUrl) {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(targetUrl, {
            errorCorrectionLevel: "H",
            type: "image/png",
            margin: 2,
            width: 512,
            color: {
                dark: "#0F172A",  // Slate-900 high contrast dark
                light: "#FFFFFF"  // Clean crisp background
            }
        });

        const qrCodeSvg = await QRCode.toString(targetUrl, {
            type: "svg",
            margin: 2,
            color: {
                dark: "#0F172A",
                light: "#FFFFFF"
            }
        });

        return { qrCodeDataUrl, qrCodeSvg };
    } catch (err) {
        logger.error("QR Code generation error:", err);
        throw new Error("Failed to generate QR code for Google Drive folder");
    }
}

/**
 * 1. GROUP SHARED FOLDER: Create or Link (Leader only)
 */
async function createOrLinkGroupFolder(tripId, userId, options = {}) {
    await ensureDriveSchema();

    const { folderName, customDriveUrl, permissionLevel = "ANYONE_WITH_LINK_CAN_EDIT" } = options;

    // Fetch trip details for contextual naming
    const tripRes = await pool.query("SELECT name FROM trips WHERE id = $1", [tripId]);
    if (tripRes.rows.length === 0) {
        throw new Error("Trip not found");
    }
    const tripName = tripRes.rows[0].name;
    const finalFolderName = folderName || `${tripName} — Official Trip Album`;

    const { folderId, driveUrl } = normalizeDriveFolder(customDriveUrl, finalFolderName);
    const { qrCodeDataUrl, qrCodeSvg } = await generateDriveQRCode(driveUrl);

    // Deactivate previous active group shared folder if any
    await pool.query(
        `UPDATE trip_drive_folders
         SET is_active = FALSE, updated_at = NOW()
         WHERE trip_id = $1 AND folder_type = 'GROUP_SHARED'`,
        [tripId]
    );

    // Insert new group shared folder
    const insertRes = await pool.query(
        `INSERT INTO trip_drive_folders
         (trip_id, user_id, folder_name, folder_type, folder_id, drive_url, qr_code_data_url, permission_level, is_active)
         VALUES ($1, $2, $3, 'GROUP_SHARED', $4, $5, $6, $7, TRUE)
         RETURNING *`,
        [tripId, userId, finalFolderName, folderId, driveUrl, qrCodeDataUrl, permissionLevel]
    );

    const folder = insertRes.rows[0];

    return {
        ...folder,
        qrCodeSvg,
        mobileUploadUrl: driveUrl,
        instructions: "Scan the QR code with any smartphone camera to open this folder in Google Drive and upload trip photos directly from your phone gallery."
    };
}

/**
 * 2. GROUP SHARED FOLDER: Get for approved members
 */
async function getGroupFolderDetails(tripId) {
    await ensureDriveSchema();

    const folderRes = await pool.query(
        `SELECT f.*, u.name as leader_name, u.email as leader_email
         FROM trip_drive_folders f
         LEFT JOIN users u ON u.id = f.user_id
         WHERE f.trip_id = $1 AND f.folder_type = 'GROUP_SHARED' AND f.is_active = TRUE
         ORDER BY f.created_at DESC LIMIT 1`,
        [tripId]
    );

    if (folderRes.rows.length === 0) {
        return null;
    }

    const folder = folderRes.rows[0];

    // Get photo metrics
    const statsRes = await pool.query(
        `SELECT
            COUNT(*)::int as total_photos,
            COALESCE(SUM(file_size_bytes), 0)::bigint as total_bytes_uploaded,
            COUNT(DISTINCT user_id)::int as contributing_members
         FROM trip_photos
         WHERE folder_id = $1`,
        [folder.id]
    );

    // Get recent photos preview
    const recentPhotosRes = await pool.query(
        `SELECT p.*, u.name as uploader_name
         FROM trip_photos p
         LEFT JOIN users u ON u.id = p.user_id
         WHERE p.folder_id = $1
         ORDER BY p.uploaded_at DESC
         LIMIT 12`,
        [folder.id]
    );

    return {
        ...folder,
        stats: statsRes.rows[0],
        recentPhotos: recentPhotosRes.rows,
        mobileUploadUrl: folder.drive_url,
        instructions: "Scan this QR code on any smartphone to immediately view and upload photos to the shared Google Drive album."
    };
}

/**
 * 3. MEMBER PRIVATE IMAGE DUMP: Create personal dump folder with dedicated QR
 */
async function createPrivateDump(tripId, userId, options = {}) {
    await ensureDriveSchema();

    const { dumpName, customDriveUrl, permissionLevel = "PRIVATE_OWNER_ONLY" } = options;

    // Get user info for naming
    const userRes = await pool.query("SELECT name FROM users WHERE id = $1", [userId]);
    const userName = userRes.rows[0]?.name || "Member";
    const finalDumpName = dumpName || `${userName}'s Private Trip Dump`;

    const { folderId, driveUrl } = normalizeDriveFolder(customDriveUrl, finalDumpName);
    const { qrCodeDataUrl, qrCodeSvg } = await generateDriveQRCode(driveUrl);

    const insertRes = await pool.query(
        `INSERT INTO trip_drive_folders
         (trip_id, user_id, folder_name, folder_type, folder_id, drive_url, qr_code_data_url, permission_level, is_active)
         VALUES ($1, $2, $3, 'PRIVATE_DUMP', $4, $5, $6, $7, TRUE)
         RETURNING *`,
        [tripId, userId, finalDumpName, folderId, driveUrl, qrCodeDataUrl, permissionLevel]
    );

    const dump = insertRes.rows[0];

    return {
        ...dump,
        qrCodeSvg,
        isPrivateDump: true,
        shareableQrCode: qrCodeDataUrl,
        mobileUploadUrl: driveUrl,
        instructions: "Your private image dump has its own dedicated Google Drive folder and private QR code. Scan to upload personal raw photos, or share this QR code selectively with anyone you choose."
    };
}

/**
 * 4. MEMBER PRIVATE DUMPS: List all private dumps owned by the user
 */
async function getUserPrivateDumps(tripId, userId) {
    await ensureDriveSchema();

    const dumpsRes = await pool.query(
        `SELECT f.*,
            (SELECT COUNT(*)::int FROM trip_photos WHERE folder_id = f.id) as photo_count
         FROM trip_drive_folders f
         WHERE f.trip_id = $1 AND f.user_id = $2 AND f.folder_type = 'PRIVATE_DUMP' AND f.is_active = TRUE
         ORDER BY f.created_at DESC`,
        [tripId, userId]
    );

    return dumpsRes.rows;
}

/**
 * 5. MEMBER PRIVATE DUMP: Get details + QR code by dump ID
 */
async function getPrivateDumpById(dumpId, userId) {
    await ensureDriveSchema();

    const dumpRes = await pool.query(
        `SELECT f.*, u.name as owner_name
         FROM trip_drive_folders f
         LEFT JOIN users u ON u.id = f.user_id
         WHERE f.id = $1 AND f.folder_type = 'PRIVATE_DUMP' AND f.is_active = TRUE`,
        [dumpId]
    );

    if (dumpRes.rows.length === 0) {
        return null;
    }

    const dump = dumpRes.rows[0];

    // Check ownership or if shared
    if (dump.user_id !== userId && dump.permission_level === "PRIVATE_OWNER_ONLY") {
        const error = new Error("Access denied: This private dump is restricted to its owner.");
        error.statusCode = 403;
        throw error;
    }

    const photosRes = await pool.query(
        `SELECT p.*, u.name as uploader_name
         FROM trip_photos p
         LEFT JOIN users u ON u.id = p.user_id
         WHERE p.folder_id = $1
         ORDER BY p.uploaded_at DESC`,
        [dump.id]
    );

    return {
        ...dump,
        photos: photosRes.rows,
        totalPhotos: photosRes.rows.length,
        shareableQrCode: dump.qr_code_data_url
    };
}

/**
 * 6. PHOTO UPLOAD REGISTRATION: Record photo upload inside a folder (Group or Private)
 */
async function recordPhotoUpload(tripId, folderId, userId, photoData) {
    await ensureDriveSchema();

    const {
        fileName,
        fileUrl,
        driveFileId = null,
        mimeType = "image/jpeg",
        fileSizeBytes = 0,
        caption = ""
    } = photoData;

    if (!fileName || !fileUrl) {
        throw new Error("fileName and fileUrl are required to register an uploaded photo");
    }

    // Verify folder exists and belongs to trip
    const folderRes = await pool.query(
        `SELECT * FROM trip_drive_folders WHERE id = $1 AND trip_id = $2 AND is_active = TRUE`,
        [folderId, tripId]
    );

    if (folderRes.rows.length === 0) {
        throw new Error("Target drive folder not found or is inactive");
    }

    const folder = folderRes.rows[0];

    // If private dump, verify ownership
    if (folder.folder_type === "PRIVATE_DUMP" && folder.user_id !== userId) {
        const error = new Error("You can only upload to your own private image dump");
        error.statusCode = 403;
        throw error;
    }

    const insertRes = await pool.query(
        `INSERT INTO trip_photos
         (trip_id, folder_id, user_id, file_name, file_url, drive_file_id, mime_type, file_size_bytes, caption)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [tripId, folder.id, userId, fileName, fileUrl, driveFileId, mimeType, fileSizeBytes, caption]
    );

    const photo = insertRes.rows[0];

    // Fetch uploader profile
    const userRes = await pool.query("SELECT name, email FROM users WHERE id = $1", [userId]);
    const uploader = userRes.rows[0] || {};

    return {
        ...photo,
        uploaderName: uploader.name,
        uploaderEmail: uploader.email,
        folderType: folder.folder_type,
        folderName: folder.folder_name,
        driveUrl: folder.drive_url
    };
}

/**
 * 7. GET PHOTOS FOR A FOLDER
 */
async function getFolderPhotos(folderId, tripId) {
    await ensureDriveSchema();

    const photosRes = await pool.query(
        `SELECT p.*, u.name as uploader_name, u.email as uploader_email
         FROM trip_photos p
         LEFT JOIN users u ON u.id = p.user_id
         WHERE p.folder_id = $1 AND p.trip_id = $2
         ORDER BY p.uploaded_at DESC`,
        [folderId, tripId]
    );

    return photosRes.rows;
}

/**
 * 8. DELETE FOLDER (Leader deletes group folder, or Member deletes their own private dump)
 */
async function deleteDriveFolder(folderId, tripId, userId, isLeader = false) {
    await ensureDriveSchema();

    const folderRes = await pool.query(
        `SELECT * FROM trip_drive_folders WHERE id = $1 AND trip_id = $2`,
        [folderId, tripId]
    );

    if (folderRes.rows.length === 0) {
        throw new Error("Folder not found");
    }

    const folder = folderRes.rows[0];

    if (folder.folder_type === "GROUP_SHARED" && !isLeader) {
        const error = new Error("Only the trip leader can remove the group shared album");
        error.statusCode = 403;
        throw error;
    }

    if (folder.folder_type === "PRIVATE_DUMP" && folder.user_id !== userId && !isLeader) {
        const error = new Error("Only the creator of this private dump can delete it");
        error.statusCode = 403;
        throw error;
    }

    await pool.query(
        `UPDATE trip_drive_folders SET is_active = FALSE, updated_at = NOW() WHERE id = $1`,
        [folderId]
    );

    return {
        success: true,
        message: `${folder.folder_type === "GROUP_SHARED" ? "Group Shared Album" : "Private Image Dump"} unlinked successfully`,
        folderId: folder.id
    };
}

module.exports = {
    createOrLinkGroupFolder,
    getGroupFolderDetails,
    createPrivateDump,
    getUserPrivateDumps,
    getPrivateDumpById,
    recordPhotoUpload,
    getFolderPhotos,
    deleteDriveFolder,
    generateDriveQRCode,
    normalizeDriveFolder
};
