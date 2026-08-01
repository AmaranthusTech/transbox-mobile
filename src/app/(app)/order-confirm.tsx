import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { LoadingOverlay, ErrorMessage, Button } from '@/components/ui';
import { ItemImage } from '@/components/catalog/ItemImage';
import { PriceDisplay } from '@/components/catalog/PriceDisplay';

export default function OrderConfirmScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { cart, isLoading, isMutating, error, fetchCart, submitCart } = useCartStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInFlightRef = useRef(false);

  useEffect(() => {
    fetchCart();
  }, []);

  if (isLoading && !cart) {
    return <LoadingOverlay message="最新の注文情報を取得中..." />;
  }

  const isEmpty = !cart || cart.status === 'empty' || cart.lines.length === 0;

  const customerName = cart?.customer_name || '所属カスタマー';
  const requesterName = cart?.requester_name || user?.display_name || 'ご注文担当者';
  const requesterEmail = cart?.requester_email || user?.email || '-';

  const handleApplyOrderClick = () => {
    if (!cart || !cart.order_available || isMutating || isSubmitting || submitInFlightRef.current) {
      return;
    }

    Alert.alert(
      '注文申請の確定',
      'この内容で注文を申請します。申請後はカート内容を変更できません。よろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '注文を申請する',
          style: 'default',
          onPress: async () => {
            if (submitInFlightRef.current) return;
            submitInFlightRef.current = true;
            setIsSubmitting(true);

            const submittedOrder = await submitCart();

            submitInFlightRef.current = false;
            setIsSubmitting(false);

            if (submittedOrder) {
              router.replace({
                pathname: '/(app)/order-complete',
                params: {
                  request_number: submittedOrder.request_number,
                  submitted_at: submittedOrder.submitted_at,
                  catalog_name: submittedOrder.catalog_name,
                  customer_name: submittedOrder.customer_name,
                  requester_name: submittedOrder.requester_name,
                  requester_email: submittedOrder.requester_email,
                  line_count: String(submittedOrder.line_count),
                  total_quantity: String(submittedOrder.total_quantity),
                  total_amount: submittedOrder.total_amount,
                },
              });
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: '注文内容の確認',
          headerBackTitle: 'カート',
        }}
      />

      {error ? (
        <View style={styles.errorBanner}>
          <ErrorMessage message={error.message} />
        </View>
      ) : null}

      {isEmpty ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>カートに商品がありません</Text>
          <Text style={styles.emptySubtitle}>
            注文確認を行う商品がカートに含まれていません。カタログから商品を追加してください。
          </Text>
          <Button
            title="ショッピングカートへ戻る"
            onPress={() => router.push('/cart')}
            style={styles.actionButton}
          />
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            {/* 1. 注文受付状態・警告 */}
            {!cart.order_available && cart.order_unavailable_reason ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxTitle}>⚠️ 注文申請ができません</Text>
                <Text style={styles.errorBoxText}>{cart.order_unavailable_reason}</Text>
              </View>
            ) : null}

            {/* 2. 発注元・申請者情報カード */}
            <View style={styles.infoCard}>
              <Text style={styles.cardHeaderTitle}>発注元・申請者情報</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>所属カスタマー</Text>
                <Text style={styles.infoValue}>{customerName}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ご注文担当者</Text>
                <Text style={styles.infoValue}>{requesterName}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>連絡先メールアドレス</Text>
                <Text style={styles.infoValue} numberOfLines={1} ellipsisMode="middle">
                  {requesterEmail}
                </Text>
              </View>

              {cart.catalog ? (
                <View style={[styles.infoRow, styles.noBorderRow]}>
                  <Text style={styles.infoLabel}>対象カタログ</Text>
                  <Text style={styles.infoValueHighlight}>{cart.catalog.name}</Text>
                </View>
              ) : null}
            </View>

            {/* 3. 注文明細リスト */}
            <View style={styles.linesSection}>
              <Text style={styles.sectionTitle}>
                注文明細一覧 ({cart.line_count}種 / {cart.total_quantity}点)
              </Text>

              {cart.lines.map((line) => (
                <View key={line.id} style={styles.lineCard}>
                  <ItemImage
                    image={line.primary_image}
                    containerStyle={styles.lineImageContainer}
                    style={styles.lineImage}
                  />

                  <View style={styles.lineContent}>
                    <Text style={styles.lineSkuCode}>{line.sku_code}</Text>
                    <Text style={styles.lineTitle} numberOfLines={2}>
                      {line.item_name}
                    </Text>
                    {line.sku_name ? (
                      <Text style={styles.lineSkuName}>バリエーション: {line.sku_name}</Text>
                    ) : null}

                    <View style={styles.lineFooter}>
                      <Text style={styles.lineQtyText}>数量: {line.quantity}</Text>
                      <View style={styles.priceColumn}>
                        <Text style={styles.unitPriceText}>
                          単価: {line.unit_price ? `¥${parseInt(line.unit_price, 10).toLocaleString()}` : '未設定'}
                        </Text>
                        <PriceDisplay
                          price={line.line_amount}
                          hasPriceMissing={!line.line_amount}
                          size="medium"
                        />
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* 4. 下部固定フッター */}
          <View style={styles.bottomFooter}>
            <View style={styles.footerSummaryRow}>
              <View>
                <Text style={styles.footerQtyText}>合計数量: {cart.total_quantity} 点</Text>
                <Text style={styles.footerSubtotalLabel}>合計金額 (税込)</Text>
              </View>
              <PriceDisplay
                price={cart.subtotal}
                hasPriceMissing={!cart.subtotal}
                size="large"
              />
            </View>

            <Button
              title={isSubmitting ? '申請送信中...' : '注文を申請する'}
              disabled={!cart.order_available || isMutating || isSubmitting}
              onPress={handleApplyOrderClick}
              style={styles.applyButton}
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
  errorBanner: {
    backgroundColor: '#FEF2F2',
    padding: 12,
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
  actionButton: {
    width: '100%',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  errorBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 4,
  },
  errorBoxText: {
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  noBorderRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    maxWidth: '60%',
  },
  infoValueHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    maxWidth: '60%',
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
  lineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  lineImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  lineImage: {
    width: '100%',
    height: '100%',
  },
  lineContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  lineSkuCode: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  lineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  lineSkuName: {
    fontSize: 12,
    color: '#475569',
  },
  lineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  lineQtyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  unitPriceText: {
    fontSize: 11,
    color: '#64748B',
  },
  bottomFooter: {
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
  footerSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerQtyText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  footerSubtotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  applyButton: {
    width: '100%',
  },
});
