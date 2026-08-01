import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useCartStore } from '@/stores/cart';
import { CartLineCard } from '@/components/cart/CartLineCard';
import { LoadingOverlay, ErrorMessage, Button } from '@/components/ui';
import { PriceDisplay } from '@/components/catalog/PriceDisplay';

export default function CartScreen() {
  const router = useRouter();
  const {
    cart,
    isLoading,
    isMutating,
    error,
    fetchCart,
    updateLine,
    removeLine,
    clearCart,
    clearError,
  } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (lineId: number, newQty: number) => {
    await updateLine(lineId, { quantity: newQty });
  };

  const handleRemoveLine = (lineId: number) => {
    Alert.alert('明細の削除', 'この商品をカートから削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => removeLine(lineId),
      },
    ]);
  };

  const handleClearCart = () => {
    Alert.alert('カートのクリア', 'カート内のすべての商品を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '全削除',
        style: 'destructive',
        onPress: () => clearCart(),
      },
    ]);
  };

  if (isLoading && !cart) {
    return <LoadingOverlay message="カートを読み込み中..." />;
  }

  const isEmpty = !cart || cart.status === 'empty' || cart.lines.length === 0;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'ショッピングカート',
          headerBackTitle: '戻る',
          headerRight: () =>
            !isEmpty ? (
              <TouchableOpacity onPress={handleClearCart} style={styles.clearHeaderButton}>
                <Text style={styles.clearHeaderText}>全削除</Text>
              </TouchableOpacity>
            ) : null,
        }}
      />

      {error ? (
        <View style={styles.errorBanner}>
          <ErrorMessage message={error.message} />
          <TouchableOpacity onPress={clearError} style={styles.dismissError}>
            <Text style={styles.dismissErrorText}>閉じる</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>カートに商品はありません</Text>
          <Text style={styles.emptySubtitle}>
            電子カタログから商品を選んでカートに追加してください。
          </Text>
          <Button
            title="電子カタログ一覧を見る"
            onPress={() => router.push('/catalogs')}
            style={styles.browseButton}
          />
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            {cart.catalog ? (
              <View style={styles.catalogCard}>
                <Text style={styles.catalogLabel}>対象カタログ</Text>
                <Text style={styles.catalogName}>{cart.catalog.name}</Text>
                {!cart.order_available && cart.order_unavailable_reason ? (
                  <View style={styles.warningBanner}>
                    <Text style={styles.warningText}>⚠️ {cart.order_unavailable_reason}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            <View style={styles.linesSection}>
              <Text style={styles.sectionTitle}>
                カート明細 ({cart.line_count}種 / {cart.total_quantity}点)
              </Text>
              {cart.lines.map((line) => (
                <CartLineCard
                  key={line.id}
                  line={line}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveLine}
                  disabled={isMutating}
                />
              ))}
            </View>
          </ScrollView>

          <View style={styles.bottomSummaryBar}>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.totalQtyText}>合計 {cart.total_quantity} 点</Text>
                <Text style={styles.subtotalLabel}>小計合計 (税込)</Text>
              </View>
              <PriceDisplay
                price={cart.subtotal}
                hasPriceMissing={!cart.subtotal}
                size="large"
              />
            </View>

            <Button
              title="注文内容を確認する"
              onPress={() => router.push('/order-confirm')}
              disabled={!cart.order_available || isMutating}
              style={styles.checkoutButton}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  clearHeaderButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearHeaderText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FCA5A5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dismissError: {
    padding: 4,
  },
  dismissErrorText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  browseButton: {
    width: '100%',
  },
  catalogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  catalogLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  catalogName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  warningBanner: {
    marginTop: 8,
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  warningText: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '600',
  },
  linesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
  },
  bottomSummaryBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalQtyText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  subtotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  checkoutButton: {
    width: '100%',
  },
});
