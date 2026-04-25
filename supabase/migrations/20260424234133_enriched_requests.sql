-- Add enriched metadata columns to journey_requests
-- Created: 2026-04-24
-- Description: Adds support for join messages, requester ratings, and verification status.

ALTER TABLE journey_requests 
ADD COLUMN IF NOT EXISTS message TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS requester_rating DECIMAL DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS requester_verified BOOLEAN DEFAULT TRUE;
