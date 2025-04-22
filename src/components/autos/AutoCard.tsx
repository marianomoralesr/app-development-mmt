import { Auto } from '@/types';
import { FC } from 'react';
import { Heart } from 'lucide-react';

interface AutoCardProps {
  auto: Auto;
  onApply: (auto: Auto) => void;
}

const AutoCard: FC<AutoCardProps> = ({ auto, onApply }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {auto.imagenes && auto.imagenes[0] && (
        <div className="relative">
          <img
            src={auto.imagenes[0]}
            alt={`${auto.marca} ${auto.modelo}`}
            className="w-full h-48 object-cover"
          />
          <button className="absolute top-3 right-3 p-2 rounded-xl bg-white/80 hover:bg-white transition">
            <Heart className="w-5 h-5 text-gray-600" />
          </button>
          <div className="absolute top-3 left-3 bg-black/50 text-white px-3 py-1 rounded-xl text-sm">
            {auto.kilometraje.toLocaleString()} km
          </div>
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-900">
            {auto.marca} {auto.modelo}
          </h3>
          <span className="text-lg font-bold text-secondary">
            ${auto.precio.toLocaleString()}
          </span>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>{auto.año}</span>
            <span>•</span>
            <span>{auto.transmision}</span>
            <span>•</span>
            <span>{auto.carroceria}</span>
          </div>
        </div>
        <button
          onClick={() => onApply(auto)}
          className="mt-4 w-full bg-primary text-white py-3 rounded-xl hover:bg-primary/90 transition-colors font-medium"
        >
          Comprar a meses
        </button>
      </div>
    </div>
  );
};

export default AutoCard;