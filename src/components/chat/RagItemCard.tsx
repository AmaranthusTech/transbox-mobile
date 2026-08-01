import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CatalogRagSource } from '@/types';
import { ItemImage, PriceDisplay } from '@/components/catalog';

interface RagItemCardProps {
  source: CatalogRagSource;
  onPress: (source: CatalogRagSource) => void;
}

export const RagItemCard: React.FC<RagItemCardProps> = ({ source, onPress }) => {
  const similarityPct = Math.round(source.similarity * 100);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(source)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`候補商品 ${source.display_name}`}
    >
      <ItemImage
        image={source.primary_image}
        containerStyle={styles.imageContainer}
        style={styles.image}
      />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.categoryRow}>
            {source.brand_name ? (
              <Text style={styles.tag}>{source.brand_name}</Text>
            ) : null}
            {source.category_name ? (
              <Text style={styles.tagSecondary}>{source.category_name}</Text>
            ) : null}
          </View>

          <View style={styles.similarityBadge}>
            <Text style={styles.similarityText}>一致度 {similarityPct}%</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {source.display_name}
        </Text>

        <Text style={styles.codeText}>コード: {source.item_code}</Text>

        <View style={styles.footerRow}>
          <PriceDisplay
            minPrice={source.min_price}
            maxPrice={source.max_price}
            hasPriceMissing={source.has_price_missing}
            size="small"
          />

          <Text style={styles.detailLinkText}>詳細を見る →</Text>
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
    marginTop: 8,
    flexDirection: 'row',
    height: 110,
  },
  imageContainer: {
    width: 100,
    height: '100%',
    backgroundColor: '#F8FAFC',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  tag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#334155',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  tagSecondary: {
    fontSize: 9,
    color: '#64748B',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  similarityBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  similarityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#208AEF',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 16,
  },
  codeText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#208AEF',
  },
});
