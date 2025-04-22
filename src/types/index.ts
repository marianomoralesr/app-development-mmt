// types/index.ts

export interface Auto {
  id: string;
  marca: string;
  modelo: string;
  año: number;
  precio: number;
  descripcion: string;
  estado: 'disponible' | 'reservado' | 'vendido';
  estado_revision: 'pendiente' | 'aprobado' | 'rechazado';
  transmision: 'manual' | 'automatica';
  numero_dueños: number;
  carroceria: 'sedan' | 'hatchback' | 'suv' | 'pickup' | 'van' | 'coupe';
  imagenes: string[];
  usuario_id: string;
  created_at: string;
}

export interface Perfil {
  id: string;
  rol_id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  created_at: string;
}

export interface SolicitudPrestamo {
  id: string;
  usuario_id: string;
  auto_id: string;
  monto: number;
  plazo_meses: number;
  ingreso_mensual: number;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  created_at: string;
}