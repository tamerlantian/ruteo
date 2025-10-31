import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { FormInputController } from '../../../../shared/components/ui/form/FormInputController';
import { useForm } from 'react-hook-form';
import { verticalRepository } from '../../../vertical/repositories/vertical.repository';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { cargarVisitasThunk } from '../../store/thunk/visita.thunk';
import { selectIsLoading } from '../../store/selector/visita.selector';
import { FormButton } from '../../../../shared/components/ui/button/FormButton';

interface CargarOrdenFormValues {
  codigo: string;
}

const CargarOrdenComponent = () => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CargarOrdenFormValues>({
    defaultValues: {
      codigo: '',
    },
    mode: 'onChange',
  });

  const onCargarOrden = async (data: CargarOrdenFormValues) => {
    const entrega = await verticalRepository.getEntrega(data.codigo);
    if (entrega) {
      const { schema_name, despacho_id } = entrega;
      dispatch(
        cargarVisitasThunk({
          schemaName: schema_name,
          despachoId: despacho_id,
        }),
      );
    }
  };

  return (
    <View>
      <Text style={styles.title}>Cargar Orden</Text>
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
        title="Cargar Orden"
        onPress={handleSubmit(onCargarOrden)}
        disabled={!isValid || isLoading}
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CargarOrdenComponent;
