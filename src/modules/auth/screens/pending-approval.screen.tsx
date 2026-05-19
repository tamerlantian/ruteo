import { Ionicons } from '@react-native-vector-icons/ionicons';
import React, { useCallback, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../context/auth.context';
import { authColors } from '../styles/auth.theme';

/**
 * Se muestra cuando el usuario inició sesión pero no puede usar la app:
 * - registro pendiente de aprobación (estado === 'pendiente'), o
 * - cuenta sin acceso móvil en ningún contenedor (acceso_movil === false).
 * Desliza hacia abajo para re-consultar el estado; si ya fue aprobado,
 * RootNavigator lo deja entrar automáticamente.
 */
export const PendingApprovalScreen = () => {
  const { logout, user, refreshUser } = useAuth();
  const [refrescando, setRefrescando] = useState(false);
  const esPendiente = user?.estado === 'pendiente';

  const onRefresh = useCallback(async () => {
    setRefrescando(true);
    await refreshUser();
    setRefrescando(false);
  }, [refreshUser]);

  const contenido = esPendiente
    ? {
        icono: 'time-outline' as const,
        badge: 'En revisión',
        titulo: 'Cuenta pendiente de aprobación',
        mensaje:
          'Recibimos tu registro. Un administrador debe aprobar tu cuenta y asignarte a tu empresa antes de que puedas usar la app.',
        hint: 'Desliza hacia abajo para comprobar si ya fue aprobada.',
      }
    : {
        icono: 'lock-closed-outline' as const,
        badge: 'Sin acceso',
        titulo: 'No tienes acceso a la app',
        mensaje:
          'Tu cuenta no tiene permiso para usar esta app. Contacta al administrador de tu empresa para que te habilite el acceso.',
        hint: 'Desliza hacia abajo para volver a comprobar tu acceso.',
      };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={onRefresh}
            tintColor={authColors.brandInk}
            colors={[authColors.brandInk]}
          />
        }
      >
        <View style={styles.hero}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.badge}>
            <Ionicons
              name={contenido.icono}
              size={15}
              color={authColors.brandInk}
            />
            <Text style={styles.badgeText}>{contenido.badge}</Text>
          </View>

          <Text style={styles.title}>{contenido.titulo}</Text>
          <Text style={styles.subtitle}>{contenido.mensaje}</Text>
          <Text style={styles.hint}>{contenido.hint}</Text>
        </View>

        <TouchableOpacity style={styles.cta} onPress={logout} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 116,
    height: 116,
    marginBottom: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(14, 123, 176, 0.10)',
    marginBottom: 18,
  },
  badgeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: authColors.brandInk,
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: authColors.ink,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 14.5,
    color: authColors.inkSoft,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 10,
  },
  hint: {
    fontSize: 13,
    color: authColors.inkMuted,
    textAlign: 'center',
    marginTop: 14,
  },
  cta: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: authColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: authColors.inkSoft,
  },
});
