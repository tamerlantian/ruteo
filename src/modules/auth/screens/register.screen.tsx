import CustomBottomSheet from '../../../shared/components/bottom-sheet/bottom-sheet';
import { DevModeSelector } from '../../../shared/components/bottom-sheet/dev-mode-selector';
import { useDevMode } from '../../../shared/context/dev-mode-context';
import { FormButton } from '../../../shared/components/ui/button/FormButton';
import { FormInputController } from '../../../shared/components/ui/form/FormInputController';
import { PasswordInputController } from '../../../shared/components/ui/form/PasswordInputController';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import BottomSheet from '@gorhom/bottom-sheet';
import CheckBox from '@react-native-community/checkbox';
import React, { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RegisterFormValues } from '../interfaces/auth.interface';
import { loginStyles } from '../styles/login.style';
import { useRegister } from '../view-models/register.view-model';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/types';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export const RegisterScreen = () => {
  // ViewModel para registro
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register, isLoading } = useRegister();

  // Contexto de modo desarrollador
  const { isDeveloperMode } = useDevMode();

  // Referencia al bottom sheet
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Función para abrir el bottom sheet
  const handleOpenDevModeSheet = () => {
    bottomSheetRef.current?.expand();
  };

  // Función para cerrar el bottom sheet
  const handleCloseDevModeSheet = () => {
    bottomSheetRef.current?.close();
  };

  // Configurar React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      username: '',
      password: '',
      aplicacion: 'reddoc',
      confirmarPassword: '',
      aceptarTerminosCondiciones: false,
    },
    mode: 'onChange',
  });

  // Obtener el valor actual de password para comparar con confirmPassword
  const password = watch('password');

  // Manejar envío del formulario
  const onSubmit = (data: RegisterFormValues) => {
    // Transformar los datos al formato esperado por el método register
    register({
      username: data.username,
      password: data.password,
      confirmarPassword: data.confirmarPassword,
      aceptarTerminosCondiciones: data.aceptarTerminosCondiciones,
      aplicacion: data.aplicacion,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Botón de modo desarrollador con indicador */}
      <TouchableOpacity style={loginStyles.devModeButton} onPress={handleOpenDevModeSheet}>
        <Ionicons name="settings" size={24} color="#666" />
        {isDeveloperMode && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: '#4CAF50',
              borderWidth: 1,
              borderColor: '#fff',
            }}
          />
        )}
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={loginStyles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* <View style={loginStyles.logoContainer}>
            <Image
              source={require('../../../../assets/images/icon.png')}
              style={loginStyles.logo}
            />
          </View> */}

          <Text style={loginStyles.title}>Crear cuenta</Text>

          {/* Campo de email */}
          <FormInputController<RegisterFormValues>
            control={control}
            name="username"
            label="Correo electrónico"
            placeholder="john.doe@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
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
          <PasswordInputController<RegisterFormValues>
            control={control}
            name="password"
            label="Contraseña"
            placeholder="**************"
            error={errors.password}
            rules={{
              required: 'La contraseña es obligatoria',
              minLength: {
                value: 6,
                message: 'La contraseña debe tener al menos 6 caracteres',
              },
            }}
          />

          {/* Campo de confirmar contraseña */}
          <PasswordInputController<RegisterFormValues>
            control={control}
            name="confirmarPassword"
            label="Confirmar contraseña"
            placeholder="**************"
            error={errors.confirmarPassword}
            rules={{
              required: 'Debes confirmar tu contraseña',
              validate: (value: string) => value === password || 'Las contraseñas no coinciden',
            }}
          />

          {/* Checkbox para términos y condiciones */}
          <Controller
            control={control}
            name="aceptarTerminosCondiciones"
            rules={{ required: 'Debes aceptar los términos y condiciones' }}
            render={({ field: { onChange, value } }) => (
              <View style={loginStyles.checkboxContainer}>
                <CheckBox
                  value={value}
                  onValueChange={onChange}
                  style={loginStyles.checkbox}
                />
                <View style={loginStyles.termsContainer}>
                  <Text style={loginStyles.termsText}>
                    Acepto los{' '}
                    <Text
                      style={loginStyles.termsLink}
                      onPress={() => console.log('Términos presionados')}
                    >
                      términos y condiciones
                    </Text>
                  </Text>
                  {errors.aceptarTerminosCondiciones && (
                    <Text style={loginStyles.errorText}>
                      {errors.aceptarTerminosCondiciones.message}
                    </Text>
                  )}
                </View>
              </View>
            )}
          />

          {/* Botón de registro */}
          <FormButton
            title="Registrarse"
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid}
            isLoading={isLoading}
          />

          {/* Enlace para iniciar sesión */}
          <View style={loginStyles.footer}>
            <Text style={loginStyles.footerText}>¿Ya tienes una cuenta?</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Login');
              }}
            >
              <Text style={loginStyles.footerLink}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>

          {isDeveloperMode && (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderRadius: 4,
                borderWidth: 1,
                alignSelf: 'center',
                borderColor: '#4CAF50',
                marginTop: 16,
              }}
            >
              <Text style={{ fontSize: 10, color: '#4CAF50', fontWeight: 'bold' }}>
                MODO DESARROLLO
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Sheet para el selector de modo desarrollador */}
        <CustomBottomSheet ref={bottomSheetRef} initialSnapPoints={['40%']}>
          <DevModeSelector onClose={handleCloseDevModeSheet} />
        </CustomBottomSheet>
      </View>
    </SafeAreaView>
  );
};
