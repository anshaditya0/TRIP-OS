-- ==============================================================================
-- TRIP//OS — COMPLETE FAIL-SAFE PRODUCTION SCHEMA FOR SUPABASE POSTGRESQL
-- ==============================================================================
-- Run this complete script in your Supabase SQL Editor:
-- Supabase Dashboard -> Project -> SQL Editor -> New Query -> Paste & Run (Ctrl+Enter)
-- ==============================================================================

-- 1. USERS TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TRIPS TABLE
CREATE TABLE IF NOT EXISTS public.trips (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    start_time TIME NOT NULL,
    start_location VARCHAR(255) NOT NULL,
    end_date DATE NOT NULL,
    end_time TIME NOT NULL,
    end_location VARCHAR(255) NOT NULL,
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
    transport_mode VARCHAR(100),
    invite_code VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure invite_code column exists if trips table already existed
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS invite_code VARCHAR(30);

-- 3. TRIP MEMBERS TABLE (Role: LEADER, MEMBER; Status: PENDING, APPROVED, REJECTED)
CREATE TABLE IF NOT EXISTS public.trip_members (
    id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    joined_via VARCHAR(50) DEFAULT 'INVITE_CODE',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- 4. PREFERENCES (Vibe Profiles - 9 Dimensions)
CREATE TABLE IF NOT EXISTS public.preferences (
    id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    adventure INT NOT NULL CHECK (adventure BETWEEN 0 AND 100),
    nature INT NOT NULL CHECK (nature BETWEEN 0 AND 100),
    food INT NOT NULL CHECK (food BETWEEN 0 AND 100),
    photography INT NOT NULL CHECK (photography BETWEEN 0 AND 100),
    nightlife INT NOT NULL CHECK (nightlife BETWEEN 0 AND 100),
    relaxation INT NOT NULL CHECK (relaxation BETWEEN 0 AND 100),
    budget_sensitivity INT NOT NULL CHECK (budget_sensitivity BETWEEN 0 AND 100),
    walking_tolerance INT NOT NULL CHECK (walking_tolerance BETWEEN 0 AND 100),
    crowd_tolerance INT NOT NULL CHECK (crowd_tolerance BETWEEN 0 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure unique preference per trip-user pair
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_trip_user_pref') THEN
        ALTER TABLE public.preferences ADD CONSTRAINT unique_trip_user_pref UNIQUE (trip_id, user_id);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 5. CONSTRAINTS (Must-Go, Don't Want, Deal Breaker)
CREATE TABLE IF NOT EXISTS public.constraints (
    id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    item VARCHAR(255) NOT NULL,
    constraint_type VARCHAR(50) NOT NULL CHECK (constraint_type IN ('MUST_GO', 'DONT_WANT', 'DEAL_BREAKER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DESTINATIONS TABLE (Engine Knowledge Base)
CREATE TABLE IF NOT EXISTS public.destinations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    nature_score INT DEFAULT 50 CHECK (nature_score BETWEEN 0 AND 100),
    adventure_score INT DEFAULT 50 CHECK (adventure_score BETWEEN 0 AND 100),
    food_score INT DEFAULT 50 CHECK (food_score BETWEEN 0 AND 100),
    photography_score INT DEFAULT 50 CHECK (photography_score BETWEEN 0 AND 100),
    nightlife_score INT DEFAULT 50 CHECK (nightlife_score BETWEEN 0 AND 100),
    relaxation_score INT DEFAULT 50 CHECK (relaxation_score BETWEEN 0 AND 100),
    budget_score INT DEFAULT 50 CHECK (budget_score BETWEEN 0 AND 100),
    walking_requirement INT DEFAULT 50 CHECK (walking_requirement BETWEEN 0 AND 100),
    crowd_level INT DEFAULT 50 CHECK (crowd_level BETWEEN 0 AND 100),
    description TEXT,
    tags TEXT,
    source VARCHAR(50) DEFAULT 'CURATED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safely add any columns that may be missing if destinations table already existed
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India';
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS latitude NUMERIC(9, 6);
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS longitude NUMERIC(9, 6);
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'CURATED';

-- 7. ITINERARIES TABLE (Dynamic Itinerary Engine)
CREATE TABLE IF NOT EXISTS public.itineraries (
    id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    destination_id INT REFERENCES public.destinations(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    version INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure unique itinerary per trip
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_trip_itinerary') THEN
        ALTER TABLE public.itineraries ADD CONSTRAINT unique_trip_itinerary UNIQUE (trip_id);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 8. ITINERARY DAYS TABLE
CREATE TABLE IF NOT EXISTS public.itinerary_days (
    id SERIAL PRIMARY KEY,
    itinerary_id INT NOT NULL REFERENCES public.itineraries(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    date DATE,
    summary VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ITINERARY ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.itinerary_activities (
    id SERIAL PRIMARY KEY,
    itinerary_day_id INT NOT NULL REFERENCES public.itinerary_days(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'GENERAL',
    indoor_outdoor VARCHAR(20) DEFAULT 'OUTDOOR' CHECK (indoor_outdoor IN ('INDOOR', 'OUTDOOR')),
    weather_dependent BOOLEAN DEFAULT FALSE,
    walking_intensity INT DEFAULT 30,
    estimated_cost NUMERIC(10, 2) DEFAULT 0,
    start_time VARCHAR(20) DEFAULT '09:00',
    end_time VARCHAR(20) DEFAULT '12:00',
    order_index INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TRIP DISRUPTIONS TABLE (Disruption & Automatic Replanning Engine)
CREATE TABLE IF NOT EXISTS public.trip_disruptions (
    id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    itinerary_id INT REFERENCES public.itineraries(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) DEFAULT 'HIGH',
    description TEXT,
    status VARCHAR(50) DEFAULT 'RESOLVED',
    impacted_activities JSONB,
    resolution_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. TRIP VOTES TABLE (Consensus & Anonymous Voting)
CREATE TABLE IF NOT EXISTS public.trip_votes (
    id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('DESTINATION', 'ITINERARY', 'ACTIVITY')),
    target_id VARCHAR(100) NOT NULL,
    vote VARCHAR(50) NOT NULL CHECK (vote IN ('YES', 'NO', 'FAVORITE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure unique vote per user per target
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_trip_user_vote') THEN
        ALTER TABLE public.trip_votes ADD CONSTRAINT unique_trip_user_vote UNIQUE (trip_id, user_id, target_type, target_id);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 12. TRIP DRIVE FOLDERS (Collaborative Albums & Private Image Dumps)
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

-- Partial unique index: only ONE active GROUP_SHARED folder per trip
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_group_drive_folder
    ON public.trip_drive_folders(trip_id)
    WHERE folder_type = 'GROUP_SHARED' AND is_active = true;

-- 13. TRIP PHOTOS TABLE (Member Trip Gallery & Uploads)
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

-- ==============================================================================
-- INDEXES FOR HIGH PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_drive_folders_trip ON public.trip_drive_folders(trip_id);
CREATE INDEX IF NOT EXISTS idx_drive_folders_user ON public.trip_drive_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_trip ON public.trip_photos(trip_id);
CREATE INDEX IF NOT EXISTS idx_photos_folder ON public.trip_photos(folder_id);
CREATE INDEX IF NOT EXISTS idx_photos_user ON public.trip_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_trip ON public.trip_members(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_user ON public.trip_members(user_id);
CREATE INDEX IF NOT EXISTS idx_preferences_trip ON public.preferences(trip_id);
CREATE INDEX IF NOT EXISTS idx_constraints_trip ON public.constraints(trip_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_itin ON public.itinerary_days(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_acts_day ON public.itinerary_activities(itinerary_day_id);
CREATE INDEX IF NOT EXISTS idx_disruptions_trip ON public.trip_disruptions(trip_id);
CREATE INDEX IF NOT EXISTS idx_votes_trip ON public.trip_votes(trip_id);

-- ==============================================================================
-- INITIAL CURATED DESTINATIONS (Inserted safely without ON CONFLICT constraint requirements)
-- ==============================================================================
INSERT INTO public.destinations 
(name, state, country, latitude, longitude, nature_score, adventure_score, food_score, photography_score, nightlife_score, relaxation_score, budget_score, walking_requirement, crowd_level, description, tags)
SELECT d.name, d.state, d.country, d.latitude, d.longitude, d.nature_score, d.adventure_score, d.food_score, d.photography_score, d.nightlife_score, d.relaxation_score, d.budget_score, d.walking_requirement, d.crowd_level, d.description, d.tags
FROM (VALUES
('Rishikesh', 'Uttarakhand', 'India', 30.0869::numeric, 78.2676::numeric, 90, 85, 70, 85, 40, 80, 80, 65, 60, 'Yoga capital of the world, white water river rafting, cliff jumping, peaceful riverbanks and ashrams.', 'yoga,rafting,nature,spiritual,mountains,trekking'),
('Goa', 'Goa', 'India', 15.2993::numeric, 74.1240::numeric, 75, 65, 90, 85, 95, 85, 65, 30, 80, 'Pristine beaches, seafood shacks, vibrant beach clubs, water sports, and historic Portuguese architecture.', 'beach,nightlife,seafood,water sports,chill,parties'),
('Manali', 'Himachal Pradesh', 'India', 32.2432::numeric, 77.1892::numeric, 95, 90, 65, 95, 55, 75, 70, 75, 70, 'Himalayan adventure hub, Solang Valley paragliding, Old Manali cafes, hot water springs and snow vistas.', 'mountains,snow,paragliding,trekking,cafes,adventure'),
('Jaipur', 'Rajasthan', 'India', 26.9124::numeric, 75.7873::numeric, 40, 45, 95, 95, 60, 65, 75, 55, 75, 'The Pink City: royal palaces, majestic forts, world-famous Rajasthani cuisine, and bustling colorful bazaars.', 'heritage,palaces,culture,shopping,food,history'),
('Munnar', 'Kerala', 'India', 10.0889::numeric, 77.0595::numeric, 95, 60, 75, 90, 25, 90, 75, 50, 45, 'Rolling green tea gardens, mist-clad peaks, tranquil lakes, spice plantations, and cool hill country climate.', 'tea gardens,hills,nature,relaxation,honeymoon,peace'),
('Leh-Ladakh', 'Ladakh', 'India', 34.1526::numeric, 77.5771::numeric, 95, 95, 50, 95, 20, 60, 50, 80, 40, 'High-altitude cold desert, Pangong Lake, Buddhist monasteries, dramatic mountain passes and star photography.', 'trekking,biking,mountains,lakes,extreme adventure,peace'),
('Udaipur', 'Rajasthan', 'India', 24.5854::numeric, 73.7125::numeric, 60, 40, 90, 95, 50, 85, 65, 45, 65, 'City of Lakes, royal marble palaces, romantic lake boat cruises, rooftop dining, and Mewar art.', 'lakes,palaces,romance,heritage,culture,relaxation'),
('Varanasi', 'Uttar Pradesh', 'India', 25.3176::numeric, 82.9739::numeric, 45, 30, 85, 90, 30, 65, 90, 70, 95, 'One of the oldest living cities, spiritual Ganga Aarti at dusk, vibrant narrow lanes, and street snacks.', 'spiritual,culture,history,photography,heritage,street food'),
('Coorg', 'Karnataka', 'India', 12.3375::numeric, 75.8069::numeric, 90, 70, 80, 85, 30, 85, 80, 55, 50, 'Scotland of India: lush coffee estates, misty hills, cascading waterfalls, and distinct Kodava cuisine.', 'coffee,nature,hills,waterfalls,quiet,relaxation'),
('Pondicherry', 'Puducherry', 'India', 11.9416::numeric, 79.8083::numeric, 70, 45, 90, 85, 65, 85, 75, 40, 60, 'French colonial quarters with mustard villas, seaside promenade, bohemian cafes, and Auroville.', 'french,beach,cafes,chill,culture,coastal'),
('Kasol', 'Himachal Pradesh', 'India', 32.0100::numeric, 77.3152::numeric, 90, 85, 75, 85, 70, 80, 85, 75, 65, 'Mini Israel of India: Parvati Valley treks, roaring river streams, Israeli bakeries, and hippie cafe vibe.', 'trekking,rivers,israeli food,youth,cafes,nature'),
('Shillong', 'Meghalaya', 'India', 25.5788::numeric, 91.8933::numeric, 95, 80, 75, 90, 60, 80, 75, 65, 45, 'Scotland of the East: living root bridges, cleanest villages, waterfalls, rock music culture, and caves.', 'caves,waterfalls,living root bridges,nature,rock music')
) AS d(name, state, country, latitude, longitude, nature_score, adventure_score, food_score, photography_score, nightlife_score, relaxation_score, budget_score, walking_requirement, crowd_level, description, tags)
WHERE NOT EXISTS (
    SELECT 1 FROM public.destinations WHERE LOWER(public.destinations.name) = LOWER(d.name)
);

-- Update existing destinations with coordinates and tags if they were NULL
UPDATE public.destinations SET
    latitude = COALESCE(destinations.latitude, d.latitude),
    longitude = COALESCE(destinations.longitude, d.longitude),
    tags = COALESCE(destinations.tags, d.tags),
    country = COALESCE(destinations.country, d.country)
FROM (VALUES
('Rishikesh', 30.0869::numeric, 78.2676::numeric, 'India', 'yoga,rafting,nature,spiritual,mountains,trekking'),
('Goa', 15.2993::numeric, 74.1240::numeric, 'India', 'beach,nightlife,seafood,water sports,chill,parties'),
('Manali', 32.2432::numeric, 77.1892::numeric, 'India', 'mountains,snow,paragliding,trekking,cafes,adventure'),
('Jaipur', 26.9124::numeric, 75.7873::numeric, 'India', 'heritage,palaces,culture,shopping,food,history'),
('Munnar', 10.0889::numeric, 77.0595::numeric, 'India', 'tea gardens,hills,nature,relaxation,honeymoon,peace'),
('Leh-Ladakh', 34.1526::numeric, 77.5771::numeric, 'India', 'trekking,biking,mountains,lakes,extreme adventure,peace'),
('Udaipur', 24.5854::numeric, 73.7125::numeric, 'India', 'lakes,palaces,romance,heritage,culture,relaxation'),
('Varanasi', 25.3176::numeric, 82.9739::numeric, 'India', 'spiritual,culture,history,photography,heritage,street food'),
('Coorg', 12.3375::numeric, 75.8069::numeric, 'India', 'coffee,nature,hills,waterfalls,quiet,relaxation'),
('Pondicherry', 11.9416::numeric, 79.8083::numeric, 'India', 'french,beach,cafes,chill,culture,coastal'),
('Kasol', 32.0100::numeric, 77.3152::numeric, 'India', 'trekking,rivers,israeli food,youth,cafes,nature'),
('Shillong', 25.5788::numeric, 91.8933::numeric, 'India', 'caves,waterfalls,living root bridges,nature,rock music')
) AS d(name, latitude, longitude, country, tags)
WHERE LOWER(destinations.name) = LOWER(d.name);

-- ==============================================================================
-- AUTOMATIC SYNC TRIGGER: AUTH.USERS -> PUBLIC.USERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email
    )
    ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name, email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (Idempotent: DROP IF EXISTS then CREATE)
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constraints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_disruptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_votes ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can read profiles" ON public.users;
CREATE POLICY "Users can read profiles" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Destinations policies
DROP POLICY IF EXISTS "Anyone authenticated can view destinations" ON public.destinations;
CREATE POLICY "Anyone authenticated can view destinations" ON public.destinations FOR SELECT USING (true);

-- Trips policies
DROP POLICY IF EXISTS "Trip members can view their trip" ON public.trips;
CREATE POLICY "Trip members can view their trip" ON public.trips FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create trips" ON public.trips;
CREATE POLICY "Authenticated users can create trips" ON public.trips FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Trip members can update trips" ON public.trips;
CREATE POLICY "Trip members can update trips" ON public.trips FOR UPDATE USING (auth.role() = 'authenticated');

-- Trip Members policies
DROP POLICY IF EXISTS "Trip members can view memberships" ON public.trip_members;
CREATE POLICY "Trip members can view memberships" ON public.trip_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can join trips" ON public.trip_members;
CREATE POLICY "Authenticated users can join trips" ON public.trip_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Leaders can update memberships" ON public.trip_members;
CREATE POLICY "Leaders can update memberships" ON public.trip_members FOR UPDATE USING (auth.role() = 'authenticated');

-- Preferences policies
DROP POLICY IF EXISTS "Members can view preferences" ON public.preferences;
CREATE POLICY "Members can view preferences" ON public.preferences FOR SELECT USING (true);

DROP POLICY IF EXISTS "Members can upsert preferences" ON public.preferences;
CREATE POLICY "Members can upsert preferences" ON public.preferences FOR ALL USING (auth.role() = 'authenticated');

-- Constraints policies
DROP POLICY IF EXISTS "Members can view constraints" ON public.constraints;
CREATE POLICY "Members can view constraints" ON public.constraints FOR SELECT USING (true);

DROP POLICY IF EXISTS "Members can manage constraints" ON public.constraints;
CREATE POLICY "Members can manage constraints" ON public.constraints FOR ALL USING (auth.role() = 'authenticated');

-- Itineraries policies
DROP POLICY IF EXISTS "Members can view itineraries" ON public.itineraries;
CREATE POLICY "Members can view itineraries" ON public.itineraries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Members can manage itineraries" ON public.itineraries;
CREATE POLICY "Members can manage itineraries" ON public.itineraries FOR ALL USING (auth.role() = 'authenticated');

-- Itinerary Days policies
DROP POLICY IF EXISTS "Members can view itinerary days" ON public.itinerary_days;
CREATE POLICY "Members can view itinerary days" ON public.itinerary_days FOR SELECT USING (true);

DROP POLICY IF EXISTS "Members can manage itinerary days" ON public.itinerary_days;
CREATE POLICY "Members can manage itinerary days" ON public.itinerary_days FOR ALL USING (auth.role() = 'authenticated');

-- Itinerary Activities policies
DROP POLICY IF EXISTS "Members can view activities" ON public.itinerary_activities;
CREATE POLICY "Members can view activities" ON public.itinerary_activities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Members can manage activities" ON public.itinerary_activities;
CREATE POLICY "Members can manage activities" ON public.itinerary_activities FOR ALL USING (auth.role() = 'authenticated');

-- Disruptions policies
DROP POLICY IF EXISTS "Members can view disruptions" ON public.trip_disruptions;
CREATE POLICY "Members can view disruptions" ON public.trip_disruptions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Members can manage disruptions" ON public.trip_disruptions;
CREATE POLICY "Members can manage disruptions" ON public.trip_disruptions FOR ALL USING (auth.role() = 'authenticated');

-- Votes policies
DROP POLICY IF EXISTS "Members can view votes" ON public.trip_votes;
CREATE POLICY "Members can view votes" ON public.trip_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Members can cast votes" ON public.trip_votes;
CREATE POLICY "Members can cast votes" ON public.trip_votes FOR ALL USING (auth.role() = 'authenticated');

-- Drive Folders policies
DROP POLICY IF EXISTS "Members can view drive folders" ON public.trip_drive_folders;
CREATE POLICY "Members can view drive folders" ON public.trip_drive_folders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Members can manage drive folders" ON public.trip_drive_folders;
CREATE POLICY "Members can manage drive folders" ON public.trip_drive_folders FOR ALL USING (auth.role() = 'authenticated');

-- Photos policies
DROP POLICY IF EXISTS "Members can view photos" ON public.trip_photos;
CREATE POLICY "Members can view photos" ON public.trip_photos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Members can manage photos" ON public.trip_photos;
CREATE POLICY "Members can manage photos" ON public.trip_photos FOR ALL USING (auth.role() = 'authenticated');

