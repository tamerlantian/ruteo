import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../../navigation/types';
import Ionicons from '@react-native-vector-icons/ionicons';
import { FormInputController } from '../../../../shared/components/ui/form/FormInputController';
import { SignatureField } from './components/SignatureField';
import { PhotoField } from './components/PhotoField';
import { entregaFormStyles } from './entrega-form.style';
import { useEntregaFormViewModel } from './entrega-form.view-model';

type EntregaFormScreenProps = NativeStackScreenProps<MainStackParamList, 'EntregaForm'>;

export const EntregaFormScreen: React.FC<EntregaFormScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { visitasSeleccionadas } = route.params;
  
  // Usar el ViewModel para manejar la lógica del formulario
  const viewModel = useEntregaFormViewModel(visitasSeleccionadas);

  // Estado para controlar el scroll durante la firma
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleGoBack = () => {
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
      <KeyboardAvoidingView 
        style={entregaFormStyles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={entregaFormStyles.scrollContainer}
          contentContainerStyle={entregaFormStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
        >
          {/* Form Fields */}
          <View style={entregaFormStyles.formContainer}>
            {/* Campo: Recibe */}
            <FormInputController
              control={viewModel.control}
              name="recibe"
              label="¿Quién recibe?"
              placeholder="Nombre completo de quien recibe"
              rules={viewModel.validationRules.recibe}
              error={viewModel.errors.recibe}
              autoCapitalize="words"
              autoComplete="name"
            />

            {/* Campo: Número de Identificación */}
            <FormInputController
              control={viewModel.control}
              name="numeroIdentificacion"
              label="Número de Identificación"
              placeholder="Cédula o documento de identidad"
              rules={viewModel.validationRules.numeroIdentificacion}
              error={viewModel.errors.numeroIdentificacion}
              keyboardType="numeric"
              autoComplete="off"
            />

            {/* Campo: Celular */}
            <FormInputController
              control={viewModel.control}
              name="celular"
              label="Número de Celular"
              placeholder="Número de contacto"
              rules={viewModel.validationRules.celular}
              error={viewModel.errors.celular}
              keyboardType="phone-pad"
              autoComplete="tel"
            />

            {/* Campo: Firma Digital */}
            <SignatureField
              control={viewModel.control}
              name="firma"
              label="Firma del Receptor"
              rules={viewModel.validationRules.firma}
              error={viewModel.errors.firma}
              required={false}
              onScrollEnable={setScrollEnabled}
            />

            {/* Campo: Fotos de Entrega */}
            <PhotoField
              control={viewModel.control}
              name="fotos"
              label="Fotos de Entrega"
              rules={viewModel.validationRules.fotos}
              error={viewModel.errors.fotos}
              required={false}
              maxPhotos={5}
            />

            {/* Info de visitas seleccionadas */}
            {/* <View style={entregaFormStyles.visitasInfo}>
              <Text style={entregaFormStyles.visitasInfoTitle}>
                Visitas a entregar ({visitasSeleccionadas.length})
              </Text>
              <View style={entregaFormStyles.visitasIds}>
                {visitasSeleccionadas.slice(0, 5).map((id) => (
                  <Text key={id} style={entregaFormStyles.visitaId}>
                    #{id}
                  </Text>
                ))}
                {visitasSeleccionadas.length > 5 && (
                  <Text style={entregaFormStyles.visitaIdMore}>
                    +{visitasSeleccionadas.length - 5} más
                  </Text>
                )}
              </View>
            </View> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Actions */}
      <View style={entregaFormStyles.footer}>
        <TouchableOpacity 
          style={entregaFormStyles.cancelButton}
          onPress={handleGoBack}
        >
          <Text style={entregaFormStyles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            entregaFormStyles.submitButton,
            !viewModel.canSubmit && entregaFormStyles.submitButtonDisabled
          ]}
          onPress={viewModel.onSubmit}
          disabled={!viewModel.canSubmit}
        >
          <Text style={[
            entregaFormStyles.submitButtonText,
            !viewModel.canSubmit && entregaFormStyles.submitButtonTextDisabled
          ]}>
            {viewModel.canSubmit ? 'Procesar Entrega' : 'Complete los campos'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
