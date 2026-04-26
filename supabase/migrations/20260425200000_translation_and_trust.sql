-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add language_preference and verification_tier to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'English',
ADD COLUMN IF NOT EXISTS verification_tier TEXT DEFAULT 'bronze' CHECK (verification_tier IN ('bronze', 'silver', 'gold'));

-- Create user_reviews table for "Kudos"
CREATE TABLE IF NOT EXISTS user_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id TEXT NOT NULL,
    reviewee_id TEXT NOT NULL,
    journey_id UUID REFERENCES journeys(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'positive' CHECK (type IN ('positive', 'neutral', 'negative')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup of reviews for a user
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewee ON user_reviews(reviewee_id);
