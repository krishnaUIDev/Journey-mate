-- Add image_url to journey_messages
ALTER TABLE journey_messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for chat attachments if it doesn't exist
-- Note: This usually requires specific permissions or is done via Supabase dashboard, 
-- but we include it here for completeness and visibility.
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage (allow all for simplicity in this demo, adjust for production)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'chat-attachments');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-attachments');
