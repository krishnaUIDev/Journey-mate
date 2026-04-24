-- Add audio_url to journey_messages
ALTER TABLE journey_messages ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- (The chat-attachments bucket already exists from the previous image migration)
