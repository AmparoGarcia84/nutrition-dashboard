// Tipos generados para Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      pacientes: {
        Row: {
          id: string;
          nombre: string;
          dni: string;
          telefono: string;
          fecha_nacimiento: string;
          email: string;
          direccion: string;
          codigo_postal: string;
          localidad: string;
          grupos_alimentarios: string[];
          ingestas: Json;
          recomendado_por: string | null;
          agua_diaria: string | null;
          otros_liquidos: string | null;
          habitos_alimenticios: string | null;
          cansancio_dia: string | null;
          problemas_digestion: string | null;
          peso_ideal: string | null;
          deporte: Json | null;
          calidad_sueno: string | null;
          dieta_anterior: string | null;
          estado_salud: string | null;
          dolencias: Json;
          medicamentos: Json;
          trabajo: Json | null;
          estres: Json | null;
          foto_perfil: string | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['pacientes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['pacientes']['Insert']>;
      };
      medidas: {
        Row: {
          id: string;
          paciente_id: string;
          fecha: string;
          hora: string;
          bioimpedancia: Json;
          segmental: Json;
          plicometria: Json;
          antropometria: Json;
          notas: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['medidas']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['medidas']['Insert']>;
      };
      biomarcadores: {
        Row: {
          id: string;
          paciente_id: string;
          tipo: string;
          porcentaje: number;
          fecha: string;
          notas: string | null;
          tareas: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['biomarcadores']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['biomarcadores']['Insert']>;
      };
      documentos: {
        Row: {
          id: string;
          paciente_id: string;
          nombre: string;
          tipo: string;
          url: string;
          fecha: string;
          notas: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['documentos']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['documentos']['Insert']>;
      };
      herramientas: {
        Row: {
          id: string;
          titulo: string;
          descripcion: string;
          tipo: string;
          url: string;
          categoria: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['herramientas']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['herramientas']['Insert']>;
      };
      herramientas_asignadas: {
        Row: {
          id: string;
          herramienta_id: string;
          paciente_id: string;
          fecha_asignacion: string;
          visto: boolean;
        };
        Insert: Omit<Database['public']['Tables']['herramientas_asignadas']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['herramientas_asignadas']['Insert']>;
      };
      dietas: {
        Row: {
          id: string;
          paciente_id: string;
          nombre: string;
          fecha_inicio: string;
          fecha_fin: string | null;
          calorias: number;
          comidas: Json;
          notas: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['dietas']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['dietas']['Insert']>;
      };
    };
  };
}

// Tipos auxiliares para usar en la app
export type Paciente = Database['public']['Tables']['pacientes']['Row'];
export type PacienteInsert = Database['public']['Tables']['pacientes']['Insert'];
export type Medida = Database['public']['Tables']['medidas']['Row'];
export type MedidaInsert = Database['public']['Tables']['medidas']['Insert'];
export type Biomarcador = Database['public']['Tables']['biomarcadores']['Row'];
export type BiomarcadorInsert = Database['public']['Tables']['biomarcadores']['Insert'];
export type Documento = Database['public']['Tables']['documentos']['Row'];
export type Herramienta = Database['public']['Tables']['herramientas']['Row'];
export type HerramientaAsignada = Database['public']['Tables']['herramientas_asignadas']['Row'];
export type Dieta = Database['public']['Tables']['dietas']['Row'];

