import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useOrderHistoryDetail } from '@/hooks/useOrderHistoryDetail';
import { LoadingOverlay, ErrorMessage, Button } from '@/components/ui';
import { ItemImage } from '@/components/catalog/ItemImage';
import { PriceDisplay } from '@/components/catalog/PriceDisplay';

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ requestId: string }>();
  const requestId = parseInt(params.requestId || '0', 10);

  const { order, isLoading, error, refetch } = useOrderHistoryDetail(requestId);

  if (isLoading && !order) {
    return <LoadingOverlay message="注文詳細を読み込み中..." />;
  }

  if (error || !order) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '注文詳細', headerBackTitle: '戻る' }} />
        <View style={styles.errorContainer}>
          <ErrorMessage message={error?.message || '指定された注文情報が見つかりません。'} />
          <Button title="再試行" onPress={refetch} style={styles.retryButton} />
          <Button title="注文履歴一覧へ戻る" onPress={() => router.push('/orders')} variant="outline" style={styles.retryButton} />
        </View>
      </View>
    );
  }

  const formattedDate = order.submitted_at
    ? new Date(order.submitted_at).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'submitted':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
      case 'approved':
        return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
      case 'rejected':
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
      case 'on_hold':
        return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
      case 'canceled':
        return { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  const statusStyle = getStatusStyle(order.status);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `申請 ${order.request_number}`,
          headerBackTitle: '履歴一覧',
        }}
      />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* ヘッダーカード */}
        <View style={styles.headerCard}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.requestNumberText}>{order.request_number}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {order.status_label || order.status}
              </Text>
            </View>
          </View>

          <Text style={styles.dateLabel}>申請日時: {formattedDate}</Text>
        </View>

        {/* 申請者・所属情報 */}
        <View style={styles.infoCard}>
          <Text style={styles.cardSectionTitle}>申請概要</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>対象カタログ</Text>
            <Text style={styles.infoValueHighlight}>{order.catalog_name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>所属カスタマー</Text>
            <Text style={styles.infoValue}>{order.customer_name}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ご注文担当者</Text>
            <Text style={styles.infoValue}>{order.requester_name}</Text>
          </View>

          <View style={[styles.infoRow, styles.noBorderRow]}>
            <Text style={styles.infoLabel}>連絡先メール</Text>
            <Text style={styles.infoValue} numberOfLines={1} ellipsisMode="middle">
              {order.requester_email || '-'}
            </Text>
          </View>

          {order.note ? (
            <View style={styles.noteContainer}>
              <Text style={styles.noteLabel}>備考:</Text>
              <Text style={styles.noteText}>{order.note}</Text>
            </View>
          ) : null}
        </View>

        {/* 明細一覧 */}
        <View style={styles.linesSection}>
          <Text style={styles.sectionTitle}>
            申請明細 ({order.lines.length}種 / {order.total_quantity}点)
          </Text>

          {order.lines.map((line) => (
            <View key={line.id} style={styles.lineCard}>
              <ItemImage
                image={line.primary_image}
                containerStyle={styles.lineImageContainer}
                style={styles.lineImage}
              />

              <View style={styles.lineContent}>
                <View style={styles.lineHeader}>
                  <Text style={styles.skuCode}>{line.sku_code}</Text>
                  {line.jan_code ? (
                    <Text style={styles.janCode}>JAN: {line.jan_code}</Text>
                  ) : null}
                </View>

                <Text style={styles.lineTitle} numberOfLines={2}>
                  {line.item_name_snapshot}
                </Text>
                {line.sku_name_snapshot ? (
                  <Text style={styles.lineSkuName}>バリエーション: {line.sku_name_snapshot}</Text>
                ) : null}

                <View style={styles.lineFooter}>
                  <Text style={styles.lineQtyText}>数量: {line.quantity}</Text>
                  <View style={styles.priceColumn}>
                    <Text style={styles.unitPriceText}>
                      申請時単価: {line.unit_price_snapshot ? `¥${parseInt(line.unit_price_snapshot, 10).toLocaleString()}` : '未設定'}
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

      {/* 固定ボトムバー */}
      <View style={styles.bottomSummaryBar}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.totalQtyText}>合計数量: {order.total_quantity} 点</Text>
            <Text style={styles.subtotalLabel}>申請時合計金額 (税込)</Text>
          </View>
          <PriceDisplay
            price={order.total_amount}
            hasPriceMissing={!order.total_amount}
            size="large"
          />
        </View>
      </View>
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
  errorContainer: {
    padding: 24,
    justifyContent: 'center',
  },
  retryButton: {
    marginTop: 12,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  requestNumberText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dateLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6,
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
  noteContainer: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
  },
  noteLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  noteText: {
    fontSize: 12,
    color: '#334155',
    marginTop: 2,
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
    width: 72,
    height: 72,
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
  lineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skuCode: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  janCode: {
    fontSize: 10,
    color: '#94A3B8',
  },
  lineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 17,
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
});
