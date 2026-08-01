import React from 'react';
import { Stack, Link } from 'expo-router';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#0F172A',
        headerTitleStyle: {
          fontWeight: '700',
        },
        contentStyle: {
          backgroundColor: '#F8FAFC',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'TRANSBOX Mobile',
          headerRight: () => (
            <Link href="/(app)/profile" asChild>
              <TouchableOpacity style={styles.headerButton}>
                <Text style={styles.headerButtonText}>プロフィール</Text>
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      <Stack.Screen
        name="profile/index"
        options={{
          title: 'ユーザー情報',
          headerBackTitle: '戻る',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  headerButtonText: {
    fontSize: 13,
    color: '#208AEF',
    fontWeight: '600',
  },
});
