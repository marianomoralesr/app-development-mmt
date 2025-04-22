import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { SolicitudPrestamo } from '../components/SolicitudPrestamo';

interface Auto {
  id: string;
  marca: string;
  modelo: string;
  año: number;
  precio: number;
  descripcion: string;
  estado: string;
  imagenes: string[];
}

export function Autos() {
  const [autos, setAutos] = useState<Auto[]>([]);
  const [selectedAuto, setSelectedAuto] = useState<Auto | null>(null);
  const [showSolicitud, setShowSolicitud] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    loadAutos();
  }, []);

  async function loadAutos() {
    const { data, error } = await supabase
      .from('autos')
      .select('*')
      .eq('estado', 'disponible');

    if (error) {
      console.error('Error cargando autos:', error);
      return;
    }

    setAutos(data || []);
  }

  function handleSolicitudPrestamo(auto: Auto) {
    setSelectedAuto(auto);
    setShowSolicitud(true);
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Autos Disponibles</h1>

      {showSolicitud && selectedAuto ? (
        <SolicitudPrestamo
          auto={selectedAuto}
          onClose={() => {
            setShowSolicitud(false);
            setSelectedAuto(null);
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
                <h3 className="text-xl font-semibold text-gray-900">
                  {auto.marca} {auto.modelo} {auto.año}
                </h3>
                <p className="text-gray-600 mt-2">{auto.descripcion}</p>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-primary">
                    ${auto.precio.toLocaleString('es-MX')}
                  </p>
                </div>
                <button
                  onClick={() => handleSolicitudPrestamo(auto)}
                  className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Comprar a meses
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}