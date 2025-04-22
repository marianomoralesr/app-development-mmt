/*
  # Add additional auto details and approval workflow

  1. Changes to 'autos' table
    - Add new columns:
      - kilometraje (numeric)
      - transmision (text)
      - numero_dueños (integer)
      - carroceria (text)
      - estado_revision (text)
    
  2. Security
    - Update RLS policies for approval workflow
*/

ALTER TABLE autos
ADD COLUMN IF NOT EXISTS kilometraje numeric CHECK (kilometraje >= 0),
ADD COLUMN IF NOT EXISTS transmision text CHECK (transmision IN ('manual', 'automatica')),
ADD COLUMN IF NOT EXISTS numero_dueños integer CHECK (numero_dueños > 0),
ADD COLUMN IF NOT EXISTS carroceria text CHECK (carroceria IN ('sedan', 'hatchback', 'suv', 'pickup', 'van', 'coupe')),
ADD COLUMN IF NOT EXISTS estado_revision text DEFAULT 'pendiente' CHECK (estado_revision IN ('pendiente', 'aprobado', 'rechazado'));

-- Actualizar política existente para incluir estado de revisión
DROP POLICY IF EXISTS "Todos pueden ver autos disponibles" ON autos;
CREATE POLICY "Todos pueden ver autos disponibles"
  ON autos FOR SELECT
  TO authenticated
  USING (
    (estado = 'disponible' AND estado_revision = 'aprobado')
    OR usuario_id = auth.uid()
  );