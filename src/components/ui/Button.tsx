import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  loading = false,
  variant = 'primary',
  disabled,
  style,
  accessibilityLabel,
  ...props
}) => {
  const isButtonDisabled = disabled || loading;

  const buttonStyles = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'outline' && styles.outline,
    variant === 'danger' && styles.danger,
    isButtonDisabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    variant === 'outline' ? styles.outlineText : styles.defaultText,
    isButtonDisabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={isButtonDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isButtonDisabled, busy: loading }}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? '#208AEF' : '#FFFFFF'}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: '#208AEF',
  },
  secondary: {
    backgroundColor: '#475569',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  danger: {
    backgroundColor: '#DC2626',
  },
  disabled: {
    backgroundColor: '#E2E8F0',
    borderColor: '#E2E8F0',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  defaultText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#334155',
  },
  disabledText: {
    color: '#94A3B8',
  },
});
