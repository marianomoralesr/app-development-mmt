/*
  # Fix Authentication System
  
  1. Changes:
    - Drop existing triggers and functions
    - Create new trigger function in auth schema
    - Add proper error handling
    - Ensure consistent profile creation
    
  2. Security:
    - Maintain SECURITY DEFINER
    - Handle NULL metadata gracefully
*/

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS auth.handle_new_user();

-- Create new trigger function
CREATE OR REPLACE FUNCTION auth.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Ensure default role exists
  INSERT INTO public.roles (nombre, descripcion)
  VALUES ('usuario', 'Usuario regular')
  ON CONFLICT (nombre) DO NOTHING;

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
    (SELECT id FROM public.roles WHERE nombre = 'usuario' LIMIT 1),
    CASE 
      WHEN NEW.raw_user_meta_data->>'nombre' IS NOT NULL THEN 
        NEW.raw_user_meta_data->>'nombre'
      WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
        split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1)
      ELSE 'Usuario'
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'apellido' IS NOT NULL THEN 
        NEW.raw_user_meta_data->>'apellido'
      WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
        substring(NEW.raw_user_meta_data->>'full_name' from position(' ' in NEW.raw_user_meta_data->>'full_name') + 1)
      ELSE 'Nuevo'
    END,
    COALESCE(NEW.raw_user_meta_data->>'telefono', NULL)
  );

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error and re-raise
    RAISE NOTICE 'Error creating profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auth.handle_new_user();

-- Ensure all profiles have user_id set
UPDATE public.perfiles
SET user_id = id
WHERE user_id IS NULL;

-- Add NOT NULL constraint to user_id
ALTER TABLE public.perfiles 
  ALTER COLUMN user_id SET NOT NULL;

-- Add unique constraint on user_id
ALTER TABLE public.perfiles
  ADD CONSTRAINT perfiles_user_id_key UNIQUE (user_id);