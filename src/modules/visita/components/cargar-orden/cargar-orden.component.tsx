import { View, Text, StyleSheet, Keyboard } from 'react-native';
import React from 'react';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { BottomSheetFormInputController } from '../../../../shared/components/ui/form/BottomSheetFormInputController';
import { FormButton } from '../../../../shared/components/ui/button/FormButton';
import { verticalRepository } from '../../../vertical/repositories/vertical.repository';
import { networkService } from '../../../../shared/services';
import { toastTextOneStyle } from '../../../../shared/styles/global.style';
import { authColors } from '../../../auth/styles/auth.theme';
import { useCargarOrden } from '../../hooks/use-cargar-orden.hook';

interface CargarOrdenFormValues {
  codigo: string;
}

const CargarOrdenComponent = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const cargarOrden = useCargarOrden();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CargarOrdenFormValues>({
    defaultValues: {
      codigo: '',
    },
    mode: 'onChange',
  });

  const onCargarOrden = async (data: CargarOrdenFormValues) => {
    const isConnected = await networkService.isConnected();
    if (!isConnected) {
      Toast.show({
        type: 'error',
        text1: 'Sin conexión a internet',
        text2: 'Verifica tu conexión e intenta nuevamente',
        text1Style: toastTextOneStyle,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const entrega = await verticalRepository.getEntrega(data.codigo);
      if (entrega) {
        await cargarOrden(entrega);
        reset();
        Keyboard.dismiss();
      }
    } catch (error: any) {
      console.log(error);
      // 404 / codigo 5 (envelope v2 "no encontrado"): con el scoping por
      // conductor, un despacho ajeno tambien responde 404 a proposito.
      if (error?.codigo === 404 || error?.codigo === 5) {
        Toast.show({
          type: 'error',
          text1: 'Orden no disponible',
          text2: 'La orden no existe o no está asignada a ti.',
          text1Style: toastTextOneStyle,
        });
      } else if (error?.titulo) {
        Toast.show({
          type: 'error',
          text1: error.titulo,
          text2: error.mensaje,
          text1Style: toastTextOneStyle,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error al cargar la orden',
          text2: 'Inténtalo nuevamente.',
          text1Style: toastTextOneStyle,
        });
      }
      Keyboard.dismiss();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="cube-outline" size={28} color={authColors.brandInk} />
      </View>

      <Text style={styles.title}>Cargar orden</Text>
      <Text style={styles.subtitle}>
        Ingresa el código de la orden asignada para ver sus entregas.
      </Text>

      <View style={styles.form}>
        <BottomSheetFormInputController
          keyboardType="numeric"
          control={control}
          name="codigo"
          label="Código de la orden"
          placeholder="Ingresa el código"
          error={errors.codigo}
          rules={{
            required: 'El código es obligatorio',
          }}
          isNumeric={true}
        />
        <FormButton
          title="Cargar orden"
          onPress={handleSubmit(onCargarOrden)}
          disabled={!isValid}
          isLoading={isSubmitting}
          style={styles.submitButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 4,
    paddingHorizontal: 4,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(27, 155, 215, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: authColors.ink,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 14,
    color: authColors.inkSoft,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  form: {
    width: '100%',
  },
  submitButton: {
    backgroundColor: authColors.brandInk,
    borderRadius: 14,
    height: 52,
    marginTop: 4,
  },
});

export default CargarOrdenComponent;
