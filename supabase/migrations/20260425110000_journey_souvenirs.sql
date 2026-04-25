-- Create journey souvenirs table
CREATE TABLE IF NOT EXISTS public.journey_souvenirs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_souvenirs_journey_id ON public.journey_souvenirs(journey_id);

-- RLS Policies
ALTER TABLE public.journey_souvenirs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read souvenirs for simplicity (matching existing schema model)
CREATE POLICY "Anyone can view souvenirs"
ON public.journey_souvenirs FOR SELECT
USING (true);

-- Allow anyone to insert souvenirs
CREATE POLICY "Anyone can add souvenirs"
ON public.journey_souvenirs FOR INSERT
WITH CHECK (true);

-- Allow anyone to delete souvenirs
CREATE POLICY "Anyone can delete souvenirs"
ON public.journey_souvenirs FOR DELETE
USING (true);
