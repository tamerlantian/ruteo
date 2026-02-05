# 🧪 Guía de Prueba: Error Boundaries

## Forma Rápida de Probar

### Paso 1: Agregar el Componente de Prueba

Abre cualquier pantalla (por ejemplo, el Dashboard) y agrega el tester:

**Archivo**: `src/modules/home/screens/dashboard/dashboard.screen.tsx`

```typescript
import { ErrorBoundaryTester } from '../../../../shared/components/error-boundary/ErrorBoundaryTester';

export const DashboardScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Agregar este componente temporalmente */}
      <ErrorBoundaryTester />

      {/* ... resto del contenido ... */}
    </SafeAreaView>
  );
};
```

### Paso 2: Ejecutar la App

```bash
# Iniciar Metro
npm start

# En otra terminal, ejecutar la app
npm run ios
# o
npm run android
```

### Paso 3: Probar los Error Boundaries

Una vez la app esté corriendo:

1. **Navega al Dashboard** (o la pantalla donde agregaste el tester)

2. **Presiona "Lanzar Error de Render"**
   - ✅ **Esperado**: Deberías ver la UI de error boundary
   - ✅ El error boundary muestra "Error en el formulario" o el nivel apropiado
   - ✅ Hay un botón "Intentar nuevamente"
   - ✅ En la consola de desarrollo, verás logs del error

3. **Presiona "Intentar nuevamente"**
   - ✅ **Esperado**: La UI se recupera y vuelve al estado normal

4. **Verifica la consola**
   - Deberías ver: `🚨 [Form Error Boundary] ... error:`

---

## Pruebas por Nivel

### Nivel 1: Root Error Boundary (App.tsx)

**Propósito**: Captura errores críticos de toda la app

**Cómo probar**:
```typescript
// Modifica temporalmente App.tsx
function AppContent() {
  throw new Error('Test root error boundary');

  return (
    <View style={styles.container}>
      <AppNavigator />
    </View>
  );
}
```

**Resultado esperado**:
- UI de error: "Algo salió mal"
- Mensaje: "La aplicación ha encontrado un error inesperado..."
- La app NO crashea completamente

---

### Nivel 2: Navigation Error Boundary (RootNavigator.tsx)

**Propósito**: Captura errores en el stack de navegación

**Cómo probar**:
```typescript
// Crea un componente que lance error en cualquier screen
const TestErrorScreen = () => {
  throw new Error('Test navigation error');
  return <Text>Never rendered</Text>;
};

// Agrega la ruta temporalmente al navigator
```

**Resultado esperado**:
- UI de error: "Error de navegación"
- El usuario puede navegar atrás
- Otras pantallas siguen funcionando

---

### Nivel 3: Form Error Boundary (Forms)

**Propósito**: Captura errores en formularios críticos

**Ya implementado en**:
- EntregaFormScreen
- NovedadFormScreen

**Cómo probar**:
1. Navega a "Formulario de entrega"
2. Agrega el ErrorBoundaryTester dentro del form
3. Presiona "Lanzar Error de Render"

**Resultado esperado**:
- UI de error: "Error en el formulario"
- Mensaje: "No se pudo procesar el formulario..."
- El resto de la app sigue funcionando

---

## Verificación de Comportamiento en Producción vs Desarrollo

### En Desarrollo (__DEV__ = true)
- ✅ Muestra stack traces completos
- ✅ Muestra "Detalles del error (solo en desarrollo)"
- ✅ Muestra componentStack
- ✅ Logs detallados en consola

### En Producción (__DEV__ = false)
- ✅ NO muestra stack traces (por seguridad)
- ✅ Solo muestra mensaje amigable
- ✅ Error es logged internamente
- ✅ TODO: Enviar a Sentry

**Cómo probar modo producción**:
```typescript
// Modifica temporalmente fallback-error.component.tsx
const isProduction = true; // !__DEV__;

// Luego vuelve a cambiarlo a:
// const isProduction = !__DEV__;
```

---

## Casos que NO son Capturados (Esperado)

Los error boundaries **NO** capturan:

### 1. Errores en Event Handlers
```typescript
// ❌ NO capturado
const handlePress = () => {
  throw new Error('Error in handler');
};

// ✅ Solución: usar try-catch
const handlePress = () => {
  try {
    // código que puede fallar
  } catch (error) {
    console.error('Error caught in handler:', error);
  }
};
```

### 2. Errores Asíncronos
```typescript
// ❌ NO capturado
setTimeout(() => {
  throw new Error('Async error');
}, 1000);

// ✅ Solución: usar try-catch en async/await
const fetchData = async () => {
  try {
    const result = await api.getData();
  } catch (error) {
    console.error('Async error caught:', error);
  }
};
```

### 3. Errores en el Error Boundary mismo
```typescript
// ❌ Si el error boundary tiene un bug, no se puede capturar a sí mismo
```

---

## Checklist de Verificación

Antes de considerar completada la implementación:

- [ ] ✅ Error boundary en App.tsx captura errores root
- [ ] ✅ Error boundary en RootNavigator captura errores de navegación
- [ ] ✅ Error boundary en EntregaFormScreen captura errores del form
- [ ] ✅ Error boundary en NovedadFormScreen captura errores del form
- [ ] ✅ UI de fallback se muestra correctamente
- [ ] ✅ Botón "Intentar nuevamente" funciona
- [ ] ✅ Diferentes niveles muestran mensajes apropiados
- [ ] ✅ Stack traces solo se muestran en desarrollo
- [ ] ✅ Errores se loggean en consola
- [ ] ✅ Custom error handlers son llamados (onError)
- [ ] ✅ La app NO crashea completamente ante errores

---

## Limpiar Después de Probar

**IMPORTANTE**: Recuerda eliminar el ErrorBoundaryTester antes de producción:

```bash
# Buscar todas las importaciones del tester
grep -r "ErrorBoundaryTester" src/

# Eliminar las importaciones y el componente <ErrorBoundaryTester />
```

O simplemente elimina el archivo:
```bash
rm src/shared/components/error-boundary/ErrorBoundaryTester.tsx
```

---

## Próximos Pasos

Una vez verificado que los error boundaries funcionan:

1. **Integrar Sentry** (Task #3)
   - Descomentar las llamadas a Sentry.captureException()
   - Configurar DSN en variables de entorno
   - Probar que errores se reportan correctamente

2. **Agregar más error boundaries** si es necesario
   - Screens complejas
   - Componentes críticos
   - Áreas propensas a errores

3. **Documentar patrones** para el equipo
   - Cuándo agregar error boundaries
   - Cómo manejar errores en event handlers
   - Mejores prácticas de error handling

---

## Recursos

- [React Error Boundaries Docs](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React Native Error Handling](https://reactnative.dev/docs/error-handling)
- Código de ejemplo: `src/shared/components/error-boundary/`
