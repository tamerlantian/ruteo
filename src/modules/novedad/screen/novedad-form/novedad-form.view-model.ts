import { useCallback, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'NovedadForm'>;

/**
 * ViewModel para el formulario de novedad
 * Maneja la lógica de validación y envío del formulario
 */
export const useNovedadFormViewModel = (
  visitasSeleccionadas: string[], 
  navigation: NavigationProp
) => {
  // === ESTADO ===
  const [isSubmitting, setIsSubmitting] = useState(false);

  // === NAVEGACIÓN ===
  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // === ACCIONES DEL FORMULARIO ===
  const onSubmit = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // TODO: Implementar lógica de envío de novedad
      console.log('Enviando novedad para visitas:', visitasSeleccionadas);
      
      // Simular delay de envío
      await new Promise<void>(resolve => setTimeout(resolve, 2000));
      
      // TODO: Navegar de vuelta o mostrar confirmación
      navigation.goBack();
    } catch (error) {
      console.error('Error enviando novedad:', error);
      // TODO: Mostrar error al usuario
    } finally {
      setIsSubmitting(false);
    }
  }, [visitasSeleccionadas, navigation, isSubmitting]);

  // === RETORNO DEL VIEWMODEL ===
  return {
    // Datos
    visitasSeleccionadas,
    
    // Estado
    isSubmitting,
    
    // Acciones
    goBack,
    onSubmit,
  };
};

export type NovedadFormViewModel = ReturnType<typeof useNovedadFormViewModel>;
