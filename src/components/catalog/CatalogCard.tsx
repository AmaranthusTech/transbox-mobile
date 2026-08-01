import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CatalogItem } from '@/types';
import { ItemImage } from './ItemImage';

interface CatalogCardProps {
  catalog: CatalogItem;
  onPress: (catalog: CatalogItem) => void;
}

export const CatalogCard: React.FC<CatalogCardProps> = ({ catalog, onPress }) => {
  const isAvailable = catalog.order_available;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(catalog)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`カタログ ${catalog.name}`}
    >
      <View style={styles.imageContainer}>
        <ItemImage image={catalog.cover_image} style={styles.coverImage} />
        <View
          style={[
            styles.statusBadge,
            isAvailable ? styles.badgeOpen : styles.badgeClosed,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isAvailable ? styles.statusOpenText : styles.statusClosedText,
            ]}
          >
            {isAvailable ? '注文受付中' : '受付期間外'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.codeBadge}>{catalog.code}</Text>
          <Text style={styles.itemCount}>{catalog.items_count} 点</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {catalog.name}
        </Text>

        {catalog.order_unavailable_reason ? (
          <Text style={styles.reasonText}>{catalog.order_unavailable_reason}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    height: 140,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeOpen: {
    backgroundColor: '#DCFCE7',
  },
  badgeClosed: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusOpenText: {
    color: '#166534',
  },
  statusClosedText: {
    color: '#64748B',
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#208AEF',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
  },
  reasonText: {
    marginTop: 6,
    fontSize: 12,
    color: '#EF4444',
  },
});
