import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (newQty: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onQuantityChange,
  min = 1,
  max = 999,
  disabled = false,
}) => {
  const handleDecrement = () => {
    if (disabled || quantity <= min) return;
    onQuantityChange(quantity - 1);
  };

  const handleIncrement = () => {
    if (disabled || quantity >= max) return;
    onQuantityChange(quantity + 1);
  };

  const handleTextChange = (text: string) => {
    if (disabled) return;
    const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10);
    if (isNaN(parsed)) {
      onQuantityChange(min);
    } else {
      const clamped = Math.min(Math.max(parsed, min), max);
      onQuantityChange(clamped);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, (disabled || quantity <= min) && styles.disabledButton]}
        onPress={handleDecrement}
        disabled={disabled || quantity <= min}
      >
        <Text style={styles.buttonText}>-</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={String(quantity)}
        onChangeText={handleTextChange}
        editable={!disabled}
      />

      <TouchableOpacity
        style={[styles.button, (disabled || quantity >= max) && styles.disabledButton]}
        onPress={handleIncrement}
        disabled={disabled || quantity >= max}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  button: {
    width: 32,
    height: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#F8FAFC',
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    width: 44,
    height: 32,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    padding: 0,
  },
});
