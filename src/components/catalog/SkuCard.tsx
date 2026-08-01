import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SkuItem } from '@/types';
import { ItemImage } from './ItemImage';
import { PriceDisplay } from './PriceDisplay';
import { Button } from '@/components/ui';

interface SkuCardProps {
  sku: SkuItem;
}

export const SkuCard: React.FC<SkuCardProps> = ({ sku }) => {
  const isAvailable = sku.is_orderable;

  return (
    <View style={styles.card}>
      <ItemImage
        image={sku.image}
        containerStyle={styles.imageContainer}
        style={styles.image}
      />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.skuCode}>{sku.sku_code}</Text>
          {sku.jan_code ? (
            <Text style={styles.janCode}>JAN: {sku.jan_code}</Text>
          ) : null}
        </View>

        <Text style={styles.title}>{sku.display_name}</Text>

        <View style={styles.specRow}>
          {sku.color ? (
            <Text style={styles.specTag}>カラー: {sku.color}</Text>
          ) : null}
          {sku.size ? (
            <Text style={styles.specTag}>サイズ: {sku.size}</Text>
          ) : null}
          {sku.order_number ? (
            <Text style={styles.specTag}>注文No: {sku.order_number}</Text>
          ) : null}
        </View>

        <View style={styles.footerRow}>
          <View>
            <PriceDisplay
              price={sku.effective_price}
              hasPriceMissing={sku.has_price_missing}
              size="medium"
            />
            {sku.catalog_price && sku.catalog_price !== sku.master_price ? (
              <Text style={styles.overrideBadge}>カタログ価格適用</Text>
            ) : null}
          </View>

          <Button
            title={isAvailable ? 'カート追加 (Phase 1-D)' : '注文不可'}
            variant="outline"
            disabled={true}
            style={styles.cartButton}
          />
        </View>
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
    marginBottom: 12,
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skuCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#208AEF',
  },
  janCode: {
    fontSize: 11,
    color: '#64748B',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginVertical: 2,
  },
  specRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  specTag: {
    fontSize: 11,
    color: '#475569',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  overrideBadge: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
  cartButton: {
    height: 34,
    paddingHorizontal: 12,
  },
});
