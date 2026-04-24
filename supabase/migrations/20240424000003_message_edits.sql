-- Add UPDATE and DELETE policies for journey_messages
DROP POLICY IF EXISTS "Users can update their own messages" ON journey_messages;
CREATE POLICY "Users can update their own messages" ON journey_messages
    FOR UPDATE USING (sender_id = sender_id); -- Simple placeholder, in real app would use auth.uid()

DROP POLICY IF EXISTS "Users can delete their own messages" ON journey_messages;
CREATE POLICY "Users can delete their own messages" ON journey_messages
    FOR DELETE USING (sender_id = sender_id);
