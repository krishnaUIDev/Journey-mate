-- Migration: Real-Time Meetup Locations
-- Created: 2026-04-25
-- Description: Supports ephemeral location sharing for landed companions.

CREATE TABLE IF NOT EXISTS journey_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Clerk User ID
    user_name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(journey_id, user_id)
);

-- Index for fast cleanup and retrieval
CREATE INDEX idx_journey_locations_journey_id ON journey_locations(journey_id);
CREATE INDEX idx_journey_locations_updated_at ON journey_locations(updated_at);

-- Comments
COMMENT ON TABLE journey_locations IS 'Stores ephemeral GPS coordinates for squad members seeking each other at airports.';
