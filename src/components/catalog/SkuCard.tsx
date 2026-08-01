import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SkuItem } from '@/types';
import { ItemImage } from './ItemImage';
import { PriceDisplay } from './PriceDisplay';
import { Button, QuantitySelector } from '@/components/ui';
import { useCartStore } from '@/stores/cart';

interface SkuCardProps {
  catalogId: number;
  sku: SkuItem;
}

export const SkuCard: React.FC<SkuCardProps> = ({ catalogId, sku }) => {
  const isAvailable = sku.is_orderable;
  const [quantity, setQuantity] = useState<number>(1);

  const { addItem, replaceItem, isMutating } = useCartStore();

  const handleAddToCart = async () => {
    if (!isAvailable) return;

    const payload = {
      catalog_id: catalogId,
      item_sku_id: sku.sku_id,
      quantity,
    };

    const result = await addItem(payload);

    if (result.success) {
      Alert.alert('カート追加', `${sku.display_name} (${quantity}個) をカートに追加しました。`);
      setQuantity(1);
    } else if (result.conflict) {
      const conflict = result.conflict;
      Alert.alert(
        '別カタログの商品の存在',
        `別のカタログ（${conflict.current_catalog.name}）の商品がカートに入っています。現在のカートをクリアして、この商品を追加しますか？`,
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: 'カートを置き換える',
            style: 'destructive',
            onPress: async () => {
              const replaced = await replaceItem(payload);
              if (replaced) {
                Alert.alert('カート更新', `${sku.display_name} を追加し、カートを更新しました。`);
                setQuantity(1);
              }
            },
          },
        ]
      );
    }
  };

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

        <View style={styles.priceRow}>
          <PriceDisplay
            price={sku.effective_price}
            hasPriceMissing={sku.has_price_missing}
            size="medium"
          />
          {sku.catalog_price && sku.catalog_price !== sku.master_price ? (
            <Text style={styles.overrideBadge}>カタログ価格適用</Text>
          ) : null}
        </View>

        <View style={styles.actionRow}>
          {isAvailable ? (
            <>
              <QuantitySelector
                quantity={quantity}
                onQuantityChange={setQuantity}
                disabled={isMutating}
              />
              <Button
                title={isMutating ? '追加中...' : 'カート追加'}
                onPress={handleAddToCart}
                disabled={isMutating}
                style={styles.cartButton}
              />
            </>
          ) : (
            <Button
              title="注文不可"
              variant="outline"
              disabled={true}
              style={styles.disabledButton}
            />
          )}
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
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  janCode: {
    fontSize: 11,
    color: '#94A3B8',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginVertical: 2,
  },
  specRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
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
  priceRow: {
    marginBottom: 8,
  },
  overrideBadge: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cartButton: {
    flex: 1,
    paddingVertical: 6,
  },
  disabledButton: {
    width: '100%',
    paddingVertical: 6,
  },
});
