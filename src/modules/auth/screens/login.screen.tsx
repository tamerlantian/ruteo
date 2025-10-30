// import CustomBottomSheet from '@/shared/components/bottom-sheet/bottom-sheet';
// import { DevModeSelector } from '@/shared/components/bottom-sheet/dev-mode-selector';
// import { FormButton } from '@/shared/components/ui/button/FormButton';
// import { FormInputController } from '@/shared/components/ui/form/FormInputController';
// import { PasswordInputController } from '@/shared/components/ui/form/PasswordInputController';
// import { useDevMode } from '@/shared/context/dev-mode-context';
// import { Ionicons } from '@react-native-vector-icons/ionicons';
// import BottomSheet from '@gorhom/bottom-sheet';
// import React, { useRef } from 'react';
// import { useForm } from 'react-hook-form';
// import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { LoginFormValues } from '../interfaces/auth.interface';
// import { loginStyles } from '../styles/login.style';
// import { useLogin } from '../view-models/login.view-model';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AuthStackParamList } from '../../../navigation/types';

// import { useNavigation } from "@react-navigation/native";
import { useLogin } from "../view-models/login.view-model";
import { useForm } from "react-hook-form";
import { LoginFormValues } from "../interfaces/auth.interface";
import { AuthStackParamList } from "../../../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { loginStyles } from "../styles/login.style";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { FormInputController } from "../../../common/components/ui/form/FormInputController";
import { PasswordInputController } from "../../../common/components/ui/form/PasswordInputController";
import { FormButton } from "../../../common/components/ui/button/FormButton";
import { useRef } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import CustomBottomSheet from "../../../common/components/bottom-sheet/bottom-sheet";
import {Ionicons} from "@react-native-vector-icons/ionicons";

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  // ViewModel para login
  const { } = useLogin();
  // const navigation = useNavigation<LoginScreenNavigationProp>();

  // Contexto de modo desarrollador
  // const { isLoading: isDevModeLoading, isDeveloperMode } = useDevMode();
  const isLoading = false;
  const isDeveloperMode = false;
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
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    defaultValues: {
      username: '',
      password: '',
      proyecto: 'REDDOC',
    },
    mode: 'onChange',
  });

  // Manejar envío del formulario
  const onSubmit = (data: LoginFormValues) => {
    // login(data);
  };

  // Mostrar loading mientras se inicializa el contexto de modo desarrollador
  // if (isDevModeLoading) {
  //   return (
  //     <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" color="#0066cc" />
  //       <Text style={{ marginTop: 16, color: '#666' }}>Inicializando...</Text>
  //     </SafeAreaView>
  //   );
  // }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Botón de modo desarrollador con indicador */}
      <TouchableOpacity style={loginStyles.devModeButton} onPress={handleOpenDevModeSheet}>
        <Ionicons name="home" size={24} color="#666" />
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
          <View style={loginStyles.logoContainer}>
            {/* <Image
              source={require('../../../../assets/images/icon.png')}
              style={loginStyles.logo}
            /> */}
          </View>

          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 30,
            }}
          >
            <Text style={loginStyles.title}>Iniciar sesión</Text>
          </View>

          {/* Campo de email */}
          <FormInputController<LoginFormValues>
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
          <PasswordInputController<LoginFormValues>
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
          {/* Enlace para recuperar contraseña */}
          <TouchableOpacity
            style={loginStyles.forgotPassword}
            onPress={() => {
              // navigation.navigate('ForgotPassword');
            }}
          >
            <Text style={loginStyles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Botón de login */}
          <FormButton
            title="Iniciar sesión"
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid}
            isLoading={isLoading}
          />

          {/* Enlace para registrarse */}
          <View style={loginStyles.footer}>
            <Text style={loginStyles.footerText}>¿No tienes una cuenta?</Text>
            <TouchableOpacity
              onPress={() => {
                // navigation.navigate('Register');
              }}
            >
              <Text style={loginStyles.footerLink}>Regístrate</Text>
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
        <CustomBottomSheet ref={bottomSheetRef} initialSnapPoints={['30%', '50%']}>
          {/* <DevModeSelector onClose={handleCloseDevModeSheet} /> */}
          <Text>Bottom Sheet</Text>
        </CustomBottomSheet>
      </View>
    </SafeAreaView>
  );
};
