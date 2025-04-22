import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Chrome } from 'lucide-react';

interface FormState {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono: string;
}

export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    telefono: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: form.email.toLowerCase().trim(),
        password: form.password,
      });
      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('No se pudo crear el usuario');

      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('nombre', 'comprador')
        .single();
      if (roleError || !roleData) throw roleError || new Error('Rol “comprador” no encontrado');

      const { error: profileError } = await supabase.from('perfiles').insert({
        id: authData.user.id,
        user_id: authData.user.id,
        rol_id: roleData.id,
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono || null,
      });
      if (profileError) throw profileError;

      toast.success('¡Registro exitoso! Ya puedes iniciar sesión');
      navigate('/login');
    } catch (error: any) {
      console.error('Error en registro:', error);
      toast.error(error.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Error con registro Google:', error);
      toast.error('Error al registrarse con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-center text-primary mb-6">TREFA</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="nombre"
              type="text"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              name="apellido"
              type="text"
              placeholder="Apellido"
              value={form.apellido}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              name="telefono"
              type="tel"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            <input
              name="email"
              type="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 rounded hover:opacity-90"
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
            >
              <Chrome className="w-5 h-5 mr-2" /> Registrarse con Google
            </button>

            <p className="text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
