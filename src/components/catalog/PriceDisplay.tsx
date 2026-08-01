import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PriceDisplayProps {
  price?: string | number | null;
  minPrice?: string | number | null;
  maxPrice?: string | number | null;
  hasPriceMissing?: boolean;
  size?: 'small' | 'medium' | 'large';
}

function formatJPY(amountStr?: string | number | null): string | null {
  if (amountStr === null || amountStr === undefined || amountStr === '') {
    return null;
  }
  const num = typeof amountStr === 'number' ? amountStr : parseFloat(amountStr);
  if (isNaN(num)) return null;
  return `¥${Math.floor(num).toLocaleString('ja-JP')}`;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  minPrice,
  maxPrice,
  hasPriceMissing = false,
  size = 'medium',
}) => {
  const formattedSingle = formatJPY(price);
  const formattedMin = formatJPY(minPrice);
  const formattedMax = formatJPY(maxPrice);

  const isRange =
    formattedMin && formattedMax && formattedMin !== formattedMax;

  const isMissing =
    hasPriceMissing || (!formattedSingle && !formattedMin && !formattedMax);

  const textStyle = [
    styles.priceText,
    size === 'small' && styles.sizeSmall,
    size === 'medium' && styles.sizeMedium,
    size === 'large' && styles.sizeLarge,
  ];

  if (isMissing) {
    return (
      <View style={styles.badgeMissing}>
        <Text style={styles.badgeMissingText}>価格未設定</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isRange ? (
        <Text style={textStyle}>
          {formattedMin} <Text style={styles.rangeSep}>〜</Text> {formattedMax}
        </Text>
      ) : (
        <Text style={textStyle}>{formattedSingle || formattedMin || '-'}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  sizeSmall: {
    fontSize: 13,
  },
  sizeMedium: {
    fontSize: 15,
  },
  sizeLarge: {
    fontSize: 20,
  },
  rangeSep: {
    fontWeight: '400',
    fontSize: 13,
    color: '#64748B',
  },
  badgeMissing: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeMissingText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '600',
  },
});
