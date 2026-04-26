-- The journey_souvenirs table exists from an older migration with image_url column.
-- We need to add the 'type' and 'content' columns our new code uses.

ALTER TABLE public.journey_souvenirs
    ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'photo' CHECK (type IN ('photo', 'note')),
    ADD COLUMN IF NOT EXISTS content TEXT;

-- Backfill content from image_url for existing rows
UPDATE public.journey_souvenirs SET content = image_url WHERE content IS NULL AND image_url IS NOT NULL;
