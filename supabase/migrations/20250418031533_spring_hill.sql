/*
  # Create default roles

  1. Changes
    - Ensure 'candidato' and 'vendedor' roles exist
    - Add unique constraint on role names if not exists
  
  2. Security
    - No changes to RLS policies
*/

-- First check if roles already exist to avoid duplicates
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM roles 
    WHERE nombre IN ('candidato', 'vendedor')
  ) THEN
    INSERT INTO roles (nombre, descripcion)
    VALUES 
      ('candidato', 'Usuario que busca comprar un auto'),
      ('vendedor', 'Usuario que busca vender autos');
  END IF;
END $$;

-- Ensure nombre column has unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'roles_nombre_key'
  ) THEN
    ALTER TABLE roles ADD CONSTRAINT roles_nombre_key UNIQUE (nombre);
  END IF;
END $$;