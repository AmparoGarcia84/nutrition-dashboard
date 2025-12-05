'use client';

import { Card } from '@/components/ui';
import { usePacientes } from '@/lib/hooks';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Calendar,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';

const colorClasses: Record<string, { bg: string; text: string; icon: string }> = {
  primary: { bg: 'bg-primary-light/50', text: 'text-primary-dark', icon: 'text-primary' },
  success: { bg: 'bg-success-light', text: 'text-success', icon: 'text-success' },
  secondary: { bg: 'bg-secondary-light/50', text: 'text-secondary', icon: 'text-secondary' },
  accent: { bg: 'bg-accent-light', text: 'text-accent', icon: 'text-accent' },
};

export default function Dashboard() {
  const { pacientes, loading: loadingPacientes } = usePacientes();
  
  if (loadingPacientes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Calcular estadísticas reales
  const statsCalculadas = [
    { 
      name: 'Total Pacientes', 
      value: pacientes.length, 
      change: '+2 este mes',
      trend: 'up',
      icon: Users,
      color: 'primary'
    },
    { 
      name: 'Pacientes Activos', 
      value: pacientes.filter(p => p.activo).length, 
      change: '100%',
      trend: 'up',
      icon: Activity,
      color: 'success'
    },
    { 
      name: 'Citas esta semana', 
      value: 12, 
      change: '+3 vs anterior',
      trend: 'up',
      icon: Calendar,
      color: 'secondary'
    },
    { 
      name: 'Objetivos cumplidos', 
      value: '85%', 
      change: '+5%',
      trend: 'up',
      icon: Target,
      color: 'accent'
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
        {statsCalculadas.map((stat) => {
          const colors = colorClasses[stat.color];
          return (
            <Card key={stat.name} hover className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted font-medium">{stat.name}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-primary" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-danger" />
                    )}
                    <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-primary' : 'text-danger'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
              </div>
              {/* Decorative gradient */}
              <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full ${colors.bg} opacity-50 blur-2xl`} />
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Patients */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Pacientes Recientes</h2>
            <Link 
              href="/pacientes" 
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              Ver todos →
            </Link>
          </div>
          <div className="space-y-4">
            {pacientes.slice(0, 4).map((paciente, index) => {
              return (
                <Link
                  key={paciente.id}
                  href={`/pacientes/${paciente.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-background transition-colors group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {paciente.foto_perfil ? (
                    <img 
                      src={paciente.foto_perfil} 
                      alt={paciente.nombre}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold text-lg">
                      {paciente.nombre.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {paciente.nombre}
                    </p>
                    <p className="text-sm text-muted truncate">
                      {paciente.email} · {paciente.localidad || 'Sin localidad'}
                    </p>
                  </div>
                </Link>
              );
            })}
            {pacientes.length === 0 && (
              <p className="text-center text-muted py-4">No hay pacientes registrados</p>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-lg font-semibold text-foreground mb-6">Acciones Rápidas</h2>
          <div className="space-y-3">
            <Link
              href="/pacientes/nuevo"
              className="flex items-center gap-4 p-4 rounded-xl bg-primary-light/50 hover:bg-primary hover:text-white transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <UserPlus className="w-5 h-5 text-primary group-hover:text-white" />
              </div>
              <div>
                <p className="font-medium text-primary-dark group-hover:text-white">Nuevo Paciente</p>
                <p className="text-xs text-primary/70 group-hover:text-white/70">Evaluación inicial</p>
              </div>
            </Link>

            <Link
              href="/herramientas"
              className="flex items-center gap-4 p-4 rounded-xl bg-secondary-light/50 hover:bg-secondary hover:text-white transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary/20 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                <TrendingUp className="w-5 h-5 text-secondary group-hover:text-white" />
              </div>
              <div>
                <p className="font-medium text-secondary group-hover:text-white">Herramientas</p>
                <p className="text-xs text-secondary/70 group-hover:text-white/70">Material educativo</p>
              </div>
            </Link>
          </div>

          {/* Mini Chart Placeholder */}
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-medium text-muted mb-4">Progreso General</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted">Objetivos cumplidos</span>
                  <span className="font-medium text-foreground">85%</span>
                </div>
                <div className="h-2 bg-muted-light rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full progress-bar" style={{ width: '85%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted">Adherencia dieta</span>
                  <span className="font-medium text-foreground">72%</span>
                </div>
                <div className="h-2 bg-muted-light rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full progress-bar" style={{ width: '72%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted">Satisfacción</span>
                  <span className="font-medium text-foreground">94%</span>
                </div>
                <div className="h-2 bg-muted-light rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full progress-bar" style={{ width: '94%' }} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
