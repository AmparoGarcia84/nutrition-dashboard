'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Dieta } from '@/types/database';

export type DietaInsert = Omit<Dieta, 'id' | 'created_at'>;

export function useDietas(pacienteId: string) {
  const [dietas, setDietas] = useState<Dieta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDietas = useCallback(async () => {
    if (!pacienteId) return;
    
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('dietas')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('fecha_inicio', { ascending: false });

    if (error) {
      setError(error.message);
      setDietas([]);
    } else {
      setDietas(data || []);
    }
    setLoading(false);
  }, [pacienteId]);

  useEffect(() => {
    fetchDietas();
  }, [fetchDietas]);

  const createDieta = async (dieta: DietaInsert): Promise<Dieta | null> => {
    const { data, error } = await supabase
      .from('dietas')
      .insert(dieta as any)
      .select()
      .single();

    if (error) {
      setError(error.message);
      return null;
    }

    setDietas(prev => [data, ...prev]);
    return data;
  };

  const updateDieta = async (id: string, updates: Partial<DietaInsert>): Promise<boolean> => {
    const { error } = await supabase
      .from('dietas')
      // @ts-ignore - Supabase type inference issue with Database generic
      .update(updates)
      .eq('id', id);

    if (error) {
      setError(error.message);
      return false;
    }

    setDietas(prev => 
      prev.map(d => d.id === id ? { ...d, ...updates } : d)
    );
    return true;
  };

  const deleteDieta = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('dietas')
      .delete()
      .eq('id', id);

    if (error) {
      setError(error.message);
      return false;
    }

    setDietas(prev => prev.filter(d => d.id !== id));
    return true;
  };

  return {
    dietas,
    loading,
    error,
    refresh: fetchDietas,
    createDieta,
    updateDieta,
    deleteDieta,
  };
}

