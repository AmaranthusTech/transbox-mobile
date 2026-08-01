import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useItemDetail } from '@/hooks/useItemDetail';
import { ItemImage, SkuCard } from '@/components/catalog';
import { LoadingOverlay, ErrorMessage, Button } from '@/components/ui';

export default function ItemDetailScreen() {
  const params = useLocalSearchParams<{ catalogId: string; itemId: string }>();
  const catalogId = parseInt(params.catalogId || '0', 10);
  const itemId = parseInt(params.itemId || '0', 10);

  const { product, isLoading, error, retry } = useItemDetail(catalogId, itemId);

  if (isLoading) {
    return <LoadingOverlay message="商品詳細を読み込み中..." />;
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <ErrorMessage message={error?.message || '商品が見つかりません。'} />
        <Button title="再試行" onPress={retry} style={styles.retryButton} />
      </View>
    );
  }

  const primaryImage = product.images.length > 0 ? product.images[0] : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          title: product.display_name,
          headerBackTitle: '商品一覧',
        }}
      />

      <View style={styles.imageCard}>
        <ItemImage
          image={primaryImage}
          containerStyle={styles.mainImageContainer}
          style={styles.mainImage}
        />
      </View>

      <View style={styles.detailCard}>
        <View style={styles.categoryRow}>
          {product.brand_name ? (
            <Text style={styles.tag}>{product.brand_name}</Text>
          ) : null}
          {product.category_name ? (
            <Text style={styles.tagSecondary}>{product.category_name}</Text>
          ) : null}
        </View>

        <Text style={styles.title}>{product.display_name}</Text>
        <Text style={styles.codeText}>商品コード: {product.item_code}</Text>

        {product.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>商品説明</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>
        ) : null}

        {product.specification ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>仕様・規格</Text>
            <Text style={styles.descriptionText}>{product.specification}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.skuSection}>
        <Text style={styles.skuSectionTitle}>
          バリエーション・SKU 一覧 ({product.skus.length})
        </Text>
        {product.skus.length === 0 ? (
          <Text style={styles.emptySkuText}>掲載可能なバリエーションがありません。</Text>
        ) : (
          product.skus.map((sku) => (
            <SkuCard key={sku.sku_id} catalogId={catalogId} sku={sku} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  retryButton: {
    marginTop: 12,
  },
  imageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  mainImageContainer: {
    width: '100%',
    height: 240,
    backgroundColor: '#F8FAFC',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#208AEF',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tagSecondary: {
    fontSize: 11,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 26,
    marginBottom: 4,
  },
  codeText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  section: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  skuSection: {
    marginBottom: 24,
  },
  skuSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  emptySkuText: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
});
