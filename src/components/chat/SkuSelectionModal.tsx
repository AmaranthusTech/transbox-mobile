import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { catalogsApi } from '@/api/catalogs';
import { CatalogRagSource, ProductDetail, SkuItem } from '@/types';
import { ItemImage } from '@/components/catalog/ItemImage';
import { PriceDisplay } from '@/components/catalog/PriceDisplay';
import { Button } from '@/components/ui/Button';
import { QuantitySelector } from '@/components/ui/QuantitySelector';

interface SkuSelectionModalProps {
  visible: boolean;
  catalogId: number;
  source: CatalogRagSource | null;
  onClose: () => void;
  onAddToCart: (
    itemDetail: ProductDetail,
    selectedSku: SkuItem,
    quantity: number
  ) => Promise<boolean>;
  isSubmitting?: boolean;
}

export const SkuSelectionModal: React.FC<SkuSelectionModalProps> = ({
  visible,
  catalogId,
  source,
  onClose,
  onAddToCart,
  isSubmitting = false,
}) => {
  const router = useRouter();
  const [itemDetail, setItemDetail] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSku, setSelectedSku] = useState<SkuItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [addSuccessMsg, setAddSuccessMsg] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!catalogId || !source?.item_id) return;
    setIsLoading(true);
    setError(null);
    setSelectedSku(null);
    setQuantity(1);
    setAddSuccessMsg(null);

    try {
      const detail = await catalogsApi.getItemDetail(catalogId, source.item_id);
      setItemDetail(detail);

      if (detail.skus && detail.skus.length > 0) {
        // 最初の注文可能かつ価格が設定されているSKUをデフォルト選択、なければ1つ目
        const availableFirst = detail.skus.find((s) => s.is_orderable && !s.has_price_missing) || detail.skus[0];
        setSelectedSku(availableFirst);
      }
    } catch (err: any) {
      console.warn(
        `[SkuSelectionModal] getItemDetail failed (catalogId=${catalogId}, itemId=${source?.item_id}):`,
        err?.response?.status,
        err?.response?.data || err?.message
      );
      setError(err?.response?.data?.error?.message || '商品仕様情報の取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [catalogId, source?.item_id]);

  useEffect(() => {
    if (visible && source) {
      fetchDetail();
    } else {
      setItemDetail(null);
      setSelectedSku(null);
      setAddSuccessMsg(null);
    }
  }, [visible, source, fetchDetail]);

  const handleConfirmAdd = async () => {
    if (!itemDetail || !selectedSku || isSubmitting) return;
    const success = await onAddToCart(itemDetail, selectedSku, quantity);
    if (success) {
      setAddSuccessMsg(`「${itemDetail.display_name} / ${selectedSku.display_name}」を ${quantity} 点カートに追加しました。`);
    }
  };

  const handleGoToCart = () => {
    onClose();
    router.push('/cart');
  };

  if (!visible || !source) return null;

  // 商品ヘッダー用の価格集計
  let minPrice: number | null = null;
  let maxPrice: number | null = null;
  let hasPriceMissing = true;

  if (itemDetail?.skus && itemDetail.skus.length > 0) {
    const validPrices = itemDetail.skus
      .map((s) => (s.effective_price ? parseFloat(s.effective_price) : null))
      .filter((p): p is number => p !== null && !isNaN(p));

    if (validPrices.length > 0) {
      minPrice = Math.min(...validPrices);
      maxPrice = Math.max(...validPrices);
      hasPriceMissing = false;
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.sheetContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>SKUを選択してカート追加</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ローディング状態 */}
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loaderText}>最新の掲載情報・単価を取得中...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Button title="再試行" onPress={fetchDetail} variant="outline" />
            </View>
          ) : addSuccessMsg ? (
            /* 追加成功表示 */
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>🎉</Text>
              <Text style={styles.successTitle}>カートに追加しました</Text>
              <Text style={styles.successMessage}>{addSuccessMsg}</Text>
              <View style={styles.successActions}>
                <Button
                  title="会話を続ける"
                  onPress={onClose}
                  variant="outline"
                  style={styles.actionBtn}
                />
                <Button
                  title="カートを見る 🛒"
                  onPress={handleGoToCart}
                  style={styles.actionBtn}
                />
              </View>
            </View>
          ) : itemDetail ? (
            /* メイン選択コンテンツ */
            <ScrollView style={styles.sheetBody} contentContainerStyle={styles.sheetBodyContent}>
              {/* 商品情報 */}
              <View style={styles.itemSummaryRow}>
                <ItemImage
                  image={itemDetail.images && itemDetail.images.length > 0 ? itemDetail.images[0] : null}
                  containerStyle={styles.itemImageContainer}
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {itemDetail.display_name}
                  </Text>
                  <Text style={styles.itemCode}>コード: {itemDetail.item_code}</Text>
                  <PriceDisplay
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    hasPriceMissing={hasPriceMissing}
                    size="small"
                  />
                </View>
              </View>

              {/* SKU一覧選択 */}
              <Text style={styles.sectionLabel}>
                バリエーション (全 {itemDetail.skus.length} 件)
              </Text>

              {itemDetail.skus.map((sku) => {
                const isSelected = selectedSku?.sku_id === sku.sku_id;
                const isAvailable = sku.is_orderable && !sku.has_price_missing;

                return (
                  <TouchableOpacity
                    key={sku.sku_id}
                    style={[
                      styles.skuCard,
                      isSelected && styles.skuCardSelected,
                      !isAvailable && styles.skuCardDisabled,
                    ]}
                    onPress={() => setSelectedSku(sku)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.radioRow}>
                      <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                        {isSelected ? <View style={styles.radioInner} /> : null}
                      </View>
                      <View style={styles.skuHeaderColumn}>
                        <Text style={styles.skuTitle}>{sku.display_name}</Text>
                        <Text style={styles.skuSubCode}>
                          SKU: {sku.sku_code} {sku.jan_code ? `| JAN: ${sku.jan_code}` : ''}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.skuPriceRow}>
                      <PriceDisplay
                        price={sku.effective_price}
                        hasPriceMissing={sku.has_price_missing}
                        size="medium"
                      />
                      {!isAvailable ? (
                        <Text style={styles.unavailableBadge}>
                          {sku.has_price_missing ? '価格未設定' : '受入停止中'}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* 数量選択 */}
              <View style={styles.quantitySection}>
                <Text style={styles.sectionLabel}>数量指定</Text>
                <QuantitySelector
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  min={1}
                  max={999}
                  disabled={isSubmitting || !selectedSku || !selectedSku.is_orderable || selectedSku.has_price_missing}
                />
              </View>
            </ScrollView>
          ) : null}

          {/* 固定フッターアクション */}
          {!addSuccessMsg && !isLoading && !error && itemDetail ? (
            <View style={styles.sheetFooter}>
              <Button
                title={isSubmitting ? 'カートに追加中...' : 'カートに追加する'}
                onPress={handleConfirmAdd}
                disabled={!selectedSku || !selectedSku.is_orderable || selectedSku.has_price_missing || isSubmitting}
                style={styles.submitButton}
              />
            </View>
          ) : null}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    minHeight: 350,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    position: 'relative',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '600',
  },
  loaderContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  successContainer: {
    padding: 32,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  successMessage: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  successActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
  },
  sheetBody: {
    flex: 1,
  },
  sheetBodyContent: {
    padding: 16,
  },
  itemSummaryRow: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  itemImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  itemCode: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginTop: 4,
  },
  skuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 8,
  },
  skuCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  skuCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#F8FAFC',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#2563EB',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  skuHeaderColumn: {
    flex: 1,
  },
  skuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  skuSubCode: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  skuPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 28,
  },
  unavailableBadge: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  quantitySection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sheetFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    width: '100%',
  },
});
