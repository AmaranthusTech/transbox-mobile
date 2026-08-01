import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  style,
  accessibilityLabel,
  secureTextEntry,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(!isPassword);

  const isSecure = isPassword ? !showPassword : secureTextEntry;

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, error ? styles.inputError : null, style]}
          placeholderTextColor="#94A3B8"
          secureTextEntry={isSecure}
          accessibilityLabel={accessibilityLabel || label}
          {...props}
        />
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.toggleButton}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'パスワードを非表示' : 'パスワードを表示'}
          >
            <Text style={styles.toggleText}>
              {showPassword ? '非表示' : '表示'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  toggleButton: {
    position: 'absolute',
    right: 12,
    padding: 6,
  },
  toggleText: {
    fontSize: 13,
    color: '#208AEF',
    fontWeight: '600',
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#EF4444',
  },
});
