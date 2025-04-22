/*
  # Fix storage bucket and roles

  1. Changes
    - Create storage bucket for car photos
    - Update roles for user registration
    - Add proper storage policies
    
  2. Security
    - Public access to car photos
    - Authenticated upload access
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotosdocumentos', 'fotosdocumentos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload car photos" ON storage.objects;

-- Create storage policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'fotosdocumentos');

CREATE POLICY "Authenticated users can upload car photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'fotosdocumentos');

-- Ensure all required roles exist
INSERT INTO roles (nombre, descripcion)
VALUES 
  ('admin', 'Administrador del sistema'),
  ('vendedor', 'Usuario que quiere vender su auto'),
  ('candidato', 'Usuario que solicita financiamiento'),
  ('usuario', 'Usuario regular'),
  ('agente', 'Agente de ventas')
ON CONFLICT (nombre) DO NOTHING;

-- Drop existing policies for autos
DROP POLICY IF EXISTS "Crear autos" ON autos;
DROP POLICY IF EXISTS "Ver autos propios o aprobados" ON autos;
DROP POLICY IF EXISTS "Editar autos propios" ON autos;

-- Recreate autos policies
CREATE POLICY "Crear autos"
ON autos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Ver autos propios o aprobados"
ON autos FOR SELECT
TO authenticated
USING (
  auth.uid() = usuario_id
  OR (estado = 'disponible' AND estado_revision = 'aprobado')
  OR EXISTS (
    SELECT 1 FROM perfiles p
    WHERE p.user_id = auth.uid()
    AND p.rol_id = (SELECT id FROM roles WHERE nombre = 'admin')
  )
);

CREATE POLICY "Editar autos propios"
ON autos FOR UPDATE
TO authenticated
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);