'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '@/components/ui';
import { usePaciente, useMedidas, useBiomarcadores, useHerramientas, useHerramientasAsignadas, useDietas } from '@/lib/hooks';
import { BIOMARCADORES_INFO } from '@/types';
import { formatDate, calcularEdad } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { 
  ArrowLeft,
  Utensils,
  Activity,
  FileText,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  TrendingUp,
  TrendingDown,
  Plus,
  Check,
  ChevronRight,
  Scale,
  Ruler,
  Trash2,
  Eye,
  Flame,
  Camera,
  Upload
} from 'lucide-react';
import GeneradorDietas from '@/components/dietas/GeneradorDietas';
import FormMedida from '@/components/medidas/FormMedida';
import FormBiomarcador from '@/components/biomarcadores/FormBiomarcador';
import AsignarHerramientas from '@/components/herramientas/AsignarHerramientas';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const tabs = [
  { id: 'biomarcadores', label: 'Biomarcadores', icon: Heart },
  { id: 'dietas', label: 'Dietas', icon: Utensils },
  { id: 'medidas', label: 'Medidas', icon: Activity },
  { id: 'documentos', label: 'Documentos', icon: FileText },
  { id: 'herramientas', label: 'Herramientas', icon: BookOpen },
];

export default function PacienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState('biomarcadores');
  const [medidaSeccion, setMedidaSeccion] = useState<'bioimpedancia' | 'segmental' | 'plicometria' | 'antropometria'>('bioimpedancia');
  const [showFormMedida, setShowFormMedida] = useState(false);
  const [showFormBiomarcador, setShowFormBiomarcador] = useState(false);
  const [editingBiomarcadorId, setEditingBiomarcadorId] = useState<string | null>(null);
  const [showAsignarHerramientas, setShowAsignarHerramientas] = useState(false);
  
  const { paciente, loading: loadingPaciente, refresh: refreshPaciente, updatePaciente } = usePaciente(resolvedParams.id);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const { medidas, loading: loadingMedidas, refresh: refreshMedidas } = useMedidas(resolvedParams.id);
  const { biomarcadores, loading: loadingBiomarcadores, refresh: refreshBiomarcadores, toggleTarea } = useBiomarcadores(resolvedParams.id);
  const [updatingTareas, setUpdatingTareas] = useState<Set<string>>(new Set());
  const { herramientas } = useHerramientas();
  const { asignadas: herramientasAsignadas } = useHerramientasAsignadas(resolvedParams.id);
  const { dietas, loading: loadingDietas, deleteDieta, refresh: refreshDietas } = useDietas(resolvedParams.id);

  if (loadingPaciente) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Paciente no encontrado</p>
        <Link href="/pacientes" className="text-primary hover:underline mt-2 inline-block">
          Volver a pacientes
        </Link>
      </div>
    );
  }

  const ultimaMedida = medidas && medidas.length > 0 ? medidas[0] : null;
  const primeraMedida = medidas && medidas.length > 0 ? medidas[medidas.length - 1] : null;
  
  const cambiosPeso = ultimaMedida && primeraMedida && ultimaMedida.bioimpedancia && primeraMedida.bioimpedancia
    ? ((ultimaMedida.bioimpedancia as any).peso - (primeraMedida.bioimpedancia as any).peso).toFixed(1)
    : '0';

  // Datos para el gráfico de radar de biomarcadores
  const radarData = (biomarcadores || [])
    .filter(bio => {
      // Filtrar biomarcadores válidos con tipo reconocido
      const info = BIOMARCADORES_INFO[bio.tipo as keyof typeof BIOMARCADORES_INFO];
      return info && bio.porcentaje != null;
    })
    .map(bio => {
      const info = BIOMARCADORES_INFO[bio.tipo as keyof typeof BIOMARCADORES_INFO];
      // Asegurar que el porcentaje sea un número válido entre 0 y 100
      const porcentaje = typeof bio.porcentaje === 'number' 
        ? Math.max(0, Math.min(100, bio.porcentaje))
        : typeof bio.porcentaje === 'string'
        ? Math.max(0, Math.min(100, parseFloat(bio.porcentaje) || 0))
        : 0;
      
      return {
        nombre: info?.nombre.split(' ')[0] || bio.tipo,
        valor: porcentaje,
        fullMark: 100,
      };
    });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <Link 
        href="/pacientes" 
        className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a pacientes
      </Link>

      {/* Patient Header */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-primary-light/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex flex-col md:flex-row gap-6">
          {/* Avatar and basic info */}
          <div className="flex items-start gap-4">
            <div className="relative group">
              {paciente.foto_perfil ? (
                <img 
                  src={paciente.foto_perfil} 
                  alt={paciente.nombre}
                  className="w-20 h-20 rounded-2xl object-cover shadow-lg shadow-primary/30"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-primary/30">
                  {paciente.nombre.charAt(0)}
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    setUploadingPhoto(true);
                    try {
                      // Convertir a base64 para guardar directamente
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        const base64String = reader.result as string;
                        const success = await updatePaciente({ foto_perfil: base64String });
                        if (success) {
                          await refreshPaciente();
                        }
                        setUploadingPhoto(false);
                      };
                      reader.readAsDataURL(file);
                    } catch (err) {
                      console.error('Error subiendo foto:', err);
                      setUploadingPhoto(false);
                    }
                  }}
                  disabled={uploadingPhoto}
                />
                {uploadingPhoto ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </label>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{paciente.nombre}</h1>
              <p className="text-muted">{paciente.dni}</p>
              <Badge variant={paciente.activo ? 'success' : 'default'} className="mt-2">
                {paciente.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>

          {/* Contact info */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3 text-sm">
              <div className="w-10 h-10 rounded-xl bg-primary-light/50 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted text-xs mb-1">Email</p>
                <p className="text-foreground font-medium break-words break-all">{paciente.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-10 h-10 rounded-xl bg-secondary-light/50 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-secondary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted text-xs mb-1">Teléfono</p>
                <p className="text-foreground font-medium break-words">{paciente.telefono}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-10 h-10 rounded-xl bg-accent-light/50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted text-xs mb-1">Localidad</p>
                <p className="text-foreground font-medium">{paciente.localidad || 'Sin localidad'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-10 h-10 rounded-xl bg-primary-light/50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted text-xs mb-1">Edad</p>
                <p className="text-foreground font-medium">{calcularEdad(paciente.fecha_nacimiento)} años</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        {ultimaMedida && ultimaMedida.bioimpedancia && (
          <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{(ultimaMedida.bioimpedancia as any).peso} kg</p>
              <p className="text-sm text-muted">Peso actual</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{(ultimaMedida.bioimpedancia as any).imc}</p>
              <p className="text-sm text-muted">IMC</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                parseFloat(cambiosPeso) < 0 ? 'text-primary' : parseFloat(cambiosPeso) > 0 ? 'text-danger' : 'text-foreground'
              }`}>
                {parseFloat(cambiosPeso) < 0 ? <TrendingDown className="w-5 h-5" /> : parseFloat(cambiosPeso) > 0 ? <TrendingUp className="w-5 h-5" /> : null}
                {cambiosPeso} kg
              </p>
              <p className="text-sm text-muted">Cambio de peso</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{medidas.length}</p>
              <p className="text-sm text-muted">Mediciones</p>
            </div>
          </div>
        )}
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-white text-muted hover:text-foreground hover:bg-primary-light/20 border border-border'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {/* Dietas Tab */}
        {activeTab === 'dietas' && (
          <div className="space-y-6">
            {/* Lista de dietas guardadas */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Dietas Guardadas</h2>
                <Badge variant="secondary">{dietas.length} {dietas.length === 1 ? 'dieta' : 'dietas'}</Badge>
              </div>

              {loadingDietas ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : dietas.length === 0 ? (
                <Card>
                  <div className="text-center py-8">
                    <Utensils className="w-12 h-12 text-muted mx-auto mb-3" />
                    <p className="text-muted">No hay dietas guardadas aún</p>
                    <p className="text-sm text-muted mt-1">Genera y guarda tu primera dieta</p>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dietas.map((dieta) => {
                    const comidas = Array.isArray(dieta.comidas) ? dieta.comidas : [];
                    const totalComidas = comidas.length;
                    const fechaInicio = new Date(dieta.fecha_inicio);
                    const fechaFin = dieta.fecha_fin ? new Date(dieta.fecha_fin) : null;
                    const diasDuracion = fechaFin 
                      ? Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
                      : 1;

                    return (
                      <Card key={dieta.id} className="hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">{dieta.nombre}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(dieta.fecha_inicio)}</span>
                              {fechaFin && (
                                <>
                                  <span>—</span>
                                  <span>{formatDate(dieta.fecha_fin)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (confirm('¿Estás seguro de que quieres eliminar esta dieta?')) {
                                await deleteDieta(dieta.id);
                                refreshDietas();
                              }
                            }}
                            className="text-danger hover:text-danger hover:bg-danger-light"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Flame className="w-4 h-4 text-accent" />
                              <span className="text-foreground font-medium">{dieta.calorias} kcal/día</span>
                            </div>
                            <Badge variant="secondary">{diasDuracion} {diasDuracion === 1 ? 'día' : 'días'}</Badge>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted">
                            <Utensils className="w-3 h-3" />
                            <span>{totalComidas} {totalComidas === 1 ? 'comida' : 'comidas'}</span>
                          </div>

                          {dieta.notas && (
                            <p className="text-xs text-muted line-clamp-2">{dieta.notas}</p>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2"
                            onClick={() => {
                              // Aquí podrías abrir un modal o navegar a una vista detallada
                              alert('Vista detallada de dieta - Próximamente');
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            Ver detalles
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Generador de dietas */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Generar Nueva Dieta</h2>
              <GeneradorDietas 
                pacienteId={paciente.id} 
                pacienteNombre={paciente.nombre}
                onDietaGuardada={refreshDietas}
              />
            </div>
          </div>
        )}

        {/* Medidas Tab */}
        {activeTab === 'medidas' && (
          <div className="space-y-6">
            {/* Sección selector */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'bioimpedancia', label: 'Bioimpedancia+', icon: Scale },
                { id: 'segmental', label: 'Segmental', icon: Activity },
                { id: 'plicometria', label: 'Plicometría', icon: Ruler },
                { id: 'antropometria', label: 'Antropometría', icon: Ruler },
              ].map(sec => (
                <button
                  key={sec.id}
                  onClick={() => setMedidaSeccion(sec.id as typeof medidaSeccion)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    medidaSeccion === sec.id
                      ? 'bg-accent text-white'
                      : 'bg-white text-muted hover:text-foreground border border-border'
                  }`}
                >
                  <sec.icon className="w-4 h-4" />
                  {sec.label}
                </button>
              ))}
            </div>

            {/* Gráfico de evolución */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Evolución del Peso</h2>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setShowFormMedida(true)}
                >
                  <Plus className="w-4 h-4" />
                  Nueva Medida
                </Button>
              </div>
              {medidas && medidas.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={medidas.map(m => ({ ...m, fecha: m.fecha, peso: (m.bioimpedancia as any)?.peso || 0 }))}>
                      <defs>
                        <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#69956D" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#69956D" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#A1B4A3" />
                      <XAxis 
                        dataKey="fecha" 
                        tickFormatter={(value) => formatDate(value)}
                        stroke="#8F8BA5"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#8F8BA5"
                        fontSize={12}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #A1B4A3',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelFormatter={(value) => formatDate(value)}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="peso" 
                        stroke="#69956D" 
                        strokeWidth={3}
                        fill="url(#colorPeso)"
                        dot={{ fill: '#69956D', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#69956D' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-muted py-8">No hay medidas registradas</p>
              )}
            </Card>

            {/* Tabla de medidas según sección */}
            <Card padding="none">
              <div className="p-6 border-b border-border">
                <h3 className="font-semibold text-foreground">
                  {medidaSeccion === 'bioimpedancia' && 'Bioimpedancia+'}
                  {medidaSeccion === 'segmental' && 'Bioimpedancia Segmental'}
                  {medidaSeccion === 'plicometria' && 'Plicometría (pliegues mm)'}
                  {medidaSeccion === 'antropometria' && 'Antropometría (perímetros cm)'}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-background">
                      <th className="text-left px-4 py-3 font-semibold text-muted">Fecha</th>
                      {medidaSeccion === 'bioimpedancia' && (
                        <>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Peso</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Grasa Sub.</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Agua</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Músculo</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Mt. Basal</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Edad Met.</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">G. Visceral</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Azúcar</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Tensión</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">IMC</th>
                        </>
                      )}
                      {medidaSeccion === 'segmental' && (
                        <>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Brazo Izq</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Brazo Der</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Tronco</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Pierna Izq</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Pierna Der</th>
                        </>
                      )}
                      {medidaSeccion === 'plicometria' && (
                        <>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Bicipital</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Tricipital</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Sub Escapular</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Abdominal</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Suprailiaco</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Muslo</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Gemelo</th>
                        </>
                      )}
                      {medidaSeccion === 'antropometria' && (
                        <>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Hombro</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Bíceps</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Pecho</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Cintura</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Cadera</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Glúteos</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Cuádriceps</th>
                          <th className="text-center px-3 py-3 font-semibold text-muted">Gemelo</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {medidas && medidas.map((medida) => {
                      const bio = medida.bioimpedancia as any;
                      const seg = medida.segmental as any;
                      const plic = medida.plicometria as any;
                      const antro = medida.antropometria as any;
                      
                      return (
                        <tr key={medida.id} className="table-row-hover">
                          <td className="px-4 py-3 font-medium">{formatDate(medida.fecha)}</td>
                          {medidaSeccion === 'bioimpedancia' && (
                            <>
                              <td className="text-center px-3 py-3">{bio?.peso || 0} kg</td>
                              <td className="text-center px-3 py-3">{bio?.grasaSubcutanea || 0}%</td>
                              <td className="text-center px-3 py-3">{bio?.agua || 0}%</td>
                              <td className="text-center px-3 py-3">{bio?.musculo || 0} kg</td>
                              <td className="text-center px-3 py-3">{bio?.metabolismoBasal || 0}</td>
                              <td className="text-center px-3 py-3">{bio?.edadMetabolica || 0}</td>
                              <td className="text-center px-3 py-3">{bio?.grasaVisceral || 0}</td>
                              <td className="text-center px-3 py-3">{bio?.azucarSangre || 0}</td>
                              <td className="text-center px-3 py-3">{bio?.tension || '-'}</td>
                              <td className="text-center px-3 py-3 font-semibold">{bio?.imc || 0}</td>
                            </>
                          )}
                          {medidaSeccion === 'segmental' && (
                            <>
                              <td className="text-center px-3 py-3">{seg?.brazoIzq?.kg || 0}kg / {seg?.brazoIzq?.porcentaje || 0}%</td>
                              <td className="text-center px-3 py-3">{seg?.brazoDer?.kg || 0}kg / {seg?.brazoDer?.porcentaje || 0}%</td>
                              <td className="text-center px-3 py-3">{seg?.tronco?.kg || 0}kg / {seg?.tronco?.porcentaje || 0}%</td>
                              <td className="text-center px-3 py-3">{seg?.piernaIzq?.kg || 0}kg / {seg?.piernaIzq?.porcentaje || 0}%</td>
                              <td className="text-center px-3 py-3">{seg?.piernaDer?.kg || 0}kg / {seg?.piernaDer?.porcentaje || 0}%</td>
                            </>
                          )}
                          {medidaSeccion === 'plicometria' && (
                            <>
                              <td className="text-center px-3 py-3">{plic?.bicipital || 0}</td>
                              <td className="text-center px-3 py-3">{plic?.tricipital || 0}</td>
                              <td className="text-center px-3 py-3">{plic?.subEscapular || 0}</td>
                              <td className="text-center px-3 py-3">{plic?.abdominal || 0}</td>
                              <td className="text-center px-3 py-3">{plic?.suprailiaco || 0}</td>
                              <td className="text-center px-3 py-3">{plic?.muslo || 0}</td>
                              <td className="text-center px-3 py-3">{plic?.gemelo || 0}</td>
                            </>
                          )}
                          {medidaSeccion === 'antropometria' && (
                            <>
                              <td className="text-center px-3 py-3">{antro?.hombro || 0}</td>
                              <td className="text-center px-3 py-3">{antro?.biceps || 0}</td>
                              <td className="text-center px-3 py-3">{antro?.pecho || 0}</td>
                              <td className="text-center px-3 py-3">{antro?.cintura || 0}</td>
                              <td className="text-center px-3 py-3">{antro?.cadera || 0}</td>
                              <td className="text-center px-3 py-3">{antro?.gluteos || 0}</td>
                              <td className="text-center px-3 py-3">{antro?.cuadriceps || 0}</td>
                              <td className="text-center px-3 py-3">{antro?.gemelo || 0}</td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Biomarcadores Tab */}
        {activeTab === 'biomarcadores' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Los 10 Biomarcadores</h2>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => {
                  setEditingBiomarcadorId(null);
                  setShowFormBiomarcador(true);
                }}
              >
                <Plus className="w-4 h-4" />
                {biomarcadores && biomarcadores.length < 10 ? 'Añadir Biomarcador' : 'Editar Biomarcadores'}
              </Button>
            </div>

            {/* Radar Chart */}
            {biomarcadores.length > 0 && (
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Visión General</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#A1B4A3" />
                      <PolarAngleAxis 
                        dataKey="nombre" 
                        tick={{ fill: '#656176', fontSize: 11 }}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]}
                        tick={{ fill: '#8F8BA5', fontSize: 10 }}
                      />
                      <Radar
                        name="Biomarcadores"
                        dataKey="valor"
                        stroke="#69956D"
                        fill="#69956D"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Grid de biomarcadores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {(biomarcadores || []).map((bio) => {
                const info = BIOMARCADORES_INFO[bio.tipo as keyof typeof BIOMARCADORES_INFO];
                if (!info) return null;
                return (
                  <Card 
                    key={bio.id} 
                    className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      setEditingBiomarcadorId(bio.id);
                      setShowFormBiomarcador(true);
                    }}
                  >
                    <div 
                      className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20"
                      style={{ backgroundColor: info.color }}
                    />
                    
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{info.icono}</span>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm">{info.nombre}</h3>
                          <p className="text-xs text-muted">{formatDate(bio.fecha)}</p>
                        </div>
                      </div>
                      <span 
                        className="text-lg font-bold"
                        style={{ color: info.color }}
                      >
                        {bio.porcentaje}%
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="h-2 bg-muted-light rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${bio.porcentaje}%`,
                            backgroundColor: info.color
                          }}
                        />
                      </div>
                    </div>

                    {bio.tareas && Array.isArray(bio.tareas) && bio.tareas.length > 0 && (
                      <div className="pt-3 border-t border-border">
                        <p className="text-xs font-medium text-muted mb-2">
                          Tareas ({(bio.tareas as any[]).filter((t: any) => t.completada).length}/{bio.tareas.length})
                        </p>
                        <ul className="space-y-1.5">
                          {(bio.tareas as any[]).slice(0, 3).map((tarea: any) => {
                            const tareaKey = `${bio.id}-${tarea.id}`;
                            const isUpdating = updatingTareas.has(tareaKey);
                            return (
                              <li 
                                key={tarea.id} 
                                className="flex items-start gap-2 text-xs"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    
                                    setUpdatingTareas(prev => new Set(prev).add(tareaKey));
                                    
                                    const success = await toggleTarea(bio.id, tarea.id);
                                    
                                    setUpdatingTareas(prev => {
                                      const newSet = new Set(prev);
                                      newSet.delete(tareaKey);
                                      return newSet;
                                    });
                                    
                                    if (!success) {
                                      console.error('Error al actualizar la tarea');
                                    }
                                  }}
                                  disabled={isUpdating}
                                  className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                    tarea.completada ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-muted-light text-muted hover:bg-muted'
                                  }`}
                                  title={tarea.completada ? 'Marcar como pendiente' : 'Marcar como completada'}
                                >
                                  {isUpdating ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  ) : tarea.completada ? (
                                    <Check className="w-2.5 h-2.5" />
                                  ) : null}
                                </button>
                                <span className={`${tarea.completada ? 'line-through text-muted' : 'text-foreground'}`}>
                                  {tarea.descripcion}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {(!biomarcadores || biomarcadores.length === 0) && (
              <Card>
                <div className="text-center py-12 text-muted">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay biomarcadores registrados todavía.</p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Documentos Tab */}
        {activeTab === 'documentos' && (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Documentos Clínicos</h2>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Subir Documento
              </Button>
            </div>
            <div className="text-center py-12 text-muted">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay documentos subidos todavía.</p>
              <p className="text-sm mt-1">Sube análisis clínicos, informes médicos, etc.</p>
            </div>
          </Card>
        )}

        {/* Herramientas Tab */}
        {activeTab === 'herramientas' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Herramientas Asignadas</h2>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setShowAsignarHerramientas(true)}
              >
                <Plus className="w-4 h-4" />
                Asignar Herramienta
              </Button>
            </div>

            {herramientasAsignadas && herramientasAsignadas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {herramientasAsignadas.map((asignada) => {
                  const herramienta = (asignada as any).herramienta;
                  if (!herramienta) return null;
                  
                  return (
                    <Card key={asignada.id} className="hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-light/50 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-1">{herramienta.titulo}</h3>
                          <p className="text-sm text-muted mb-2 line-clamp-2">{herramienta.descripcion}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="primary" size="sm">
                              {herramienta.tipo.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted bg-muted-light px-2 py-1 rounded">
                              {herramienta.categoria}
                            </span>
                          </div>
                          <a
                            href={herramienta.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium"
                          >
                            Abrir herramienta
                            <ChevronRight className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <div className="text-center py-12 text-muted">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay herramientas asignadas todavía.</p>
                  <p className="text-sm mt-1">Asigna herramientas desde el botón de arriba.</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      {showFormMedida && (
        <FormMedida
          pacienteId={resolvedParams.id}
          onClose={() => {
            setShowFormMedida(false);
            refreshMedidas();
          }}
        />
      )}

      {showFormBiomarcador && (
        <FormBiomarcador
          pacienteId={resolvedParams.id}
          biomarcadorId={editingBiomarcadorId || undefined}
          onClose={() => {
            setShowFormBiomarcador(false);
            setEditingBiomarcadorId(null);
            refreshBiomarcadores();
          }}
        />
      )}

      {showAsignarHerramientas && (
        <AsignarHerramientas
          pacienteId={resolvedParams.id}
          onClose={() => setShowAsignarHerramientas(false)}
        />
      )}
    </div>
  );
}
