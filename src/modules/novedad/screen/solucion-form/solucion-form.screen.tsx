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
import { FormButton } from '../../../../shared/components/ui/button/FormButton';
import { solucionFormStyles } from './solucion-form.style';

type SolucionFormScreenProps = NativeStackScreenProps<
  MainStackParamList,
  'SolucionForm'
>;

export const SolucionFormScreen: React.FC<SolucionFormScreenProps> = ({
  navigation,
  route,
}) => {
  const { novedadesSeleccionadas } = route.params;

  // Estado para controlar el scroll durante la interacción
  const [scrollEnabled, _setScrollEnabled] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSubmit = () => {
    // TODO: Implementar lógica de envío
    console.log('Enviando solución para novedades:', novedadesSeleccionadas);
    navigation.goBack();
  };

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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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

            {/* Placeholder para campos futuros */}
            <View style={solucionFormStyles.placeholderContainer}>
              <Ionicons name="construct-outline" size={48} color="#8e8e93" />
              <Text style={solucionFormStyles.placeholderTitle}>
                Formulario en construcción
              </Text>
              <Text style={solucionFormStyles.placeholderText}>
                Los campos del formulario de solución se agregarán próximamente.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Actions */}
      <View style={solucionFormStyles.footer}>
        <FormButton
          title="Enviar solución"
          onPress={handleSubmit}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
};
