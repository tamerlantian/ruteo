import React, { useState } from 'react';
import { Control, Controller, FieldError, FieldPath, FieldValues } from 'react-hook-form';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

interface PasswordInputControllerProps<T extends FieldValues>
  extends Omit<
    React.ComponentProps<typeof TextInput>,
    'value' | 'onChangeText' | 'secureTextEntry'
  > {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  error?: FieldError;
  rules?: Record<string, any>;
}

export const PasswordInputController = <T extends FieldValues>({
  control,
  name,
  label,
  error,
  rules,
  ...props
}: PasswordInputControllerProps<T>) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prev => !prev);
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{label}</Text>
          <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
            <TextInput
              style={styles.input}
              placeholderTextColor="#999"
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              {...props}
            />
            <TouchableOpacity
              style={styles.visibilityToggle}
              onPress={togglePasswordVisibility}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="#777"
              />
            </TouchableOpacity>
          </View>
          {error ? <Text style={styles.errorText}>{error.message}</Text> : null}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  inputWrapperError: {
    borderColor: '#ff3b30',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  visibilityToggle: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 5,
  },
});
