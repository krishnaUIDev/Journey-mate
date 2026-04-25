-- Migration: Add manual flight entry fields
-- Created: 2026-04-25

ALTER TABLE journeys 
ADD COLUMN IF NOT EXISTS airline_name TEXT,
ADD COLUMN IF NOT EXISTS layover TEXT;
