import BottomSheet from '@gorhom/bottom-sheet';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import CustomBottomSheet from '../../../shared/components/bottom-sheet/bottom-sheet';
import { DevModeSelector } from '../../../shared/components/bottom-sheet/dev-mode-selector';
import { useDevMode } from '../../../shared/context/dev-mode-context';
import appInfoService from '../../../shared/services/app-info.service';
import { useAuthNavigation } from '../../../navigation/hooks';
import { AuthTextField } from '../components/AuthTextField';
import { useLogin } from '../hooks/useLogin';
import { LoginFormValues } from '../interfaces/auth.interface';
import { authColors } from '../styles/auth.theme';

export const LoginScreen = () => {
  // ViewModel para login
  const { login, isLoading } = useLogin();
  const navigation = useAuthNavigation();

  // Contexto de modo desarrollador
  const { isLoading: isDevModeLoading, isDeveloperMode } = useDevMode();

  // Referencia al bottom sheet
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Insets del área segura (notch / barra de estado)
  const insets = useSafeAreaInsets();

  const handleOpenDevModeSheet = () => {
    bottomSheetRef.current?.expand();
  };

  const handleCloseDevModeSheet = () => {
    bottomSheetRef.current?.close();
  };

  // Configurar React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    defaultValues: {
      username: '',
      password: '',
    },
    mode: 'onChange',
  });

  // Manejar envío del formulario
  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      // Si el login es exitoso, el AuthProvider se encargará de la navegación automática
      // No necesitamos navegar manualmente porque isAuthenticated cambiará a true
      console.log('Login exitoso, navegación automática por AuthProvider');
    } catch (error) {
      console.error('Error durante el login:', error);
      // El error ya se maneja en el hook useLogin con toast
    }
  };

  // Mostrar loading mientras se inicializa el contexto de modo desarrollador
  if (isDevModeLoading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color={authColors.brand} />
        <Text style={styles.loadingText}>Inicializando…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Botón de modo desarrollador con indicador */}
      <TouchableOpacity
        style={[styles.devButton, { top: insets.top + 8 }]}
        onPress={handleOpenDevModeSheet}
        activeOpacity={0.7}
      >
        <Ionicons name="settings-outline" size={20} color={authColors.inkSoft} />
        {isDeveloperMode && <View style={styles.devDot} />}
      </TouchableOpacity>

      <View style={styles.body}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Marca */}
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>
            Inicia sesión para gestionar tus entregas
          </Text>

          {/* Campo de correo */}
          <AuthTextField<LoginFormValues>
            control={control}
            name="username"
            label="Correo electrónico"
            icon="mail-outline"
            placeholder="tucorreo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            error={errors.username}
            rules={{
              required: 'El correo electrónico es obligatorio',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Correo electrónico inválido',
              },
            }}
          />

          {/* Campo de contraseña */}
          <AuthTextField<LoginFormValues>
            control={control}
            name="password"
            label="Contraseña"
            icon="lock-closed-outline"
            placeholder="••••••••••"
            secure
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            error={errors.password}
            rules={{
              required: 'La contraseña es obligatoria',
              minLength: {
                value: 6,
                message: 'La contraseña debe tener al menos 6 caracteres',
              },
            }}
          />

          {/* Enlace para recuperar contraseña */}
          <TouchableOpacity
            style={styles.forgot}
            onPress={() => navigation.navigate('ForgotPassword')}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Botón de login */}
          <TouchableOpacity
            style={[styles.cta, !isValid && styles.ctaDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.ctaContent}>
                <Text
                  style={[styles.ctaText, !isValid && styles.ctaTextDisabled]}
                >
                  Iniciar sesión
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={isValid ? '#fff' : authColors.inkMuted}
                  style={styles.ctaArrow}
                />
              </View>
            )}
          </TouchableOpacity>

          {/* Enlace para registrarse */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>

          {isDeveloperMode && (
            <View style={styles.devBadge}>
              <Text style={styles.devBadgeText}>MODO PRUEBAS</Text>
            </View>
          )}

          {/* Versión de la aplicación */}
          <Text style={styles.version}>
            {appInfoService.getFormattedVersion()}
          </Text>
        </ScrollView>

        {/* Bottom Sheet para el selector de modo desarrollador */}
        <CustomBottomSheet
          ref={bottomSheetRef}
          enableDynamicSizing={false}
          initialSnapPoints={['27%']}
        >
          <DevModeSelector onClose={handleCloseDevModeSheet} />
        </CustomBottomSheet>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  body: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: authColors.background,
  },
  loadingText: {
    marginTop: 14,
    color: authColors.inkSoft,
    fontSize: 14,
  },

  devButton: {
    position: 'absolute',
    right: 20,
    zIndex: 100,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: authColors.border,
  },
  devDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  logo: {
    width: 136,
    height: 136,
    alignSelf: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: authColors.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14.5,
    color: authColors.inkSoft,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 20,
  },

  forgot: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    marginTop: 2,
    marginBottom: 22,
  },
  forgotText: {
    color: authColors.brandInk,
    fontSize: 13.5,
    fontWeight: '600',
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
  ctaDisabled: {
    backgroundColor: authColors.disabled,
    shadowOpacity: 0,
    elevation: 0,
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
  ctaTextDisabled: {
    color: authColors.inkMuted,
  },
  ctaArrow: {
    marginLeft: 8,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
    color: authColors.inkSoft,
  },
  footerLink: {
    fontSize: 14,
    color: authColors.brandInk,
    fontWeight: '700',
  },

  devBadge: {
    alignSelf: 'center',
    marginTop: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
    backgroundColor: '#ECFDF5',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  devBadgeText: {
    fontSize: 10.5,
    color: '#059669',
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  version: {
    alignSelf: 'center',
    marginTop: 16,
    fontSize: 12,
    color: authColors.inkMuted,
  },
});
