import React from 'react';
import { View, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import { SignatureCapture } from '../../../../../shared/components/ui/signature/SignatureCapture';
import { entregaFormStyles } from '../entrega-form.style';

interface SignatureFieldProps {
  control: any;
  name: string;
  label: string;
  error?: any;
  rules?: any;
  required?: boolean;
  onScrollEnable?: (enabled: boolean) => void;
  navigation?: any; // Navigation object para controlar gestos del modal
}

/**
 * Campo de firma para formularios usando React Hook Form
 * Integra SignatureCapture con el sistema de formularios
 */
export const SignatureField: React.FC<SignatureFieldProps> = ({
  control,
  name,
  label,
  error,
  rules,
  onScrollEnable,
  navigation,
}) => {
  return (
    <View style={entregaFormStyles.signatureFieldContainer}>
      {/* Label */}
      <Text style={entregaFormStyles.signatureLabel}>
        {label}
      </Text>

      {/* Controller para React Hook Form */}
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange } }) => (
          <SignatureCapture
            onSignatureCapture={(signature: string) => {
              onChange(signature);
            }}
            onSignatureClear={() => {
              onChange('');
            }}
            onScrollEnable={onScrollEnable}
            navigation={navigation}
            width={325}
            height={160}
          />
        )}
      />

      {/* Error message */}
      {error && (
        <Text style={entregaFormStyles.signatureError}>
          {error.message}
        </Text>
      )}

      {/* Helper text */}
      <Text style={entregaFormStyles.signatureHelper}>
        Firme con su dedo en el recuadro. Al terminar, la firma se guardará automáticamente.
      </Text>
    </View>
  );
};
