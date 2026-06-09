import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAuth } from '../../auth/context/auth.context';
import { useDevMode } from '../../../shared/context/dev-mode-context';
import { useTabNavigation } from '../../../navigation/hooks/useTypedNavigation';
import { settingsStyles } from '../styles/settings.style';
import { AppBar } from '../../../shared/components/ui/app-bar/app-bar.component';
import appInfo from '../../../shared/services/app-info.service';

const inicial = (texto?: string | null): string =>
  (texto ?? '').trim().charAt(0).toUpperCase() || 'U';

export const SettingsScreen = () => {
  const { user, logout } = useAuth();
  const { isDeveloperMode } = useDevMode();
  const navigation = useTabNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión? Se eliminarán todos los datos locales.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
    );
  };

  const nombre = user?.nombre || user?.username || 'Usuario';
  const subtitulo = user?.correo || user?.telefono || user?.username || '';
  const tieneFoto = !!user?.imagen && user.imagen.startsWith('http');

  return (
    <SafeAreaView style={settingsStyles.container}>
      <AppBar title="Ajustes" />
      <ScrollView
        style={settingsStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta de usuario — atajo al perfil */}
        <TouchableOpacity
          style={settingsStyles.profileCard}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={settingsStyles.avatar}>
            {tieneFoto ? (
              <Image
                source={{ uri: user!.imagen }}
                style={settingsStyles.avatarImage}
              />
            ) : (
              <Text style={settingsStyles.avatarText}>
                {inicial(user?.nombre || user?.username)}
              </Text>
            )}
          </View>
          <View style={settingsStyles.profileInfo}>
            <Text style={settingsStyles.profileName} numberOfLines={1}>
              {nombre}
            </Text>
            {!!subtitulo && (
              <Text style={settingsStyles.profileSub} numberOfLines={1}>
                {subtitulo}
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
        </TouchableOpacity>

        {/* Cuenta */}
        <Text style={settingsStyles.sectionLabel}>Cuenta</Text>
        <View style={settingsStyles.optionsContainer}>
          <TouchableOpacity
            style={settingsStyles.optionButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons
              name="person-outline"
              size={22}
              color="#6b7280"
              style={settingsStyles.optionIcon}
            />
            <Text style={settingsStyles.optionText}>Perfil</Text>
            <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
          </TouchableOpacity>
        </View>

        {/* Aplicación */}
        <Text style={settingsStyles.sectionLabel}>Aplicación</Text>
        <View style={settingsStyles.optionsContainer}>
          {/* Entorno (informativo) — clave para pruebas en producción */}
          <View style={settingsStyles.infoRow}>
            <Ionicons
              name="server-outline"
              size={22}
              color="#6b7280"
              style={settingsStyles.optionIcon}
            />
            <Text style={settingsStyles.optionText}>Entorno</Text>
            <View
              style={[
                settingsStyles.badge,
                isDeveloperMode
                  ? settingsStyles.badgeTest
                  : settingsStyles.badgeProd,
              ]}
            >
              <Text
                style={[
                  settingsStyles.badgeText,
                  isDeveloperMode
                    ? settingsStyles.badgeTestText
                    : settingsStyles.badgeProdText,
                ]}
              >
                {isDeveloperMode ? 'Pruebas' : 'Producción'}
              </Text>
            </View>
          </View>

          {/* Acerca de */}
          <TouchableOpacity
            style={settingsStyles.optionButton}
            onPress={() => navigation.navigate('About')}
          >
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#6b7280"
              style={settingsStyles.optionIcon}
            />
            <Text style={settingsStyles.optionText}>Acerca de</Text>
            <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
          </TouchableOpacity>
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity
          style={settingsStyles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={settingsStyles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={settingsStyles.footer}>
          <Text style={settingsStyles.footerApp}>Ruteo</Text>
          <Text style={settingsStyles.footerVersion}>
            {appInfo.getFormattedVersion()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
