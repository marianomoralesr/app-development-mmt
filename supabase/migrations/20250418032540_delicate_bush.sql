/*
  # Add required roles for user registration

  1. New Data
    - Add 'candidato' and 'vendedor' roles to the roles table
    
  2. Changes
    - Insert new roles if they don't exist
    - Use safe insertion with DO block to prevent duplicates
*/

DO $$ 
BEGIN
  -- Insert candidato role if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'candidato') THEN
    INSERT INTO roles (nombre, descripcion)
    VALUES ('candidato', 'Usuario que busca comprar un auto');
  END IF;

  -- Insert vendedor role if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'vendedor') THEN
    INSERT INTO roles (nombre, descripcion)
    VALUES ('vendedor', 'Usuario que busca vender un auto');
  END IF;
END $$;