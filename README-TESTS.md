# 🧪 Suite de Tests Completa

Este proyecto incluye una suite completa de tests unitarios y end-to-end.

## 📦 Instalación

```bash
npm install
```

## 🚀 Comandos Disponibles

### Tests Unitarios

```bash
# Ejecutar todos los tests unitarios
npm test

# Modo watch (ejecuta tests cuando cambias archivos)
npm run test:watch

# Con reporte de cobertura
npm run test:coverage
```

### Tests E2E

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Con UI interactiva (recomendado para desarrollo)
npm run test:e2e:ui

# Con navegador visible
npm run test:e2e:headed
```

## 📁 Estructura

```
├── __tests__/              # Tests unitarios
│   ├── lib/
│   │   ├── utils.test.ts
│   │   └── hooks/
│   │       ├── usePacientes.test.ts
│   │       ├── useMedidas.test.ts
│   │       └── useDietas.test.ts
│   └── components/
│       └── ui/
│           ├── Button.test.tsx
│           └── Card.test.tsx
│
├── e2e/                    # Tests end-to-end
│   ├── navigation.spec.ts
│   ├── pacientes.spec.ts
│   ├── dietas.spec.ts
│   └── biomarcadores.spec.ts
│
├── jest.config.js          # Configuración Jest
├── jest.setup.js           # Setup de Jest
└── playwright.config.ts    # Configuración Playwright
```

## ✅ Cobertura de Tests

### Tests Unitarios Incluidos

1. **Utilidades** (`lib/utils.test.ts`)
   - ✅ formatDate
   - ✅ formatDateTime
   - ✅ calcularIMC
   - ✅ calcularEdad
   - ✅ generarId

2. **Componentes UI**
   - ✅ Button (variantes, tamaños, estados)
   - ✅ Card (props, estilos)

3. **Hooks**
   - ✅ usePacientes (fetch, create, update, delete)
   - ✅ usePaciente (fetch, update)
   - ✅ useMedidas (fetch, create)
   - ✅ useDietas (fetch, create)

### Tests E2E Incluidos

1. **Navegación** (`e2e/navigation.spec.ts`)
   - ✅ Navegación entre páginas
   - ✅ Responsive navigation

2. **Pacientes** (`e2e/pacientes.spec.ts`)
   - ✅ Lista de pacientes
   - ✅ Crear nuevo paciente
   - ✅ Ver detalles de paciente
   - ✅ Navegación entre tabs
   - ✅ Búsqueda de pacientes

3. **Dietas** (`e2e/dietas.spec.ts`)
   - ✅ Visualizar tab de dietas
   - ✅ Generar plan semanal
   - ✅ Guardar dieta

4. **Biomarcadores** (`e2e/biomarcadores.spec.ts`)
   - ✅ Visualizar tab de biomarcadores
   - ✅ Agregar nuevo biomarcador
   - ✅ Lista de biomarcadores

## 🎯 Próximos Tests a Agregar

Para expandir la cobertura, considera agregar tests para:

- [ ] Componentes de formularios (FormMedida, FormBiomarcador)
- [ ] Componente GeneradorDietas
- [ ] Hooks restantes (useBiomarcadores, useHerramientas)
- [ ] Integración con Spoonacular API
- [ ] Subida de archivos
- [ ] Validación de formularios

## 📊 Métricas de Cobertura

El proyecto tiene umbrales mínimos de cobertura configurados:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Ver reporte completo: `npm run test:coverage`

## 🔧 Configuración

### Jest

Configurado en `jest.config.js` con:
- Next.js integration
- Path aliases (@/*)
- Coverage thresholds
- Test environment (jsdom)

### Playwright

Configurado en `playwright.config.ts` con:
- Múltiples navegadores (Chrome, Firefox, Safari)
- Auto-start del servidor de desarrollo
- Screenshots en fallos
- Traces para debugging

## 💡 Tips

1. **Desarrollo**: Usa `npm run test:watch` para desarrollo activo
2. **Debugging E2E**: Usa `npm run test:e2e:ui` para ver los tests en tiempo real
3. **Cobertura**: Revisa `coverage/` después de `npm run test:coverage`
4. **CI/CD**: Los tests están listos para integrarse en pipelines

## 🐛 Troubleshooting

### Error: "Cannot find module"
Ejecuta: `npm install` para instalar todas las dependencias

### Tests E2E fallan
Asegúrate de que el servidor esté corriendo: `npm run dev`

### Timeout errors
Aumenta el timeout en `jest.config.js` o en el test específico

