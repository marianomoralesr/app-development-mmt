import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { setUser, setRole } = useAuthStore();

  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login');
        return;
      }

      // Obtener perfil y rol del usuario
      supabase
        .from('perfiles')
        .select(`
          *,
          roles (
            id,
            nombre,
            descripcion
          )
        `)
        .eq('id', session.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile) {
            setUser({
              id: profile.id,
              rol_id: profile.rol_id,
              nombre: profile.nombre,
              apellido: profile.apellido,
              telefono: profile.telefono,
              created_at: profile.created_at,
            });
            setRole(profile.roles);
            navigate('/dashboard');
          }
        });
    });

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setRole(null);
          navigate('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, setUser, setRole]);

  return children;
}