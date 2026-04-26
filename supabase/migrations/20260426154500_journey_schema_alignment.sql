-- Migration: Align journeys table with Shared Schema
-- Adds missing columns: contact_method, group_name, group_avatar, user_verification_tier
-- Created: 2026-04-26

ALTER TABLE journeys 
ADD COLUMN IF NOT EXISTS contact_method TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS group_name TEXT,
ADD COLUMN IF NOT EXISTS group_avatar TEXT,
ADD COLUMN IF NOT EXISTS user_verification_tier TEXT DEFAULT 'bronze';

-- Update existing contact_method based on contact_info heuristics if needed
-- (Skipping heuristic update for now to avoid data corruption; default 'email' is safe)

-- Ensure existing journeys have the default verification tier
UPDATE journeys SET user_verification_tier = 'bronze' WHERE user_verification_tier IS NULL;

-- Log the migration
COMMENT ON COLUMN journeys.contact_method IS 'The preferred way to contact the journey owner (whatsapp, instagram, email)';
COMMENT ON COLUMN journeys.group_name IS 'Custom name for the journey squad';
COMMENT ON COLUMN journeys.group_avatar IS 'Optional avatar URI for the journey squad';
COMMENT ON COLUMN journeys.user_verification_tier IS 'Trust tier of the user (bronze, silver, gold)';
