-- Run this in Supabase → SQL Editor before using the join/invite APIs

ALTER TABLE trips
ADD COLUMN IF NOT EXISTS invite_code VARCHAR(20) UNIQUE;
