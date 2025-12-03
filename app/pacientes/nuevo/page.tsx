'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { usePacientes } from '@/lib/hooks';
import { GrupoAlimentario, DolenciaTipo } from '@/types';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Utensils,
  Heart,
  Briefcase,
  Save,
  ArrowLeft,
  Check
} from 'lucide-react';
import Link from 'next/link';

const gruposAlimentarios: { value: GrupoAlimentario; label: string }[] = [
  { value: 'harinas', label: 'Harinas' },
  { value: 'frutas', label: 'Frutas' },
  { value: 'carneBlanca', label: 'Carne Blanca' },
  { value: 'carneRoja', label: 'Carne Roja' },
  { value: 'pescadoBlanco', label: 'Pescado Blanco' },
  { value: 'pescadoAzul', label: 'Pescado Azul' },
  { value: 'frutosSecos', label: 'Frutos Secos' },
  { value: 'marisco', label: 'Marisco' },
  { value: 'feculas', label: 'Féculas' },
  { value: 'legumbres', label: 'Legumbres' },
  { value: 'quesos', label: 'Quesos' },
  { value: 'cafes', label: 'Cafés' },
  { value: 'tes', label: 'Tés' },
  { value: 'dulce', label: 'Dulce' },
  { value: 'lacteos', label: 'Lácteos' },
  { value: 'semillas', label: 'Semillas' },
];

const dolencias: { value: DolenciaTipo; label: string }[] = [
  { value: 'estrenimiento', label: 'Estreñimiento' },
  { value: 'ulceras', label: 'Úlceras' },
  { value: 'jaquecas', label: 'Jaquecas/Migrañas' },
  { value: 'tensionArterial', label: 'Tensión arterial' },
  { value: 'anemia', label: 'Anemia' },
  { value: 'hemorroides', label: 'Hemorroides' },
  { value: 'osteoporosis', label: 'Osteoporosis' },
  { value: 'fumador', label: 'Fumador' },
  { value: 'colesterolAlto', label: 'Colesterol alto' },
  { value: 'artrosis', label: 'Artrosis/Artritis' },
  { value: 'colonIrritable', label: 'Colon irritable' },
  { value: 'crohn', label: 'Enfermedad de Crohn' },
  { value: 'gastritis', label: 'Gastritis' },
  { value: 'retencionLiquidos', label: 'Retención de líquidos' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'depresion', label: 'Depresión' },
];

const ingestaTipos = ['desayuno', 'almuerzo', 'comida', 'merienda', 'cena'] as const;

