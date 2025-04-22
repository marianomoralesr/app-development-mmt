// pages/MisSolicitudes.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { SolicitudPrestamo, Auto } from '../types';

interface SolicitudConAuto extends SolicitudPrestamo {
  auto: Auto;
}

export function MisSolicitudes() {
  const { user } = useAuthStore();
  const [solicitudes, setSolicitudes] = useState<SolicitudConAuto[]>([]);

  useEffect(() => {
    if (user?.id) loadSolicitudes();
  }, [user]);

  async function loadSolicitudes() {
    const { data, error } = await supabase
      .from('solicitudes_prestamo')
      .select('*, auto:autos(*)')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando solicitudes:', error);
      return;
    }

    setSolicitudes(data || []);
  }

  const getColor = (estado: string) => {
    switch (estado) {
      case 'aprobada': return 'text-green-600';
      case 'rechazada': return 'text-red-600';
      case 'en_revision': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Mis Solicitudes de Préstamo</h1>
      {solicitudes.length === 0 ? (
        <p>No has enviado solicitudes aún.</p>
      ) : (
        <div className="space-y-6">
          {solicitudes.map((s) => (
            <div key={s.id} className="bg-white shadow-md rounded-lg p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{s.auto.marca} {s.auto.modelo} {s.auto.año}</h2>
                <span className={`text-sm font-medium ${getColor(s.estado)}`}>
                  {s.estado.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 mt-2">Monto solicitado: ${s.monto.toLocaleString('es-MX')}</p>
              <p className="text-gray-600">Plazo: {s.plazo_meses} meses</p>
              <p className="text-gray-600">Ingreso mensual declarado: ${s.ingreso_mensual.toLocaleString('es-MX')}</p>
              <p className="text-sm text-gray-400 mt-1">Fecha de envío: {new Date(s.created_at).toLocaleDateString('es-MX')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}