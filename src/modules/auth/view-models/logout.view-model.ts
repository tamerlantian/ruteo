import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authController } from '../controllers/auth.controller';
import { authKeys } from '../constants/auth-keys';
import { useAppDispatch } from '../../../store/hooks';
import { clearSettingsThunk, resetSettings } from '../../settings';
import { removerVisitas, limpiarSeleccionVisitas } from '../../visita/store/slice/visita.slice';
import { persistor } from '../../../store';

// Hook para manejar el logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // 1. Logout del servidor y limpiar tokens de auth
      await authController.logout();
      
      // 2. Limpiar settings del storage y Redux
      await dispatch(clearSettingsThunk());
      dispatch(resetSettings());
      
      // 3. Limpiar datos de visitas
      dispatch(removerVisitas());
      dispatch(limpiarSeleccionVisitas());
      
      // 4. Limpiar React Query cache
      queryClient.clear();
      
      // 5. Purgar Redux Persist
      await persistor.purge();
      
      return true;
    },
    onSuccess: () => {
      // Limpiar el estado de autenticación y usuario inmediatamente
      queryClient.setQueryData(authKeys.session(), false);
      queryClient.setQueryData(authKeys.user(), null);
      
      // Invalidar queries para limpiar cache
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: (error) => {
      console.error('Error during logout:', error);
      // Aún si hay error, intentamos limpiar lo que podamos
      queryClient.setQueryData(authKeys.session(), false);
      queryClient.setQueryData(authKeys.user(), null);
    },
  });

  return {
    logout: logoutMutation.mutate,
    isLoading: logoutMutation.isPending,
    isError: logoutMutation.isError,
    error: logoutMutation.error,
  };
};
