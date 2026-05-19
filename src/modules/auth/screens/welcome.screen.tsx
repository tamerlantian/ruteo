import { Ionicons } from '@react-native-vector-icons/ionicons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthNavigation } from '../../../navigation/hooks';
import { markWelcomeSeen } from '../hooks/useWelcomeSeen';
import { authColors } from '../styles/auth.theme';

/**
 * Pantalla de bienvenida. Se muestra solo en la primera apertura de la app
 * (ver useWelcomeSeen / AuthNavigator). Al continuar marca el flag y pasa a Login.
 */
export const WelcomeScreen = () => {
  const navigation = useAuthNavigation();
  const [saving, setSaving] = useState(false);

  const handleStart = async () => {
    setSaving(true);
    try {
      await markWelcomeSeen();
    } catch {
      // Si falla el guardado seguimos igual: no bloqueamos el ingreso.
    }
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Bienvenido a Ruteo</Text>
          <Text style={styles.subtitle}>
            Tu ruta del día, tus entregas y novedades en un solo lugar.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cta}
          onPress={handleStart}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.ctaContent}>
              <Text style={styles.ctaText}>Comenzar</Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#fff"
                style={styles.ctaArrow}
              />
            </View>
          )}
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
    width: 152,
    height: 152,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: authColors.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: authColors.inkSoft,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
    paddingHorizontal: 8,
  },
  cta: {
    height: 54,
    borderRadius: 14,
    backgroundColor: authColors.brandInk,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: authColors.brandInk,
    shadowOpacity: 0.33,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 6,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  ctaArrow: {
    marginLeft: 8,
  },
});
