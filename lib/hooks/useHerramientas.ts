'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Herramienta, HerramientaAsignada } from '@/types/database';

export function useHerramientas() {
  const [herramientas, setHerramientas] = useState<Herramienta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHerramientas = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('herramientas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setHerramientas([]);
    } else {
      setHerramientas(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHerramientas();
  }, [fetchHerramientas]);

  const createHerramienta = async (herramienta: Omit<Herramienta, 'id' | 'created_at'>): Promise<Herramienta | null> => {
    const { data, error } = await supabase
      .from('herramientas')
      .insert(herramienta)
      .select()
      .single();

    if (error) {
      setError(error.message);
      return null;
    }

    setHerramientas(prev => [data, ...prev]);
    return data;
  };

  const updateHerramienta = async (id: string, updates: Partial<Herramienta>): Promise<boolean> => {
    const { error } = await supabase
      .from('herramientas')
      .update(updates)
      .eq('id', id);

    if (error) {
      setError(error.message);
      return false;
    }

    setHerramientas(prev => 
      prev.map(h => h.id === id ? { ...h, ...updates } : h)
    );
    return true;
  };

  const deleteHerramienta = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('herramientas')
      .delete()
      .eq('id', id);

    if (error) {
      setError(error.message);
      return false;
    }

    setHerramientas(prev => prev.filter(h => h.id !== id));
    return true;
  };

  return {
    herramientas,
    loading,
    error,
    refresh: fetchHerramientas,
    createHerramienta,
    updateHerramienta,
    deleteHerramienta,
  };
}

// Hook para herramientas asignadas a un paciente
export function useHerramientasAsignadas(pacienteId: string) {
  const [asignadas, setAsignadas] = useState<(HerramientaAsignada & { herramienta: Herramienta })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAsignadas = useCallback(async () => {
    if (!pacienteId) return;
    
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('herramientas_asignadas')
      .select(`
        *,
        herramienta:herramientas(*)
      `)
      .eq('paciente_id', pacienteId);

    if (error) {
      setError(error.message);
      setAsignadas([]);
    } else {
      setAsignadas(data as any || []);
    }
    setLoading(false);
  }, [pacienteId]);

  useEffect(() => {
    fetchAsignadas();
  }, [fetchAsignadas]);

  const asignarHerramienta = async (herramientaId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('herramientas_asignadas')
      .insert({
        herramienta_id: herramientaId,
        paciente_id: pacienteId,
        fecha_asignacion: new Date().toISOString(),
        visto: false,
      });

    if (error) {
      setError(error.message);
      return false;
    }

    fetchAsignadas();
    return true;
  };

  const desasignarHerramienta = async (herramientaId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('herramientas_asignadas')
      .delete()
      .eq('herramienta_id', herramientaId)
      .eq('paciente_id', pacienteId);

    if (error) {
      setError(error.message);
      return false;
    }

    setAsignadas(prev => prev.filter(a => a.herramienta_id !== herramientaId));
    return true;
  };

  const marcarVisto = async (herramientaId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('herramientas_asignadas')
      .update({ visto: true })
      .eq('herramienta_id', herramientaId)
      .eq('paciente_id', pacienteId);

    if (error) {
      setError(error.message);
      return false;
    }

    setAsignadas(prev => 
      prev.map(a => a.herramienta_id === herramientaId ? { ...a, visto: true } : a)
    );
    return true;
  };

  return {
    asignadas,
    loading,
    error,
    refresh: fetchAsignadas,
    asignarHerramienta,
    desasignarHerramienta,
    marcarVisto,
  };
}

