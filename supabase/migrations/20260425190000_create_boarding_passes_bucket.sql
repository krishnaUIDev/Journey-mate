-- Create the boarding_passes bucket in storage.buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('boarding_passes', 'boarding_passes', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read files in the boarding_passes bucket
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Boarding Pass Public Read'
    ) THEN
        CREATE POLICY "Boarding Pass Public Read"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'boarding_passes' );
    END IF;
END $$;

-- Allow authenticated users to upload files to the boarding_passes bucket
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Boarding Pass Authenticated Upload'
    ) THEN
        CREATE POLICY "Boarding Pass Authenticated Upload"
        ON storage.objects FOR INSERT
        WITH CHECK ( bucket_id = 'boarding_passes' );
    END IF;
END $$;
