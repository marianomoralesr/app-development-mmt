import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useUserPerfil } from '@/hooks/useUserPerfil';
import { supabase } from '@/lib/supabase';
import { Auto } from '@/types';

interface Props {
  auto: Auto;
  onClose: () => void;
}

export default function PrestamoForm({ auto, onClose }: Props) {
  const perfil = useUserPerfil();
  const [plazoMeses, setPlazoMeses] = useState(12);
  const [ingresoMensual, setIngresoMensual] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfil) {
      toast.error('No se encontró información del perfil');
      return;
    }

    const loadingToast = toast.loading('Enviando solicitud...');
    setLoading(true);

    try {
      const { error } = await supabase.from('solicitudes_prestamo').insert({
        usuario_id: perfil.id,
        auto_id: auto.id,
        monto: auto.precio,
        plazo_meses: plazoMeses,
        ingreso_mensual: parseFloat(ingresoMensual),
      });

      if (error) throw error;

      toast.success('¡Solicitud enviada con éxito!', {
        id: loadingToast,
      });
      
      setTimeout(() => {
        onClose();
        window.location.href = '/mis-solicitudes';
      }, 2000);
    } catch (err) {
      console.error('Error submitting loan application:', err);
      toast.error('Error al enviar la solicitud. Por favor, intente nuevamente.', {
        id: loadingToast,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Datos del vehículo
        </label>
        <div className="mt-1 p-3 bg-gray-50 rounded-xl">
          <p className="font-medium">{auto.marca} {auto.modelo} {auto.año}</p>
          <p className="text-lg font-bold text-secondary">
            ${auto.precio.toLocaleString('es-MX')}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Datos del solicitante
        </label>
        <div className="mt-1 p-3 bg-gray-50 rounded-xl">
          <p>{perfil?.nombre} {perfil?.apellido}</p>
          <p>{perfil?.telefono || 'Sin teléfono registrado'}</p>
        </div>
      </div>

      <div>
        <label htmlFor="plazoMeses" className="block text-sm font-medium text-gray-700">
          Plazo del préstamo
        </label>
        <select
          id="plazoMeses"
          value={plazoMeses}
          onChange={(e) => setPlazoMeses(parseInt(e.target.value))}
          className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
        >
          <option value="12">12 meses</option>
          <option value="24">24 meses</option>
          <option value="36">36 meses</option>
          <option value="48">48 meses</option>
          <option value="60">60 meses</option>
        </select>
      </div>

      <div>
        <label htmlFor="ingresoMensual" className="block text-sm font-medium text-gray-700">
          Ingreso mensual
        </label>
        <div className="mt-1 relative rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="ingresoMensual"
            value={ingresoMensual}
            onChange={(e) => setIngresoMensual(e.target.value)}
            className="pl-7 block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary text-white py-2 px-4 rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar solicitud'}
        </button>
      </div>
    </form>
  );
}