# Arquitectura Modular - Ruteo App

## 📁 Estructura de Carpetas

```
src/
├── components/           # Componentes reutilizables
│   ├── common/          # Componentes básicos (Button, Input, etc.)
│   └── index.ts         # Exportaciones principales
├── screens/             # Pantallas de la aplicación
│   ├── auth/           # Pantallas de autenticación
│   │   ├── LoginScreen.tsx
│   │   └── index.ts
│   ├── main/           # Pantallas principales
│   │   ├── HomeScreen.tsx
│   │   └── index.ts
│   └── index.ts
├── navigation/          # Configuración de navegación
│   ├── AppNavigator.tsx # Navegador principal
│   └── index.ts
├── types/              # Definiciones de tipos TypeScript
│   ├── navigation.ts   # Tipos para navegación
│   └── index.ts
└── index.ts            # Punto de entrada principal
```

## 🚀 Características

### Componentes Reutilizables
- **Button**: Botón personalizable con variantes (primary, secondary, outline)
- **Input**: Campo de entrada con validación y soporte para contraseñas

### Pantallas
- **LoginScreen**: Pantalla de inicio de sesión con validación
- **HomeScreen**: Dashboard principal con estadísticas y acciones rápidas

### Navegación
- Sistema de navegación personalizado (compatible con React Navigation)
- Manejo de estado de autenticación
- Transiciones suaves entre pantallas

## 🔧 Uso

### Credenciales de Prueba
- **Email**: admin@test.com
- **Contraseña**: 123456

### Instalación de React Navigation (Opcional)
Para usar React Navigation en lugar del navegador personalizado:

```bash
npm install @react-navigation/native @react-navigation/native-stack react-native-screens
```

### Ejecutar la App
```bash
npm start
npm run ios    # Para iOS
npm run android # Para Android
```

## 📱 Funcionalidades

### Pantalla de Login
- Validación de formularios
- Manejo de errores
- Indicador de carga
- Toggle para mostrar/ocultar contraseña
- Diseño responsive

### Pantalla Home
- Dashboard con estadísticas
- Botones de acción rápida
- Confirmación para cerrar sesión
- Diseño modular y escalable

## 🎨 Diseño

- **Colores**: Paleta iOS-style con azul primario (#007AFF)
- **Tipografía**: San Francisco (iOS) / Roboto (Android)
- **Componentes**: Diseño moderno con bordes redondeados y sombras
- **Responsive**: Adaptable a diferentes tamaños de pantalla

## 🔄 Próximos Pasos

1. Integrar React Navigation para navegación avanzada
2. Agregar manejo de estado global (Redux/Zustand)
3. Implementar autenticación real con API
4. Agregar más pantallas y funcionalidades
5. Implementar testing unitario
