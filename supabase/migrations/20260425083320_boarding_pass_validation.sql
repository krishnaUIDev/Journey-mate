-- Add flight validation support to journey_requests
-- Created: 2026-04-25
-- Description: Adds a column to store boarding pass proof images for flight validation.

ALTER TABLE journey_requests 
ADD COLUMN IF NOT EXISTS boarding_pass_url TEXT;
