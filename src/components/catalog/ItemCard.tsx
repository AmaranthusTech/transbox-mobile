import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CatalogProductItem } from '@/types';
import { ItemImage } from './ItemImage';
import { PriceDisplay } from './PriceDisplay';

interface ItemCardProps {
  item: CatalogProductItem;
  onPress: (item: CatalogProductItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`商品 ${item.display_name}`}
    >
      <ItemImage
        image={item.primary_image}
        containerStyle={styles.imageContainer}
        style={styles.image}
      />

      <View style={styles.content}>
        <View style={styles.categoryRow}>
          {item.brand_name ? (
            <Text style={styles.tag}>{item.brand_name}</Text>
          ) : null}
          {item.category_name ? (
            <Text style={styles.tagSecondary}>{item.category_name}</Text>
          ) : null}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {item.display_name}
        </Text>

        <Text style={styles.codeText}>コード: {item.item_code}</Text>

        <View style={styles.footerRow}>
          <PriceDisplay
            minPrice={item.min_price}
            maxPrice={item.max_price}
            hasPriceMissing={item.has_price_missing}
            size="medium"
          />

          <Text style={styles.skuBadge}>{item.sku_count} SKU</Text>
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
    overflow: 'hidden',
    marginBottom: 12,
    flexDirection: 'row',
    height: 120,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  imageContainer: {
    width: 110,
    height: '100%',
    backgroundColor: '#F8FAFC',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagSecondary: {
    fontSize: 10,
    color: '#64748B',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  codeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skuBadge: {
    fontSize: 11,
    color: '#475569',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
