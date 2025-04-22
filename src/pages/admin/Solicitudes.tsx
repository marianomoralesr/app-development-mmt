// pages/admin/solicitudes.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { SolicitudPrestamo, Auto, Perfil } from '../../types';

interface SolicitudExpandida extends SolicitudPrestamo {
  auto: Auto;
  perfil: Perfil;
}

const estados = ['pendiente', 'en_revision', 'aprobada', 'rechazada'];

export default function AdminSolicitudes() {
  const [solicitudes, setSolicitudes] = useState<
    Record<string, SolicitudExpandida[]>
  >({});

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const loadSolicitudes = async () => {
    const { data, error } = await supabase
      .from('solicitudes_prestamo')
      .select('*, auto:autos(*), perfil:perfiles(*)');

    if (error) {
      console.error('Error cargando solicitudes:', error);
      return;
    }

    const agrupadas = estados.reduce((acc, estado) => {
      acc[estado] = data.filter((s: SolicitudExpandida) => s.estado === estado);
      return acc;
    }, {} as Record<string, SolicitudExpandida[]>);

    setSolicitudes(agrupadas);
  };

  const actualizarEstado = async (id: string, nuevoEstado: string) => {
    await supabase
      .from('solicitudes_prestamo')
      .update({ estado: nuevoEstado })
      .eq('id', id);
    loadSolicitudes();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 overflow-x-auto">
      {estados.map((estado) => (
        <div key={estado} className="w-full lg:w-1/4">
          <h3 className="text-lg font-bold text-gray-800 mb-2 capitalize">
            {estado.replace('_', ' ')}
          </h3>
          <div className="space-y-4">
            {solicitudes[estado]?.map((solicitud) => (
              <div
                key={solicitud.id}
                className="bg-white shadow p-4 rounded-lg space-y-2"
              >
                <p>
                  <strong>{solicitud.perfil.nombre}</strong> solicita{' '}
                  <strong>${solicitud.monto.toLocaleString()}</strong> para{' '}
                  {solicitud.auto.marca} {solicitud.auto.modelo}
                </p>
                <p>Plazo: {solicitud.plazo_meses} meses</p>
                <p>Ingreso: ${solicitud.ingreso_mensual.toLocaleString()}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {estados
                    .filter((e) => e !== estado)
                    .map((nuevoEstado) => (
                      <button
                        key={nuevoEstado}
                        onClick={() =>
                          actualizarEstado(solicitud.id, nuevoEstado)
                        }
                        className="bg-primary text-white px-2 py-1 rounded text-sm"
                      >
                        Mover a {nuevoEstado.replace('_', ' ')}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
