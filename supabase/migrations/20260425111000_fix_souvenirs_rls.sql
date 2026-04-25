-- Fix RLS Policies for journey_souvenirs
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Participants can view souvenirs" ON public.journey_souvenirs;
DROP POLICY IF EXISTS "Participants can add souvenirs" ON public.journey_souvenirs;
DROP POLICY IF EXISTS "Uploaders can delete souvenirs" ON public.journey_souvenirs;
DROP POLICY IF EXISTS "Anyone can view souvenirs" ON public.journey_souvenirs;
DROP POLICY IF EXISTS "Anyone can add souvenirs" ON public.journey_souvenirs;
DROP POLICY IF EXISTS "Anyone can delete souvenirs" ON public.journey_souvenirs;

-- Create open policies matching the rest of the schema
CREATE POLICY "Anyone can view souvenirs"
ON public.journey_souvenirs FOR SELECT
USING (true);

CREATE POLICY "Anyone can add souvenirs"
ON public.journey_souvenirs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete souvenirs"
ON public.journey_souvenirs FOR DELETE
USING (true);
