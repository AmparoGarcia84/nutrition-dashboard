# Guía de Testing

Este proyecto incluye tests unitarios y tests end-to-end (E2E) para asegurar la calidad del código.

## Configuración

### Instalación

```bash
npm install
```

### Dependencias de Testing

- **Jest**: Framework de testing unitario
- **React Testing Library**: Para testing de componentes React
- **Playwright**: Para tests E2E

## Tests Unitarios

Los tests unitarios se encuentran en la carpeta `__tests__/` y cubren:

- **Utilidades** (`__tests__/lib/utils.test.ts`): Funciones de utilidad como formateo de fechas, cálculo de IMC, etc.
- **Componentes UI** (`__tests__/components/ui/`): Componentes reutilizables como Button, Card, etc.
- **Hooks** (`__tests__/lib/hooks/`): Custom hooks como usePacientes, useMedidas, useDietas, etc.

### Ejecutar Tests Unitarios

```bash
# Ejecutar todos los tests
npm test

# Ejecutar en modo watch
npm run test:watch

# Ejecutar con cobertura
npm run test:coverage
```

### Estructura de Tests Unitarios

```
__tests__/
├── lib/
│   ├── utils.test.ts
│   └── hooks/
│       ├── usePacientes.test.ts
│       ├── useMedidas.test.ts
│       └── useDietas.test.ts
└── components/
    └── ui/
        ├── Button.test.tsx
        └── Card.test.tsx
```

## Tests End-to-End (E2E)

Los tests E2E se encuentran en la carpeta `e2e/` y cubren flujos completos de la aplicación:

- **Navegación** (`e2e/navigation.spec.ts`): Navegación entre páginas
- **Pacientes** (`e2e/pacientes.spec.ts`): Flujo completo de gestión de pacientes
- **Dietas** (`e2e/dietas.spec.ts`): Generación y guardado de dietas
- **Biomarcadores** (`e2e/biomarcadores.spec.ts`): Gestión de biomarcadores

### Ejecutar Tests E2E

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar con UI interactiva
npm run test:e2e:ui

# Ejecutar en modo headed (con navegador visible)
npm run test:e2e:headed
```

### Estructura de Tests E2E

```
e2e/
├── navigation.spec.ts
├── pacientes.spec.ts
├── dietas.spec.ts
└── biomarcadores.spec.ts
```

## Cobertura de Tests

El proyecto tiene configurado un umbral mínimo de cobertura:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

Para ver el reporte de cobertura:

```bash
npm run test:coverage
```

El reporte se generará en la carpeta `coverage/`.

## Escribir Nuevos Tests

### Test Unitario

```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Test E2E

```typescript
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

## Mocks

Los mocks se configuran en `jest.setup.js`:

- **Next.js Router**: Mockeado para tests de componentes
- **Supabase Client**: Mockeado para tests de hooks
- **Environment Variables**: Configuradas con valores de test

## CI/CD

Los tests se pueden integrar en pipelines de CI/CD. Ejemplo para GitHub Actions:

```yaml
- name: Run unit tests
  run: npm test

- name: Run E2E tests
  run: npm run test:e2e
```

## Troubleshooting

### Tests fallan por timeouts

Aumenta el timeout en `jest.config.js` o en el test específico:

```javascript
jest.setTimeout(10000); // 10 segundos
```

### Tests E2E no encuentran elementos

Asegúrate de que el servidor de desarrollo esté corriendo o usa `webServer` en `playwright.config.ts`.

### Problemas con mocks

Verifica que los mocks en `jest.setup.js` estén correctamente configurados para tu caso de uso.

