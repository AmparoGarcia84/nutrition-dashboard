-- ============================================
-- NUTRIDASH - ESQUEMA DE BASE DE DATOS
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: PACIENTES
-- ============================================
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  dni TEXT NOT NULL UNIQUE,
  telefono TEXT NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  email TEXT NOT NULL,
  direccion TEXT,
  codigo_postal TEXT,
  localidad TEXT,
  grupos_alimentarios TEXT[] DEFAULT '{}',
  ingestas JSONB DEFAULT '[]',
  recomendado_por TEXT,
  agua_diaria TEXT,
  otros_liquidos TEXT,
  habitos_alimenticios TEXT,
  cansancio_dia TEXT,
  problemas_digestion TEXT,
  peso_ideal TEXT,
  deporte JSONB DEFAULT '{"practica": false, "cual": "", "frecuencia": ""}',
  calidad_sueno TEXT,
  dieta_anterior TEXT,
  estado_salud TEXT,
  dolencias JSONB DEFAULT '[]',
  medicamentos JSONB DEFAULT '[]',
  trabajo JSONB DEFAULT '{"activo": false, "tipo": "", "horario": ""}',
  estres JSONB DEFAULT '{"nivel": 0, "motivo": "", "afectaSalud": ""}',
  foto_perfil TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pacientes_updated_at
  BEFORE UPDATE ON pacientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: MEDIDAS
-- ============================================
CREATE TABLE IF NOT EXISTS medidas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  bioimpedancia JSONB NOT NULL DEFAULT '{
    "peso": 0,
    "grasaSubcutanea": 0,
    "huesos": 0,
    "agua": 0,
    "musculo": 0,
    "metabolismoBasal": 0,
    "edadMetabolica": 0,
    "grasaVisceral": 0,
    "azucarSangre": 0,
    "tension": "",
    "flexibilidad": 0,
    "phSaliva": 0,
    "imc": 0
  }',
  segmental JSONB NOT NULL DEFAULT '{
    "brazoIzq": {"kg": 0, "porcentaje": 0},
    "brazoDer": {"kg": 0, "porcentaje": 0},
    "tronco": {"kg": 0, "porcentaje": 0},
    "piernaIzq": {"kg": 0, "porcentaje": 0},
    "piernaDer": {"kg": 0, "porcentaje": 0}
  }',
  plicometria JSONB NOT NULL DEFAULT '{
    "bicipital": 0,
    "tricipital": 0,
    "subEscapular": 0,
    "abdominal": 0,
    "suprailiaco": 0,
    "muslo": 0,
    "gemelo": 0
  }',
  antropometria JSONB NOT NULL DEFAULT '{
    "hombro": 0,
    "biceps": 0,
    "bicepsContraido": 0,
    "pecho": 0,
    "cintura": 0,
    "ombligo": 0,
    "cadera": 0,
    "muneca": 0,
    "gluteos": 0,
    "cuadriceps": 0,
    "gemelo": 0,
    "tobillo": 0
  }',
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medidas_paciente ON medidas(paciente_id);
CREATE INDEX idx_medidas_fecha ON medidas(fecha DESC);

-- ============================================
-- TABLA: BIOMARCADORES
-- ============================================
CREATE TABLE IF NOT EXISTS biomarcadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'gastrointestinal', 'biorritmo', 'osteoarticular', 'datosCliniclos',
    'estetica', 'psiconutricion', 'rendimientoDeportivo', 'hormonas',
    'sistemaInmune', 'microbiota'
  )),
  porcentaje INTEGER NOT NULL CHECK (porcentaje >= 0 AND porcentaje <= 100),
  fecha DATE NOT NULL,
  notas TEXT,
  tareas JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_biomarcadores_updated_at
  BEFORE UPDATE ON biomarcadores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_biomarcadores_paciente ON biomarcadores(paciente_id);

-- ============================================
-- TABLA: DOCUMENTOS (análisis clínicos)
-- ============================================
CREATE TABLE IF NOT EXISTS documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('analisis', 'informe', 'receta', 'otro')),
  url TEXT NOT NULL,
  fecha DATE NOT NULL,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documentos_paciente ON documentos(paciente_id);

-- ============================================
-- TABLA: HERRAMIENTAS DE APRENDIZAJE
-- ============================================
CREATE TABLE IF NOT EXISTS herramientas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('pdf', 'video', 'articulo', 'infografia')),
  url TEXT NOT NULL,
  categoria TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: HERRAMIENTAS ASIGNADAS A PACIENTES
-- ============================================
CREATE TABLE IF NOT EXISTS herramientas_asignadas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  herramienta_id UUID NOT NULL REFERENCES herramientas(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  fecha_asignacion TIMESTAMPTZ DEFAULT NOW(),
  visto BOOLEAN DEFAULT false,
  UNIQUE(herramienta_id, paciente_id)
);

CREATE INDEX idx_herramientas_asignadas_paciente ON herramientas_asignadas(paciente_id);

-- ============================================
-- TABLA: DIETAS (planes generados)
-- ============================================
CREATE TABLE IF NOT EXISTS dietas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  calorias INTEGER NOT NULL,
  comidas JSONB DEFAULT '[]',
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dietas_paciente ON dietas(paciente_id);

-- ============================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE medidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarcadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE herramientas ENABLE ROW LEVEL SECURITY;
ALTER TABLE herramientas_asignadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE dietas ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (para desarrollo - ajustar en producción)
CREATE POLICY "Enable all access for all users" ON pacientes FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON medidas FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON biomarcadores FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON documentos FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON herramientas FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON herramientas_asignadas FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON dietas FOR ALL USING (true);

-- ============================================
-- DATOS DE EJEMPLO (opcional)
-- ============================================
INSERT INTO herramientas (titulo, descripcion, tipo, url, categoria) VALUES
  ('Guía de alimentación saludable', 'Documento completo sobre los principios de una alimentación equilibrada.', 'pdf', '/docs/guia-alimentacion.pdf', 'Nutrición básica'),
  ('Recetas bajas en calorías', 'Colección de 50 recetas saludables con menos de 400 calorías.', 'pdf', '/docs/recetas-bajas-calorias.pdf', 'Recetas'),
  ('Cómo leer etiquetas nutricionales', 'Video explicativo sobre cómo interpretar la información nutricional.', 'video', 'https://youtube.com/example', 'Educación'),
  ('Infografía: Plato saludable', 'Representación visual de las proporciones ideales en cada comida.', 'infografia', '/docs/plato-saludable.png', 'Nutrición básica'),
  ('Gestión del estrés y alimentación', 'Artículo sobre la relación entre el estrés y los hábitos alimenticios.', 'articulo', '/docs/estres-alimentacion.pdf', 'Bienestar');

