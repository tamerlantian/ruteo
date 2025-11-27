import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../../navigation/types';
import Ionicons from '@react-native-vector-icons/ionicons';
import { FormButton } from '../../../../shared/components/ui/button/FormButton';
import { FormInputController } from '../../../../shared/components/ui/form/FormInputController';
import { solucionFormStyles } from './solucion-form.style';
import { useSolucionFormViewModel } from './solucion-form.view-model';
import { useGradualAnimation } from '../../../../shared/hooks/use-gradual-animation.hook';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

type SolucionFormScreenProps = NativeStackScreenProps<
  MainStackParamList,
  'SolucionForm'
>;

export const SolucionFormScreen: React.FC<SolucionFormScreenProps> = ({
  navigation,
  route,
}) => {
  const { novedadesSeleccionadas } = route.params;

  // ViewModel
  const viewModel = useSolucionFormViewModel({ novedadesSeleccionadas });

  // Estado para controlar el scroll durante la interacción
  const [scrollEnabled, _setScrollEnabled] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const { height } = useGradualAnimation();

  // Obtener los insets del área segura para manejar correctamente el espacio del footer
  const insets = useSafeAreaInsets();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const keyboardPadding = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  }, []);

  return (
    <SafeAreaView style={solucionFormStyles.container}>
      {/* Header */}
      <View style={solucionFormStyles.header}>
        <TouchableOpacity
          style={solucionFormStyles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#007aff" />
        </TouchableOpacity>

        <View style={solucionFormStyles.headerContent}>
          <Text style={solucionFormStyles.title}>Formulario de solución</Text>
          <Text style={solucionFormStyles.subtitle}>
            {novedadesSeleccionadas.length} novedad
            {novedadesSeleccionadas.length !== 1 ? 'es' : ''} seleccionada
            {novedadesSeleccionadas.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={solucionFormStyles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={solucionFormStyles.scrollContainer}
          contentContainerStyle={solucionFormStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
        >
          {/* Form Fields */}
          <View style={solucionFormStyles.formContainer}>
            {/* Info de novedades seleccionadas */}
            <View style={solucionFormStyles.novedadesInfo}>
              <Text style={solucionFormStyles.novedadesInfoTitle}>
                Novedades seleccionadas
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={solucionFormStyles.novedadesScrollContainer}
                contentContainerStyle={solucionFormStyles.novedadesIds}
              >
                {novedadesSeleccionadas.map(id => (
                  <Text key={id} style={solucionFormStyles.novedadId}>
                    #{id}
                  </Text>
                ))}
              </ScrollView>
            </View>

            {/* Campo: Descripción de la Solución */}
            <FormInputController
              control={viewModel.control}
              disabled={viewModel.isSubmitting}
              name="solucion"
              label="Descripción de la solución *"
              placeholder="Describe detalladamente la solución aplicada a las novedades..."
              rules={viewModel.validationRules.solucion}
              error={viewModel.errors.solucion}
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
              style={solucionFormStyles.textArea}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Actions */}
      <View
        style={[
          solucionFormStyles.footer,
          {
            paddingBottom:
              Platform.OS === 'ios' ? 0 : Math.max(insets.bottom, 14), // Asegurar espacio mínimo de 8px o el inset del área segura
          },
        ]}
      >
        <FormButton
          title={viewModel.isSubmitting ? 'Enviando...' : 'Enviar solución'}
          onPress={viewModel.onSubmit}
          disabled={viewModel.isSubmitting || !viewModel.isValid}
          variant="primary"
        />

        <Animated.View style={keyboardPadding} />
      </View>
    </SafeAreaView>
  );
};
