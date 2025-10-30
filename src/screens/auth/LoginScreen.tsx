import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {Button, Input} from '../../components';
import {Screen} from '../../navigation/AppNavigator';

interface LoginScreenProps {
  onLogin: () => void;
  navigate: (screen: Screen) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({onLogin}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});

  const validateForm = (): boolean => {
    const newErrors: {email?: string; password?: string} = {};

    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    if (!password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulamos una llamada a API
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));
      
      // Simulamos validación de credenciales
      if (email === 'admin@test.com' && password === '123456') {
        onLogin();
      } else {
        Alert.alert(
          'Error de autenticación',
          'Credenciales incorrectas. Usa: admin@test.com / 123456'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar contraseña',
      'Funcionalidad de recuperación de contraseña no implementada'
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>¡Bienvenido!</Text>
          <Text style={styles.subtitle}>
            Inicia sesión para continuar con tu cuenta
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Ingresa tu email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            showPasswordToggle
            error={errors.password}
          />

          <Button
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />

          <Button
            title="¿Olvidaste tu contraseña?"
            onPress={handleForgotPassword}
            variant="outline"
            style={styles.forgotButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Credenciales de prueba:{'\n'}
            Email: admin@test.com{'\n'}
            Contraseña: 123456
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  forgotButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});
