'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { useBiomarcadores } from '@/lib/hooks';
import { BIOMARCADORES_INFO } from '@/types';
import { 
  Heart,
  X,
  Save,
  Plus,
  Trash2,
  Loader2,
  Edit2,
  Check
} from 'lucide-react';

interface FormBiomarcadorProps {
  pacienteId: string;
  biomarcadorId?: string; // Si existe, es edición
  onClose: () => void;
}

export default function FormBiomarcador({ pacienteId, biomarcadorId, onClose }: FormBiomarcadorProps) {
  const { biomarcadores, createBiomarcador, updateBiomarcador } = useBiomarcadores(pacienteId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const biomarcadorExistente = biomarcadorId 
    ? biomarcadores?.find(b => b.id === biomarcadorId)
    : null;

  const [formData, setFormData] = useState({
    tipo: biomarcadorExistente?.tipo || 'gastrointestinal',
    porcentaje: biomarcadorExistente?.porcentaje || 50,
    fecha: biomarcadorExistente?.fecha || new Date().toISOString().split('T')[0],
    notas: biomarcadorExistente?.notas || '',
    tareas: (biomarcadorExistente?.tareas as any[]) || [],
  });

  // Actualizar formData cuando cambie el biomarcadorExistente
  useEffect(() => {
    if (biomarcadorExistente) {
      setFormData({
        tipo: biomarcadorExistente.tipo,
        porcentaje: biomarcadorExistente.porcentaje,
        fecha: biomarcadorExistente.fecha,
        notas: biomarcadorExistente.notas || '',
        tareas: (biomarcadorExistente.tareas as any[]) || [],
      });
    } else {
      // Resetear para nuevo biomarcador
      setFormData({
        tipo: 'gastrointestinal',
        porcentaje: 50,
        fecha: new Date().toISOString().split('T')[0],
        notas: '',
        tareas: [],
      });
    }
  }, [biomarcadorExistente]);

  const [nuevaTarea, setNuevaTarea] = useState('');
  const [editingTareaId, setEditingTareaId] = useState<string | null>(null);
  const [editingTareaText, setEditingTareaText] = useState('');

  const handleAddTarea = () => {
    if (nuevaTarea.trim()) {
      setFormData(prev => ({
        ...prev,
        tareas: [
          ...prev.tareas,
          {
            id: Date.now().toString(),
            descripcion: nuevaTarea.trim(),
            completada: false,
          }
        ]
      }));
      setNuevaTarea('');
    }
  };

  const handleRemoveTarea = (id: string) => {
    setFormData(prev => ({
      ...prev,
      tareas: prev.tareas.filter(t => (t as any).id !== id)
    }));
  };

  const handleEditTarea = (tarea: any) => {
    setEditingTareaId(tarea.id);
    setEditingTareaText(tarea.descripcion);
  };

  const handleSaveTarea = (id: string) => {
    if (editingTareaText.trim()) {
      setFormData(prev => ({
        ...prev,
        tareas: prev.tareas.map((t: any) => 
          t.id === id 
            ? { ...t, descripcion: editingTareaText.trim() }
            : t
        )
      }));
      setEditingTareaId(null);
      setEditingTareaText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTareaId(null);
    setEditingTareaText('');
  };

  const handleToggleTareaCompletada = (id: string) => {
    setFormData(prev => ({
      ...prev,
      tareas: prev.tareas.map((t: any) => 
        t.id === id 
          ? { ...t, completada: !t.completada }
          : t
      )
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Asegurar que el porcentaje sea un número válido entre 0 y 100
      const porcentajeNumero = typeof formData.porcentaje === 'number'
        ? Math.max(0, Math.min(100, formData.porcentaje))
        : typeof formData.porcentaje === 'string'
        ? Math.max(0, Math.min(100, parseFloat(formData.porcentaje) || 0))
        : 0;

      if (biomarcadorId) {
        // Editar
        const success = await updateBiomarcador(biomarcadorId, {
          tipo: formData.tipo,
          porcentaje: porcentajeNumero,
          fecha: formData.fecha,
          notas: formData.notas || null,
          tareas: formData.tareas,
        });

        if (success) {
          onClose();
        } else {
          setError('Error al actualizar el biomarcador');
          setIsSubmitting(false);
        }
      } else {
        // Crear nuevo
        const nuevo = await createBiomarcador({
          paciente_id: pacienteId,
          tipo: formData.tipo,
          porcentaje: porcentajeNumero,
          fecha: formData.fecha,
          notas: formData.notas || null,
          tareas: formData.tareas,
        });

        if (nuevo) {
          onClose();
        } else {
          setError('Error al crear el biomarcador');
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      setError('Error inesperado');
      setIsSubmitting(false);
    }
  };

  const tiposDisponibles = Object.keys(BIOMARCADORES_INFO) as Array<keyof typeof BIOMARCADORES_INFO>;
  const tiposYaUsados = biomarcadores?.map(b => b.tipo) || [];
  const tiposDisponiblesFiltrados = biomarcadorId 
    ? tiposDisponibles // Si edita, puede cambiar a cualquier tipo
    : tiposDisponibles.filter(t => !tiposYaUsados.includes(t)); // Si crea, solo los que no tiene

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b border-border">
          <h2 className="text-2xl font-semibold text-foreground">
            {biomarcadorId ? 'Editar Biomarcador' : 'Nuevo Biomarcador'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted-light transition-colors"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-danger-light rounded-xl text-danger text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Tipo de biomarcador */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tipo de Biomarcador
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
              disabled={tiposDisponiblesFiltrados.length === 0 && !biomarcadorId}
            >
              {tiposDisponibles.map(tipo => {
                const info = BIOMARCADORES_INFO[tipo];
                const yaUsado = tiposYaUsados.includes(tipo) && tipo !== formData.tipo;
                return (
                  <option 
                    key={tipo} 
                    value={tipo}
                    disabled={yaUsado && !biomarcadorId}
                  >
                    {info.nombre} {yaUsado && !biomarcadorId ? '(ya existe)' : ''}
                  </option>
                );
              })}
            </select>
            {tiposDisponiblesFiltrados.length === 0 && !biomarcadorId && (
              <p className="mt-2 text-sm text-muted">
                Ya tienes todos los biomarcadores registrados. Edita uno existente para cambiar su valor.
              </p>
            )}
          </div>

          {/* Porcentaje */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Porcentaje: <span className="text-primary font-bold">{formData.porcentaje}%</span>
            </label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">0</span>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.porcentaje}
                onChange={(e) => setFormData(prev => ({ ...prev, porcentaje: parseInt(e.target.value) }))}
                className="flex-1 h-2 bg-muted-light rounded-full appearance-none cursor-pointer accent-primary"
              />
              <span className="text-sm text-muted">100</span>
            </div>
            <div className="mt-2 h-3 bg-muted-light rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  formData.porcentaje >= 80 ? 'bg-success' : 
                  formData.porcentaje >= 50 ? 'bg-warning' : 'bg-danger'
                }`}
                style={{ width: `${formData.porcentaje}%` }}
              />
            </div>
          </div>

          {/* Fecha */}
          <Input
            label="Fecha de evaluación"
            type="date"
            value={formData.fecha}
            onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
          />

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Notas
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
              placeholder="Observaciones sobre este biomarcador..."
            />
          </div>

          {/* Tareas */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Tareas Recomendadas
            </label>
            
            {/* Añadir nueva tarea */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={nuevaTarea}
                onChange={(e) => setNuevaTarea(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTarea()}
                placeholder="Nueva tarea..."
                className="flex-1 px-4 py-2 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
              />
              <Button onClick={handleAddTarea} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Añadir
              </Button>
            </div>

            {/* Lista de tareas */}
            <div className="space-y-2">
              {formData.tareas.map((tarea: any) => (
                <div 
                  key={tarea.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-background"
                >
                  {/* Checkbox para completada */}
                  <button
                    onClick={() => handleToggleTareaCompletada(tarea.id)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      tarea.completada 
                        ? 'bg-primary text-white hover:bg-primary-dark' 
                        : 'bg-muted-light text-muted hover:bg-muted border-2 border-border'
                    }`}
                    title={tarea.completada ? 'Marcar como pendiente' : 'Marcar como completada'}
                  >
                    {tarea.completada && <Check className="w-3 h-3" />}
                  </button>

                  {/* Descripción de la tarea - editable */}
                  {editingTareaId === tarea.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editingTareaText}
                        onChange={(e) => setEditingTareaText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSaveTarea(tarea.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-primary bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveTarea(tarea.id)}
                        className="p-1.5 rounded-lg hover:bg-success-light transition-colors"
                        title="Guardar"
                      >
                        <Check className="w-4 h-4 text-success" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1.5 rounded-lg hover:bg-muted-light transition-colors"
                        title="Cancelar"
                      >
                        <X className="w-4 h-4 text-muted" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span 
                        className={`flex-1 text-sm ${
                          tarea.completada 
                            ? 'line-through text-muted' 
                            : 'text-foreground'
                        }`}
                      >
                        {tarea.descripcion}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditTarea(tarea)}
                          className="p-1.5 rounded-lg hover:bg-primary-light transition-colors"
                          title="Editar tarea"
                        >
                          <Edit2 className="w-4 h-4 text-primary" />
                        </button>
                        <button
                          onClick={() => handleRemoveTarea(tarea.id)}
                          className="p-1.5 rounded-lg hover:bg-danger-light transition-colors"
                          title="Eliminar tarea"
                        >
                          <Trash2 className="w-4 h-4 text-danger" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {formData.tareas.length === 0 && (
                <p className="text-sm text-muted text-center py-4">
                  No hay tareas. Añade tareas recomendadas para este biomarcador.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-6 sticky bottom-0 bg-white pt-4 border-t border-border">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            isLoading={isSubmitting}
            disabled={tiposDisponiblesFiltrados.length === 0 && !biomarcadorId}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {biomarcadorId ? 'Guardar Cambios' : 'Crear Biomarcador'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

