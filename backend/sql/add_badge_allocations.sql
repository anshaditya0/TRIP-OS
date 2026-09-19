-- ==============================================================================
-- TRIP//OS — TRAVEL BADGE ALLOCATION SYSTEM SCHEMA
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_badges (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    destination VARCHAR(255) NOT NULL,
    badge_title VARCHAR(255) NOT NULL,
    icon_emoji VARCHAR(50) DEFAULT '🏆',
    rarity VARCHAR(50) DEFAULT 'RARE' CHECK (rarity IN ('COMMON', 'UNCOMMON', 'RARE', 'LEGENDARY')),
    earned_reason VARCHAR(255),
    bg_gradient VARCHAR(100) DEFAULT 'from-amber-500 to-orange-500',
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure index on user_id and destination for fast querying
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_dest ON public.user_badges(destination);

-- Enable Row Level Security
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Idempotent RLS Policies
DROP POLICY IF EXISTS "Anyone can view user badges" ON public.user_badges;
CREATE POLICY "Anyone can view user badges" ON public.user_badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert user badges" ON public.user_badges;
CREATE POLICY "Authenticated users can insert user badges" ON public.user_badges FOR INSERT WITH CHECK (true);
