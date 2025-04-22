/*
  # Add roles and update profile policies

  1. Changes:
    - Insert default roles if they don't exist
    - Update profile policies to use user_id
    - Drop and recreate policies to avoid conflicts
*/

-- Insert default roles
INSERT INTO roles (nombre, descripcion)
VALUES 
  ('candidato', 'Usuario que busca comprar un auto'),
  ('vendedor', 'Usuario que busca vender un auto'),
  ('admin', 'Administrador del sistema'),
  ('usuario', 'Usuario regular')
ON CONFLICT (nombre) DO NOTHING;

-- Drop all existing profile policies to avoid conflicts
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON perfiles;
DROP POLICY IF EXISTS "Ver mi perfil" ON perfiles;
DROP POLICY IF EXISTS "Actualizar mi perfil" ON perfiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON perfiles;

-- Create new policies
CREATE POLICY "Ver mi perfil"
  ON perfiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create update policy with a different name to avoid conflicts
CREATE POLICY "Usuarios actualizan perfil"
  ON perfiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);