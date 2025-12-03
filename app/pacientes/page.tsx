'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, Button, Input, Badge } from '@/components/ui';
import { pacientesMock } from '@/lib/mock-data';
import { formatDate, calcularEdad } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  ChevronRight
} from 'lucide-react';

export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filteredPacientes = pacientesMock.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.localidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o localidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
            />
          </div>
          <Button variant="ghost" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
        </div>
        <Link href="/pacientes/nuevo">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Paciente
          </Button>
        </Link>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('table')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'table' ? 'bg-primary text-white' : 'bg-muted-light text-muted hover:text-foreground'
          }`}
        >
          Tabla
        </button>
        <button
          onClick={() => setViewMode('cards')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'cards' ? 'bg-primary text-white' : 'bg-muted-light text-muted hover:text-foreground'
          }`}
        >
          Tarjetas
        </button>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted-light/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">
                    Localidad
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">
                    Edad
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPacientes.map((paciente) => (
                  <tr 
                    key={paciente.id} 
                    className="table-row-hover transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link href={`/pacientes/${paciente.id}`} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                          {paciente.nombre.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {paciente.nombre}
                          </p>
                          <p className="text-sm text-muted">{paciente.dni}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-foreground flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-muted" />
                          {paciente.email}
                        </p>
                        <p className="text-sm text-muted flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          {paciente.telefono}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-muted" />
                        {paciente.localidad}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">
                        {calcularEdad(paciente.fechaNacimiento)} años
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={paciente.activo ? 'success' : 'default'}>
                        {paciente.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted">
                        {formatDate(paciente.fechaRegistro)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/pacientes/${paciente.id}`}
                        className="p-2 rounded-lg hover:bg-muted-light transition-colors inline-flex"
                      >
                        <ChevronRight className="w-5 h-5 text-muted" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPacientes.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-muted">No se encontraron pacientes</p>
            </div>
          )}
        </Card>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {filteredPacientes.map((paciente) => (
            <Link key={paciente.id} href={`/pacientes/${paciente.id}`}>
              <Card hover className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-lg">
                      {paciente.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{paciente.nombre}</p>
                      <p className="text-sm text-muted">{paciente.dni}</p>
                    </div>
                  </div>
                  <Badge variant={paciente.activo ? 'success' : 'default'} size="sm">
                    {paciente.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-muted">
                    <Mail className="w-4 h-4" />
                    {paciente.email}
                  </p>
                  <p className="flex items-center gap-2 text-muted">
                    <Phone className="w-4 h-4" />
                    {paciente.telefono}
                  </p>
                  <p className="flex items-center gap-2 text-muted">
                    <MapPin className="w-4 h-4" />
                    {paciente.localidad}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-xs text-muted">
                    {calcularEdad(paciente.fechaNacimiento)} años
                  </span>
                  <span className="text-xs text-muted">
                    Desde {formatDate(paciente.fechaRegistro)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-muted">
        Mostrando {filteredPacientes.length} de {pacientesMock.length} pacientes
      </p>
    </div>
  );
}

