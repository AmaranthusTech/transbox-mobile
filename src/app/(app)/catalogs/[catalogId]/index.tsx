import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useCatalogItems } from '@/hooks/useCatalogItems';
import { ItemCard } from '@/components/catalog';
import { Input, LoadingOverlay, ErrorMessage, Button } from '@/components/ui';
import { CatalogProductItem } from '@/types';

export default function CatalogItemsScreen() {
  const params = useLocalSearchParams<{ catalogId: string }>();
  const catalogId = parseInt(params.catalogId || '0', 10);
  const router = useRouter();

  const {
    catalog,
    items,
    searchQuery,
    setSearchQuery,
    isLoading,
    isFetchingMore,
    isRefreshing,
    error,
    hasMore,
    loadMore,
    refresh,
  } = useCatalogItems(catalogId);

  const handleSelectItem = (item: CatalogProductItem) => {
    router.push({
      pathname: '/(app)/catalogs/[catalogId]/items/[itemId]',
      params: { catalogId, itemId: item.item_id },
    });
  };

  const handleOpenAiChat = () => {
    router.push({
      pathname: '/(app)/catalogs/[catalogId]/chat',
      params: { catalogId },
    });
  };

  const isPagingEnabled =
    hasMore && !isLoading && !isFetchingMore && !isRefreshing && !error && items.length > 0;

  if (isLoading && !isRefreshing && items.length === 0) {
    return <LoadingOverlay message="商品一覧を読み込み中..." />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: catalog ? catalog.name : 'カタログ商品',
          headerBackTitle: '一覧',
        }}
      />

      <View style={styles.headerArea}>
        {catalog ? (
          <View style={styles.catalogInfoBox}>
            <View style={styles.catalogBadgeRow}>
              <Text style={styles.codeBadge}>{catalog.code}</Text>
              <Text style={styles.statusBadge}>
                {catalog.order_available ? '受付中' : '受付期間外'}
              </Text>
            </View>
            <Text style={styles.catalogTitle}>{catalog.name}</Text>
            {catalog.description ? (
              <Text style={styles.catalogDesc} numberOfLines={2}>
                {catalog.description}
              </Text>
            ) : null}

            <TouchableOpacity
              style={styles.aiChatButton}
              onPress={handleOpenAiChat}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="AIアシスタントに聞く"
            >
              <Text style={styles.aiChatButtonBadge}>AI RAG</Text>
              <Text style={styles.aiChatButtonText}>AIアシスタントに質問する →</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Input
          placeholder="商品名、商品コード、JANで検索..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          accessibilityLabel="商品検索入力"
        />
      </View>

      {error ? (
        <View style={styles.errorWrapper}>
          <ErrorMessage message={error.message} />
          <Button title="再試行" onPress={refresh} style={styles.retryButton} />
        </View>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.catalog_item_listing_id)}
        renderItem={({ item }) => (
          <ItemCard item={item} onPress={handleSelectItem} />
        )}
        contentContainerStyle={styles.listContent}
        onEndReached={isPagingEnabled ? loadMore : undefined}
        onEndReachedThreshold={0.2}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={['#208AEF']}
            tintColor="#208AEF"
          />
        }
        ListFooterComponent={
          isFetchingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#208AEF" />
              <Text style={styles.footerLoaderText}>さらに読み込み中...</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading && !error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>商品が見つかりません</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `「${searchQuery}」に一致する商品は掲載されていません。`
                  : 'このカタログにはまだ商品が掲載されていません。'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerArea: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  catalogInfoBox: {
    marginBottom: 12,
  },
  catalogBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 4,
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
  statusBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catalogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  catalogDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  aiChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#208AEF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    gap: 8,
  },
  aiChatButtonBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiChatButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchInput: {
    height: 42,
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  listContent: {
    padding: 16,
  },
  errorWrapper: {
    padding: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 13,
    color: '#64748B',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
