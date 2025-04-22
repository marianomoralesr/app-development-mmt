// components/autos/AutosSubidos.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserPerfil } from '@/hooks/useUserPerfil';
import { Auto } from '@/types';

const AutosSubidos = () => {
  const perfil = useUserPerfil();
  const [autos, setAutos] = useState<Auto[]>([]);

  useEffect(() => {
    const fetch = async () => {
      if (!perfil) return;
      const { data } = await supabase
        .from('autos')
        .select('*')
        .eq('usuario_id', perfil.id)
        .order('created_at', { ascending: false });
      setAutos(data || []);
    };
    fetch();
  }, [perfil]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-[#FF6801]">Mis autos subidos</h2>
      {autos.map(auto => (
        <div key={auto.id} className="border p-4 rounded-lg shadow-sm">
          <p className="font-semibold">{auto.marca} {auto.modelo} ({auto.año})</p>
          <p>Kilometraje: {auto.kilometraje} km</p>
          <p>Estado de revisión: <span className={`font-bold ${auto.estado_revision === 'aprobado' ? 'text-green-600' : auto.estado_revision === 'rechazado' ? 'text-red-600' : 'text-yellow-600'}`}>{auto.estado_revision}</span></p>
        </div>
      ))}
    </div>
  );
};

export default AutosSubidos;