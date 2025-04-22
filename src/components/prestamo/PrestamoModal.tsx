import { FC } from 'react';
import PrestamoForm from './PrestamoForm';
import { Auto } from '@/types';
import { X } from 'lucide-react';

interface Props {
  auto: Auto;
  onClose: () => void;
}

const PrestamoModal: FC<Props> = ({ auto, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
    <div className="bg-white rounded-xl max-w-md w-full p-8 relative">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Solicitar crédito para {auto.marca} {auto.modelo}
      </h2>
      <PrestamoForm auto={auto} onClose={onClose} />
    </div>
  </div>
);

export default PrestamoModal;