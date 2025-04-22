import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Auto } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

export default function AdminAutos() {
  const [autosPendientes, setAutosPendientes] = useState<Auto[]>([]);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    verificarAcceso();
    fetchAutos();
  }, [user]);

  const verificarAcceso = async () => {
    const { data, error } = await supabase
      .from('perfiles')
      .select('rol_id, rol:roles(nombre)')
      .eq('id', user.id)
      .single();

    if (!data || data.rol.nombre !== 'admin') {
      navigate('/'); // Redirigir si no es admin
    }
  };

  const fetchAutos = async () => {
    const { data, error } = await supabase
      .from('autos')
      .select('*')
      .eq('estado_revision', 'pendiente');

    if (!error && data) {
      setAutosPendientes(data);
    }
  };

  const cambiarEstado = async (id: string, estado: 'aprobado' | 'rechazado') => {
    await supabase.from('autos').update({ estado_revision: estado }).eq('id', id);
    fetchAutos();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-[#FF6801]">Revisión de Autos</h1>

      {autosPendientes.length === 0 ? (
        <p className="text-gray-600">No hay autos pendientes por revisar.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {autosPendientes.map((auto) => (
            <div key={auto.id} className="bg-white rounded-lg shadow p-4">
              {auto.imagenes && auto.imagenes[0] && (
                <img
                  src={auto.imagenes[0]}
                  alt={`${auto.marca} ${auto.modelo}`}
                  className="w-full h-48 object-cover rounded"
                />
              )}
              <h2 className="text-xl font-semibold mt-2">
                {auto.marca} {auto.modelo} {auto.año}
              </h2>
              <p className="text-gray-700 text-sm mt-1">{auto.descripcion}</p>
              <p className="text-sm mt-1">Precio: ${auto.precio.toLocaleString('es-MX')}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => cambiarEstado(auto.id, 'aprobado')}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => cambiarEstado(auto.id, 'rechazado')}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}