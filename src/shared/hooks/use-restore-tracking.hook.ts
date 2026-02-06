import { useEffect, useRef } from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectOrdenEntrega, selectSubdominio, selectDespacho } from '../../modules/settings';
import { backgroundGeolocationService } from '../services/background-geolocation.service';
import { useAuth } from '../../modules/auth/context/auth.context';
import { reportLocationTrackingError } from '../utils/sentry-helpers';

/**
 * Hook para restaurar tracking automáticamente después de Redux REHYDRATE
 *
 * Se ejecuta cuando:
 * - Redux se rehidrata con orden activa
 * - Usuario está autenticado
 *
 * NO restaura si:
 * - No hay orden activa
 * - Usuario NO está autenticado
 * - Tracking ya está activo
 */
export const useRestoreTracking = () => {
  const { user, isAuthenticated } = useAuth();
  const ordenEntrega = useAppSelector(selectOrdenEntrega);
  const subdominio = useAppSelector(selectSubdominio);
  const despacho = useAppSelector(selectDespacho);

  const hasAttemptedRestore = useRef(false);

  useEffect(() => {
    // Solo intentar restaurar UNA VEZ por sesión de app
    if (hasAttemptedRestore.current) {
      return;
    }

    // Validar precondiciones - IMPORTANTE: NO marcar como intentado si aún no se cargó el user
    if (!isAuthenticated || !user?.id) {
      console.log('🔄 [RestoreTracking] Usuario no autenticado o aún cargando, esperando...');
      return; // NO marcar hasAttemptedRestore aquí - permitir retry cuando user cargue
    }

    if (!ordenEntrega || !subdominio || !despacho) {
      console.log('🔄 [RestoreTracking] No hay orden activa, omitiendo');
      // Marcar como intentado solo si definitivamente no hay orden
      hasAttemptedRestore.current = true;
      return;
    }

    // Verificar que el servicio esté listo
    const serviceState = backgroundGeolocationService.getState();
    if (!serviceState.isEnabled) {
      console.log('🔄 [RestoreTracking] Servicio no está ready aún, esperando...');
      return; // NO marcar hasAttemptedRestore - permitir retry cuando ready esté listo
    }

    // Si ya está tracking, no hacer nada
    if (serviceState.isTracking) {
      console.log('🔄 [RestoreTracking] Tracking ya está activo, omitiendo');
      hasAttemptedRestore.current = true;
      return;
    }

    // Intentar restaurar tracking
    const restoreTracking = async () => {
      try {
        console.log('🔄 [RestoreTracking] Intentando restaurar tracking para orden:', ordenEntrega);
        console.log('🔄 [RestoreTracking] Usuario ID:', user.id);

        const restored = await backgroundGeolocationService.restoreTrackingIfNeeded();

        if (restored) {
          console.log('✅ [RestoreTracking] Tracking restaurado exitosamente');
        } else {
          console.log('⚠️ [RestoreTracking] No se pudo restaurar (puede ser normal si no había tracking activo)');
        }

        // SOLO marcar como intentado después de realmente ejecutar la restauración
        hasAttemptedRestore.current = true;
      } catch (error) {
        console.error('❌ [RestoreTracking] Error restaurando tracking:', error);

        // Report restoration errors
        reportLocationTrackingError('restoration', error, {
          hasOrdenEntrega: !!ordenEntrega,
          hasSubdominio: !!subdominio,
          hasDespacho: !!despacho,
          hasUserId: !!user?.id,
          serviceIsEnabled: serviceState.isEnabled,
        });

        hasAttemptedRestore.current = true;
      }
    };

    // Delay para asegurar que Redux Persist terminó de rehidratar
    const timeoutId = setTimeout(restoreTracking, 1000);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user?.id, ordenEntrega, subdominio, despacho]);
};
