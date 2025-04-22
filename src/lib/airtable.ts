import { supabase } from './supabase';

export const fetchInventario = async () => {
  try {
    const { data: autos, error } = await supabase
      .from('autos')
      .select('*')
      .eq('estado', 'disponible')
      .eq('estado_revision', 'aprobado')
      .limit(100);

    if (error) {
      throw error;
    }

    return autos || [];
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};