/*
  # Add admin user

  1. Changes
    - Insert admin role if not exists
    - Insert admin user profile
    
  2. Admin Credentials
    Email: admin@trefa.com
    Password: Admin123!
*/

-- Insert admin role if not exists
INSERT INTO roles (nombre, descripcion)
VALUES ('admin', 'Administrador del sistema')
ON CONFLICT (nombre) DO NOTHING;

-- Insert admin user profile
INSERT INTO perfiles (id, rol_id, nombre, apellido, telefono, user_id)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  (SELECT id FROM roles WHERE nombre = 'admin'),
  'Admin',
  'TREFA',
  '0000000000',
  '00000000-0000-0000-0000-000000000000'
)
ON CONFLICT (id) DO NOTHING;