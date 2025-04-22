/*
  # Initial Schema Setup

  1. Tables Created:
    - roles (system roles)
    - perfiles (user profiles)
    - autos (vehicle listings)
    - solicitudes_prestamo (loan applications)

  2. Security:
    - RLS policies for each table
    - Role-based access control
    - Proper constraints for conflict handling

  3. Initial Data:
    - Default admin role
*/

-- Create roles table with proper constraints
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT roles_nombre_key UNIQUE (nombre)
);

-- Enable RLS on roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Roles policies
CREATE POLICY "Roles visibles para todos los usuarios autenticados"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- Create perfiles table with proper constraints
CREATE TABLE IF NOT EXISTS perfiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rol_id uuid NOT NULL REFERENCES roles(id),
  nombre text NOT NULL,
  apellido text NOT NULL,
  telefono text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on perfiles
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- Perfiles policies
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON perfiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON perfiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins pueden ver todos los perfiles"
  ON perfiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.id = auth.uid()
      AND p.rol_id = (SELECT id FROM roles WHERE nombre = 'admin')
    )
  );

-- Create autos table with proper constraints
CREATE TABLE IF NOT EXISTS autos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES perfiles(id),
  marca text NOT NULL,
  modelo text NOT NULL,
  año integer NOT NULL CHECK (año >= 1900),
  precio numeric NOT NULL CHECK (precio > 0),
  kilometraje numeric NOT NULL CHECK (kilometraje >= 0),
  transmision text NOT NULL CHECK (transmision IN ('manual', 'automatica')),
  numero_dueños integer NOT NULL CHECK (numero_dueños > 0),
  carroceria text NOT NULL CHECK (carroceria IN ('sedan', 'hatchback', 'suv', 'pickup', 'van', 'coupe')),
  descripcion text NOT NULL,
  estado text NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'vendido', 'reservado')),
  estado_revision text NOT NULL DEFAULT 'pendiente' CHECK (estado_revision IN ('pendiente', 'aprobado', 'rechazado')),
  imagenes text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on autos
ALTER TABLE autos ENABLE ROW LEVEL SECURITY;

-- Autos policies
CREATE POLICY "Usuarios pueden crear autos"
  ON autos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden ver sus propios autos"
  ON autos FOR SELECT
  TO authenticated
  USING (
    auth.uid() = usuario_id OR
    (estado = 'disponible' AND estado_revision = 'aprobado') OR
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.id = auth.uid()
      AND p.rol_id = (SELECT id FROM roles WHERE nombre = 'admin')
    )
  );

CREATE POLICY "Usuarios pueden actualizar sus propios autos"
  ON autos FOR UPDATE
  TO authenticated
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- Create solicitudes_prestamo table with proper constraints
CREATE TABLE IF NOT EXISTS solicitudes_prestamo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES perfiles(id),
  auto_id uuid NOT NULL REFERENCES autos(id),
  monto numeric NOT NULL CHECK (monto > 0),
  plazo_meses integer NOT NULL CHECK (plazo_meses > 0),
  ingreso_mensual numeric NOT NULL CHECK (ingreso_mensual > 0),
  estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on solicitudes_prestamo
ALTER TABLE solicitudes_prestamo ENABLE ROW LEVEL SECURITY;

-- Solicitudes_prestamo policies
CREATE POLICY "Usuarios pueden crear solicitudes"
  ON solicitudes_prestamo FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden ver sus propias solicitudes"
  ON solicitudes_prestamo FOR SELECT
  TO authenticated
  USING (
    auth.uid() = usuario_id OR
    EXISTS (
      SELECT 1 FROM perfiles p
      WHERE p.id = auth.uid()
      AND p.rol_id = (SELECT id FROM roles WHERE nombre = 'admin')
    )
  );

-- Insert default admin role
INSERT INTO roles (nombre, descripcion)
VALUES ('admin', 'Administrador del sistema')
ON CONFLICT (nombre) DO NOTHING;