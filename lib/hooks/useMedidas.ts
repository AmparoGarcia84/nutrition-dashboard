'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Medida, MedidaInsert } from '@/types/database';

export function useMedidas(pacienteId: string) {
  const [medidas, setMedidas] = useState<Medida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedidas = useCallback(async () => {
    if (!pacienteId) return;
    
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('medidas')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('fecha', { ascending: false });

    if (error) {
      setError(error.message);
      setMedidas([]);
    } else {
      setMedidas(data || []);
    }
    setLoading(false);
  }, [pacienteId]);

  useEffect(() => {
    fetchMedidas();
  }, [fetchMedidas]);

  const createMedida = async (medida: MedidaInsert): Promise<Medida | null> => {
    const { data, error } = await supabase
      .from('medidas')
      .insert(medida)
      .select()
      .single();

    if (error) {
      setError(error.message);
      return null;
    }

    setMedidas(prev => [data, ...prev]);
    return data;
  };

  const updateMedida = async (id: string, updates: Partial<MedidaInsert>): Promise<boolean> => {
    const { error } = await supabase
      .from('medidas')
      .update(updates)
      .eq('id', id);

    if (error) {
      setError(error.message);
      return false;
    }

    setMedidas(prev => 
      prev.map(m => m.id === id ? { ...m, ...updates } : m)
    );
    return true;
  };

  const deleteMedida = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('medidas')
      .delete()
      .eq('id', id);

    if (error) {
      setError(error.message);
      return false;
    }

    setMedidas(prev => prev.filter(m => m.id !== id));
    return true;
  };

  return {
    medidas,
    loading,
    error,
    refresh: fetchMedidas,
    createMedida,
    updateMedida,
    deleteMedida,
  };
}

