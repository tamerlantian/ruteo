import React from 'react';
import { View, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import { PhotoCaptureVision } from '../../../../../shared/components/ui/photo-capture/PhotoCaptureVision';
import { PhotoData } from '../../../../../shared/components/ui/photo-capture/PhotoCapture.types';
import { entregaFormStyles } from '../entrega-form.style';

interface PhotoFieldProps {
  control: any;
  name: string;
  label: string;
  error?: any;
  disabled?: boolean;
  rules?: any;
  required?: boolean;
  maxPhotos?: number;
}

/**
 * Campo de fotos para formularios usando React Hook Form
 * Integra PhotoCaptureVision (Vision Camera) con el sistema de formularios
 */
export const PhotoField: React.FC<PhotoFieldProps> = ({
  control,
  name,
  label,
  error,
  disabled,
  rules,
  maxPhotos = 5,
}) => {
  return (
    <View style={entregaFormStyles.photoFieldContainer}>
      {/* Label */}
      <Text style={entregaFormStyles.photoLabel}>
        {label}
      </Text>

      {/* Controller para React Hook Form */}
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, value } }) => (
          <PhotoCaptureVision
            photos={value || []}
            onPhotosChange={(photos: PhotoData[]) => {
              onChange(photos);
            }}
            maxPhotos={maxPhotos}
            disabled={disabled}
          />
        )}
      />

      {/* Error message */}
      {error && (
        <Text style={entregaFormStyles.photoError}>
          {error.message}
        </Text>
      )}

      {/* Helper text */}
      <Text style={entregaFormStyles.photoHelper}>
        Toma fotos para documentar la entrega. Máximo {maxPhotos} fotos.
      </Text>
    </View>
  );
};
