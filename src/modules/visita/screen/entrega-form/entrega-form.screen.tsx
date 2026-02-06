import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../../navigation/types';
import Ionicons from '@react-native-vector-icons/ionicons';
import { FormInputController } from '../../../../shared/components/ui/form/FormInputController';
import { SignatureField } from './components/SignatureField';
import { PhotoField } from './components/PhotoField';
import { entregaFormStyles } from './entrega-form.style';
import { useEntregaFormViewModel } from './entrega-form.view-model';
import { FormSelectorController } from '../../../../shared/components/ui/form/form-selector/FormSelectorController';
import { FormButton } from '../../../../shared/components/ui/button/FormButton';
import { ErrorBoundary } from '../../../../shared/components/error-boundary';
import * as Sentry from '@sentry/react-native';

type EntregaFormScreenProps = NativeStackScreenProps<
  MainStackParamList,
  'EntregaForm'
>;

const EntregaFormContent: React.FC<EntregaFormScreenProps> = ({
  navigation,
  route,
}) => {
  const { visitasSeleccionadas } = route.params;

  // Usar el ViewModel para manejar la lógica del formulario
  const viewModel = useEntregaFormViewModel(visitasSeleccionadas, navigation);

  // Estado para controlar el scroll durante la firma
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // Obtener los insets del área segura para manejar correctamente el espacio del footer
  const insets = useSafeAreaInsets();

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
          <Text style={entregaFormStyles.title}>Formulario de entrega</Text>
          {/* <Text style={entregaFormStyles.subtitle}>
            {visitasSeleccionadas.length} visita
            {visitasSeleccionadas.length !== 1 ? 's' : ''} seleccionada
            {visitasSeleccionadas.length !== 1 ? 's' : ''}
          </Text> */}
        </View>
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={entregaFormStyles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
            {/* Info de visitas seleccionadas */}
            <View style={entregaFormStyles.visitasInfo}>
              <Text style={entregaFormStyles.visitasInfoTitle}>
                Visitas seleccionadas ({visitasSeleccionadas.length})
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={entregaFormStyles.visitasScrollContainer}
                contentContainerStyle={entregaFormStyles.visitasIds}
              >
                {visitasSeleccionadas.map(id => (
                  <Text key={id} style={entregaFormStyles.visitaId}>
                    #{id}
                  </Text>
                ))}
              </ScrollView>
            </View>

            {/* Campo: Fotos de Entrega */}
            <PhotoField
              control={viewModel.control}
              name="fotos"
              label="Fotos"
              disabled={viewModel.isSubmitting}
              rules={viewModel.visitaFormValidationRules.fotos}
              error={viewModel.errors.fotos}
              required={false}
              maxPhotos={5}
            />

            {/* Campo: Recibe */}
            <FormInputController
              control={viewModel.control}
              name="recibe"
              label="¿Quién recibe el paquete?"
              placeholder=""
              rules={viewModel.visitaFormValidationRules.recibe}
              error={viewModel.errors.recibe}
              autoCapitalize="words"
              autoComplete="name"
            />

            {/* Campo: Número de Identificación */}
            <FormInputController
              control={viewModel.control}
              name="numeroIdentificacion"
              label="Número de identificación"
              placeholder=""
              rules={viewModel.visitaFormValidationRules.numeroIdentificacion}
              error={viewModel.errors.numeroIdentificacion}
              keyboardType="numeric"
              autoComplete="off"
            />

            {/* Campo: Celular */}
            <FormInputController
              control={viewModel.control}
              name="celular"
              label="Número de celular"
              placeholder=""
              rules={viewModel.visitaFormValidationRules.celular}
              error={viewModel.errors.celular}
              keyboardType="phone-pad"
              autoComplete="tel"
            />

            {/* Campo: Parentesco */}
            <FormSelectorController
              control={viewModel.control}
              name="parentesco"
              label="Parentesco"
              placeholder="Seleccionar parentesco"
              options={viewModel.parentescoOptions}
              error={viewModel.errors.parentesco}
              rules={viewModel.visitaFormValidationRules.parentesco}
              emptyOptionsMessage="No hay opciones disponibles"
            />

            {/* Campo: Firma Digital */}
            <SignatureField
              control={viewModel.control}
              name="firma"
              label="Firma del receptor"
              rules={viewModel.visitaFormValidationRules.firma}
              error={viewModel.errors.firma}
              required={false}
              onScrollEnable={setScrollEnabled}
              navigation={navigation}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Actions */}
      <View style={[
        entregaFormStyles.footer,
        {
          paddingBottom: Math.max(insets.bottom, 4), // Asegurar espacio mínimo de 8px o el inset del área segura
        }
      ]}>
        <FormButton
          title="Entregar"
          disabled={!viewModel.isValid || viewModel.isSubmitting}
          isLoading={viewModel.isSubmitting}
          onPress={viewModel.onSubmit}
        />
      </View>
    </SafeAreaView>
  );
};

// Wrap the form with error boundary
export const EntregaFormScreen: React.FC<EntregaFormScreenProps> = (props) => {
  const handleFormError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('🚨 [Form Error Boundary] Entrega form error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Log to Sentry with context
    Sentry.captureException(error, {
      level: 'error',
      tags: {
        error_boundary: 'form',
        form_type: 'entrega',
        location: 'entrega_form_screen',
      },
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
        form: {
          visitas_count: props.route.params.visitasSeleccionadas.length,
          visitas_ids: props.route.params.visitasSeleccionadas.join(','),
        },
      },
    });
  };

  return (
    <ErrorBoundary level="form" onError={handleFormError}>
      <EntregaFormContent {...props} />
    </ErrorBoundary>
  );
};
