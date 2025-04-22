-- Drop all existing tables and functions
DROP TABLE IF EXISTS public.solicitudes_prestamo CASCADE;
DROP TABLE IF EXISTS public.autos CASCADE;
DROP TABLE IF EXISTS public.perfiles CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS auth.handle_new_user() CASCADE;

-- Create roles table
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  descripcion text,
  created_at timestamptz DEFAULT now()
);

-- Create perfiles table
CREATE TABLE public.perfiles (
  id uuid PRIMARY KEY,
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  rol_id uuid REFERENCES public.roles(id),
  nombre text NOT NULL,
  apellido text NOT NULL,
  telefono text,
  created_at timestamptz DEFAULT now()
);

-- Create autos table
CREATE TABLE public.autos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES public.perfiles(id) ON DELETE CASCADE,
  marca text NOT NULL,
  modelo text NOT NULL,
  año integer NOT NULL CHECK (año >= 1900),
  precio numeric NOT NULL CHECK (precio > 0),
  kilometraje numeric CHECK (kilometraje >= 0),
  transmision text CHECK (transmision IN ('manual', 'automatica')),
  numero_dueños integer CHECK (numero_dueños > 0),
  carroceria text CHECK (carroceria IN ('sedan', 'hatchback', 'suv', 'pickup', 'van', 'coupe')),
  descripcion text NOT NULL,
  estado text NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'vendido', 'reservado')),
  estado_revision text DEFAULT 'pendiente' CHECK (estado_revision IN ('pendiente', 'aprobado', 'rechazado')),
  imagenes text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

-- Create solicitudes_prestamo table
CREATE TABLE public.solicitudes_prestamo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES public.perfiles(id) ON DELETE CASCADE,
  auto_id uuid REFERENCES public.autos(id) ON DELETE CASCADE,
  monto numeric NOT NULL CHECK (monto > 0),
  plazo_meses integer NOT NULL CHECK (plazo_meses > 0),
  ingreso_mensual numeric NOT NULL CHECK (ingreso_mensual > 0),
  estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  created_at timestamptz DEFAULT now()
);

-- Insert default roles
INSERT INTO public.roles (nombre, descripcion)
VALUES 
  ('admin', 'Administrador del sistema'),
  ('usuario', 'Usuario regular');

-- Enable RLS on all tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_prestamo ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Roles visibles para todos" ON public.roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Ver perfil propio o admin" ON public.perfiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM public.perfiles p 
      WHERE p.id = auth.uid() 
      AND p.rol_id = (SELECT id FROM public.roles WHERE nombre = 'admin')
    )
  );

CREATE POLICY "Actualizar perfil propio" ON public.perfiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create trigger function for new users
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
    COALESCE(
      NEW.raw_user_meta_data->>'nombre',
      split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1),
      'Usuario'
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'apellido',
      substring(COALESCE(NEW.raw_user_meta_data->>'full_name', '') from position(' ' in COALESCE(NEW.raw_user_meta_data->>'full_name', '')) + 1),
      'Nuevo'
    ),
    NEW.raw_user_meta_data->>'telefono'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auth.handle_new_user();