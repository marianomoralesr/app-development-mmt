// hooks/useUserPerfil.ts

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const useUserPerfil = () => {
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (!error) setPerfil(data);
    };

    fetchPerfil();
  }, []);

  return perfil;
};