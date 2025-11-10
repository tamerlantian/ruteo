import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAuth } from '../../auth/context/auth.context';

export const SettingsScreen = () => {
  const { logout } = useAuth();

  // Función para manejar el logout
  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión? Se eliminarán todos los datos locales.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  // Función placeholder para manejar navegación a opciones
  const handleOptionPress = (option: string) => {
    console.log(`Navegando a: ${option}`);
    // TODO: Implementar navegación a cada opción
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ 
          paddingHorizontal: 20, 
          paddingVertical: 16,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e5ea'
        }}>
          <Text style={{ 
            fontSize: 28, 
            fontWeight: 'bold', 
            color: '#1c1c1e' 
          }}>
            Ajustes
          </Text>
        </View>

        {/* Opciones de configuración */}
        <View style={{ 
          backgroundColor: '#fff', 
          marginTop: 20,
          marginHorizontal: 16,
          borderRadius: 12,
          overflow: 'hidden'
        }}>
          {/* Perfil */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 18,
              borderBottomWidth: 1,
              borderBottomColor: '#f0f0f0'
            }}
            onPress={() => handleOptionPress('Perfil')}
          >
            <Ionicons name="person-outline" size={22} color="#6b7280" style={{ marginRight: 16 }} />
            <Text style={{ 
              flex: 1, 
              fontSize: 16, 
              color: '#1f2937',
              fontWeight: '400'
            }}>
              Perfil
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
          </TouchableOpacity>

          {/* Acerca de */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 18,
              borderBottomWidth: 1,
              borderBottomColor: '#f0f0f0'
            }}
            onPress={() => handleOptionPress('Acerca de')}
          >
            <Ionicons name="information-circle-outline" size={22} color="#6b7280" style={{ marginRight: 16 }} />
            <Text style={{ 
              flex: 1, 
              fontSize: 16, 
              color: '#1f2937',
              fontWeight: '400'
            }}>
              Acerca de
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
          </TouchableOpacity>

          {/* Salir */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 18,
            }}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#ef4444" style={{ marginRight: 16 }} />
            <Text style={{ 
              flex: 1, 
              fontSize: 16, 
              color: '#ef4444',
              fontWeight: '400'
            }}>
              Salir
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
