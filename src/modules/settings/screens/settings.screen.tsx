import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAuth } from '../../auth/context/auth.context';
import { useTabNavigation } from '../../../navigation/hooks/useTypedNavigation';
import { settingsStyles } from '../styles/settings.style';

export const SettingsScreen = () => {
  const { logout } = useAuth();
  const navigation = useTabNavigation();

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

  // Función para manejar navegación a opciones
  const handleOptionPress = (option: string) => {
    switch (option) {
      case 'Perfil':
        navigation.navigate('Profile');
        break;
      case 'Acerca de':
        navigation.navigate('About');
        break;
      default:
        console.log(`Navegando a: ${option}`);
    }
  };

  return (
    <SafeAreaView style={settingsStyles.container}>
      <ScrollView style={settingsStyles.scrollContainer}>
        {/* Header */}
        <View style={settingsStyles.header}>
          <Text style={settingsStyles.headerTitle}>
            Ajustes
          </Text>
        </View>

        {/* Opciones de configuración */}
        <View style={settingsStyles.optionsContainer}>
          {/* Perfil */}
          <TouchableOpacity
            style={settingsStyles.optionButtonWithBorder}
            onPress={() => handleOptionPress('Perfil')}
          >
            <Ionicons name="person-outline" size={22} color="#6b7280" style={settingsStyles.optionIcon} />
            <Text style={settingsStyles.optionText}>
              Perfil
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
          </TouchableOpacity>

          {/* Acerca de */}
          <TouchableOpacity
            style={settingsStyles.optionButtonWithBorder}
            onPress={() => handleOptionPress('Acerca de')}
          >
            <Ionicons name="information-circle-outline" size={22} color="#6b7280" style={settingsStyles.optionIcon} />
            <Text style={settingsStyles.optionText}>
              Acerca de
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
          </TouchableOpacity>

          {/* Salir */}
          <TouchableOpacity
            style={settingsStyles.optionButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#ef4444" style={settingsStyles.optionIcon} />
            <Text style={settingsStyles.optionTextDanger}>
              Salir
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
