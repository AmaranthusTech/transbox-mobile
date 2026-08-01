import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '@/stores/cart';

export const CartBadgeButton: React.FC = () => {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);
  const totalQty = cart?.total_quantity || 0;

  const badgeText = totalQty > 99 ? '99+' : String(totalQty);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/cart')}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>🛒</Text>
      {totalQty > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 6,
    position: 'relative',
    marginRight: 8,
  },
  icon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
