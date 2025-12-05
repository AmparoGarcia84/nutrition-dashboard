# Correcciones Aplicadas a los Tests

## Problemas Corregidos

### 1. Tests de Utilidades (`utils.test.ts`)
- ✅ **Formato de fechas**: Cambiado a usar expresiones regulares flexibles en lugar de valores exactos, ya que `toLocaleDateString` puede variar según el entorno
- ✅ **Cálculo de IMC**: Cambiado a usar `toBeCloseTo` para manejar decimales correctamente

### 2. Tests de Card Component (`Card.test.tsx`)
- ✅ **Padding "none"**: Corregido para verificar que no tiene clases de padding en lugar de buscar `p-0`
- ✅ Agregados tests para todos los valores de padding (sm, md, lg)

### 3. Tests de Hooks
- ✅ **Mocks de Supabase**: Mejorados para evitar conflictos entre mocks globales y específicos
- ✅ **usePaciente update**: Corregido para verificar que `fetchPaciente` se llama después de actualizar
- ✅ Agregado `mockClear()` en beforeEach para evitar interferencias entre tests

### 4. Configuración de Jest
- ✅ Simplificado el mock global de Supabase en `jest.setup.js`
- ✅ Los mocks específicos en cada test pueden sobrescribir el mock global

## Cómo Ejecutar los Tests

```bash
# Ejecutar todos los tests
npm test

# Ver qué tests están fallando
npm test -- --verbose

# Ejecutar un test específico
npm test -- utils.test.ts

# Modo watch para desarrollo
npm run test:watch
```

## Si Aún Hay Fallos

1. **Verifica que todas las dependencias estén instaladas**:
   ```bash
   npm install
   ```

2. **Limpia la caché de Jest**:
   ```bash
   npm test -- --clearCache
   ```

3. **Ejecuta con más información**:
   ```bash
   npm test -- --verbose --no-coverage
   ```

4. **Revisa los errores específicos** y ajusta los mocks según sea necesario

