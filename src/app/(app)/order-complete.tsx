import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui';
import { PriceDisplay } from '@/components/catalog/PriceDisplay';

export default function OrderCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    request_number?: string;
    submitted_at?: string;
    catalog_name?: string;
    customer_name?: string;
    requester_name?: string;
    requester_email?: string;
    line_count?: string;
    total_quantity?: string;
    total_amount?: string;
  }>();

  const requestNumber = params.request_number || 'EUO-XXXXXX-XXXX';
  const catalogName = params.catalog_name || '電子カタログ';
  const customerName = params.customer_name || '所属カスタマー';
  const requesterName = params.requester_name || 'ご注文担当者';
  const lineCount = params.line_count || '0';
  const totalQuantity = params.total_quantity || '0';
  const totalAmount = params.total_amount || '0.00';

  const formattedDate = params.submitted_at
    ? new Date(params.submitted_at).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleString('ja-JP');

  const handleGoHome = () => {
    router.replace('/(app)');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: '注文申請完了',
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>注文申請を受け付けました</Text>
          <Text style={styles.successSubtitle}>
            ご注文申請の受付が正常に完了いたしました。担当者からの確定連絡をお待ちください。
          </Text>

          <View style={styles.numberBadge}>
            <Text style={styles.numberLabel}>申請番号</Text>
            <Text style={styles.numberText}>{requestNumber}</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>申請受付内容</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>申請日時</Text>
            <Text style={styles.detailValue}>{formattedDate}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>対象カタログ</Text>
            <Text style={styles.detailValueHighlight}>{catalogName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>所属カスタマー</Text>
            <Text style={styles.detailValue}>{customerName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ご注文担当者</Text>
            <Text style={styles.detailValue}>{requesterName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>申請商品数</Text>
            <Text style={styles.detailValue}>{lineCount} 種 / {totalQuantity} 点</Text>
          </View>

          <View style={[styles.detailRow, styles.noBorderRow]}>
            <Text style={styles.detailLabel}>合計金額 (税込)</Text>
            <PriceDisplay price={totalAmount} size="medium" />
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Button
            title="ホーム画面へ戻る"
            onPress={handleGoHome}
            style={styles.primaryButton}
          />

          <Button
            title="注文履歴を見る"
            variant="outline"
            onPress={() => router.push('/orders')}
            style={styles.secondaryButton}
          />
        </View>
      </ScrollView>
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
    paddingBottom: 32,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  numberBadge: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    width: '100%',
  },
  numberLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  numberText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 0.5,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  noBorderRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    maxWidth: '60%',
  },
  detailValueHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    maxWidth: '60%',
  },
  actionsContainer: {
    gap: 12,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
});
