import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OrderHistoryListItem } from '@/types';
import { ItemImage } from '@/components/catalog/ItemImage';
import { PriceDisplay } from '@/components/catalog/PriceDisplay';

interface OrderHistoryCardProps {
  item: OrderHistoryListItem;
  onPress: (item: OrderHistoryListItem) => void;
}

export const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({ item, onPress }) => {
  const formattedDate = item.submitted_at
    ? new Date(item.submitted_at).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

  const getStatusStyle = (status: string, hasConvertedOrder: boolean) => {
    if (hasConvertedOrder) {
      return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
    }
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

  const hasConvertedOrder = !!item.converted_order_number;
  const statusStyle = getStatusStyle(item.status, hasConvertedOrder);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.requestNumber}>{item.request_number}</Text>
          {item.converted_order_number ? (
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#059669', marginTop: 2 }}>
              正式注文: {item.converted_order_number}
            </Text>
          ) : null}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {item.status_label || (hasConvertedOrder ? '正式注文作成済み' : item.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.dateText}>申請日時: {formattedDate}</Text>

      <View style={styles.contentRow}>
        <ItemImage
          image={item.representative_image}
          containerStyle={styles.imageContainer}
          style={styles.image}
        />

        <View style={styles.infoColumn}>
          <Text style={styles.catalogName} numberOfLines={1}>
            カタログ: {item.catalog_name}
          </Text>
          <Text style={styles.itemLabel} numberOfLines={2}>
            {item.representative_item_label || '掲載商品'}
          </Text>

          <View style={styles.footerRow}>
            <Text style={styles.qtyText}>計 {item.total_quantity} 点</Text>
            <PriceDisplay
              price={item.total_amount}
              hasPriceMissing={!item.total_amount}
              size="medium"
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  requestNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoColumn: {
    flex: 1,
    justifyContent: 'space-between',
  },
  catalogName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 2,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 17,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  qtyText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
});
