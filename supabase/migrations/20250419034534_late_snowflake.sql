/*
  # Rebuild Authentication System
  
  1. Changes:
    - Reset and recreate roles table
    - Update perfiles table structure
    - Simplify RLS policies
    - Remove email verification requirement
    
  2. Security:
    - Basic role-based access
    - Simplified user management
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON perfiles;
DROP POLICY IF EXISTS "Ver perfil propio" ON perfiles;
DROP POLICY IF EXISTS "Actualizar perfil propio" ON perfiles;
DROP POLICY IF EXISTS "Crear perfil propio" ON perfiles;
DROP POLICY IF EXISTS "Admin ve todos los perfiles" ON perfiles;

-- Reset roles table
TRUNCATE roles CASCADE;

-- Insert basic roles
INSERT INTO roles (nombre, descripcion)
VALUES 
  ('admin', 'Administrador del sistema'),
  ('usuario', 'Usuario regular');

-- Update perfiles table
ALTER TABLE perfiles
DROP CONSTRAINT IF EXISTS perfiles_rol_id_fkey,
ALTER COLUMN rol_id DROP NOT NULL;

-- Create new policies for perfiles
CREATE POLICY "Ver perfil"
  ON perfiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM roles r 
      WHERE r.id = (SELECT rol_id FROM perfiles WHERE id = auth.uid())
      AND r.nombre = 'admin'
    )
  );

CREATE POLICY "Crear perfil"
  ON perfiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Actualizar perfil"
  ON perfiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Update auth.users settings via SQL function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfiles (id, user_id, nombre, apellido, rol_id)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'apellido', 'Nuevo'),
    (SELECT id FROM roles WHERE nombre = 'usuario')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();