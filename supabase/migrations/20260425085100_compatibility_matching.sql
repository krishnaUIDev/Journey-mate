-- Migration: Add Compatibility Score and Reason to journey_requests
-- Created: 2026-04-25
-- Description: Supports AI-powered compatibility matching between owners and requesters.

ALTER TABLE journey_requests 
ADD COLUMN IF NOT EXISTS compatibility_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS compatibility_reason TEXT DEFAULT NULL;
