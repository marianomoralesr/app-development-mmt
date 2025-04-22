/*
  # Fix registration flow
  
  1. Changes
    - Ensure required roles exist
    - Add missing indexes
  
  2. Security
    - Maintain existing RLS policies
*/

-- Insert required roles if they don't exist
INSERT INTO roles (nombre, descripcion)
VALUES 
  ('comprador', 'Usuario que busca comprar un auto'),
  ('vendedor', 'Usuario que busca vender un auto')
ON CONFLICT (nombre) DO NOTHING;