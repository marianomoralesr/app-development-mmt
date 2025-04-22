import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import AutoList from '../../components/autos/AutoList';
import AutosSubidos from '../../components/AutosSubidos';
import { Car, FileText } from 'lucide-react';

export default function Dashboard() {
  const { user, role } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'comprador' | 'vendedor'>('comprador');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {user?.nombre}
        </h1>
        <p className="text-gray-600 mt-2">
          Gestiona tus autos y solicitudes desde aquí
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm mb-8">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('comprador')}
              className={`flex items-center px-6 py-4 text-sm font-medium ${
                activeTab === 'comprador'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Car className="w-5 h-5 mr-2" />
              Comprar Auto
            </button>
            <button
              onClick={() => setActiveTab('vendedor')}
              className={`flex items-center px-6 py-4 text-sm font-medium ${
                activeTab === 'vendedor'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-5 h-5 mr-2" />
              Mis Autos Publicados
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'comprador' ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Autos Disponibles
              </h2>
              <AutoList />
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Mis Autos Publicados
              </h2>
              <AutosSubidos />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Estadísticas Rápidas
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Autos Visitados</p>
              <p className="text-2xl font-bold text-primary">24</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Solicitudes Activas</p>
              <p className="text-2xl font-bold text-primary">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <p className="text-sm text-gray-600">Nueva solicitud aprobada</p>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
              <p className="text-sm text-gray-600">Auto nuevo disponible</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Acciones Rápidas
          </h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20">
              Publicar Auto
            </button>
            <button className="w-full px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20">
              Ver Solicitudes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}