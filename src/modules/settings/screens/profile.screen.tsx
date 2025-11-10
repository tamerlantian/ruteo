import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAuth } from '../../auth/context/auth.context';
import { profileStyles } from '../styles/profile.style';

export const ProfileScreen = () => {
  const { user } = useAuth();

  // Función para abrir términos de uso
  const handleOpenTerms = () => {
    Linking.openURL('http://app.ruteo.online/terminos_de_uso');
  };

  // Función para abrir políticas de privacidad
  const handleOpenPrivacy = () => {
    Linking.openURL('http://app.ruteo.online/politicas_privacidad');
  };

  // Función para eliminar cuenta
  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer y perderás todos tus datos.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar eliminación de cuenta
            console.log('Eliminando cuenta...');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={profileStyles.container}>
      <ScrollView style={profileStyles.scrollContainer}>
        {/* Header */}
        <View style={profileStyles.header}>
          {/* <Text style={profileStyles.headerTitle}>
            Perfil
          </Text> */}
        </View>

        {/* Información Personal */}
        {user && (
          <View style={profileStyles.userInfoContainer}>
            <View style={profileStyles.avatar}>
              <Text style={profileStyles.avatarText}>
                {user.nombre ? user.nombre.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            
            <View style={profileStyles.userDetails}>
              <Text style={profileStyles.userName}>
                {user.nombre || user.username || 'Usuario'}
              </Text>
              {user.correo && (
                <Text style={profileStyles.userEmail}>
                  {user.correo}
                </Text>
              )}
              {user.telefono && (
                <Text style={profileStyles.userPhone}>
                  {user.telefono}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Enlaces Legales */}
        <View style={profileStyles.sectionContainer}>
          <Text style={profileStyles.sectionTitle}>Legal</Text>
          
          <View style={profileStyles.optionsContainer}>
            {/* Términos de uso */}
            <TouchableOpacity
              style={profileStyles.optionButtonWithBorder}
              onPress={handleOpenTerms}
            >
              <Ionicons name="document-text-outline" size={22} color="#6b7280" style={profileStyles.optionIcon} />
              <Text style={profileStyles.optionText}>
                Términos de uso
              </Text>
              <Ionicons name="open-outline" size={18} color="#d1d5db" />
            </TouchableOpacity>

            {/* Políticas de privacidad */}
            <TouchableOpacity
              style={profileStyles.optionButtonWithBorder}
              onPress={handleOpenPrivacy}
            >
              <Ionicons name="shield-checkmark-outline" size={22} color="#6b7280" style={profileStyles.optionIcon} />
              <Text style={profileStyles.optionText}>
                Políticas de privacidad
              </Text>
              <Ionicons name="open-outline" size={18} color="#d1d5db" />
            </TouchableOpacity>

            {/* Eliminar cuenta */}
            <TouchableOpacity
              style={profileStyles.optionButton}
              onPress={handleDeleteAccount}
            >
              <Ionicons name="trash-outline" size={22} color="#ef4444" style={profileStyles.optionIcon} />
              <Text style={profileStyles.optionTextDanger}>
                Eliminar cuenta
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
