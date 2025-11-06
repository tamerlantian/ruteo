import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FormButton } from './FormButton';

/**
 * Ejemplos de uso del FormButton mejorado
 */
export const FormButtonExamples = () => {
  return (
    <View style={styles.container}>
      {/* Botón primario básico */}
      <FormButton 
        title="Botón Primario" 
        onPress={() => console.log('Primary pressed')} 
      />

      {/* Botón secundario */}
      <FormButton 
        title="Botón Secundario" 
        variant="secondary"
        onPress={() => console.log('Secondary pressed')} 
      />

      {/* Botón de peligro */}
      <FormButton 
        title="Eliminar" 
        variant="danger"
        onPress={() => console.log('Danger pressed')} 
      />

      {/* Botón con loading */}
      <FormButton 
        title="Cargando..." 
        isLoading={true}
        onPress={() => console.log('Loading pressed')} 
      />

      {/* Botón deshabilitado */}
      <FormButton 
        title="Deshabilitado" 
        disabled={true}
        onPress={() => console.log('Disabled pressed')} 
      />

      {/* Botón con estilos personalizados */}
      <FormButton 
        title="Estilo Personalizado" 
        style={styles.customButton}
        textStyle={styles.customText}
        onPress={() => console.log('Custom pressed')} 
      />

      {/* Botón secundario con estilos personalizados */}
      <FormButton 
        title="Secundario Personalizado" 
        variant="secondary"
        style={styles.customSecondary}
        textStyle={styles.customSecondaryText}
        onPress={() => console.log('Custom secondary pressed')} 
      />

      {/* Botón con loading color personalizado */}
      <FormButton 
        title="Loading Personalizado" 
        variant="danger"
        isLoading={true}
        loadingColor="#fff"
        onPress={() => console.log('Custom loading pressed')} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
  },
  customButton: {
    backgroundColor: '#34c759', // Verde personalizado
    borderRadius: 12,
    paddingVertical: 18,
    marginTop: 5,
  },
  customText: {
    fontSize: 16,
    fontWeight: '700',
  },
  customSecondary: {
    borderColor: '#ff9500', // Naranja
    borderWidth: 2,
    borderRadius: 20,
  },
  customSecondaryText: {
    color: '#ff9500',
    fontSize: 16,
    fontWeight: '500',
  },
});
