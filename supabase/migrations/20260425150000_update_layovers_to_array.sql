-- Migration: Update layover to layovers array
-- Created: 2026-04-25

-- 1. Rename column
ALTER TABLE journeys RENAME COLUMN layover TO layover_old;

-- 2. Add new array column
ALTER TABLE journeys ADD COLUMN layovers TEXT[] DEFAULT '{}';

-- 3. Migrate data (convert old single string to a one-element array)
UPDATE journeys 
SET layovers = ARRAY[layover_old] 
WHERE layover_old IS NOT NULL AND layover_old != '';

-- 4. Drop old column
ALTER TABLE journeys DROP COLUMN layover_old;
