-- Migration: Vault Attribution Enhancement
-- Add uploader_name to journey_emergency_contacts for clearer coordination in large groups.

ALTER TABLE journey_emergency_contacts 
ADD COLUMN IF NOT EXISTS uploader_name TEXT NOT NULL DEFAULT 'A Participant';
