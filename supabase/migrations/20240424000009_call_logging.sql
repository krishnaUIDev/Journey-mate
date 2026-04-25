-- Migration: Add call_metadata to journey_messages
ALTER TABLE journey_messages ADD COLUMN IF NOT EXISTS call_metadata JSONB DEFAULT NULL;

COMMENT ON COLUMN journey_messages.call_metadata IS 'Stores call details like status (missed, accepted, declined), type (audio, video), and duration.';
