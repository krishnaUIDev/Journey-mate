-- Add luggage_capacity to journeys
ALTER TABLE journeys ADD COLUMN IF NOT EXISTS luggage_capacity TEXT;

-- Add badges to user_reviews
ALTER TABLE user_reviews ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- Add badges to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';
