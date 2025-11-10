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
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#e5e5ea'
            }}
            onPress={() => handleOptionPress('Perfil')}
          >
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#007aff',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}>
              <Ionicons name="person" size={18} color="#fff" />
            </View>
            <Text style={{ 
              flex: 1, 
              fontSize: 16, 
              color: '#1c1c1e' 
            }}>
              Perfil
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#c7c7cc" />
          </TouchableOpacity>

          {/* Acerca de */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#e5e5ea'
            }}
            onPress={() => handleOptionPress('Acerca de')}
          >
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#34c759',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}>
              <Ionicons name="information" size={18} color="#fff" />
            </View>
            <Text style={{ 
              flex: 1, 
              fontSize: 16, 
              color: '#1c1c1e' 
            }}>
              Acerca de
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#c7c7cc" />
          </TouchableOpacity>

          {/* Salir */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 16,
            }}
            onPress={handleLogout}
          >
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#ff3b30',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}>
              <Ionicons name="log-out" size={18} color="#fff" />
            </View>
            <Text style={{ 
              flex: 1, 
              fontSize: 16, 
              color: '#ff3b30' 
            }}>
              Salir
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#c7c7cc" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
