import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { fetchInventario } from '@/lib/airtable';
import { Auto } from '@/types';
import AutoCard from './AutoCard';
import PrestamoModal from '../prestamo/PrestamoModal';

export function AutoList() {
  const [autos, setAutos] = useState<Auto[]>([]);
  const [selectedAuto, setSelectedAuto] = useState<Auto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAutos();
  }, []);

  async function loadAutos() {
    try {
      setLoading(true);
      
      // Fetch from Supabase
      const { data: supabaseAutos, error: supabaseError } = await supabase
        .from('autos')
        .select('*')
        .eq('estado', 'disponible')
        .eq('estado_revision', 'aprobado')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      // Fetch from Airtable
      const airtableAutos = await fetchInventario();

      // Merge and deduplicate autos
      const allAutos = [
        ...(supabaseAutos || []),
        ...airtableAutos.map(auto => ({
          id: auto.id,
          marca: auto.Marca,
          modelo: auto.Modelo,
          año: auto.Año,
          precio: auto.Precio,
          kilometraje: auto.Kilometraje,
          transmision: auto.Transmision,
          carroceria: auto.Carroceria,
          estado: 'disponible',
          estado_revision: 'aprobado',
          imagenes: [auto.Imagen],
          created_at: new Date().toISOString(),
        })),
      ];

      setAutos(allAutos);
    } catch (error) {
      console.error('Error loading autos:', error);
      toast.error('Error al cargar los autos disponibles');
    } finally {
      setLoading(false);
    }
  }

  const handleApply = (auto: Auto) => {
    setSelectedAuto(auto);
    toast.success(`Seleccionaste ${auto.marca} ${auto.modelo}`);
  };

  return (
    <div className="container mx-auto px-4">
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {autos.map((auto) => (
              <AutoCard
                key={auto.id}
                auto={auto}
                onApply={handleApply}
              />
            ))}
          </div>

          {autos.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No hay autos disponibles en este momento.</p>
            </div>
          )}

          {selectedAuto && (
            <PrestamoModal
              auto={selectedAuto}
              onClose={() => {
                setSelectedAuto(null);
                toast('Cancelaste la solicitud', {
                  icon: '❌',
                });
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

export default AutoList