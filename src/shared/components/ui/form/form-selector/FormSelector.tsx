import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  Animated,
  Dimensions,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/Ionicons';

export interface Option {
  label: string;
  value: string;
}

interface FormSelectorProps {
  label: string;
  placeholder?: string;
  options: Option[];
  value?: string;
  onValueChange: (_value: string) => void;
  error?: string;
  isLoading?: boolean;
  onRetry?: () => void;
  emptyOptionsMessage?: string;
}

export const FormSelector = ({
  label,
  placeholder = 'Seleccionar...',
  options,
  value,
  onValueChange,
  error,
  isLoading,
  onRetry,
  emptyOptionsMessage,
}: FormSelectorProps) => {
  // Estado para controlar la visibilidad del modal
  const [modalVisible, setModalVisible] = useState(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  // Find the selected option to display its label
  const selectedOption = options.find(option => option.value === value);

  // Efectos de animación cuando el modal cambia de visibilidad
  useEffect(() => {
    if (modalVisible) {
      // Animación de entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animación de salida
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
          delay: 50, // Pequeño retraso para que el fondo no desaparezca antes que el contenido
        }),
        Animated.timing(slideAnim, {
          toValue: Dimensions.get('window').height,
          duration: 300,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [modalVisible, fadeAnim, slideAnim]);

  // Abrir y cerrar el modal
  const openModal = () => setModalVisible(true);

  // Cerrar el modal con una pequeña función para evitar cierres abruptos
  const closeModal = () => {
    // Primero iniciamos la animación de cierre
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Y luego de completar la animación, cerramos el modal
      setModalVisible(false);
    });
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>

      <TouchableOpacity
        style={[styles.selector, error ? styles.selectorError : null]}
        onPress={openModal}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectorText, !selectedOption && styles.placeholderText]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={closeModal}
      >
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {isLoading && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color="#0066CC" />
                <Text style={styles.loaderText}>Cargando opciones...</Text>
              </View>
            )}

            {error && !isLoading && (
              <View style={styles.errorContainer}>
                <View style={styles.errorContent}>
                  <Ionicons
                    name="warning-outline"
                    size={20}
                    color="#FF3B30"
                    style={styles.errorIcon}
                  />
                  <Text style={styles.errorMessage}>Error al cargar opciones</Text>
                </View>
                {onRetry && (
                  <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
                    <Ionicons
                      name="refresh-outline"
                      size={16}
                      color="#FFFFFF"
                      style={styles.retryIcon}
                    />
                    <Text style={styles.retryButtonText}>Reintentar</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {!isLoading && !error && options.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#666"
                  style={styles.emptyIcon}
                />
                <Text style={styles.noOptionsText}>
                  {emptyOptionsMessage || 'No hay opciones disponibles'}
                </Text>
              </View>
            )}

            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionItem, item.value === value && styles.selectedOption]}
                  onPress={() => {
                    onValueChange(item.value);
                    closeModal();
                  }}
                >
                  <Text
                    style={[styles.optionText, item.value === value && styles.selectedOptionText]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && <Ionicons name="checkmark" size={20} color="#0066CC" />}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
    fontWeight: '500',
  },
  selector: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorError: {
    borderColor: '#ff3b30',
    backgroundColor: '#fff5f5',
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
  },
  optionItem: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#f0f8ff',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#0066CC',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  loaderText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFF5F5',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#FF3B30',
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryIcon: {
    marginRight: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  emptyIcon: {
    marginRight: 8,
  },
  noOptionsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
