import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../../navigation/types';
import Ionicons from '@react-native-vector-icons/ionicons';
import { entregaFormStyles } from './entrega-form.style';

type EntregaFormScreenProps = NativeStackScreenProps<MainStackParamList, 'EntregaForm'>;

export const EntregaFormScreen: React.FC<EntregaFormScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { visitasSeleccionadas } = route.params;

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSubmitEntrega = () => {
    // TODO: Implementar lógica de entrega
    console.log('Procesando entrega de visitas:', visitasSeleccionadas);
    
    // Por ahora solo navegamos de vuelta
    navigation.goBack();
  };

  return (
    <SafeAreaView style={entregaFormStyles.container}>
      {/* Header */}
      <View style={entregaFormStyles.header}>
        <TouchableOpacity 
          style={entregaFormStyles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#007aff" />
        </TouchableOpacity>
        
        <View style={entregaFormStyles.headerContent}>
          <Text style={entregaFormStyles.title}>Formulario de Entrega</Text>
          <Text style={entregaFormStyles.subtitle}>
            {visitasSeleccionadas.length} visita{visitasSeleccionadas.length !== 1 ? 's' : ''} seleccionada{visitasSeleccionadas.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={entregaFormStyles.content}>
        <View style={entregaFormStyles.placeholderContainer}>
          <Ionicons name="document-text-outline" size={64} color="#8e8e93" />
          <Text style={entregaFormStyles.placeholderTitle}>
            Formulario en Construcción
          </Text>
          <Text style={entregaFormStyles.placeholderText}>
            Aquí se implementará el formulario de entrega para las {visitasSeleccionadas.length} visitas seleccionadas.
          </Text>
          
          {/* Lista de IDs para desarrollo */}
          <View style={entregaFormStyles.debugContainer}>
            <Text style={entregaFormStyles.debugTitle}>Visitas a entregar:</Text>
            {visitasSeleccionadas.map((id, index) => (
              <Text key={id} style={entregaFormStyles.debugItem}>
                {index + 1}. ID: {id}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Footer Actions */}
      <View style={entregaFormStyles.footer}>
        <TouchableOpacity 
          style={entregaFormStyles.cancelButton}
          onPress={handleGoBack}
        >
          <Text style={entregaFormStyles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={entregaFormStyles.submitButton}
          onPress={handleSubmitEntrega}
        >
          <Text style={entregaFormStyles.submitButtonText}>
            Procesar Entrega
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
