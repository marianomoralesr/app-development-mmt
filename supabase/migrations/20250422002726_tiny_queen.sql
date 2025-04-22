-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS auth.handle_new_user() CASCADE;

-- Create simplified trigger function
CREATE OR REPLACE FUNCTION auth.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Get or create default role
  INSERT INTO public.roles (nombre, descripcion)
  VALUES ('usuario', 'Usuario regular')
  ON CONFLICT (nombre) DO UPDATE SET nombre = 'usuario'
  RETURNING id INTO default_role_id;

  -- Create profile with minimal required data
  INSERT INTO public.perfiles (
    id,
    user_id,
    rol_id,
    nombre,
    apellido
  ) VALUES (
    NEW.id,
    NEW.id,
    default_role_id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'apellido', 'Nuevo')
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error details but don't block user creation
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auth.handle_new_user();

-- Ensure all existing users have profiles
DO $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Get or create default role
  INSERT INTO public.roles (nombre, descripcion)
  VALUES ('usuario', 'Usuario regular')
  ON CONFLICT (nombre) DO UPDATE SET nombre = 'usuario'
  RETURNING id INTO default_role_id;

  -- Create missing profiles
  INSERT INTO public.perfiles (id, user_id, rol_id, nombre, apellido)
  SELECT 
    u.id,
    u.id,
    default_role_id,
    'Usuario',
    'Nuevo'
  FROM auth.users u
  LEFT JOIN public.perfiles p ON u.id = p.user_id
  WHERE p.id IS NULL;
END;
$$;