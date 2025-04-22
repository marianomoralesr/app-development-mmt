import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Chrome } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });
      if (error) throw error;
      if (!data.user) throw new Error('No se encontró la información del usuario');
      toast.success('¡Inicio de sesión exitoso!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error en inicio de sesión:', error);
      toast.error(error.message || 'Correo electrónico o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
      console.error('Error con Google login:', error);
      toast.error('Error al iniciar sesión con Google');
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
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 rounded hover:opacity-90"
            >
              {loading ? 'Cargando...' : 'Iniciar sesión'}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
            >
              <Chrome className="w-5 h-5 mr-2" /> Google
            </button>

            <p className="text-center text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Regístrate
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
