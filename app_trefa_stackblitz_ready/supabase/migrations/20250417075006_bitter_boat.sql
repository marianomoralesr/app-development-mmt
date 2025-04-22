/*
  # Add dummy auto listings

  This migration adds sample auto listings to demonstrate the application's functionality.
*/

-- Insert dummy autos
INSERT INTO autos (
  marca, modelo, año, precio, kilometraje, transmision, 
  numero_dueños, carroceria, estado, estado_revision, descripcion,
  imagenes, usuario_id
)
VALUES
  (
    'Toyota', 'Camry', 2022, 350000, 15000, 'automatica',
    1, 'sedan', 'disponible', 'aprobado',
    'Excelente sedan familiar con bajo kilometraje',
    ARRAY['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'],
    (SELECT id FROM perfiles WHERE rol_id = (SELECT id FROM roles WHERE nombre = 'admin') LIMIT 1)
  ),
  (
    'Honda', 'CR-V', 2021, 420000, 25000, 'automatica',
    1, 'suv', 'disponible', 'aprobado',
    'SUV espaciosa y económica',
    ARRAY['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800'],
    (SELECT id FROM perfiles WHERE rol_id = (SELECT id FROM roles WHERE nombre = 'admin') LIMIT 1)
  ),
  (
    'Volkswagen', 'Golf', 2023, 380000, 5000, 'manual',
    1, 'hatchback', 'disponible', 'aprobado',
    'Deportivo y eficiente, perfecto para ciudad',
    ARRAY['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'],
    (SELECT id FROM perfiles WHERE rol_id = (SELECT id FROM roles WHERE nombre = 'admin') LIMIT 1)
  ),
  (
    'Ford', 'Ranger', 2022, 450000, 30000, 'manual',
    2, 'pickup', 'disponible', 'aprobado',
    'Pickup robusta para trabajo y aventura',
    ARRAY['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'],
    (SELECT id FROM perfiles WHERE rol_id = (SELECT id FROM roles WHERE nombre = 'admin') LIMIT 1)
  ),
  (
    'Mazda', 'CX-5', 2023, 460000, 12000, 'automatica',
    1, 'suv', 'disponible', 'aprobado',
    'SUV premium con excelentes acabados',
    ARRAY['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'],
    (SELECT id FROM perfiles WHERE rol_id = (SELECT id FROM roles WHERE nombre = 'admin') LIMIT 1)
  );