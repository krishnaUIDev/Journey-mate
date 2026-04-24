-- Add DELETE policy for journeys
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can delete their own journeys" ON journeys;
CREATE POLICY "Users can delete their own journeys" ON journeys
    FOR DELETE USING (true); -- In a production app, we would use auth.uid() matching, but here we allow public delete for simplicity/demo as per current schema pattern

DROP POLICY IF EXISTS "Users can update their own journeys" ON journeys;
CREATE POLICY "Users can update their own journeys" ON journeys
    FOR UPDATE USING (true);
