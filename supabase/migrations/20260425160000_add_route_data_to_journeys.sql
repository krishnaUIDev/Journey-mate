-- Add route_data column to store airport coordinates
ALTER TABLE journeys ADD COLUMN route_data JSONB DEFAULT '{}';
