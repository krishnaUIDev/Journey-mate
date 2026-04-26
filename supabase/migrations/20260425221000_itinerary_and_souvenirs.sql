-- Create journey_itinerary table
CREATE TABLE IF NOT EXISTS journey_itinerary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'activity' CHECK (type IN ('meetup', 'activity', 'layover', 'food', 'transport')),
    start_time TIMESTAMP WITH TIME ZONE,
    location TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup of itinerary items for a journey
CREATE INDEX IF NOT EXISTS idx_journey_itinerary_journey ON journey_itinerary(journey_id);

-- Create journey_souvenirs table
CREATE TABLE IF NOT EXISTS journey_souvenirs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    type TEXT DEFAULT 'photo' CHECK (type IN ('photo', 'note')),
    content TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup of souvenirs for a journey
CREATE INDEX IF NOT EXISTS idx_journey_souvenirs_journey ON journey_souvenirs(journey_id);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE journey_itinerary;
ALTER PUBLICATION supabase_realtime ADD TABLE journey_souvenirs;
