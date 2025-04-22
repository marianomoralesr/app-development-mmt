/*
  # Fix roles and policies

  1. Changes:
    - Drop and recreate profile policies to use correct auth checks
    - Add policies for role-based access
    - Ensure proper user_id references
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Ver mi perfil" ON perfiles;
DROP POLICY IF EXISTS "Usuarios actualizan perfil" ON perfiles;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON perfiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON perfiles;

-- Create new profile policies
CREATE POLICY "Ver perfil propio"
  ON perfiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Actualizar perfil propio"
  ON perfiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR auth.uid() = user_id)
  WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Crear perfil propio"
  ON perfiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id AND auth.uid() = user_id);

-- Ensure admin can view all profiles
CREATE POLICY "Admin ve todos los perfiles"
  ON perfiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.id = auth.uid()
      AND p.rol_id = (SELECT id FROM roles WHERE nombre = 'admin')
    )
  );