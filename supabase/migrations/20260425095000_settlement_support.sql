-- Migration: Settlement Support
-- Created: 2026-04-25
-- Description: Adds columns to track peer-to-peer settlements within journeys.

ALTER TABLE journey_expenses 
ADD COLUMN IF NOT EXISTS is_settlement BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS receiver_id TEXT; -- Clerk User ID of the recipient

COMMENT ON COLUMN journey_expenses.is_settlement IS 'True if this is a payment between users rather than a group expense';
COMMENT ON COLUMN journey_expenses.receiver_id IS 'The user who received the payment (for settlements)';
