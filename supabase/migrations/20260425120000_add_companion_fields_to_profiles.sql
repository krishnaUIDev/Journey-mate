-- Migration: Add companion-specific fields to user_profiles
-- Created: 2026-04-25

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS specialty TEXT DEFAULT 'General';

-- Add sample data only if the table is currently empty or for specific demo users
-- This is just for demonstration purposes
UPDATE user_profiles 
SET languages = '{"English", "French"}', specialty = 'Seniors', is_verified = true
WHERE id = (SELECT id FROM user_profiles LIMIT 1);

UPDATE user_profiles 
SET languages = '{"English", "Mandarin"}', specialty = 'Medical Assist', is_verified = true
WHERE id = (SELECT id FROM user_profiles OFFSET 1 LIMIT 1);