export default function NuevoPacientePage() {
  const router = useRouter();
  const { createPaciente } = usePacientes();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    // Datos personales
    nombre: '',
    dni: '',
    telefono: '',
    fechaNacimiento: '',
    email: '',
    direccion: '',
    codigoPostal: '',
    localidad: '',
    
    // Grupos alimentarios
    gruposSeleccionados: [] as GrupoAlimentario[],
    
    // Ingestas
    ingestas: ingestaTipos.map(tipo => ({
      tipo,
      realiza: false,
      horario: '',
      descripcion: ''
    })),
    
    // Hábitos
    recomendadoPor: '',
    aguaDiaria: '',
    otrosLiquidos: '',
    habitosAlimenticios: '',
    cansancioDia: '',
    problemasDigestion: '',
    pesoIdeal: '',
    practicaDeporte: false,
    deporteCual: '',
    deporteFrecuencia: '',
    calidadSueno: '',
    dietaAnterior: '',
    estadoSalud: '',
    
    // Dolencias
    dolenciasSeleccionadas: [] as DolenciaTipo[],
    
    // Medicamentos
    medicamentos: [{ farmaco: '', dosis: '', motivo: '', tiempo: '' }],
    
    // Trabajo
    trabajaActualmente: false,
    tipoTrabajo: '',
    horarioTrabajo: '',
    nivelEstres: 5,
    motivoEstres: '',
    estresAfectaSalud: '',
  });

  const steps = [
    { title: 'Datos Personales', icon: User },
    { title: 'Alimentación', icon: Utensils },
    { title: 'Salud', icon: Heart },
    { title: 'Trabajo y Estrés', icon: Briefcase },
  ];

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleGrupo = (grupo: GrupoAlimentario) => {
    setFormData(prev => ({
      ...prev,
      gruposSeleccionados: prev.gruposSeleccionados.includes(grupo)
        ? prev.gruposSeleccionados.filter(g => g !== grupo)
        : [...prev.gruposSeleccionados, grupo]
    }));
  };

  const toggleDolencia = (dolencia: DolenciaTipo) => {
    setFormData(prev => ({
      ...prev,
      dolenciasSeleccionadas: prev.dolenciasSeleccionadas.includes(dolencia)
        ? prev.dolenciasSeleccionadas.filter(d => d !== dolencia)
        : [...prev.dolenciasSeleccionadas, dolencia]
    }));
  };

  const updateIngesta = (index: number, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      ingestas: prev.ingestas.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Mapear datos del formulario a la estructura de Supabase
      const pacienteData = {
        nombre: formData.nombre,
        dni: formData.dni,
        telefono: formData.telefono,
        fecha_nacimiento: formData.fechaNacimiento,
        email: formData.email,
        direccion: formData.direccion,
        codigo_postal: formData.codigoPostal,
        localidad: formData.localidad,
        grupos_alimentarios: formData.gruposSeleccionados,
        ingestas: formData.ingestas,
        recomendado_por: formData.recomendadoPor || null,
        agua_diaria: formData.aguaDiaria || null,
        otros_liquidos: formData.otrosLiquidos || null,
        habitos_alimenticios: formData.habitosAlimenticios || null,
        cansancio_dia: formData.cansancioDia || null,
        problemas_digestion: formData.problemasDigestion || null,
        peso_ideal: formData.pesoIdeal || null,
        deporte: {
          practica: formData.practicaDeporte,
          cual: formData.deporteCual,
          frecuencia: formData.deporteFrecuencia,
        },
        calidad_sueno: formData.calidadSueno || null,
        dieta_anterior: formData.dietaAnterior || null,
        estado_salud: formData.estadoSalud || null,
        dolencias: formData.dolenciasSeleccionadas.map(d => ({ tipo: d, activa: true })),
        medicamentos: formData.medicamentos.map((m, idx) => ({
          id: idx.toString(),
          farmaco: m.farmaco,
          dosis: m.dosis,
          motivo: m.motivo,
          tiempo: m.tiempo,
        })),
        trabajo: {
          activo: formData.trabajaActualmente,
          tipo: formData.tipoTrabajo,
          horario: formData.horarioTrabajo,
        },
        estres: {
          nivel: formData.nivelEstres,
          motivo: formData.motivoEstres,
          afectaSalud: formData.estresAfectaSalud,
        },
        activo: true,
      };

      const nuevoPaciente = await createPaciente(pacienteData);
      
      if (nuevoPaciente) {
        router.push('/pacientes');
      } else {
        setError('Error al guardar el paciente. Intenta de nuevo.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('Error inesperado al guardar');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Back button */}
      <Link 
        href="/pacientes" 
        className="inline-flex items-center gap-2 text-muted hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a pacientes
      </Link>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.title} className="flex items-center">
              <button
                onClick={() => setCurrentStep(index)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                  index === currentStep 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : index < currentStep
                    ? 'bg-primary-light text-primary-dark'
                    : 'bg-muted-light text-muted'
                }`}
              >
                <step.icon className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">{step.title}</span>
              </button>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${index < currentStep ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Card className="mb-6 p-4 bg-danger-light border border-danger">
          <p className="text-danger">{error}</p>
        </Card>
      )}

      {/* Form Steps */}
      <Card className="mb-6">
        {/* Step 1: Datos Personales */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Datos Personales
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Nombre completo" 
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                placeholder="Nombre y apellidos"
              />
              <Input 
                label="DNI" 
                value={formData.dni}
                onChange={(e) => handleInputChange('dni', e.target.value)}
                placeholder="12345678A"
              />
              <Input 
                label="Teléfono/Móvil" 
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                placeholder="612345678"
              />
              <Input 
                label="Fecha de nacimiento" 
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
              />
              <Input 
                label="Email" 
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@ejemplo.com"
                className="md:col-span-2"
              />
              <Input 
                label="Dirección" 
                value={formData.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                placeholder="Calle, número, piso..."
                className="md:col-span-2"
              />
              <Input 
                label="Código Postal" 
                value={formData.codigoPostal}
                onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                placeholder="28001"
              />
              <Input 
                label="Localidad" 
                value={formData.localidad}
                onChange={(e) => handleInputChange('localidad', e.target.value)}
                placeholder="Madrid"
              />
            </div>
          </div>
        )}

        {/* Step 2: Alimentación */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
                <Utensils className="w-5 h-5 text-primary" />
                Grupos Alimentarios Preferidos
              </h2>
              <div className="flex flex-wrap gap-2">
                {gruposAlimentarios.map(grupo => (
                  <button
                    key={grupo.value}
                    type="button"
                    onClick={() => toggleGrupo(grupo.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.gruposSeleccionados.includes(grupo.value)
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-muted-light text-muted hover:bg-muted-light/80'
                    }`}
                  >
                    {formData.gruposSeleccionados.includes(grupo.value) && (
                      <Check className="w-4 h-4 inline mr-1" />
                    )}
                    {grupo.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Ingestas Diarias</h3>
              <div className="space-y-4">
                {formData.ingestas.map((ingesta, index) => (
                  <div key={ingesta.tipo} className="p-4 rounded-xl bg-muted-light/50 space-y-3">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ingesta.realiza}
                          onChange={(e) => updateIngesta(index, 'realiza', e.target.checked)}
                          className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="font-medium capitalize">{ingesta.tipo}</span>
                      </label>
                    </div>
                    {ingesta.realiza && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-7">
                        <Input
                          label="Horario"
                          type="time"
                          value={ingesta.horario}
                          onChange={(e) => updateIngesta(index, 'horario', e.target.value)}
                        />
                        <Input
                          label="¿El qué?"
                          value={ingesta.descripcion}
                          onChange={(e) => updateIngesta(index, 'descripcion', e.target.value)}
                          placeholder="Descripción de lo que comes"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="¿Quién te ha recomendado?" 
                value={formData.recomendadoPor}
                onChange={(e) => handleInputChange('recomendadoPor', e.target.value)}
              />
              <Input 
                label="Cantidad de agua diaria" 
                value={formData.aguaDiaria}
                onChange={(e) => handleInputChange('aguaDiaria', e.target.value)}
                placeholder="Ej: 1.5 litros"
              />
              <Input 
                label="Otros líquidos" 
                value={formData.otrosLiquidos}
                onChange={(e) => handleInputChange('otrosLiquidos', e.target.value)}
                placeholder="Café, infusiones, refrescos..."
              />
              <Input 
                label="¿Cómo calificaría sus hábitos alimenticios?" 
                value={formData.habitosAlimenticios}
                onChange={(e) => handleInputChange('habitosAlimenticios', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Salud */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Estado de Salud
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                label="¿Cansado durante el día? ¿En qué momento?"
                value={formData.cansancioDia}
                onChange={(e) => handleInputChange('cansancioDia', e.target.value)}
                rows={2}
              />
              <Textarea
                label="¿Problemas en la digestión? ¿En qué momento?"
                value={formData.problemasDigestion}
                onChange={(e) => handleInputChange('problemasDigestion', e.target.value)}
                rows={2}
              />
              <Input
                label="¿Peso ideal?"
                value={formData.pesoIdeal}
                onChange={(e) => handleInputChange('pesoIdeal', e.target.value)}
                placeholder="Ej: 65 kg"
              />
              <Input
                label="¿Qué tal duermes por las noches?"
                value={formData.calidadSueno}
                onChange={(e) => handleInputChange('calidadSueno', e.target.value)}
              />
            </div>

            <div className="p-4 rounded-xl bg-muted-light/50 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.practicaDeporte}
                  onChange={(e) => handleInputChange('practicaDeporte', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="font-medium">¿Practica algún deporte?</span>
              </label>
              {formData.practicaDeporte && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-7">
                  <Input
                    label="¿Cuál?"
                    value={formData.deporteCual}
                    onChange={(e) => handleInputChange('deporteCual', e.target.value)}
                  />
                  <Input
                    label="¿Cuántas veces?"
                    value={formData.deporteFrecuencia}
                    onChange={(e) => handleInputChange('deporteFrecuencia', e.target.value)}
                    placeholder="Ej: 3 veces/semana"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Textarea
                label="¿Alguna dieta anterior o actualmente?"
                value={formData.dietaAnterior}
                onChange={(e) => handleInputChange('dietaAnterior', e.target.value)}
                rows={2}
              />
              <Textarea
                label="¿Cómo cree que es su estado de salud actualmente?"
                value={formData.estadoSalud}
                onChange={(e) => handleInputChange('estadoSalud', e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">
                ¿Padece o ha padecido alguna de las siguientes dolencias?
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {dolencias.map(dolencia => (
                  <button
                    key={dolencia.value}
                    type="button"
                    onClick={() => toggleDolencia(dolencia.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                      formData.dolenciasSeleccionadas.includes(dolencia.value)
                        ? 'bg-danger text-white'
                        : 'bg-muted-light text-muted hover:bg-muted-light/80'
                    }`}
                  >
                    {formData.dolenciasSeleccionadas.includes(dolencia.value) && (
                      <Check className="w-4 h-4 inline mr-1" />
                    )}
                    {dolencia.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">
                ¿Toma algún medicamento o tratamiento médico?
              </h3>
              {formData.medicamentos.map((med, index) => (
                <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <Input
                    placeholder="Fármaco"
                    value={med.farmaco}
                    onChange={(e) => {
                      const newMeds = [...formData.medicamentos];
                      newMeds[index].farmaco = e.target.value;
                      handleInputChange('medicamentos', newMeds);
                    }}
                  />
                  <Input
                    placeholder="Dosis"
                    value={med.dosis}
                    onChange={(e) => {
                      const newMeds = [...formData.medicamentos];
                      newMeds[index].dosis = e.target.value;
                      handleInputChange('medicamentos', newMeds);
                    }}
                  />
                  <Input
                    placeholder="Motivo"
                    value={med.motivo}
                    onChange={(e) => {
                      const newMeds = [...formData.medicamentos];
                      newMeds[index].motivo = e.target.value;
                      handleInputChange('medicamentos', newMeds);
                    }}
                  />
                  <Input
                    placeholder="Tiempo"
                    value={med.tiempo}
                    onChange={(e) => {
                      const newMeds = [...formData.medicamentos];
                      newMeds[index].tiempo = e.target.value;
                      handleInputChange('medicamentos', newMeds);
                    }}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleInputChange('medicamentos', [
                  ...formData.medicamentos,
                  { farmaco: '', dosis: '', motivo: '', tiempo: '' }
                ])}
              >
                + Añadir medicamento
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Trabajo y Estrés */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Trabajo y Estrés
            </h2>

            <div className="p-4 rounded-xl bg-muted-light/50 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.trabajaActualmente}
                  onChange={(e) => handleInputChange('trabajaActualmente', e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="font-medium">¿Trabaja actualmente?</span>
              </label>
              {formData.trabajaActualmente && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-7">
                  <Input
                    label="Tipo de trabajo"
                    value={formData.tipoTrabajo}
                    onChange={(e) => handleInputChange('tipoTrabajo', e.target.value)}
                  />
                  <Input
                    label="Horario"
                    value={formData.horarioTrabajo}
                    onChange={(e) => handleInputChange('horarioTrabajo', e.target.value)}
                    placeholder="Ej: 9:00-18:00"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Nivel de estrés: <span className="text-primary font-bold">{formData.nivelEstres}</span>
              </label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted">0</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.nivelEstres}
                  onChange={(e) => handleInputChange('nivelEstres', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-muted-light rounded-full appearance-none cursor-pointer accent-primary"
                />
                <span className="text-sm text-muted">10</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted">Sin estrés</span>
                <span className="text-xs text-muted">Muy estresado</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Textarea
                label="¿Motivo del estrés?"
                value={formData.motivoEstres}
                onChange={(e) => handleInputChange('motivoEstres', e.target.value)}
                rows={2}
              />
              <Textarea
                label="¿Cree que afecta a su salud?"
                value={formData.estresAfectaSalud}
                onChange={(e) => handleInputChange('estresAfectaSalud', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
        >
          Anterior
        </Button>
        
        {currentStep < steps.length - 1 ? (
          <Button onClick={() => setCurrentStep(prev => prev + 1)}>
            Siguiente
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            isLoading={isSubmitting}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Guardar Paciente
          </Button>
        )}
      </div>
    </div>
  );
}

