const pool = require("../config/db");

async function createDriveTables() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.trip_drive_folders (
        id SERIAL PRIMARY KEY,
        trip_id INT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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

    CREATE TABLE IF NOT EXISTS public.trip_photos (
        id SERIAL PRIMARY KEY,
        trip_id INT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
        folder_id INT NOT NULL REFERENCES public.trip_drive_folders(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        drive_file_id VARCHAR(255),
        mime_type VARCHAR(100) DEFAULT 'image/jpeg',
        file_size_bytes BIGINT DEFAULT 0,
        caption TEXT,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  try {
    await pool.query(sql);
    console.log("✅ Successfully created trip_drive_folders & trip_photos tables in Supabase!");
  } catch (err) {
    console.error("Error creating tables:", err.message);
  } finally {
    await pool.end();
  }
}

createDriveTables();
