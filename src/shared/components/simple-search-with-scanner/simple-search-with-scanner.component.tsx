import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Scanner, ScanResult } from '../scanner';

export interface SimpleSearchWithScannerProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onScanResult?: (result: ScanResult) => void;
}

/**
 * Componente de búsqueda con scanner QR/Barcode integrado
 */
export const SimpleSearchWithScanner: React.FC<SimpleSearchWithScannerProps> = ({
  searchValue,
  onSearchChange,
  placeholder = 'Buscar...',
  onClear,
  onScanResult,
}) => {
  /**
   * Maneja el resultado del escaneo
   */
  const handleScanResult = (result: ScanResult) => {
    // Actualizar el valor de búsqueda con el código escaneado
    onSearchChange(result.value);
    
    // Llamar al callback si existe
    if (onScanResult) {
      onScanResult(result);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons 
          name="search-outline" 
          size={20} 
          color="#8e8e93" 
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#8e8e93"
          value={searchValue}
          onChangeText={onSearchChange}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          multiline={false}
        />
        {searchValue.length > 0 && (
          <TouchableOpacity 
            onPress={onClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color="#8e8e93" />
          </TouchableOpacity>
        )}
        
        {/* Scanner Button */}
        <Scanner onScanResult={handleScanResult} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1c1c1e',
    paddingVertical: 4,
    minHeight: 20,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
});
