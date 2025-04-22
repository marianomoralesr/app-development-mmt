/*
  # Add default user roles

  1. Changes
    - Insert default roles for 'candidato' and 'vendedor'
    - Add descriptions for each role
    - Uses ON CONFLICT DO NOTHING to handle existing roles

  2. Security
    - No changes to RLS policies
    - Maintains existing table security
*/

INSERT INTO roles (nombre, descripcion)
VALUES 
  ('candidato', 'Usuario que busca comprar un auto'),
  ('vendedor', 'Usuario que busca vender un auto')
ON CONFLICT (nombre) DO NOTHING;