'use client';

import { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { useMedidas } from '@/lib/hooks';
import { calcularIMC } from '@/lib/utils';
import { 
  Scale,
  Ruler,
  Droplets,
  Flame,
  X,
  Save,
  Loader2
} from 'lucide-react';

interface FormMedidaProps {
  pacienteId: string;
  onClose: () => void;
}

export default function FormMedida({ pacienteId, onClose }: FormMedidaProps) {
  const { createMedida } = useMedidas(pacienteId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seccion, setSeccion] = useState<'bioimpedancia' | 'segmental' | 'plicometria' | 'antropometria'>('bioimpedancia');

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
    bioimpedancia: {
      altura: 0,
      peso: 0,
      grasaSubcutanea: 0,
      huesos: 0,
      agua: 0,
      musculo: 0,
      metabolismoBasal: 0,
      edadMetabolica: 0,
      grasaVisceral: 0,
      azucarSangre: 0,
      tension: '',
      flexibilidad: 0,
      phSaliva: 7.0,
      imc: 0,
    },
    segmental: {
      brazoIzq: { kg: 0, porcentaje: 0 },
      brazoDer: { kg: 0, porcentaje: 0 },
      tronco: { kg: 0, porcentaje: 0 },
      piernaIzq: { kg: 0, porcentaje: 0 },
      piernaDer: { kg: 0, porcentaje: 0 },
    },
    plicometria: {
      bicipital: 0,
      tricipital: 0,
      subEscapular: 0,
      abdominal: 0,
      suprailiaco: 0,
      muslo: 0,
      gemelo: 0,
    },
    antropometria: {
      hombro: 0,
      biceps: 0,
      bicepsContraido: 0,
      pecho: 0,
      cintura: 0,
      ombligo: 0,
      cadera: 0,
      muneca: 0,
      gluteos: 0,
      cuadriceps: 0,
      gemelo: 0,
      tobillo: 0,
    },
    notas: '',
  });

  const handleInputChange = (seccion: string, campo: string, valor: unknown) => {
    if (seccion === 'bioimpedancia' || seccion === 'segmental' || seccion === 'plicometria' || seccion === 'antropometria') {
      setFormData(prev => ({
        ...prev,
        [seccion]: {
          ...prev[seccion],
          [campo]: valor
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [campo]: valor }));
    }
  };

  // Calcular IMC automáticamente cuando cambia peso o altura
  const handlePesoChange = (peso: number) => {
    setFormData(prev => {
      const altura = (prev.bioimpedancia as any).altura || 0;
      const imc = altura > 0 ? calcularIMC(peso, altura) : 0;
      return {
        ...prev,
        bioimpedancia: {
          ...prev.bioimpedancia,
          peso,
          imc
        }
      };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const medida = await createMedida({
        paciente_id: pacienteId,
        fecha: formData.fecha,
        hora: formData.hora,
        bioimpedancia: formData.bioimpedancia,
        segmental: formData.segmental,
        plicometria: formData.plicometria,
        antropometria: formData.antropometria,
        notas: formData.notas || null,
      });

      if (medida) {
        onClose();
      } else {
        setError('Error al guardar la medida');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('Error inesperado');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b border-border">
          <h2 className="text-2xl font-semibold text-foreground">Nueva Medida</h2>
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

        {/* Selector de sección */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: 'bioimpedancia', label: 'Bioimpedancia+', icon: Scale },
            { id: 'segmental', label: 'Segmental', icon: Droplets },
            { id: 'plicometria', label: 'Plicometría', icon: Ruler },
            { id: 'antropometria', label: 'Antropometría', icon: Ruler },
          ].map(sec => (
            <button
              key={sec.id}
              onClick={() => setSeccion(sec.id as typeof seccion)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                seccion === sec.id
                  ? 'bg-accent text-white'
                  : 'bg-white text-muted hover:text-foreground border border-border'
              }`}
            >
              <sec.icon className="w-4 h-4" />
              {sec.label}
            </button>
          ))}
        </div>

        {/* Fecha y hora */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Input
            label="Fecha"
            type="date"
            value={formData.fecha}
            onChange={(e) => handleInputChange('', 'fecha', e.target.value)}
          />
          <Input
            label="Hora"
            type="time"
            value={formData.hora}
            onChange={(e) => handleInputChange('', 'hora', e.target.value)}
          />
        </div>

        {/* Bioimpedancia+ */}
        {seccion === 'bioimpedancia' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              label="Peso (kg)"
              type="number"
              step="0.1"
              value={formData.bioimpedancia.peso}
              onChange={(e) => handlePesoChange(parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Altura (cm)"
              type="number"
              value={(formData.bioimpedancia as any).altura || 0}
              onChange={(e) => {
                const altura = parseFloat(e.target.value) || 0;
                const peso = formData.bioimpedancia.peso;
                const imc = altura > 0 ? calcularIMC(peso, altura) : 0;
                setFormData(prev => ({
                  ...prev,
                  bioimpedancia: {
                    ...prev.bioimpedancia,
                    altura,
                    imc
                  } as any
                }));
              }}
            />
            <Input
              label="IMC"
              type="number"
              step="0.1"
              value={formData.bioimpedancia.imc}
              readOnly
              className="bg-muted-light"
            />
            <Input
              label="Grasa Subcutánea (%)"
              type="number"
              step="0.1"
              value={formData.bioimpedancia.grasaSubcutanea}
              onChange={(e) => handleInputChange('bioimpedancia', 'grasaSubcutanea', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Huesos (kg)"
              type="number"
              step="0.1"
              value={formData.bioimpedancia.huesos}
              onChange={(e) => handleInputChange('bioimpedancia', 'huesos', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Agua (%)"
              type="number"
              step="0.1"
              value={formData.bioimpedancia.agua}
              onChange={(e) => handleInputChange('bioimpedancia', 'agua', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Músculo (kg)"
              type="number"
              step="0.1"
              value={formData.bioimpedancia.musculo}
              onChange={(e) => handleInputChange('bioimpedancia', 'musculo', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Metabolismo Basal (kcal)"
              type="number"
              value={formData.bioimpedancia.metabolismoBasal}
              onChange={(e) => handleInputChange('bioimpedancia', 'metabolismoBasal', parseInt(e.target.value) || 0)}
            />
            <Input
              label="Edad Metabólica"
              type="number"
              value={formData.bioimpedancia.edadMetabolica}
              onChange={(e) => handleInputChange('bioimpedancia', 'edadMetabolica', parseInt(e.target.value) || 0)}
            />
            <Input
              label="Grasa Visceral"
              type="number"
              value={formData.bioimpedancia.grasaVisceral}
              onChange={(e) => handleInputChange('bioimpedancia', 'grasaVisceral', parseInt(e.target.value) || 0)}
            />
            <Input
              label="Azúcar Sangre (mg/dl)"
              type="number"
              value={formData.bioimpedancia.azucarSangre}
              onChange={(e) => handleInputChange('bioimpedancia', 'azucarSangre', parseInt(e.target.value) || 0)}
            />
            <Input
              label="Tensión (ej: 120/80)"
              value={formData.bioimpedancia.tension}
              onChange={(e) => handleInputChange('bioimpedancia', 'tension', e.target.value)}
              placeholder="120/80"
            />
            <Input
              label="Flexibilidad"
              type="number"
              value={formData.bioimpedancia.flexibilidad}
              onChange={(e) => handleInputChange('bioimpedancia', 'flexibilidad', parseInt(e.target.value) || 0)}
            />
            <Input
              label="pH Saliva"
              type="number"
              step="0.1"
              value={formData.bioimpedancia.phSaliva}
              onChange={(e) => handleInputChange('bioimpedancia', 'phSaliva', parseFloat(e.target.value) || 0)}
            />
          </div>
        )}

        {/* Segmental */}
        {seccion === 'segmental' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="col-span-2 md:col-span-3 font-semibold text-foreground mb-2">Brazo Izquierdo</div>
            <Input
              label="kg"
              type="number"
              step="0.1"
              value={formData.segmental.brazoIzq.kg}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                segmental: {
                  ...prev.segmental,
                  brazoIzq: { ...prev.segmental.brazoIzq, kg: parseFloat(e.target.value) || 0 }
                }
              }))}
            />
            <Input
              label="%"
              type="number"
              step="0.1"
              value={formData.segmental.brazoIzq.porcentaje}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                segmental: {
                  ...prev.segmental,
                  brazoIzq: { ...prev.segmental.brazoIzq, porcentaje: parseFloat(e.target.value) || 0 }
                }
              }))}
            />
            
            <div className="col-span-2 md:col-span-3 font-semibold text-foreground mb-2 mt-4">Brazo Derecho</div>
            <Input
              label="kg"
              type="number"
              step="0.1"
              value={formData.segmental.brazoDer.kg}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                segmental: {
                  ...prev.segmental,
                  brazoDer: { ...prev.segmental.brazoDer, kg: parseFloat(e.target.value) || 0 }
                }
              }))}
            />
            <Input
              label="%"
              type="number"
              step="0.1"
              value={formData.segmental.brazoDer.porcentaje}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                segmental: {
                  ...prev.segmental,
                  brazoDer: { ...prev.segmental.brazoDer, porcentaje: parseFloat(e.target.value) || 0 }
                }
              }))}
            />

            <div className="col-span-2 md:col-span-3 font-semibold text-foreground mb-2 mt-4">Tronco</div>
            <Input
              label="kg"
              type="number"
              step="0.1"
              value={formData.segmental.tronco.kg}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                segmental: {
                  ...prev.segmental,
                  tronco: { ...prev.segmental.tronco, kg: parseFloat(e.target.value) || 0 }
                }
              }))}
            />
            <Input
              label="%"
              type="number"
              step="0.1"
              value={formData.segmental.tronco.porcentaje}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                segmental: {
                  ...prev.segmental,
                  tronco: { ...prev.segmental.tronco, porcentaje: parseFloat(e.target.value) || 0 }
                }
              }))}
            />

            <div className="col-span-2 md:col-span-3 font-semibold text-foreground mb-2 mt-4">Pierna Izquierda</div>
            <Input
              label="kg"
              type="number"
              step="0.1"
              value={formData.segmental.piernaIzq.kg}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                segmental: {
                  ...prev.segmental,
                  piernaIzq: { ...prev.segmental.piernaIzq, kg: parseFloat(e.target.value) || 0 }
                }
              }))}
            />
            <Input
              label="%"
              type="number"
              step="0.1"
              value={formData.segmental.piernaIzq.porcentaje}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                segmental: {
                  ...prev.segmental,
                  piernaIzq: { ...prev.segmental.piernaIzq, porcentaje: parseFloat(e.target.value) || 0 }
                }
              }))}
            />

            <div className="col-span-2 md:col-span-3 font-semibold text-foreground mb-2 mt-4">Pierna Derecha</div>
            <Input
              label="kg"
              type="number"
              step="0.1"
              value={formData.segmental.piernaDer.kg}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                segmental: {
                  ...prev.segmental,
                  piernaDer: { ...prev.segmental.piernaDer, kg: parseFloat(e.target.value) || 0 }
                }
              }))}
            />
            <Input
              label="%"
              type="number"
              step="0.1"
              value={formData.segmental.piernaDer.porcentaje}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                segmental: {
                  ...prev.segmental,
                  piernaDer: { ...prev.segmental.piernaDer, porcentaje: parseFloat(e.target.value) || 0 }
                }
              }))}
            />
          </div>
        )}

        {/* Plicometría */}
        {seccion === 'plicometria' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              label="Bicipital (mm)"
              type="number"
              step="0.1"
              value={formData.plicometria.bicipital}
              onChange={(e) => handleInputChange('plicometria', 'bicipital', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Tricipital (mm)"
              type="number"
              step="0.1"
              value={formData.plicometria.tricipital}
              onChange={(e) => handleInputChange('plicometria', 'tricipital', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Sub Escapular (mm)"
              type="number"
              step="0.1"
              value={formData.plicometria.subEscapular}
              onChange={(e) => handleInputChange('plicometria', 'subEscapular', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Abdominal (mm)"
              type="number"
              step="0.1"
              value={formData.plicometria.abdominal}
              onChange={(e) => handleInputChange('plicometria', 'abdominal', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Suprailiaco (mm)"
              type="number"
              step="0.1"
              value={formData.plicometria.suprailiaco}
              onChange={(e) => handleInputChange('plicometria', 'suprailiaco', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Muslo (mm)"
              type="number"
              step="0.1"
              value={formData.plicometria.muslo}
              onChange={(e) => handleInputChange('plicometria', 'muslo', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Gemelo (mm)"
              type="number"
              step="0.1"
              value={formData.plicometria.gemelo}
              onChange={(e) => handleInputChange('plicometria', 'gemelo', parseFloat(e.target.value) || 0)}
            />
          </div>
        )}

        {/* Antropometría */}
        {seccion === 'antropometria' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              label="Hombro (cm)"
              type="number"
              step="0.1"
              value={formData.antropometria.hombro}
              onChange={(e) => handleInputChange('antropometria', 'hombro', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Bíceps (cm)"
              type="number"
              step="0.1"
              value={formData.antropometria.biceps}
              onChange={(e) => handleInputChange('antropometria', 'biceps', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Bíceps Contraído (cm)"
              type="number"
              step="0.1"
              value={formData.antropometria.bicepsContraido}
              onChange={(e) => handleInputChange('antropometria', 'bicepsContraido', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Pecho (cm)"
              type="number"
              step="0.1"
              value={formData.antropometria.pecho}
              onChange={(e) => handleInputChange('antropometria', 'pecho', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Cintura (cm)"
              type="number"
              step="0.1"
              value={formData.antropometria.cintura}
              onChange={(e) => handleInputChange('antropometria', 'cintura', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Ombligo (cm)"
              type="number"
              step="0.1"
              value={formData.antropometria.ombligo}
              onChange={(e) => handleInputChange('antropometria', 'ombligo', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Cadera (cm)"
              type="number"
              step="0.1"
              value={formData.antropometria.cadera}
              onChange={(e) => handleInputChange('antropometria', 'cadera', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Muñeca (cm)"
              type="number"
              step="0.1"
              value={formData.antropometria.muneca}
              onChange={(e) => handleInputChange('antropometria', 'muneca', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Glúteos (cm)"
              type="number"
              step="0.1"
              value={formData.antropometria.gluteos}
              onChange={(e) => handleInputChange('antropometria', 'gluteos', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Cuádriceps (cm)"
              type="number"
              step="0.1"
              value={formData.antropometria.cuadriceps}
              onChange={(e) => handleInputChange('antropometria', 'cuadriceps', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Gemelo (cm)"
              type="number"
              step="0.1"
              value={formData.antropometria.gemelo}
              onChange={(e) => handleInputChange('antropometria', 'gemelo', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Tobillo (cm)"
              type="number"
              step="0.1"
              value={formData.antropometria.tobillo}
              onChange={(e) => handleInputChange('antropometria', 'tobillo', parseFloat(e.target.value) || 0)}
            />
          </div>
        )}

        {/* Notas */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Notas adicionales
          </label>
          <textarea
            value={formData.notas}
            onChange={(e) => handleInputChange('', 'notas', e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
            placeholder="Observaciones, comentarios..."
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-6 sticky bottom-0 bg-white pt-4 border-t border-border">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting} className="gap-2">
            <Save className="w-4 h-4" />
            Guardar Medida
          </Button>
        </div>
      </Card>
    </div>
  );
}

