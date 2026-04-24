-- Open up UPDATE and DELETE policies for journey_messages for testing
DROP POLICY IF EXISTS "Users can update their own messages" ON journey_messages;
CREATE POLICY "Anyone can update messages" ON journey_messages
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete their own messages" ON journey_messages;
CREATE POLICY "Anyone can delete messages" ON journey_messages
    FOR DELETE USING (true);
