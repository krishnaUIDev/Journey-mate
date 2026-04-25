-- Add airline_iata column to store specific airline identifiers for logos
ALTER TABLE journeys ADD COLUMN airline_iata VARCHAR(5);
