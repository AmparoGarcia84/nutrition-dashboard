# 🥗 PSNutrición - Dashboard de Nutrición

Dashboard profesional para nutricionistas con gestión completa de pacientes, biomarcadores, medidas corporales y dietas personalizadas.

## ✨ Características

- 📊 **Dashboard Principal** - Estadísticas y resumen general
- 👥 **Gestión de Pacientes** - Listado, búsqueda, formulario de evaluación inicial completo para registro de nuevos pacientes
- 📏 **Medidas Corporales** - 4 tipos de mediciones:
  - Bioimpedancia+ (peso, grasa, agua, músculo, metabolismo, etc.)
  - Bioimpedancia Segmental (brazos, tronco, piernas)
  - Plicometría (7 pliegues en mm)
  - Antropometría (12 perímetros en cm)
- 🧬 **10 Biomarcadores** - Con porcentajes, gráfico radar y tareas:
  1. Funciones Gastrointestinales
  2. Biorritmo
  3. Osteoarticular
  4. Datos Clínicos
  5. Estética
  6. Psiconutrición
  7. Rendimiento Deportivo
  8. Hormonas
  9. Sistema Inmune
  10. Microbiota
- 📚 **Herramientas de Aprendizaje** - CRUD completo de material educativo
- 🍽️ **Dietas con IA** - Integración con Spoonacular API
- 📄 **Documentos Clínicos** - Gestión de análisis e informes
- 🗄️ **Base de Datos Supabase** - PostgreSQL en la nube

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase (gratis)
- (Opcional) API key de Spoonacular para dietas

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/AmparoGarcia84/nutrition-dashboard.git
cd nutrition-dashboard
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz:

```env
# Supabase (obligatorio)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Spoonacular (opcional - para dietas)
NEXT_PUBLIC_SPOONACULAR_API_KEY=tu_api_key_aqui
```

4. **Configurar Supabase**

- Ve a [supabase.com](https://supabase.com) y crea un proyecto gratis
- En el SQL Editor, ejecuta el contenido de `supabase/schema.sql`
- Copia la URL y anon key a `.env.local`

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
nutrition-dashboard/
├── app/                    # Páginas Next.js
│   ├── page.tsx           # Dashboard principal
│   ├── pacientes/         # Gestión de pacientes
│   ├── herramientas/      # Material educativo
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── layout/           # Sidebar, Header
│   ├── ui/               # Componentes base (Button, Card, etc.)
│   └── dietas/           # Generador de dietas
├── lib/                  # Utilidades
│   ├── hooks/            # Hooks personalizados (usePacientes, etc.)
│   ├── supabase.ts       # Cliente Supabase
│   ├── spoonacular.ts    # API Spoonacular
│   └── utils.ts          # Funciones auxiliares
├── types/                # Tipos TypeScript
│   ├── index.ts          # Tipos de la app
│   └── database.ts       # Tipos de Supabase
└── supabase/             # SQL y migraciones
    └── schema.sql        # Esquema de base de datos
```

## 🎨 Colores Corporativos

- **Verde Principal:** `#69956D`
- **Verde Claro:** `#A1B4A3`
- **Naranja/Dorado:** `#D98D1C`
- **Fondo:** `#E3EEE4`
- **Gris Púrpura:** `#8F8BA5`
- **Gris Oscuro:** `#656176`

## 🗄️ Base de Datos

### Tablas

- `pacientes` - Datos de evaluación inicial
- `medidas` - Todas las mediciones corporales
- `biomarcadores` - Los 10 biomarcadores con tareas
- `documentos` - Análisis clínicos
- `herramientas` - Material educativo
- `herramientas_asignadas` - Relación paciente-herramienta
- `dietas` - Planes de dieta generados

### Plan Gratuito de Supabase

- ✅ 500MB de almacenamiento
- ✅ 50,000 filas
- ✅ Suficiente para ~100 pacientes con todas sus mediciones

## 🍽️ Spoonacular API

Para generar dietas personalizadas:

1. Ve a [spoonacular.com/food-api](https://spoonacular.com/food-api/console#Dashboard)
2. Crea una cuenta gratis (sin tarjeta)
3. Copia tu API Key
4. Añádela a `.env.local`

**Plan gratuito:** 150 puntos/día (~150 consultas)

## 📝 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter
```

## 🛠️ Tecnologías

- **Next.js 16** - Framework React
- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Tailwind CSS 4** - Estilos
- **Supabase** - Base de datos PostgreSQL
- **Spoonacular** - API de recetas y dietas
- **Recharts** - Gráficos
- **Lucide React** - Iconos

## 📄 Licencia

Este proyecto es una prueba de concepto.

## 🤝 Contribuciones

Este es un proyecto privado, pero siéntete libre de hacer fork y adaptarlo a tus necesidades.

---

**Desarrollado con ❤️ para nutricionistas profesionales**
