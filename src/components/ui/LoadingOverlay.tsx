import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = '読み込み中...',
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#208AEF" />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  text: {
    marginTop: 16,
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
});
