-- Add Group Customization Columns to Journeys
ALTER TABLE journeys ADD COLUMN IF NOT EXISTS group_name TEXT;
ALTER TABLE journeys ADD COLUMN IF NOT EXISTS group_avatar TEXT;
