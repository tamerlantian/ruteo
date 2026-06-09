import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Linking,
  Modal,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../auth/context/auth.context';
import { profileStyles } from '../styles/profile.style';
import { toastTextOneStyle } from '../../../shared/styles/global.style';

export const ProfileScreen = () => {
  const { user, actualizarPerfil } = useAuth();

  const [editVisible, setEditVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);

  const abrirEdicion = () => {
    setNombre(user?.nombre || '');
    setEditVisible(true);
  };

  const cerrarEdicion = () => {
    if (guardando) {
      return;
    }
    Keyboard.dismiss();
    setEditVisible(false);
  };

  const guardarNombre = async () => {
    const limpio = nombre.trim();
    if (!limpio) {
      Toast.show({
        type: 'error',
        text1: 'El nombre no puede estar vacío',
        text1Style: toastTextOneStyle,
      });
      return;
    }
    if (limpio === (user?.nombre || '')) {
      cerrarEdicion();
      return;
    }
    Keyboard.dismiss();
    setGuardando(true);
    try {
      await actualizarPerfil({ nombre: limpio });
      setEditVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Nombre actualizado',
        text1Style: toastTextOneStyle,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error?.titulo || 'No se pudo actualizar el nombre',
        text2: error?.mensaje || 'Inténtalo nuevamente.',
        text1Style: toastTextOneStyle,
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleOpenTerms = () => {
    Linking.openURL('http://app.ruteo.online/terminos_de_uso');
  };

  const handleOpenPrivacy = () => {
    Linking.openURL('http://app.ruteo.online/politicas_privacidad');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer y perderás todos tus datos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar eliminación de cuenta
            console.log('Eliminando cuenta...');
          },
        },
      ],
    );
  };

  const inicial = user?.nombre
    ? user.nombre.charAt(0).toUpperCase()
    : user?.username?.charAt(0).toUpperCase() || 'U';

  return (
    <SafeAreaView style={profileStyles.container}>
      <ScrollView style={profileStyles.scrollContainer}>
        <View style={profileStyles.header} />

        {/* Información Personal */}
        {user && (
          <View style={profileStyles.userInfoContainer}>
            <View style={profileStyles.avatar}>
              <Text style={profileStyles.avatarText}>{inicial}</Text>
            </View>

            <View style={profileStyles.userDetails}>
              <Text style={profileStyles.userName}>
                {user.nombre || user.username || 'Usuario'}
              </Text>
              {!!user.correo && (
                <Text style={profileStyles.userEmail}>{user.correo}</Text>
              )}
              {!!user.telefono && (
                <Text style={profileStyles.userPhone}>{user.telefono}</Text>
              )}
            </View>

            <TouchableOpacity
              style={profileStyles.editButton}
              onPress={abrirEdicion}
              accessibilityRole="button"
              accessibilityLabel="Editar nombre"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="pencil" size={18} color="#007aff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Enlaces Legales */}
        <View style={profileStyles.sectionContainer}>
          <Text style={profileStyles.sectionTitle}>Legal</Text>

          <View style={profileStyles.optionsContainer}>
            <TouchableOpacity
              style={profileStyles.optionButtonWithBorder}
              onPress={handleOpenTerms}
            >
              <Ionicons
                name="document-text-outline"
                size={22}
                color="#6b7280"
                style={profileStyles.optionIcon}
              />
              <Text style={profileStyles.optionText}>Términos de uso</Text>
              <Ionicons name="open-outline" size={18} color="#d1d5db" />
            </TouchableOpacity>

            <TouchableOpacity
              style={profileStyles.optionButtonWithBorder}
              onPress={handleOpenPrivacy}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color="#6b7280"
                style={profileStyles.optionIcon}
              />
              <Text style={profileStyles.optionText}>
                Políticas de privacidad
              </Text>
              <Ionicons name="open-outline" size={18} color="#d1d5db" />
            </TouchableOpacity>

            <TouchableOpacity
              style={profileStyles.optionButton}
              onPress={handleDeleteAccount}
            >
              <Ionicons
                name="trash-outline"
                size={22}
                color="#ef4444"
                style={profileStyles.optionIcon}
              />
              <Text style={profileStyles.optionTextDanger}>Eliminar cuenta</Text>
              <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal de edición del nombre */}
      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
        onRequestClose={cerrarEdicion}
      >
        <View style={profileStyles.modalOverlay}>
          <View style={profileStyles.modalCard}>
            <Text style={profileStyles.modalTitle}>Editar nombre</Text>
            <TextInput
              style={profileStyles.modalInput}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Tu nombre"
              placeholderTextColor="#9ca3af"
              autoFocus
              maxLength={80}
              returnKeyType="done"
              onSubmitEditing={guardarNombre}
              editable={!guardando}
            />
            <View style={profileStyles.modalActions}>
              <TouchableOpacity
                style={[profileStyles.modalBtn, profileStyles.modalBtnCancel]}
                onPress={cerrarEdicion}
                disabled={guardando}
              >
                <Text style={profileStyles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  profileStyles.modalBtn,
                  profileStyles.modalBtnSave,
                  guardando && profileStyles.modalBtnDisabled,
                ]}
                onPress={guardarNombre}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={profileStyles.modalBtnSaveText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
