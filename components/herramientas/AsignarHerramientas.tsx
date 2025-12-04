'use client';

import { useState, useMemo } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { useHerramientas, useHerramientasAsignadas } from '@/lib/hooks';
import { 
  BookOpen,
  X,
  Check,
  Search,
  Loader2
} from 'lucide-react';

interface AsignarHerramientasProps {
  pacienteId: string;
  onClose: () => void;
}

export default function AsignarHerramientas({ pacienteId, onClose }: AsignarHerramientasProps) {
  const { herramientas, loading: loadingHerramientas } = useHerramientas();
  const { asignadas, loading: loadingAsignadas, asignarHerramienta, desasignarHerramienta } = useHerramientasAsignadas(pacienteId);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAssigning, setIsAssigning] = useState<string | null>(null);

  const herramientasAsignadasIds = useMemo(() => 
    new Set(asignadas?.map(a => a.herramienta_id) || []),
    [asignadas]
  );

  const filteredHerramientas = useMemo(() => {
    if (!herramientas) return [];
    return herramientas.filter(h =>
      h.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [herramientas, searchTerm]);

  const handleToggleAsignacion = async (herramientaId: string) => {
    setIsAssigning(herramientaId);
    
    if (herramientasAsignadasIds.has(herramientaId)) {
      await desasignarHerramienta(herramientaId);
    } else {
      await asignarHerramienta(herramientaId);
    }
    
    setIsAssigning(null);
  };

  if (loadingHerramientas || loadingAsignadas) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b border-border">
          <h2 className="text-2xl font-semibold text-foreground">Asignar Herramientas</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted-light transition-colors"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Buscar herramientas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
            />
          </div>
        </div>

        {/* Lista de herramientas */}
        <div className="space-y-3">
          {filteredHerramientas.length === 0 ? (
            <p className="text-center text-muted py-8">No hay herramientas disponibles</p>
          ) : (
            filteredHerramientas.map((herramienta) => {
              const estaAsignada = herramientasAsignadasIds.has(herramienta.id);
              const tipoIconos: Record<string, string> = {
                pdf: '📄',
                video: '🎥',
                infografia: '📊',
                articulo: '📰',
              };

              return (
                <div
                  key={herramienta.id}
                  className={`p-4 rounded-xl border transition-all ${
                    estaAsignada 
                      ? 'bg-primary-light/20 border-primary' 
                      : 'bg-white border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-light/50 flex items-center justify-center text-2xl flex-shrink-0">
                      {tipoIconos[herramienta.tipo] || '📄'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">
                            {herramienta.titulo}
                          </h3>
                          <p className="text-sm text-muted mb-2 line-clamp-2">
                            {herramienta.descripcion}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="primary" size="sm">
                              {herramienta.tipo.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted bg-muted-light px-2 py-1 rounded">
                              {herramienta.categoria}
                            </span>
                            {estaAsignada && (
                              <Badge variant="success" size="sm" className="gap-1">
                                <Check className="w-3 h-3" />
                                Asignada
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleToggleAsignacion(herramienta.id)}
                          disabled={isAssigning === herramienta.id}
                          variant={estaAsignada ? 'outline' : 'primary'}
                          size="sm"
                          className="flex-shrink-0"
                        >
                          {isAssigning === herramienta.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : estaAsignada ? (
                            'Desasignar'
                          ) : (
                            'Asignar'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Resumen */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted text-center">
            {herramientasAsignadasIds.size || 0} herramienta{herramientasAsignadasIds.size !== 1 ? 's' : ''} asignada{herramientasAsignadasIds.size !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Botón cerrar */}
        <div className="flex justify-end mt-6 sticky bottom-0 bg-white pt-4 border-t border-border">
          <Button onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </Card>
    </div>
  );
}

