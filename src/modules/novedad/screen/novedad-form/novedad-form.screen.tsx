import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../../navigation/types';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNovedadFormViewModel } from './novedad-form.view-model';
import { novedadFormStyles } from './novedad-form.style';
import { FormButton } from '../../../../shared/components/ui/button/FormButton';
import { FormInputController } from '../../../../shared/components/ui/form/FormInputController';
import { FormSelectorController } from '../../../../shared/components/ui/form/form-selector/FormSelectorController';
import { PhotoField } from '../../../visita/screen/entrega-form/components/PhotoField';

type NovedadFormScreenProps = NativeStackScreenProps<
  MainStackParamList,
  'NovedadForm'
>;

export const NovedadFormScreen: React.FC<NovedadFormScreenProps> = ({
  navigation,
  route,
}) => {
  const { visitasSeleccionadas } = route.params;

  // Usar el ViewModel para manejar la lógica del formulario
  const viewModel = useNovedadFormViewModel(visitasSeleccionadas, navigation);

  // Estado para controlar el scroll durante la interacción
  const [scrollEnabled, _setScrollEnabled] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={novedadFormStyles.container}>
      {/* Header */}
      <View style={novedadFormStyles.header}>
        <TouchableOpacity
          style={novedadFormStyles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#007aff" />
        </TouchableOpacity>

        <View style={novedadFormStyles.headerContent}>
          <Text style={novedadFormStyles.title}>Formulario de novedad</Text>
          <Text style={novedadFormStyles.subtitle}>
            {visitasSeleccionadas.length} visita
            {visitasSeleccionadas.length !== 1 ? 's' : ''} seleccionada
            {visitasSeleccionadas.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={novedadFormStyles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={novedadFormStyles.scrollContainer}
          contentContainerStyle={novedadFormStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
        >
          {/* Form Fields */}
          <View style={novedadFormStyles.formContainer}>
            {/* Info de visitas seleccionadas */}
            <View style={novedadFormStyles.visitasInfo}>
              <Text style={novedadFormStyles.visitasInfoTitle}>
                Visitas seleccionadas
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={novedadFormStyles.visitasScrollContainer}
                contentContainerStyle={novedadFormStyles.visitasIds}
              >
                {visitasSeleccionadas.map(id => (
                  <Text key={id} style={novedadFormStyles.visitaId}>
                    #{id}
                  </Text>
                ))}
              </ScrollView>
            </View>

              {/* Campo: Descripción */}
            <FormInputController
              control={viewModel.control}
              name="descripcion"
              label="Descripción *"
              placeholder="Describe detalladamente la novedad encontrada..."
              rules={viewModel.validationRules.descripcion}
              error={viewModel.errors.descripcion}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
              style={novedadFormStyles.textArea}
            />

            {/* Campo: Tipo de Novedad */}
            <FormSelectorController
              control={viewModel.control}
              name="tipo"
              label="Tipo de novedad *"
              placeholder="Selecciona el tipo de novedad"
              options={viewModel.tiposOptions}
              rules={viewModel.validationRules.tipo}
              error={viewModel.errors.tipo}
              isLoading={viewModel.isLoadingTipos}
              apiError={viewModel.tiposError}
              onRetry={viewModel.refetchTipos}
              emptyOptionsMessage="No hay tipos de novedad disponibles"
            />

            {/* Campo: Foto de Novedad */}
            <PhotoField
              control={viewModel.control}
              name="foto"
              label="Foto *"
              rules={viewModel.validationRules.foto}
              error={viewModel.errors.foto}
              required={true}
              maxPhotos={1}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Actions */}
      <View style={novedadFormStyles.footer}>
        <FormButton
          title={viewModel.isValid && !viewModel.isSubmitting ? "Enviar novedad" : "Complete los campos obligatorios"}
          disabled={!viewModel.isValid || viewModel.isSubmitting}
          isLoading={viewModel.isSubmitting}
          onPress={viewModel.onSubmit}
        />
      </View>
    </SafeAreaView>
  );
};
