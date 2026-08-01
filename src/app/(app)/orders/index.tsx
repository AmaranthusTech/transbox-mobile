import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useOrderHistory } from '@/hooks/useOrderHistory';
import { OrderHistoryCard } from '@/components/orderHistory/OrderHistoryCard';
import { LoadingOverlay, ErrorMessage, Input, Button } from '@/components/ui';
import { OrderHistoryListItem } from '@/types';

export default function OrderHistoryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState<string>('');
  const [activeSearch, setActiveSearch] = useState<string>('');

  const {
    items,
    isLoading,
    isRefreshing,
    isFetchingMore,
    hasMore,
    error,
    refresh,
    loadMore,
    retry,
  } = useOrderHistory({ search: activeSearch });

  const handleSearchSubmit = () => {
    setActiveSearch(search.trim());
  };

  const handleClearSearch = () => {
    setSearch('');
    setActiveSearch('');
  };

  const handleSelectOrder = (order: OrderHistoryListItem) => {
    router.push({
      pathname: '/(app)/orders/[requestId]',
      params: { requestId: order.id },
    });
  };

  if (isLoading && !isRefreshing && items.length === 0) {
    return <LoadingOverlay message="注文履歴を読み込み中..." />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: '注文履歴',
          headerBackTitle: '戻る',
        }}
      />

      {/* 検索バー */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputRow}>
          <Input
            placeholder="申請番号・カタログ名・商品名で検索"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            containerStyle={styles.searchInput}
          />
          <Button
            title="検索"
            onPress={handleSearchSubmit}
            style={styles.searchButton}
          />
        </View>

        {activeSearch ? (
          <View style={styles.activeFilterRow}>
            <Text style={styles.activeFilterText}>
              検索条件: "{activeSearch}"
            </Text>
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearSearchButton}>
              <Text style={styles.clearSearchText}>条件解除</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <ErrorMessage message={error.message} />
          <Button title="再試行" onPress={retry} variant="outline" style={styles.retryButton} />
        </View>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <OrderHistoryCard item={item} onPress={handleSelectOrder} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} colors={['#2563EB']} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>注文履歴はありません</Text>
              <Text style={styles.emptySubtitle}>
                {activeSearch
                  ? '検索条件に一致する注文申請が見つかりませんでした。'
                  : '過去の注文申請履歴がまだ存在しません。カタログから商品をご申請ください。'}
              </Text>
              {activeSearch ? (
                <Button title="検索条件をクリア" onPress={handleClearSearch} variant="outline" />
              ) : (
                <Button title="カタログ一覧を見る" onPress={() => router.push('/catalogs')} />
              )}
            </View>
          ) : null
        }
        ListFooterComponent={
          isFetchingMore ? (
            <View style={styles.footerLoader}>
              <Text style={styles.footerLoaderText}>追加の注文履歴を読み込み中...</Text>
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
  searchContainer: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  activeFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  activeFilterText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  clearSearchButton: {
    padding: 2,
  },
  clearSearchText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  errorContainer: {
    padding: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerLoaderText: {
    fontSize: 12,
    color: '#64748B',
  },
});
