import { ItemImage, PriceDisplay } from '@/components/catalog';
import { CatalogRagSource } from '@/types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RagItemCardProps {
  source: CatalogRagSource;
  onPress: (source: CatalogRagSource) => void;
  onSelectSku?: (source: CatalogRagSource) => void;
}

export const RagItemCard: React.FC<RagItemCardProps> = ({ source, onPress, onSelectSku }) => {
  const similarityPct = Math.round(source.similarity * 100);

  return (
    <View style={styles.card}>
      {/* 上部: 固定高画像 */}
      <TouchableOpacity
        style={styles.imageWrapper}
        onPress={() => onPress(source)}
        activeOpacity={0.85}
      >
        <ItemImage
          image={source.primary_image}
          containerStyle={styles.imageContainer}
          style={styles.image}
        />
        <View style={styles.similarityBadge}>
          <Text style={styles.similarityText}>一致度 {similarityPct}%</Text>
        </View>
      </TouchableOpacity>

      {/* 中部: 商品情報 */}
      <TouchableOpacity
        style={styles.content}
        onPress={() => onPress(source)}
        activeOpacity={0.85}
      >
        <View style={styles.categoryRow}>
          {source.brand_name ? (
            <Text style={styles.tag} numberOfLines={1}>{source.brand_name}</Text>
          ) : null}
          {source.category_name ? (
            <Text style={styles.tagSecondary} numberOfLines={1}>{source.category_name}</Text>
          ) : null}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {source.display_name}
        </Text>

        <Text style={styles.codeText} numberOfLines={1}>商品コード: {source.item_code}</Text>

        <View style={styles.priceRow}>
          <View style={styles.priceWrapper}>
            <PriceDisplay
              minPrice={source.min_price}
              maxPrice={source.max_price}
              hasPriceMissing={source.has_price_missing}
              size="medium"
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* 下部: 明示的アクションボタンエリア */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => onPress(source)}
          activeOpacity={0.7}
        >
          <Text style={styles.detailButtonText} numberOfLines={1}>商品詳細を見る</Text>
        </TouchableOpacity>

        {onSelectSku ? (
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => onSelectSku(source)}
            activeOpacity={0.7}
          >
            <Text style={styles.addToCartButtonText} numberOfLines={1}>🛒 SKUを選んでカート追加</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
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
    marginBottom: 6,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  imageWrapper: {
    width: '100%',
    maxWidth: '100%',
    height: 135,
    backgroundColor: '#F8FAFC',
    position: 'relative',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    maxWidth: '100%',
    height: '100%',
    backgroundColor: '#F8FAFC',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  similarityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  similarityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    padding: 10,
    width: '100%',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 4,
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
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 4,
    flexShrink: 1,
  },
  codeText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  priceWrapper: {
    flexShrink: 1,
    maxWidth: '100%',
  },
  actionRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
    padding: 8,
    gap: 6,
    width: '100%',
  },
  detailButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'stretch',
  },
  detailButtonText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'stretch',
  },
  addToCartButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
