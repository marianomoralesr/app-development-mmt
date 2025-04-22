/*
  # Update perfiles table constraints

  1. Changes
    - Remove rol_id constraint from perfiles table
    - Remove foreign key constraint to roles table
*/

ALTER TABLE perfiles
DROP CONSTRAINT IF EXISTS perfiles_rol_id_fkey,
ALTER COLUMN rol_id DROP NOT NULL;