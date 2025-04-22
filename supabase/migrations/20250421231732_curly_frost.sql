/*
  # Fix Authentication Trigger and Profile Creation

  1. Changes
    - Drop existing trigger and function
    - Create new trigger function in auth schema
    - Add proper profile creation on user signup
    - Ensure proper role assignment
    
  2. Security
    - Maintain existing RLS policies
    - Keep proper user isolation
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS auth.handle_new_user();

-- Create new trigger function in auth schema
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
    (SELECT id FROM public.roles WHERE nombre = 'usuario'),
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'apellido', 'Nuevo'),
    NEW.raw_user_meta_data->>'telefono'
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

-- Update existing profiles to ensure user_id is set
UPDATE public.perfiles
SET user_id = id
WHERE user_id IS NULL;

-- Add NOT NULL constraint to user_id if not already present
ALTER TABLE public.perfiles 
  ALTER COLUMN user_id SET NOT NULL;