-- Drop NOT NULL constraints from legacy columns that our new code doesn't populate
ALTER TABLE public.journey_souvenirs
    ALTER COLUMN user_name DROP NOT NULL,
    ALTER COLUMN image_url DROP NOT NULL;
