# 📱 Navegación - Arquitectura Modular

Esta carpeta contiene toda la configuración de navegación de la aplicación siguiendo principios de arquitectura modular y buenas prácticas.

## 🏗️ Estructura

```
src/navigation/
├── AppNavigator.tsx          # Navegador principal con NavigationContainer
├── README.md                 # Esta documentación
├── index.ts                  # Barrel exports
├── types.ts                  # Tipos de navegación centralizados
├── navigators/               # Navegadores modulares
│   ├── index.ts             # Barrel exports de navegadores
│   ├── AuthNavigator.tsx    # Stack de autenticación
│   ├── MainNavigator.tsx    # Stack principal autenticado
│   └── RootNavigator.tsx    # Navegador raíz (Auth/Main)
└── hooks/                   # Hooks tipados de navegación
    ├── index.ts            # Barrel exports de hooks
    └── useTypedNavigation.ts # Hooks tipados por contexto
```

## 🎯 Principios de Diseño

### ✅ Separación de Responsabilidades
- **AppNavigator**: Solo contiene NavigationContainer y RootNavigator
- **RootNavigator**: Maneja Auth vs Main basado en autenticación
- **AuthNavigator**: Stack completo de autenticación
- **MainNavigator**: Stack completo de aplicación autenticada

### ✅ Tipado Fuerte
- Todos los navegadores están completamente tipados
- Hooks específicos para cada contexto de navegación
- Tipos centralizados y bien documentados

### ✅ Modularidad
- Cada navegador es independiente y reutilizable
- Barrel exports para importaciones limpias
- Hooks especializados por contexto

## 🚀 Uso

### Navegación desde Auth
```typescript
import { useAuthNavigation } from 'navigation/hooks';

const LoginScreen = () => {
  const navigation = useAuthNavigation();
  
  // Navegación automática por AuthProvider
  // No necesitas navegar manualmente después del login
};
```

### Navegación desde Main Stack
```typescript
import { useMainNavigation } from 'navigation/hooks';

const SomeScreen = () => {
  const navigation = useMainNavigation();
  
  navigation.navigate('EntregaForm', { 
    visitasSeleccionadas: ['id1', 'id2'] 
  });
};
```

### Navegación desde Tabs
```typescript
import { useTabNavigation } from 'navigation/hooks';

const DashboardScreen = () => {
  const navigation = useTabNavigation();
  
  // Puede navegar a cualquier tab o pantalla del Main Stack
  navigation.navigate('Visitas');
  navigation.navigate('EntregaForm', { visitasSeleccionadas: [] });
};
```

## 🔄 Flujo de Navegación

```
App Start
    ↓
AppNavigator (NavigationContainer)
    ↓
RootNavigator
    ↓
┌─────────────────┬─────────────────┐
│   Auth Stack    │   Main Stack    │
│                 │                 │
│ • Login         │ • HomeTabs      │
│ • Register      │   ├─ Dashboard  │
│ • ForgotPass    │   ├─ Visitas    │
│                 │   └─ Profile    │
│                 │ • EntregaForm   │
└─────────────────┴─────────────────┘
```

## 🎨 Beneficios

1. **Mantenibilidad**: Cada navegador es independiente
2. **Escalabilidad**: Fácil agregar nuevos stacks o pantallas
3. **Tipado**: Navegación completamente tipada
4. **Reutilización**: Hooks especializados por contexto
5. **Organización**: Estructura clara y predecible
6. **Performance**: Lazy loading y optimizaciones automáticas

## 📝 Convenciones

- **Nombres**: PascalCase para navegadores, camelCase para hooks
- **Archivos**: Un navegador por archivo
- **Tipos**: Centralizados en `types.ts`
- **Exports**: Siempre usar barrel exports
- **Documentación**: JSDoc en todos los navegadores públicos

## 🔧 Extensión

Para agregar un nuevo stack:

1. Crear el navegador en `navigators/`
2. Agregar tipos en `types.ts`
3. Crear hook tipado en `hooks/`
4. Exportar en los `index.ts` correspondientes
5. Integrar en `RootNavigator` si es necesario
