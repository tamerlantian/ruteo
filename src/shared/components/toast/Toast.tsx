import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { ToastType, ToastPlacement } from '../../context/toast/ToastContext';
import { createToastStyles } from './toast.styles';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  placement?: ToastPlacement;
}

const Toast: React.FC<ToastProps> = ({ type, message, onClose, placement = 'bottom' }) => {
  const styles = createToastStyles();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(placement === 'bottom' ? 20 : -20)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  // Configurar el icono según el tipo de toast
  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'info':
        return 'information-circle';
      case 'warning':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  // Animación de entrada y salida
  useEffect(() => {
    // Usar requestAnimationFrame para evitar conflictos con el render
    const animateIn = () => {
      // Animación de entrada
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Añadir un pequeño rebote al final de la animación
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
      });
    };

    // Usar requestAnimationFrame para evitar el warning de useInsertionEffect
    requestAnimationFrame(animateIn);
  }, [opacity, translateY, scale]);

  // Obtener el estilo según el tipo de toast
  const getContainerStyle = () => {
    switch (type) {
      case 'success':
        return styles.success;
      case 'error':
        return styles.error;
      case 'info':
        return styles.info;
      case 'warning':
        return styles.warning;
      default:
        return styles.info;
    }
  };

  // Función para cerrar el toast con animación
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: placement === 'bottom' ? -20 : 20,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getContainerStyle(),
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name={getIcon()} size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.message} numberOfLines={6}>
          {message}
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleClose}
        style={styles.closeButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={18} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Toast;
