import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { FormInputController } from '../../../../shared/components/ui/form/FormInputController';
import { useForm } from 'react-hook-form';
import { verticalRepository } from '../../../vertical/repositories/vertical.repository';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { cargarVisitasThunk } from '../../store/thunk/visita.thunk';
import { selectIsLoading } from '../../store/selector/visita.selector';
import { FormButton } from '../../../../shared/components/ui/button/FormButton';
import { updateSettingsThunk, selectSubdominio } from '../../../settings';
import Toast from 'react-native-toast-message';
import { toastTextOneStyle } from '../../../../shared/styles/global.style';
import { useNovedadTipos } from '../../../novedad/view-models/novedad.view-model';

interface CargarOrdenFormValues {
  codigo: string;
}

const CargarOrdenComponent = () => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const subdominio = useAppSelector(selectSubdominio);
  
  // Query para cargar tipos de novedad cuando hay subdominio
  const { refetch: refetchNovedadTipos } = useNovedadTipos(subdominio || '', !!subdominio);


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
    try {
      const entrega = await verticalRepository.getEntrega(data.codigo);
      if (entrega) {
        const { schema_name, despacho_id } = entrega;
        await dispatch(
          updateSettingsThunk({
            subdominio: schema_name,
            despacho: `${despacho_id}`,
            ordenEntrega: data.codigo,
          }),
        );
        await dispatch(
          cargarVisitasThunk({
            schemaName: schema_name,
            despachoId: despacho_id,
          }),
        );

        try {
          await refetchNovedadTipos();
        } catch (novedadError) {
          console.warn('Error cargando tipos de novedad:', novedadError);
          Toast.show({
            type: 'error',
            text1: 'Error cargando tipos de novedad',
            text1Style: toastTextOneStyle,
          });
          // No bloquear el flujo principal si falla la carga de tipos de novedad
        }

        Toast.show({
          type: 'success',
          text1: 'Orden cargada correctamente',
          text1Style: toastTextOneStyle,
        });
        reset();
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'La orden no existe',
        text1Style: toastTextOneStyle,
      });
    }
  };

  return (
    <View>
      <Text style={styles.title}>Cargar orden</Text>
      <FormInputController
        control={control}
        name="codigo"
        label=""
        placeholder="#"
        error={errors.codigo}
        rules={{
          required: 'El código es obligatorio',
        }}
      />
      <FormButton
        title="Cargar orden"
        onPress={handleSubmit(onCargarOrden)}
        disabled={!isValid}
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CargarOrdenComponent;
