/*
  # Create and configure storage buckets

  1. New Buckets
    - `fotosdocumentos` (public)
      - For storing car photos
      - Public access enabled
      - Contains `autos/` folder
    
    - `solicitudes` (private)
      - For storing application documents
      - Private access only
      - Contains `documentos/` folder for user uploads
      
  2. Security
    - Enable public access for `fotosdocumentos`
    - Restrict access to `solicitudes` to authenticated users
    - RLS policies for secure access
*/

-- Create the public bucket for car photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotosdocumentos', 'fotosdocumentos', true)
ON CONFLICT (id) DO NOTHING;

-- Create the private bucket for application documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('solicitudes', 'solicitudes', false)
ON CONFLICT (id) DO NOTHING;

-- Policy for public read access to fotosdocumentos
CREATE POLICY "Public Access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'fotosdocumentos');

-- Policy for authenticated users to upload to fotosdocumentos
CREATE POLICY "Authenticated users can upload car photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'fotosdocumentos' AND
  (storage.foldername(name))[1] = 'autos'
);

-- Policy for users to access their own documents in solicitudes bucket
CREATE POLICY "Users can access their own documents"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'solicitudes' AND
  auth.uid()::text = (storage.foldername(name))[2]
)
WITH CHECK (
  bucket_id = 'solicitudes' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Create folders (this is just for organization, not strictly required)
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES 
  ('fotosdocumentos', 'autos/.keep', auth.uid(), '{"mimetype": "text/plain"}'),
  ('solicitudes', 'documentos/.keep', auth.uid(), '{"mimetype": "text/plain"}')
ON CONFLICT (bucket_id, name) DO NOTHING;