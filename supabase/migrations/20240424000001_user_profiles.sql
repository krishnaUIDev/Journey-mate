-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY, -- Stores the user_id (Clerk ID)
    username TEXT,
    avatar_url TEXT,
    avg_rating NUMERIC DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create journey_reviews table
CREATE TABLE IF NOT EXISTS journey_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    reviewer_id TEXT NOT NULL,
    reviewee_id TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(journey_id, reviewer_id, reviewee_id) -- One review per person per journey
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_reviews ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON user_profiles;
CREATE POLICY "Profiles are viewable by everyone" ON user_profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (id = id); -- Placeholder, usually check against auth provider or custom logic

DROP POLICY IF EXISTS "Allow public insert for profiles" ON user_profiles;
CREATE POLICY "Allow public insert for profiles" ON user_profiles
    FOR INSERT WITH CHECK (true);

-- Journey Reviews Policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON journey_reviews;
CREATE POLICY "Reviews are viewable by everyone" ON journey_reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON journey_reviews;
CREATE POLICY "Users can create reviews" ON journey_reviews
    FOR INSERT WITH CHECK (true);

-- Function to update user rating
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_profiles
    SET 
        avg_rating = (
            SELECT AVG(rating)::NUMERIC(2,1)
            FROM journey_reviews
            WHERE reviewee_id = NEW.reviewee_id
        ),
        review_count = (
            SELECT COUNT(*)
            FROM journey_reviews
            WHERE reviewee_id = NEW.reviewee_id
        )
    WHERE id = NEW.reviewee_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run after a review is inserted or updated
DROP TRIGGER IF EXISTS tr_update_user_rating ON journey_reviews;
CREATE TRIGGER tr_update_user_rating
AFTER INSERT OR UPDATE ON journey_reviews
FOR EACH ROW EXECUTE FUNCTION update_user_rating();

-- Add sample profiles to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE journey_reviews;
