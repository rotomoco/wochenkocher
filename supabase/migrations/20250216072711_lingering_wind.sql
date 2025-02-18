/*
  # Add storage bucket for dish images

  1. Changes
    - Create storage bucket for dish images
    - Add storage policies for authenticated users
    - Add RLS policies for bucket access
*/

-- Erstelle einen neuen Storage Bucket für Gerichtsbilder
INSERT INTO storage.buckets (id, name, public)
VALUES ('dish-images', 'dish-images', true);

-- Policies für den Storage Bucket
CREATE POLICY "Authenticated users can upload dish images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'dish-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update their dish images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'dish-images'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'dish-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Anyone can view dish images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'dish-images');

CREATE POLICY "Authenticated users can delete their dish images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'dish-images'
  AND auth.role() = 'authenticated'
);