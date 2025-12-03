// Tipos para el Dashboard de Nutrición

export interface Paciente {
  id: string;
  // Datos personales
  nombre: string;
  dni: string;
  telefono: string;
  fechaNacimiento: string;
  email: string;
  direccion: string;
  codigoPostal: string;
  localidad: string;
  
  // Preferencias alimentarias
  gruposAlimentarios: GrupoAlimentario[];
  
  // Ingestas
  ingestas: Ingesta[];
  
  // Hábitos
  recomendadoPor: string;
  aguaDiaria: string;
  otrosLiquidos: string;
  habitosAlimenticios: string;
  cansancioDia: string;
  problemasDigestion: string;
  pesoIdeal: string;
  deporte: {
    practica: boolean;
    cual: string;
    frecuencia: string;
  };
  calidadSueno: string;
  dietaAnterior: string;
  estadoSalud: string;
  
  // Historial médico
  dolencias: Dolencia[];
  
  // Medicamentos
  medicamentos: Medicamento[];
  
  // Trabajo y estrés
  trabajo: {
    activo: boolean;
    tipo: string;
    horario: string;
  };
  estres: {
    nivel: number;
    motivo: string;
    afectaSalud: string;
  };
  
  // Metadata
  fechaRegistro: string;
  activo: boolean;
}

export type GrupoAlimentario = 
  | 'harinas' | 'frutas' | 'carneBlanca' | 'carneRoja' 
  | 'pescadoBlanco' | 'pescadoAzul' | 'frutosSecos' | 'marisco'
  | 'feculas' | 'legumbres' | 'quesos' | 'cafes' | 'tes'
  | 'dulce' | 'lacteos' | 'semillas';

export interface Ingesta {
  tipo: 'desayuno' | 'almuerzo' | 'comida' | 'merienda' | 'cena';
  realiza: boolean;
  horario: string;
  descripcion: string;
}

export type DolenciaTipo = 
  | 'estrenimiento' | 'ulceras' | 'jaquecas' | 'tensionArterial'
  | 'anemia' | 'hemorroides' | 'osteoporosis' | 'fumador'
  | 'colesterolAlto' | 'artrosis' | 'colonIrritable' | 'crohn'
  | 'gastritis' | 'retencionLiquidos' | 'diabetes' | 'depresion';

export interface Dolencia {
  tipo: DolenciaTipo;
  activa: boolean;
  notas?: string;
}

export interface Medicamento {
  id: string;
  farmaco: string;
  dosis: string;
  motivo: string;
  tiempo: string;
}

// ============================================
// MEDIDAS CORPORALES - Estructura completa
// ============================================

export interface Medida {
  id: string;
  pacienteId: string;
  fecha: string;
  hora: string;
  
  // BIOIMPEDANCIA+
  bioimpedancia: {
    peso: number;              // kg
    grasaSubcutanea: number;   // %
    huesos: number;            // kg
    agua: number;              // %
    musculo: number;           // kg
    metabolismoBasal: number;  // kcal
    edadMetabolica: number;    // años
    grasaVisceral: number;     // nivel
    azucarSangre: number;      // mg/dl
    tension: string;           // ej: "120/80"
    flexibilidad: number;      // puntuación
    phSaliva: number;          // pH
    imc: number;               // calculado
  };
  
  // BIOIMPEDANCIA SEGMENTAL
  segmental: {
    brazoIzq: { kg: number; porcentaje: number };
    brazoDer: { kg: number; porcentaje: number };
    tronco: { kg: number; porcentaje: number };
    piernaIzq: { kg: number; porcentaje: number };
    piernaDer: { kg: number; porcentaje: number };
  };
  
  // PLICOMETRÍA (pliegues en mm)
  plicometria: {
    bicipital: number;
    tricipital: number;
    subEscapular: number;
    abdominal: number;
    suprailiaco: number;
    muslo: number;
    gemelo: number;
  };
  
  // ANTROPOMETRÍA (perímetros en cm)
  antropometria: {
    hombro: number;
    biceps: number;
    bicepsContraido: number;
    pecho: number;
    cintura: number;
    ombligo: number;
    cadera: number;
    muneca: number;
    gluteos: number;
    cuadriceps: number;
    gemelo: number;
    tobillo: number;
  };
  
  notas?: string;
}

// ============================================
// BIOMARCADORES - Los 10 específicos
// ============================================

export type BiomarcadorTipo = 
  | 'gastrointestinal'    // 1. Funciones gastrointestinales
  | 'biorritmo'           // 2. Biorritmo
  | 'osteoarticular'      // 3. Osteoarticular
  | 'datosCliniclos'      // 4. Datos clínicos
  | 'estetica'            // 5. Estética
  | 'psiconutricion'      // 6. Psiconutrición
  | 'rendimientoDeportivo'// 7. Rendimiento deportivo
  | 'hormonas'            // 8. Hormonas
  | 'sistemaInmune'       // 9. Sistema inmune
  | 'microbiota';         // 10. Microbiota

export const BIOMARCADORES_INFO: Record<BiomarcadorTipo, { nombre: string; color: string; icono: string }> = {
  gastrointestinal: { nombre: 'Funciones Gastrointestinales', color: '#69956D', icono: '🫁' },
  biorritmo: { nombre: 'Biorritmo', color: '#D98D1C', icono: '🌙' },
  osteoarticular: { nombre: 'Osteoarticular', color: '#8F8BA5', icono: '🦴' },
  datosCliniclos: { nombre: 'Datos Clínicos', color: '#656176', icono: '📋' },
  estetica: { nombre: 'Estética', color: '#e5a84d', icono: '✨' },
  psiconutricion: { nombre: 'Psiconutrición', color: '#A1B4A3', icono: '🧠' },
  rendimientoDeportivo: { nombre: 'Rendimiento Deportivo', color: '#4a7a4e', icono: '💪' },
  hormonas: { nombre: 'Hormonas', color: '#b87333', icono: '⚗️' },
  sistemaInmune: { nombre: 'Sistema Inmune', color: '#69956D', icono: '🛡️' },
  microbiota: { nombre: 'Microbiota', color: '#7c9a7e', icono: '🦠' },
};

export interface Biomarcador {
  id: string;
  pacienteId: string;
  tipo: BiomarcadorTipo;
  porcentaje: number;       // 0-100
  fecha: string;
  notas?: string;
  tareas: TareaBiomarcador[];
}

export interface TareaBiomarcador {
  id: string;
  descripcion: string;
  completada: boolean;
}

// ============================================
// DOCUMENTOS
// ============================================

export interface Documento {
  id: string;
  nombre: string;
  tipo: 'analisis' | 'informe' | 'receta' | 'otro';
  url: string;
  fecha: string;
  notas?: string;
}

export interface DocumentoPaciente extends Documento {
  pacienteId: string;
}

// ============================================
// HERRAMIENTAS DE APRENDIZAJE
// ============================================

export interface HerramientaAprendizaje {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'pdf' | 'video' | 'articulo' | 'infografia';
  url: string;
  categoria: string;
  fechaCreacion: string;
}

export interface HerramientaAsignada {
  herramientaId: string;
  pacienteId: string;
  fechaAsignacion: string;
  visto: boolean;
}

// ============================================
// DIETAS (Spoonacular)
// ============================================

export interface PlanDieta {
  id: string;
  pacienteId: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  calorias: number;
  comidas: ComidaDieta[];
  notas?: string;
}

export interface ComidaDieta {
  id: number;
  title: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  image: string;
  tipo: 'desayuno' | 'almuerzo' | 'cena' | 'snack';
}
