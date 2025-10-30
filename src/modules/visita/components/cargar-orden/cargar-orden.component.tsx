import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { FormInputController } from '../../../../shared/components/ui/form/FormInputController';
import { useForm } from 'react-hook-form';
import { Button } from '../../../../components';

interface CargarOrdenFormValues {
  orden: string;
}

const CargarOrdenComponent = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CargarOrdenFormValues>({
    defaultValues: {
      orden: '',
    },
    mode: 'onChange',
  });

  const onSubmit = (data: CargarOrdenFormValues) => {
    console.log(data);
  };

  return (
    <View>
      <Text style={styles.title}>Cargar Orden</Text>
      <FormInputController
        control={control}
        name="orden"
        label=""
        placeholder="#"
        error={errors.orden}
        rules={{
          required: 'El número de orden es obligatorio',
        }}
      />
      <Button
        title="Cargar Orden"
        onPress={handleSubmit(onSubmit)}
        disabled={!isValid}
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
