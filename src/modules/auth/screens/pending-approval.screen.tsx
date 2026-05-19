import { Ionicons } from '@react-native-vector-icons/ionicons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../context/auth.context';
import { authColors } from '../styles/auth.theme';

/**
 * Se muestra cuando el conductor inició sesión pero su auto-registro aún está
 * pendiente de aprobación. Un super-admin debe aprobarlo y asignarlo a una
 * empresa; mientras tanto la app no tiene acceso al resto de funciones.
 */
export const PendingApprovalScreen = () => {
  const { logout } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.badge}>
            <Ionicons name="time-outline" size={15} color={authColors.brandInk} />
            <Text style={styles.badgeText}>En revisión</Text>
          </View>

          <Text style={styles.title}>Cuenta pendiente de aprobación</Text>
          <Text style={styles.subtitle}>
            Recibimos tu registro. Un administrador debe aprobar tu cuenta y
            asignarte a tu empresa antes de que puedas usar la app.
          </Text>
          <Text style={styles.hint}>
            Si ya te aprobaron, cierra sesión y vuelve a iniciar sesión.
          </Text>
        </View>

        <TouchableOpacity style={styles.cta} onPress={logout} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  content: {
    flex: 1,
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
