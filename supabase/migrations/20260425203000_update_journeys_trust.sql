-- Add user_verification_tier to journeys table for denormalized access in feed
ALTER TABLE journeys 
ADD COLUMN IF NOT EXISTS user_verification_tier TEXT DEFAULT 'bronze' CHECK (user_verification_tier IN ('bronze', 'silver', 'gold'));
