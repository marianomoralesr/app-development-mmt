import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

interface Props {
  onClose: () => void;
}

export function FormularioAuto({ onClose }: Props) {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    marca: '',
    modelo: '',
    año: 2020,
    kilometraje: 0,
    transmision: 'manual',
    numero_dueños: 1,
    carroceria: 'sedan',
    precio: 0,
    descripcion: '',
  });
  const [imagenes, setImagenes] = useState<FileList | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'año' || name === 'kilometraje' || name === 'numero_dueños' || name === 'precio'
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setEnviando(true);
    const imagenUrls: string[] = [];

    if (imagenes) {
      for (let i = 0; i < imagenes.length; i++) {
        const file = imagenes[i];
        const filePath = `autos/${user.id}_${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('fotosdocumentos')
          .upload(`autos/${filePath}`, file);

        if (!uploadError) {
          const { data } = supabase.storage
            .from('fotosdocumentos')
            .getPublicUrl(`autos/${filePath}`);
          imagenUrls.push(data.publicUrl);
        }
      }
    }

    const { error } = await supabase.from('autos').insert({
      ...form,
      usuario_id: user.id,
      estado: 'disponible',
      estado_revision: 'pendiente',
      imagenes: imagenUrls,
    });

    if (error) {
      setMensaje('Error al subir el auto. Intenta de nuevo.');
    } else {
      setMensaje('Auto enviado para revisión.');
      setTimeout(onClose, 1500);
    }

    setEnviando(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800">Publicar Auto</h2>

      <input name="marca" required className="input" placeholder="Marca" onChange={handleChange} />
      <input name="modelo" required className="input" placeholder="Modelo" onChange={handleChange} />
      <input name="año" type="number" min={1900} required className="input" placeholder="Año" onChange={handleChange} />
      <input name="kilometraje" type="number" required className="input" placeholder="Kilometraje" onChange={handleChange} />
      <input name="precio" type="number" required className="input" placeholder="Precio" onChange={handleChange} />

      <select name="transmision" required className="input" onChange={handleChange}>
        <option value="manual">Manual</option>
        <option value="automatica">Automática</option>
      </select>

      <select name="carroceria" required className="input" onChange={handleChange}>
        <option value="sedan">Sedán</option>
        <option value="hatchback">Hatchback</option>
        <option value="suv">SUV</option>
        <option value="pickup">Pickup</option>
        <option value="van">Van</option>
        <option value="coupe">Coupé</option>
      </select>

      <input name="numero_dueños" type="number" min={1} required className="input" placeholder="Número de dueños" onChange={handleChange} />
      <textarea name="descripcion" className="input" placeholder="Descripción" rows={3} onChange={handleChange} />

      <input type="file" multiple accept="image/*" onChange={(e) => setImagenes(e.target.files)} className="input" />

      <div className="flex gap-4 mt-4">
        <button
          type="submit"
          disabled={enviando}
          className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition"
        >
          {enviando ? 'Enviando...' : 'Publicar'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 underline"
        >
          Cancelar
        </button>
      </div>

      {mensaje && <p className="text-sm mt-4 text-green-600">{mensaje}</p>}
    </form>
  );
}