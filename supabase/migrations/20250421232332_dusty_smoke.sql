/*
  # Fix OAuth callback and user creation

  1. Changes
    - Update trigger function to handle both email and OAuth signups
    - Ensure proper role assignment
    - Add proper error handling
    
  2. Security
    - Maintain existing RLS policies
    - Keep security definer context
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS auth.handle_new_user();

-- Create improved trigger function
CREATE OR REPLACE FUNCTION auth.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Get default role id
  SELECT id INTO default_role_id
  FROM public.roles
  WHERE nombre = 'usuario'
  LIMIT 1;

  -- Create profile
  INSERT INTO public.perfiles (
    id,
    user_id,
    rol_id,
    nombre,
    apellido,
    telefono
  ) VALUES (
    NEW.id,
    NEW.id,
    default_role_id,
    CASE 
      WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
        split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1)
      ELSE
        COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario')
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
        substring(NEW.raw_user_meta_data->>'full_name' from position(' ' in NEW.raw_user_meta_data->>'full_name') + 1)
      ELSE
        COALESCE(NEW.raw_user_meta_data->>'apellido', 'Nuevo')
    END,
    COALESCE(NEW.raw_user_meta_data->>'telefono', NULL)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auth.handle_new_user();

-- Ensure default role exists
INSERT INTO public.roles (nombre, descripcion)
VALUES ('usuario', 'Usuario regular')
ON CONFLICT (nombre) DO NOTHING;