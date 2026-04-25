-- Migration: Add is_system and is_system_event to journey_messages
-- Created: 2026-04-25
-- Description: Supports centered system notifications like "User left the group".

ALTER TABLE journey_messages 
ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;
