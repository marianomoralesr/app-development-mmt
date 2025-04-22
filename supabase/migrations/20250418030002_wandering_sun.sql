/*
  # Add user roles and profile policies

  1. Changes
    - Add comprador and vendedor roles
    - Add user_id column to perfiles table
    - Update RLS policies for perfiles table
*/

-- Insert required roles if they don't exist
INSERT INTO roles (nombre, descripcion)
VALUES 
  ('comprador', 'Usuario que busca comprar un auto'),
  ('vendedor', 'Usuario que quiere vender su auto')
ON CONFLICT (nombre) DO NOTHING;

-- Update perfiles table to add user_id column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'perfiles' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE perfiles ADD COLUMN user_id uuid UNIQUE REFERENCES auth.users(id);
  END IF;
END $$;

-- Drop existing policies before recreating them
DROP POLICY IF EXISTS "Usuarios crean su perfil" ON perfiles;
DROP POLICY IF EXISTS "Ver mi perfil" ON perfiles;

-- Create new policies
CREATE POLICY "Usuarios crean su perfil"
  ON perfiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Ver mi perfil"
  ON perfiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);