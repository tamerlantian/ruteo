import React, { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

/** Colores de marca Ruteo — consistentes con el rediseño del login. */
const colors = {
  background: '#F8FAFC',
  ink: '#0F172A',
  brand: '#0E7BB0',
  brandSoft: '#1B9BD7',
  muted: '#94A3B8',
};

/**
 * Pantalla de carga inicial. La muestra RootNavigator mientras se resuelve
 * el estado de sesión. Anima la entrada de la marca de forma escalonada.
 */
export const SplashScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.88);
  const textOpacity = useSharedValue(0);
  const textShift = useSharedValue(14);
  const bottomOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, {
      duration: 560,
      easing: Easing.out(Easing.quad),
    });
    logoScale.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
    textOpacity.value = withDelay(240, withTiming(1, { duration: 480 }));
    textShift.value = withDelay(
      240,
      withTiming(0, { duration: 480, easing: Easing.out(Easing.cubic) }),
    );
    bottomOpacity.value = withDelay(520, withTiming(1, { duration: 420 }));
  }, [logoOpacity, logoScale, textOpacity, textShift, bottomOpacity]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textShift.value }],
  }));
  const bottomStyle = useAnimatedStyle(() => ({
    opacity: bottomOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Animated.View style={[styles.logoWrap, logoStyle]}>
          <View style={styles.glow} />
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={[styles.lockup, textStyle]}>
          <Text style={styles.wordmark}>Ruteo</Text>
          <Text style={styles.tagline}>Rutas y entregas</Text>
        </Animated.View>
      </View>

      <Animated.View
        style={[styles.bottom, bottomStyle, { paddingBottom: insets.bottom + 28 }]}
      >
        <ActivityIndicator size="small" color={colors.brand} />
        <Text style={styles.footer}>Semántica Digital</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    top: -35,
    left: -35,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.brandSoft,
    opacity: 0.09,
  },
  logo: {
    width: 170,
    height: 170,
  },
  lockup: {
    alignItems: 'center',
    marginTop: -14,
  },
  wordmark: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 5,
    letterSpacing: 0.3,
  },
  bottom: {
    alignItems: 'center',
  },
  footer: {
    marginTop: 14,
    fontSize: 12.5,
    color: colors.muted,
    letterSpacing: 0.3,
  },
});
