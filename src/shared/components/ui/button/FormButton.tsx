import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface FormButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  isLoading?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  loadingColor?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export const FormButton = ({ 
  title, 
  isLoading, 
  disabled, 
  style,
  textStyle,
  loadingColor = '#fff',
  variant = 'primary',
  ...props 
}: FormButtonProps) => {
  const isDisabled = disabled || isLoading;

  // Seleccionar estilos base según variante
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'danger':
        return styles.buttonDanger;
      case 'success':
        return styles.buttonSuccess;
      default:
        return styles.buttonPrimary;
    }
  };

  const getVariantTextStyles = () => {
    switch (variant) {
      case 'secondary':
        return styles.buttonTextSecondary;
      case 'danger':
        return styles.buttonTextDanger;
      case 'success':
        return styles.buttonTextSuccess;
      default:
        return styles.buttonTextPrimary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(),
        isDisabled && styles.buttonDisabled,
        style, // Estilos externos se aplican al final para permitir override
      ]}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={loadingColor} />
      ) : (
        <Text style={[
          styles.buttonText,
          getVariantTextStyles(),
          isDisabled && styles.buttonTextDisabled,
          textStyle, // Permite customizar el texto también
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    fontSize: 16,
    justifyContent: 'center',
  },
  // Variantes de botón
  buttonPrimary: {
    backgroundColor: '#007aff',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007aff',
  },
  buttonDanger: {
    backgroundColor: '#ff3b30',
  },
  buttonSuccess: {
    backgroundColor: '#34c759',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    borderColor: '#cccccc',
  },
  // Estilos de texto base
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Variantes de texto
  buttonTextPrimary: {
    color: '#fff',
  },
  buttonTextSecondary: {
    color: '#007aff',
  },
  buttonTextDanger: {
    color: '#fff',
  },
  buttonTextDisabled: {
    color: '#999999',
  },
  buttonTextSuccess: {
    color: '#fff',
  },
});
