import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CartLine } from '@/types';
import { ItemImage } from '@/components/catalog/ItemImage';
import { PriceDisplay } from '@/components/catalog/PriceDisplay';
import { QuantitySelector } from '@/components/ui/QuantitySelector';

interface CartLineCardProps {
  line: CartLine;
  onQuantityChange: (lineId: number, newQty: number) => void;
  onRemove: (lineId: number) => void;
  disabled?: boolean;
}

export const CartLineCard: React.FC<CartLineCardProps> = ({
  line,
  onQuantityChange,
  onRemove,
  disabled = false,
}) => {
  return (
    <View style={styles.card}>
      <ItemImage
        image={line.primary_image}
        containerStyle={styles.imageContainer}
        style={styles.image}
      />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.skuCode}>{line.sku_code}</Text>
          <TouchableOpacity
            onPress={() => onRemove(line.id)}
            disabled={disabled}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>削除</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {line.item_name}
        </Text>
        {line.sku_name ? (
          <Text style={styles.skuName}>バリエーション: {line.sku_name}</Text>
        ) : null}

        <View style={styles.footerRow}>
          <QuantitySelector
            quantity={line.quantity}
            onQuantityChange={(newQty) => onQuantityChange(line.id, newQty)}
            disabled={disabled}
          />

          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>小計</Text>
            <PriceDisplay
              price={line.line_amount}
              hasPriceMissing={!line.line_amount}
              size="medium"
            />
          </View>
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
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
    marginBottom: 4,
  },
  skuCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  deleteButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  deleteText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 2,
  },
  skuName: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
  },
});
