import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

interface Auto {
  id: string;
  marca: string;
  modelo: string;
  año: number;
  precio: number;
}

interface SolicitudPrestamoProps {
  auto: Auto;
  onClose: () => void;
}

export function SolicitudPrestamo({ auto, onClose }: SolicitudPrestamoProps) {
  const { user } = useAuthStore();
  const [plazoMeses, setPlazoMeses] = useState(12);
  const [ingresoMensual, setIngresoMensual] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.from('solicitudes_prestamo').insert({
        usuario_id: user?.id,
        monto: auto.precio,
        plazo_meses: plazoMeses,
        ingreso_mensual: parseFloat(ingresoMensual),
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError('Error al enviar la solicitud. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Solicitud de Financiamiento
        </h2>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700">Detalles del Auto</h3>
          <p className="mt-2">
            {auto.marca} {auto.modelo} {auto.año}
          </p>
          <p className="text-xl font-bold text-primary mt-2">
            ${auto.precio.toLocaleString('es-MX')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre Completo
            </label>
            <p className="mt-1 p-2 bg-gray-50 rounded-md">
              {user?.nombre} {user?.apellido}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <p className="mt-1 p-2 bg-gray-50 rounded-md">
              {user?.telefono || 'No especificado'}
            </p>
          </div>

          <div>
            <label
              htmlFor="plazoMeses"
              className="block text-sm font-medium text-gray-700"
            >
              Plazo (meses)
            </label>
            <select
              id="plazoMeses"
              value={plazoMeses}
              onChange={(e) => setPlazoMeses(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="12">12 meses</option>
              <option value="24">24 meses</option>
              <option value="36">36 meses</option>
              <option value="48">48 meses</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="ingresoMensual"
              className="block text-sm font-medium text-gray-700"
            >
              Ingreso Mensual
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="ingresoMensual"
                value={ingresoMensual}
                onChange={(e) => setIngresoMensual(e.target.value)}
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && (
            <p className="text-green-600 text-sm">
              ¡Solicitud enviada con éxito!
            </p>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}