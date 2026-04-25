-- Add audio support to journey_requests
-- Created: 2026-04-24
-- Description: Adds a column to store voice notes from requesters.

ALTER TABLE journey_requests 
ADD COLUMN IF NOT EXISTS requester_audio_url TEXT;
