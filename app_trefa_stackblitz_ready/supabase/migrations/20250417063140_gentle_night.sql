/*
  # Esquema inicial para App TREFA

  1. Nuevas Tablas
    - `roles` - Roles de usuario
      - `id` (uuid, primary key)
      - `nombre` (text)
      - `descripcion` (text)
    
    - `perfiles` - Información extendida de usuarios
      - `id` (uuid, primary key, references auth.users)
      - `rol_id` (uuid, references roles)
      - `nombre` (text)
      - `apellido` (text)
      - `telefono` (text)
      - `created_at` (timestamp)
    
    - `solicitudes_prestamo` - Solicitudes de préstamo
      - `id` (uuid, primary key)
      - `usuario_id` (uuid, references perfiles)
      - `monto` (decimal)
      - `plazo_meses` (integer)
      - `ingreso_mensual` (decimal)
      - `estado` (text)
      - `created_at` (timestamp)
    
    - `autos` - Listado de autos en el marketplace
      - `id` (uuid, primary key)
      - `usuario_id` (uuid, references perfiles)
      - `marca` (text)
      - `modelo` (text)
      - `año` (integer)
      - `precio` (decimal)
      - `descripcion` (text)
      - `estado` (text)
      - `imagenes` (text[])
      - `created_at` (timestamp)

  2. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas específicas para cada rol
*/

-- Crear tabla de roles
CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  created_at timestamptz DEFAULT now()
);

-- Insertar roles iniciales
INSERT INTO roles (nombre, descripcion) VALUES
  ('admin', 'Administrador del sistema'),
  ('usuario', 'Usuario regular');

-- Crear tabla de perfiles
CREATE TABLE perfiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  rol_id uuid REFERENCES roles NOT NULL,
  nombre text NOT NULL,
  apellido text NOT NULL,
  telefono text,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de solicitudes de préstamo
CREATE TABLE solicitudes_prestamo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES perfiles NOT NULL,
  monto decimal NOT NULL CHECK (monto > 0),
  plazo_meses integer NOT NULL CHECK (plazo_meses > 0),
  ingreso_mensual decimal NOT NULL CHECK (ingreso_mensual > 0),
  estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de autos
CREATE TABLE autos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES perfiles NOT NULL,
  marca text NOT NULL,
  modelo text NOT NULL,
  año integer NOT NULL CHECK (año >= 1900),
  precio decimal NOT NULL CHECK (precio > 0),
  descripcion text NOT NULL,
  estado text NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'vendido', 'reservado')),
  imagenes text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_prestamo ENABLE ROW LEVEL SECURITY;
ALTER TABLE autos ENABLE ROW LEVEL SECURITY;

-- Políticas para roles
CREATE POLICY "Roles visibles para todos los usuarios autenticados"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- Políticas para perfiles
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON perfiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins pueden ver todos los perfiles"
  ON perfiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE id = auth.uid()
      AND rol_id = (SELECT id FROM roles WHERE nombre = 'admin')
    )
  );

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON perfiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Políticas para solicitudes de préstamo
CREATE POLICY "Usuarios pueden ver sus propias solicitudes"
  ON solicitudes_prestamo FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Admins pueden ver todas las solicitudes"
  ON solicitudes_prestamo FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM perfiles
      WHERE id = auth.uid()
      AND rol_id = (SELECT id FROM roles WHERE nombre = 'admin')
    )
  );

CREATE POLICY "Usuarios pueden crear solicitudes"
  ON solicitudes_prestamo FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

-- Políticas para autos
CREATE POLICY "Todos pueden ver autos disponibles"
  ON autos FOR SELECT
  TO authenticated
  USING (estado = 'disponible' OR usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden crear listados de autos"
  ON autos FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar sus propios autos"
  ON autos FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());