import { QueryClient } from '@tanstack/react-query';

// Configuración del cliente de React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo de reintento en milisegundos (por defecto es exponencial)
      retry: 1,
      // Tiempo que los datos se consideran frescos (en milisegundos)
      staleTime: 1000 * 60 * 5, // 5 minutos
      // Tiempo que los datos inactivos permanecen en caché (en milisegundos)
      gcTime: 1000 * 60 * 10, // 10 minutos
      // Refetch automático cuando la ventana recupera el foco
      refetchOnWindowFocus: true,
      // Refetch automático cuando la aplicación se reconecta
      refetchOnReconnect: true,
    },
    mutations: {
      // Número de reintentos para mutaciones fallidas
      retry: 1,
    },
  },
});
