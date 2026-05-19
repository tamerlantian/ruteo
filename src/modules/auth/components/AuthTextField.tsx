import { Ionicons } from '@react-native-vector-icons/ionicons';
import React, { useState } from 'react';
import {
  Control,
  Controller,
  FieldError,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { authColors } from '../styles/auth.theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface AuthTextFieldProps<T extends FieldValues>
  extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  icon: IoniconName;
  error?: FieldError;
  rules?: Record<string, any>;
  /** Campo de contrasena: oculta el texto y muestra el toggle de visibilidad. */
  secure?: boolean;
}

/**
 * Campo de texto del rediseno de autenticacion: etiqueta, icono guia,
 * estados de foco/error y toggle de visibilidad para contrasenas.
 * Integrado con react-hook-form via Controller.
 */
export const AuthTextField = <T extends FieldValues>({
  control,
  name,
  label,
  icon,
  error,
  rules,
  secure = false,
  ...props
}: AuthTextFieldProps<T>) => {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const borderColor = error
    ? authColors.danger
    : focused
      ? authColors.brand
      : authColors.border;
  const iconColor = error
    ? authColors.danger
    : focused
      ? authColors.brand
      : authColors.inkMuted;

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={styles.container}>
          <Text style={styles.label}>{label}</Text>
          <View style={[styles.field, { borderColor }]}>
            <Ionicons
              name={icon}
              size={20}
              color={iconColor}
              style={styles.leadingIcon}
            />
            <TextInput
              style={styles.input}
              placeholderTextColor={authColors.inkMuted}
              secureTextEntry={secure && !revealed}
              value={value ?? ''}
              onChangeText={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                onBlur();
                setFocused(false);
              }}
              {...props}
            />
            {secure && (
              <TouchableOpacity
                style={styles.trailing}
                onPress={() => setRevealed(prev => !prev)}
                hitSlop={8}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={revealed ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={authColors.inkMuted}
                />
              </TouchableOpacity>
            )}
          </View>
          {error && (
            <View style={styles.errorRow}>
              <Ionicons
                name="alert-circle"
                size={13}
                color={authColors.danger}
              />
              <Text style={styles.errorText}>{error.message}</Text>
            </View>
          )}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: authColors.inkSoft,
    marginBottom: 7,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: authColors.field,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  leadingIcon: {
    marginLeft: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: authColors.ink,
    paddingHorizontal: 11,
    paddingVertical: 0,
  },
  trailing: {
    paddingHorizontal: 14,
    height: '100%',
    justifyContent: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorText: {
    color: authColors.danger,
    fontSize: 12.5,
    marginLeft: 4,
    flex: 1,
  },
});
