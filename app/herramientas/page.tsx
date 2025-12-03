'use client';

import { useState } from 'react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { herramientasMock } from '@/lib/mock-data';
import { HerramientaAprendizaje } from '@/types';
import { formatDate } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  FileText,
  Video,
  FileImage,
  BookOpen,
  Trash2,
  ExternalLink,
  Edit,
  X,
  Upload
} from 'lucide-react';

const tipoIconos: Record<string, React.ElementType> = {
  pdf: FileText,
  video: Video,
  infografia: FileImage,
  articulo: BookOpen,
};

const tipoColores: Record<string, string> = {
  pdf: 'danger',
  video: 'secondary',
  infografia: 'success',
  articulo: 'primary',
};

export default function HerramientasPage() {
  const [herramientas, setHerramientas] = useState(herramientasMock);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'pdf' as HerramientaAprendizaje['tipo'],
    url: '',
    categoria: '',
  });

  const filteredHerramientas = herramientas.filter(h =>
    h.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categorias = [...new Set(herramientas.map(h => h.categoria))];

  const handleSubmit = () => {
    if (editingId) {
      setHerramientas(prev => prev.map(h => 
        h.id === editingId 
          ? { ...h, ...formData }
          : h
      ));
    } else {
      const newHerramienta: HerramientaAprendizaje = {
        id: Date.now().toString(),
        ...formData,
        fechaCreacion: new Date().toISOString(),
      };
      setHerramientas(prev => [...prev, newHerramienta]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta herramienta?')) {
      setHerramientas(prev => prev.filter(h => h.id !== id));
    }
  };

  const openEditModal = (herramienta: HerramientaAprendizaje) => {
    setFormData({
      titulo: herramienta.titulo,
      descripcion: herramienta.descripcion,
      tipo: herramienta.tipo,
      url: herramienta.url,
      categoria: herramienta.categoria,
    });
    setEditingId(herramienta.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      titulo: '',
      descripcion: '',
      tipo: 'pdf',
      url: '',
      categoria: '',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Buscar herramientas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          />
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Herramienta
        </Button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSearchTerm('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !searchTerm ? 'bg-primary text-white' : 'bg-muted-light text-muted hover:text-foreground'
          }`}
        >
          Todas
        </button>
        {categorias.map(cat => (
          <button
            key={cat}
            onClick={() => setSearchTerm(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              searchTerm === cat ? 'bg-primary text-white' : 'bg-muted-light text-muted hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
        {filteredHerramientas.map((herramienta) => {
          const Icon = tipoIconos[herramienta.tipo] || FileText;
          const color = tipoColores[herramienta.tipo] || 'primary';
          
          return (
            <Card key={herramienta.id} className="group relative">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-${color}-light flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 text-${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate pr-16">
                    {herramienta.titulo}
                  </h3>
                  <p className="text-sm text-muted line-clamp-2 mt-1">
                    {herramienta.descripcion}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Badge variant={color as 'primary' | 'secondary' | 'success' | 'danger'}>
                  {herramienta.tipo.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted">
                  {formatDate(herramienta.fechaCreacion)}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs font-medium text-muted bg-muted-light px-2 py-1 rounded">
                  {herramienta.categoria}
                </span>
                <div className="flex gap-1">
                  <a
                    href={herramienta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-muted-light transition-colors"
                    title="Abrir"
                  >
                    <ExternalLink className="w-4 h-4 text-muted hover:text-primary" />
                  </a>
                  <button
                    onClick={() => openEditModal(herramienta)}
                    className="p-2 rounded-lg hover:bg-muted-light transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4 text-muted hover:text-secondary" />
                  </button>
                  <button
                    onClick={() => handleDelete(herramienta.id)}
                    className="p-2 rounded-lg hover:bg-danger-light transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-muted hover:text-danger" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredHerramientas.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-muted">No se encontraron herramientas</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {editingId ? 'Editar Herramienta' : 'Nueva Herramienta'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-muted-light transition-colors"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Título"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Nombre de la herramienta"
              />
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Breve descripción del contenido"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Tipo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as HerramientaAprendizaje['tipo'] }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                  >
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="articulo">Artículo</option>
                    <option value="infografia">Infografía</option>
                  </select>
                </div>
                <Input
                  label="Categoría"
                  value={formData.categoria}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                  placeholder="Ej: Nutrición básica"
                />
              </div>

              <Input
                label="URL o archivo"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://... o /docs/archivo.pdf"
              />

              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted mx-auto mb-2" />
                <p className="text-sm text-muted">
                  Arrastra un archivo aquí o haz clic para seleccionar
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={closeModal}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingId ? 'Guardar Cambios' : 'Crear Herramienta'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

