'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Paciente, PacienteInsert } from '@/types/database';

export function usePacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPacientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setPacientes([]);
    } else {
      setPacientes(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes]);

  const createPaciente = async (paciente: PacienteInsert): Promise<Paciente | null> => {
    const { data, error } = await supabase
      .from('pacientes')
      .insert(paciente as any)
      .select()
      .single();

    if (error) {
      setError(error.message);
      return null;
    }

    setPacientes(prev => [data, ...prev]);
    return data;
  };

  const updatePaciente = async (id: string, updates: Partial<PacienteInsert>): Promise<boolean> => {
    const { error } = await supabase
      .from('pacientes')
      .update(updates as any)
      .eq('id', id);

    if (error) {
      setError(error.message);
      return false;
    }

    setPacientes(prev => 
      prev.map(p => p.id === id ? { ...p, ...updates } : p)
    );
    return true;
  };

  const deletePaciente = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', id);

    if (error) {
      setError(error.message);
      return false;
    }

    setPacientes(prev => prev.filter(p => p.id !== id));
    return true;
  };

  return {
    pacientes,
    loading,
    error,
    refresh: fetchPacientes,
    createPaciente,
    updatePaciente,
    deletePaciente,
  };
}

export function usePaciente(id: string) {
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaciente = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      setError(error.message);
      setPaciente(null);
    } else {
      setPaciente(data);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchPaciente();
  }, [fetchPaciente]);

  const updatePaciente = async (updates: Partial<PacienteInsert>): Promise<boolean> => {
    if (!id) return false;
    
    const { error } = await supabase
      .from('pacientes')
      .update(updates as any)
      .eq('id', id);

    if (error) {
      setError(error.message);
      return false;
    }

    // Refrescar los datos
    await fetchPaciente();
    return true;
  };

  return { paciente, loading, error, refresh: fetchPaciente, updatePaciente };
}

