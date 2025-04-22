/*
  # Fix registration flow

  1. Changes
    - Simplify trigger function
    - Remove complex role logic
    - Fix profile creation
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS auth.handle_new_user();

-- Create simplified trigger function
CREATE OR REPLACE FUNCTION auth.handle_new_user()
RETURNS trigger AS $$
BEGIN
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
    (SELECT id FROM public.roles WHERE nombre = 'usuario' LIMIT 1),
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'apellido', 'Nuevo'),
    COALESCE(NEW.raw_user_meta_data->>'telefono', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auth.handle_new_user();