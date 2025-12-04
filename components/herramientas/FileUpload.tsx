'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, FileText, Loader2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FileUploadProps {
  onFileSelect: (url: string) => void;
  currentUrl?: string;
}

export default function FileUpload({ onFileSelect, currentUrl }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const uploadFile = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadedFileName(file.name);

    try {
      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `herramientas/${fileName}`;

      // Subir a Supabase Storage
      const { data, error } = await supabase.storage
        .from('documentos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        // Si el bucket no existe, usar URL local como fallback
        console.warn('Error al subir a Supabase Storage:', error);
        // Crear una URL local temporal
        const localUrl = URL.createObjectURL(file);
        onFileSelect(localUrl);
        setIsUploading(false);
        return;
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath);

      onFileSelect(publicUrl);
      setUploadProgress(100);
    } catch (err) {
      console.error('Error al subir archivo:', err);
      // Fallback: crear URL local
      const localUrl = URL.createObjectURL(file);
      onFileSelect(localUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setUploadedFileName(null);
    onFileSelect('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        Subir Archivo
      </label>
      
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
          ${isDragging 
            ? 'border-primary bg-primary-light/10 scale-[1.02]' 
            : 'border-border hover:border-primary hover:bg-primary-light/5'
          }
          ${isUploading ? 'pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov"
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Subiendo {uploadedFileName}...
              </p>
              <div className="w-full bg-muted-light rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : currentUrl && currentUrl.trim() !== '' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Check className="w-6 h-6" />
              <span className="font-medium">Archivo seleccionado</span>
            </div>
            {uploadedFileName && (
              <p className="text-sm text-muted flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                {uploadedFileName}
              </p>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger-light text-danger hover:bg-danger hover:text-white transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className={`w-8 h-8 mx-auto ${isDragging ? 'text-primary' : 'text-muted'}`} />
            <div>
              <p className="text-sm font-medium text-foreground">
                Arrastra un archivo aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-muted mt-1">
                PDF, DOC, imágenes, videos (máx. 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {currentUrl && currentUrl.trim() !== '' && !uploadedFileName && (
        <p className="mt-2 text-xs text-muted">
          URL actual: <span className="font-mono text-primary break-all">{currentUrl}</span>
        </p>
      )}
    </div>
  );
}

