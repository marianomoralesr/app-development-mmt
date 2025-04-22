import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse OAuth tokens from URL
        const { data, error: urlError } = await supabase.auth.getSessionFromUrl();
        if (urlError) throw urlError;
        const session = data.session;
        if (!session?.user) throw new Error('No session found');

        // Ensure perfil exists
        const { data: profile, error: profileError } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (!profile && !profileError) {
          const { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('id')
            .eq('nombre', 'comprador')
            .single();
          if (roleError || !roleData) throw roleError || new Error('Rol “comprador” no encontrado');

          const { error: insertError } = await supabase.from('perfiles').insert({
            id: session.user.id,
            user_id: session.user.id,
            rol_id: roleData.id,
            nombre: session.user.user_metadata.full_name?.split(' ')[0] || 'Usuario',
            apellido: session.user.user_metadata.full_name?.split(' ').slice(1).join(' ') || 'Google',
            telefono: null,
          });
          if (insertError) throw insertError;
        }

        toast.success('¡Inicio de sesión exitoso!');
        navigate('/dashboard');
      } catch (error: any) {
        console.error('Error in auth callback:', error);
        toast.error('Error al procesar el inicio de sesión');
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-600">Procesando inicio de sesión...</p>
      </div>
    </div>
  );
}
