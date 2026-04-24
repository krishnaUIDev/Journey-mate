-- Initial Schema for Journey-mate

-- 1. journeys table
CREATE TABLE IF NOT EXISTS journeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- User ID from Clerk
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    date DATE NOT NULL,
    flight_number TEXT,
    contact_info TEXT,
    description TEXT,
    user_name TEXT,
    user_avatar TEXT,
    user_rating NUMERIC DEFAULT 5.0,
    user_verified BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. journey_requests table
CREATE TABLE IF NOT EXISTS journey_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    requester_id TEXT NOT NULL,
    requester_name TEXT,
    requester_avatar TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'none')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. journey_messages table
CREATE TABLE IF NOT EXISTS journey_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_name TEXT,
    sender_avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Realtime
-- Check if publication exists then add tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'journeys') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE journeys;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'journey_requests') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE journey_requests;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'journey_messages') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE journey_messages;
    END IF;
END $$;

-- 5. RLS Policies
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_messages ENABLE ROW LEVEL SECURITY;

-- Journeys Policies
DROP POLICY IF EXISTS "Public journeys are viewable by everyone" ON journeys;
CREATE POLICY "Public journeys are viewable by everyone" ON journeys
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert for journeys" ON journeys;
CREATE POLICY "Allow public insert for journeys" ON journeys
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own journeys" ON journeys;
CREATE POLICY "Users can update their own journeys" ON journeys
    FOR UPDATE USING (user_id = user_id);

-- Journey Requests Policies
DROP POLICY IF EXISTS "Anyone can view requests" ON journey_requests;
CREATE POLICY "Anyone can view requests" ON journey_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create requests" ON journey_requests;
CREATE POLICY "Anyone can create requests" ON journey_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Owners/Participants can update requests" ON journey_requests;
CREATE POLICY "Owners/Participants can update requests" ON journey_requests FOR UPDATE USING (true);

-- Journey Messages Policies
DROP POLICY IF EXISTS "Anyone can view messages" ON journey_messages;
CREATE POLICY "Anyone can view messages" ON journey_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can send messages" ON journey_messages;
CREATE POLICY "Anyone can send messages" ON journey_messages FOR INSERT WITH CHECK (true);
