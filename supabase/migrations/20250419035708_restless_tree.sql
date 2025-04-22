/*
  # Add username field and update profile policies
  
  1. Changes:
    - Add username column to perfiles
    - Update profile policies to include username
    - Remove admin user creation (will be handled by auth signup)
*/

-- Add username column to perfiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'perfiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE perfiles ADD COLUMN username text;
    ALTER TABLE perfiles ADD CONSTRAINT perfiles_username_key UNIQUE (username);
  END IF;
END $$;

-- Drop existing policies to recreate them with username support
DROP POLICY IF EXISTS "Ver perfil propio" ON perfiles;
DROP POLICY IF EXISTS "Actualizar perfil propio" ON perfiles;
DROP POLICY IF EXISTS "Crear perfil propio" ON perfiles;
DROP POLICY IF EXISTS "Admin ve todos los perfiles" ON perfiles;

-- Create updated policies
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

-- Ensure admin role exists
INSERT INTO roles (nombre, descripcion)
VALUES ('admin', 'Administrador del sistema')
ON CONFLICT (nombre) DO NOTHING;