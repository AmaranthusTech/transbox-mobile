import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { LoadingOverlay } from '@/components/ui';

export default function RootLayout() {
  const { isHydrated, isAuthenticated, hydrate } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [isHydrated, isAuthenticated, segments]);

  if (!isHydrated) {
    return (
      <SafeAreaProvider>
        <LoadingOverlay message="認証情報を確認中..." />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Slot />
    </SafeAreaProvider>
  );
}
