-- Add reply_to_id to journey_messages for threaded replies
ALTER TABLE journey_messages 
ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES journey_messages(id) ON DELETE SET NULL;
