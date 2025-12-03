'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '@/components/ui';
import { usePaciente, useMedidas, useBiomarcadores, useHerramientas } from '@/lib/hooks';
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
  Ruler
} from 'lucide-react';
import GeneradorDietas from '@/components/dietas/GeneradorDietas';
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
  { id: 'dietas', label: 'Dietas', icon: Utensils },
  { id: 'medidas', label: 'Medidas', icon: Activity },
  { id: 'biomarcadores', label: 'Biomarcadores', icon: Heart },
  { id: 'documentos', label: 'Documentos', icon: FileText },
  { id: 'herramientas', label: 'Herramientas', icon: BookOpen },
];

export default function PacienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState('medidas');
  const [medidaSeccion, setMedidaSeccion] = useState<'bioimpedancia' | 'segmental' | 'plicometria' | 'antropometria'>('bioimpedancia');
  
  const { paciente, loading: loadingPaciente } = usePaciente(resolvedParams.id);
  const { medidas, loading: loadingMedidas } = useMedidas(resolvedParams.id);
  const { biomarcadores, loading: loadingBiomarcadores } = useBiomarcadores(resolvedParams.id);
  const { herramientas } = useHerramientas();

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
  const radarData = (biomarcadores || []).map(bio => ({
    nombre: BIOMARCADORES_INFO[bio.tipo as keyof typeof BIOMARCADORES_INFO]?.nombre.split(' ')[0] || bio.tipo,
    valor: bio.porcentaje,
    fullMark: 100,
  }));

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
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-primary/30">
              {paciente.nombre.charAt(0)}
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
            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 rounded-xl bg-primary-light/50 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-muted text-xs">Email</p>
                <p className="text-foreground font-medium">{paciente.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 rounded-xl bg-secondary-light/50 flex items-center justify-center">
                <Phone className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-muted text-xs">Teléfono</p>
                <p className="text-foreground font-medium">{paciente.telefono}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 rounded-xl bg-accent-light/50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-muted text-xs">Localidad</p>
                <p className="text-foreground font-medium">{paciente.localidad || 'Sin localidad'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 rounded-xl bg-primary-light/50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-muted text-xs">Edad</p>
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
          <GeneradorDietas 
            pacienteId={paciente.id} 
            pacienteNombre={paciente.nombre} 
          />
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
                <Button variant="outline" className="gap-2">
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
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Actualizar Biomarcadores
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
                  <Card key={bio.id} className="relative overflow-hidden">
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
                          {(bio.tareas as any[]).slice(0, 3).map((tarea: any) => (
                            <li key={tarea.id} className="flex items-start gap-2 text-xs">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                tarea.completada ? 'bg-primary text-white' : 'bg-muted-light text-muted'
                              }`}>
                                {tarea.completada && <Check className="w-2.5 h-2.5" />}
                              </span>
                              <span className={`${tarea.completada ? 'line-through text-muted' : 'text-foreground'}`}>
                                {tarea.descripcion}
                              </span>
                            </li>
                          ))}
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
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Asignar Herramienta
              </Button>
            </div>

            <Card>
              <h3 className="font-medium text-foreground mb-4">Herramientas Disponibles</h3>
              <div className="space-y-3">
                {herramientas && herramientas.slice(0, 3).map((herramienta) => (
                  <div 
                    key={herramienta.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-background hover:bg-primary-light/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-light/50 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{herramienta.titulo}</p>
                        <p className="text-sm text-muted">{herramienta.categoria}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Asignar
                    </Button>
                  </div>
                ))}
                {(!herramientas || herramientas.length === 0) && (
                  <p className="text-center text-muted py-4">No hay herramientas disponibles</p>
                )}
              </div>
              <Link 
                href="/herramientas"
                className="mt-4 text-sm text-primary hover:text-primary-dark font-medium inline-flex items-center gap-1"
              >
                Ver todas las herramientas
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
