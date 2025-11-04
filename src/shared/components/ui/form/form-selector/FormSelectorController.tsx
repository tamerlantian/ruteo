import React from 'react';
import { Control, Controller, FieldError, FieldPath, FieldValues } from 'react-hook-form';
import { FormSelector, Option } from './FormSelector';

interface FormSelectorControllerProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  options: Option[];
  error?: FieldError;
  rules?: Record<string, any>;
  isLoading?: boolean;
  onRetry?: () => void;
  emptyOptionsMessage?: string;
  apiError?: Error | null;
}

export const FormSelectorController = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  error,
  rules,
  isLoading,
  onRetry,
  emptyOptionsMessage,
  apiError,
}: FormSelectorControllerProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <FormSelector
          label={label}
          placeholder={placeholder}
          options={options}
          value={value}
          onValueChange={onChange}
          error={error?.message || (apiError ? 'Error al cargar opciones' : undefined)}
          isLoading={isLoading}
          onRetry={onRetry}
          emptyOptionsMessage={emptyOptionsMessage}
        />
      )}
    />
  );
};
