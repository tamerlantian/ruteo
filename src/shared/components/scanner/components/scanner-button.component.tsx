import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { ScannerButtonProps } from '../interfaces/scanner.interface';

/**
 * Botón para abrir el scanner QR/Barcode
 */
export const ScannerButton: React.FC<ScannerButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled
      ]}
      onPress={onPress}
      disabled={disabled}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons 
        name="qr-code-outline" 
        size={20} 
        color={disabled ? '#c7c7cc' : '#007aff'} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonDisabled: {
    backgroundColor: '#f2f2f7',
    borderColor: '#e5e5ea',
  },
});
