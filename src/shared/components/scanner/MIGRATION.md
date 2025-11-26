# Migración a react-native-vision-camera

Este documento describe la migración del componente Scanner de `react-native-camera-kit` a `react-native-vision-camera`.

## Cambios Realizados

### Nuevos Componentes

1. **ScannerModalVision** - Modal de escaneo usando Vision Camera
2. **ScannerVision** - Componente principal alternativo con Vision Camera
3. **useScannerVision** - Hook con manejo avanzado de permisos

### Componente Principal Actualizado

El componente `Scanner` principal ahora usa `react-native-vision-camera` por defecto, manteniendo la misma API para compatibilidad.

### Configuración Requerida

#### Android
- Agregado `VisionCamera_enableCodeScanner=true` en `gradle.properties`
- No requiere permisos CAMERA en AndroidManifest.xml (manejados automáticamente)

#### iOS
- `NSCameraUsageDescription` ya configurado en Info.plist
- No requiere configuración adicional

### Características Implementadas

- **Manejo de Permisos**: Control explícito con `useCameraPermission()`
- **Múltiples Formatos**: QR, EAN-13/8, Code-128/39/93, UPC-A/E, PDF-417, etc.
- **UI Consistente**: Mantiene el mismo diseño y overlay del scanner original
- **Error Handling**: Manejo robusto de errores y estados de carga
- **Compatibilidad**: API idéntica para migración sin cambios

### Mejoras sobre Camera-Kit

- **Performance**: Renderizado nativo más eficiente
- **Control de Permisos**: Manejo granular y explícito
- **Debugging**: Logs detallados y mejor manejo de errores
- **Futuro-proof**: Librería moderna y activamente mantenida
- **Flexibilidad**: Configuración avanzada de tipos de códigos

### API de Migración

```typescript
// Antes y después - API idéntica
import { Scanner } from '@/shared/components/scanner';

// Uso sin cambios
<Scanner onScanResult={handleScanResult} disabled={loading} />
```

### Estados Manejados

- Loading de inicialización de cámara
- Permisos denegados con UI específica
- Error de dispositivo no encontrado
- Prevención de múltiples escaneos
- Cleanup automático de timeouts

### Archivos Creados

- `scanner-modal-vision.component.tsx`
- `scanner-vision.component.tsx`
- `use-scanner-vision.hook.ts`
- `MIGRATION.md` (este archivo)

### Archivos Modificados

- `scanner.component.tsx` - Actualizado para usar Vision Camera
- `index.ts` - Exports actualizados
- `android/gradle.properties` - Configuración VisionCamera

## Uso

El componente funciona exactamente igual que antes:

```typescript
import { Scanner } from '@/shared/components/scanner';

const MyComponent = () => {
  const handleScanResult = (result: ScanResult) => {
    console.log('Scanned:', result.value, result.type);
  };

  return (
    <Scanner 
      onScanResult={handleScanResult} 
      disabled={false} 
    />
  );
};
```

## Beneficios

- ✅ Mejor performance y estabilidad
- ✅ Manejo de permisos más robusto
- ✅ Soporte para más tipos de códigos
- ✅ Librería moderna y mantenida
- ✅ API compatible sin breaking changes
- ✅ Mejor debugging y error handling
