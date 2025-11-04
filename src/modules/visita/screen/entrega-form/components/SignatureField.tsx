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
        Use su dedo para firmar en el recuadro. La firma será guardada automáticamente.
      </Text>
    </View>
  );
};
