-- Fix RLS Policies for journey_guestbook
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Journey participants can read guestbook" ON public.journey_guestbook;
DROP POLICY IF EXISTS "Journey participants can add to guestbook" ON public.journey_guestbook;

-- Create open policies matching journey_souvenirs and messages
CREATE POLICY "Anyone can view guestbook"
ON public.journey_guestbook FOR SELECT
USING (true);

CREATE POLICY "Anyone can add to guestbook"
ON public.journey_guestbook FOR INSERT
WITH CHECK (true);
