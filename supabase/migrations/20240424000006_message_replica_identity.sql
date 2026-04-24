-- Set replica identity to FULL for journey_messages
-- This allows real-time filters to work for DELETE events by including all columns in the 'old' payload
ALTER TABLE journey_messages REPLICA IDENTITY FULL;
