import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAuth } from '../../auth/screens/auth-provider';
import { usePermissions } from '../../../shared/hooks/usePermissions';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { FormButton } from '../../../shared/components/ui/button/FormButton';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen = () => {
  const { logout, user } = useAuth();
  const navigation = useNavigation<HomeNavigationProp>();
  const { 
    permissionsGranted, 
    permissionsChecked, 
    isRequestingPermissions 
  } = usePermissions();

  const handleLogout = async () => {
    try {
      await logout();
      // Si el logout es exitoso, redirigir al stack de autenticación
      navigation.navigate('Auth');
    } catch (error) {
      console.error('Error durante el logout:', error);
      // Aún si hay error, intentar redirigir (el logout puede haber limpiado datos localmente)
      navigation.navigate('Auth');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Home</Text>
        
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>
              Bienvenido, {user.correo || user.username}
            </Text>
          </View>
        )}

        {/* Indicador de estado de permisos */}
        {permissionsChecked && (
          <View style={styles.permissionsStatus}>
            <View style={styles.permissionItem}>
              <Ionicons 
                name={permissionsGranted ? "checkmark-circle" : "alert-circle"} 
                size={20} 
                color={permissionsGranted ? "#34c759" : "#ff9500"} 
              />
              <Text style={[
                styles.permissionText,
                permissionsGranted ? styles.permissionGranted : styles.permissionPending
              ]}>
                {permissionsGranted 
                  ? "Permisos configurados correctamente" 
                  : "Algunos permisos pendientes"
                }
              </Text>
            </View>
            
            {isRequestingPermissions && (
              <Text style={styles.requestingText}>
                Configurando permisos...
              </Text>
            )}
          </View>
        )}

        <FormButton title="Cerrar sesión" onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  userInfo: {
    marginBottom: 40,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionsStatus: {
    marginBottom: 30,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    minWidth: 280,
    alignItems: 'center',
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permissionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  requestingText: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 8,
    fontStyle: 'italic',
  },
  permissionGranted: {
    color: '#34c759',
  },
  permissionPending: {
    color: '#ff9500',
  },
});
