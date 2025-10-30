import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authController } from '../controllers/auth.controller';
import { authKeys } from '../constants/auth-keys';

// Hook para manejar el logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  // const router = useRouter();

  const logoutMutation = useMutation({
    mutationFn: authController.logout,
    onSuccess: () => {
      // Limpiar el estado de autenticación y usuario
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      queryClient.setQueryData(authKeys.session(), false);
      queryClient.setQueryData(authKeys.user(), null);
      // router.replace('/(auth)/login');
    },
  });

  return {
    logout: logoutMutation.mutate,
    isLoading: logoutMutation.isPending,
    isError: logoutMutation.isError,
    error: logoutMutation.error,
  };
};
