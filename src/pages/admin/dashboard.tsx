// pages/admin/dashboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Auto } from '@/types';

const AdminDashboard = () => {
  const [autosPendientes, setAutosPendientes] = useState<Auto[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('autos')
        .select('*')
        .eq('estado_revision', 'pendiente');
      setAutosPendientes(data || []);
    };
    fetch();
  }, []);

  const revisar = async (id: string, estado: 'aprobado' | 'rechazado') => {
    await supabase
      .from('autos')
      .update({ estado_revision: estado })
      .eq('id', id);
    setAutosPendientes((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-[#FF6801]">Autos por aprobar</h1>
      {autosPendientes.map((auto) => (
        <div key={auto.id} className="border p-4 rounded-xl shadow-md">
          <p><strong>{auto.marca} {auto.modelo}</strong> - {auto.año}</p>
          <p>{auto.descripcion}</p>
          <div className="space-x-2 mt-2">
            <button onClick={() => revisar(auto.id, 'aprobado')}
              className="bg-green-600 text-white px-4 py-1 rounded-md">Aprobar</button>
            <button onClick={() => revisar(auto.id, 'rechazado')}
              className="bg-red-600 text-white px-4 py-1 rounded-md">Rechazar</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;