import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

interface SyncBannerProps {
  /** Cantidad de entregas guardadas pendientes de enviar al servidor. */
  pendientes: number;
  /** True mientras se está sincronizando (deshabilita el botón). */
  isSyncing?: boolean;
  /** Dispara la sincronización de toda la cola. */
  onSincronizar: () => void;
  /** Abre el filtro "Sincronizar" para ver el detalle. */
  onVerPendientes: () => void;
}

/**
 * Barra fija que da visibilidad CONSTANTE a las entregas que quedaron
 * guardadas sin enviar (offline / servidor ocupado). Sin esto, el conductor
 * depende de descubrir el filtro "Sincronizar" por su cuenta. El cuerpo es
 * tappable (lleva al filtro) y trae una acción directa "Sincronizar ahora".
 */
export const SyncBanner: React.FC<SyncBannerProps> = ({
  pendientes,
  isSyncing = false,
  onSincronizar,
  onVerPendientes,
}) => {
  if (pendientes <= 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.info}
        onPress={onVerPendientes}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${pendientes} entregas sin sincronizar, ver detalle`}
      >
        <Ionicons name="cloud-offline-outline" size={18} color="#B45309" />
        <Text style={styles.text} numberOfLines={1}>
          <Text style={styles.count}>{pendientes}</Text>
          {pendientes === 1
            ? ' entrega sin sincronizar'
            : ' entregas sin sincronizar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isSyncing && styles.buttonDisabled]}
        onPress={onSincronizar}
        disabled={isSyncing}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Sincronizar ahora"
      >
        {isSyncing ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="sync" size={14} color="#FFFFFF" />
            <Text style={styles.buttonText}>Sincronizar</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
  },
  count: {
    fontWeight: '800',
    color: '#B45309',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F59E0B',
    minWidth: 96,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
