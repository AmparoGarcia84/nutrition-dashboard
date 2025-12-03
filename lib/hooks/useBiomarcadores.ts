'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Biomarcador, BiomarcadorInsert } from '@/types/database';

export function useBiomarcadores(pacienteId: string) {
  const [biomarcadores, setBiomarcadores] = useState<Biomarcador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBiomarcadores = useCallback(async () => {
    if (!pacienteId) return;
    
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('biomarcadores')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('fecha', { ascending: false });

    if (error) {
      setError(error.message);
      setBiomarcadores([]);
    } else {
      setBiomarcadores(data || []);
    }
    setLoading(false);
  }, [pacienteId]);

  useEffect(() => {
    fetchBiomarcadores();
  }, [fetchBiomarcadores]);

  const createBiomarcador = async (biomarcador: BiomarcadorInsert): Promise<Biomarcador | null> => {
    const { data, error } = await supabase
      .from('biomarcadores')
      .insert(biomarcador)
      .select()
      .single();

    if (error) {
      setError(error.message);
      return null;
    }

    setBiomarcadores(prev => [data, ...prev]);
    return data;
  };

  const updateBiomarcador = async (id: string, updates: Partial<BiomarcadorInsert>): Promise<boolean> => {
    const { error } = await supabase
      .from('biomarcadores')
      .update(updates)
      .eq('id', id);

    if (error) {
      setError(error.message);
      return false;
    }

    setBiomarcadores(prev => 
      prev.map(b => b.id === id ? { ...b, ...updates } : b)
    );
    return true;
  };

  const deleteBiomarcador = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('biomarcadores')
      .delete()
      .eq('id', id);

    if (error) {
      setError(error.message);
      return false;
    }

    setBiomarcadores(prev => prev.filter(b => b.id !== id));
    return true;
  };

  // Actualizar tarea de un biomarcador
  const toggleTarea = async (biomarcadorId: string, tareaId: string): Promise<boolean> => {
    const biomarcador = biomarcadores.find(b => b.id === biomarcadorId);
    if (!biomarcador) return false;

    const tareas = (biomarcador.tareas as { id: string; descripcion: string; completada: boolean }[]) || [];
    const updatedTareas = tareas.map(t => 
      t.id === tareaId ? { ...t, completada: !t.completada } : t
    );

    return updateBiomarcador(biomarcadorId, { tareas: updatedTareas });
  };

  return {
    biomarcadores,
    loading,
    error,
    refresh: fetchBiomarcadores,
    createBiomarcador,
    updateBiomarcador,
    deleteBiomarcador,
    toggleTarea,
  };
}

