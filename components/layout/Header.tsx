'use client';

import { Bell, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Resumen general de tu consulta' },
  '/pacientes': { title: 'Pacientes', subtitle: 'Gestiona tus pacientes' },
  '/pacientes/nuevo': { title: 'Nuevo Paciente', subtitle: 'Evaluación inicial' },
  '/herramientas': { title: 'Herramientas', subtitle: 'Material educativo para pacientes' },
};

export default function Header() {
  const pathname = usePathname();
  
  // Handle dynamic routes
  let pageInfo = pageTitles[pathname];
  if (!pageInfo) {
    if (pathname.startsWith('/pacientes/') && pathname !== '/pacientes/nuevo') {
      pageInfo = { title: 'Ficha del Paciente', subtitle: 'Información detallada' };
    } else {
      pageInfo = { title: 'NutriDash', subtitle: '' };
    }
  }

  return (
    <header className="h-20 bg-white border-b border-border flex items-center justify-between px-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{pageInfo.title}</h1>
        {pageInfo.subtitle && (
          <p className="text-sm text-muted">{pageInfo.subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            className="w-64 pl-10 pr-4 py-2 rounded-xl border border-border bg-muted-light/50 text-sm placeholder:text-muted focus:bg-white transition-colors"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-muted-light transition-colors">
          <Bell className="w-5 h-5 text-muted" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />
        </button>

        {/* Date */}
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <p className="text-xs text-muted">
            {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </header>
  );
}

