import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, Link } from 'expo-router';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { CartBadgeButton } from '@/components/cart/CartBadgeButton';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

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
            <View style={styles.headerRightContainer}>
              <CartBadgeButton />
              <Link href="/(app)/profile" asChild>
                <TouchableOpacity style={styles.headerButton}>
                  <Text style={styles.headerButtonText}>マイページ</Text>
                </TouchableOpacity>
              </Link>
            </View>
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
      <Stack.Screen
        name="cart"
        options={{
          title: 'ショッピングカート',
          headerBackTitle: '戻る',
        }}
      />
      <Stack.Screen
        name="order-confirm"
        options={{
          title: '注文内容の確認',
          headerBackTitle: 'カート',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
