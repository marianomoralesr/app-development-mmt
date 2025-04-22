import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { FormularioAuto } from '../components/FormularioAuto';

interface Auto {
  id: string;
  marca: string;
  modelo: string;
  año: number;
  precio: number;
  kilometraje: number;
  transmision: string;
  numero_dueños: number;
  carroceria: string;
  estado: string;
  estado_revision: string;
  imagenes: string[];
}

export function MisAutos() {
  const [autos, setAutos] = useState<Auto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      loadAutos();
    }
  }, [user]);

  async function loadAutos() {
    const { data, error } = await supabase
      .from('autos')
      .select('*')
      .eq('usuario_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando autos:', error);
      return;
    }

    setAutos(data || []);
  }

  function getEstadoColor(estado: string) {
    switch (estado) {
      case 'aprobado':
        return 'bg-green-100 text-green-800';
      case 'rechazado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Autos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
        >
          <Plus className="w-5 h-5 mr-2" />
          Publicar Auto
        </button>
      </div>

      {showForm ? (
        <FormularioAuto
          onClose={() => {
            setShowForm(false);
            loadAutos();
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {autos.map((auto) => (
            <div
              key={auto.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              {auto.imagenes && auto.imagenes[0] && (
                <img
                  src={auto.imagenes[0]}
                  alt={`${auto.marca} ${auto.modelo}`}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {auto.marca} {auto.modelo} {auto.año}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(
                      auto.estado_revision
                    )}`}
                  >
                    {auto.estado_revision.charAt(0).toUpperCase() +
                      auto.estado_revision.slice(1)}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Kilometraje: {auto.kilometraje.toLocaleString()} km</p>
                  <p>Transmisión: {auto.transmision}</p>
                  <p>Carrocería: {auto.carroceria}</p>
                  <p>Dueños previos: {auto.numero_dueños}</p>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-primary">
                    ${auto.precio.toLocaleString('es-MX')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}