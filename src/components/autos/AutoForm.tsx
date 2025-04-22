import { useUserPerfil } from '@/hooks/useUserPerfil';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Auto } from '@/types';
import { Plus } from 'lucide-react';

const carroceriaOptions = ['sedan', 'hatchback', 'suv', 'pickup', 'van', 'coupe'];
const transmisionOptions = ['manual', 'automatica'];

const AutoForm = () => {
  const perfil = useUserPerfil();
  const [form, setForm] = useState<Partial<Auto>>({
    marca: '', modelo: '', año: 2020, kilometraje: 0,
    transmision: 'manual', numero_dueños: 1, carroceria: 'sedan',
  });
  const [imagenes, setImagenes] = useState<FileList | null>(null);
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'año' || name === 'kilometraje' || name === 'numero_dueños' ? Number(value) : value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!perfil) return;

    // Upload photos
    const uploadedUrls: string[] = [];
    if (imagenes) {
      for (let i = 0; i < imagenes.length; i++) {
        const file = imagenes[i];
        const filePath = `autos/${perfil.id}_${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('fotosdocumentos')
          .upload(filePath, file);

        if (!error) {
          const url = supabase.storage.from('fotosdocumentos').getPublicUrl(filePath).data.publicUrl;
          uploadedUrls.push(url);
        }
      }
    }

    const { error } = await supabase.from('autos').insert({
      ...form,
      usuario_id: perfil.id,
      estado_revision: 'pendiente',
      imagenes: uploadedUrls,
    });

    if (!error) setMensaje('Auto enviado para revisión');
    else setMensaje('Error al enviar el auto');
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Agregar nuevo auto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input 
            name="marca" 
            required 
            placeholder="Marca" 
            className="px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
            onChange={handleChange} 
          />
          <input 
            name="modelo" 
            required 
            placeholder="Modelo" 
            className="px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
            onChange={handleChange} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input 
            name="año" 
            type="number" 
            min={1900} 
            required 
            placeholder="Año" 
            className="px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
            onChange={handleChange} 
          />
          <input 
            name="kilometraje" 
            type="number" 
            required 
            placeholder="Kilometraje" 
            className="px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
            onChange={handleChange} 
          />
        </div>
        
        <select 
          name="transmision" 
          required 
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
          onChange={handleChange}
        >
          {transmisionOptions.map(op => <option key={op} value={op}>{op.charAt(0).toUpperCase() + op.slice(1)}</option>)}
        </select>

        <div className="grid grid-cols-2 gap-4">
          <input 
            name="numero_dueños" 
            type="number" 
            required 
            placeholder="Número de dueños" 
            className="px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
            onChange={handleChange} 
          />
          <select 
            name="carroceria" 
            required 
            className="px-4 py-3 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
            onChange={handleChange}
          >
            {carroceriaOptions.map(op => <option key={op} value={op}>{op.charAt(0).toUpperCase() + op.slice(1)}</option>)}
          </select>
        </div>

        <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-2xl text-center">
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={(e) => setImagenes(e.target.files)} 
            className="hidden" 
            id="images" 
          />
          <label 
            htmlFor="images" 
            className="flex flex-col items-center cursor-pointer"
          >
            <Plus className="w-8 h-8 text-gray-400" />
            <span className="mt-2 text-sm text-gray-600">Agregar fotos</span>
          </label>
        </div>

        <button 
          type="submit" 
          className="w-full bg-primary text-white py-3 rounded-2xl hover:bg-primary/90 transition-colors font-medium mt-6"
        >
          Publicar auto
        </button>

        {mensaje && (
          <div className="mt-4 p-4 rounded-2xl bg-green-50 text-green-700 text-center">
            {mensaje}
          </div>
        )}
      </form>
    </div>
  );
};

export default AutoForm;