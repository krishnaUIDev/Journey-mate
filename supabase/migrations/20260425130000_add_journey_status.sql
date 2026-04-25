-- Migration: Add status column to journeys
-- Created: 2026-04-25

ALTER TABLE journeys 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled'));

-- Update existing journeys to 'completed' if their date is in the past
UPDATE journeys 
SET status = 'completed' 
WHERE date < CURRENT_DATE;
