import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useCatalogs } from '@/hooks/useCatalogs';
import { CatalogCard } from '@/components/catalog';
import { LoadingOverlay, ErrorMessage, Button } from '@/components/ui';
import { CatalogItem } from '@/types';

export default function CatalogsListScreen() {
  const { catalogs, isLoading, isRefreshing, error, refresh, retry } = useCatalogs();
  const router = useRouter();

  const handleSelectCatalog = (catalog: CatalogItem) => {
    router.push({
      pathname: '/(app)/catalogs/[catalogId]',
      params: { catalogId: catalog.id },
    });
  };

  if (isLoading && !isRefreshing) {
    return <LoadingOverlay message="カタログ一覧を読み込み中..." />;
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorWrapper}>
          <ErrorMessage message={error.message} />
          <Button title="再試行" onPress={retry} style={styles.retryButton} />
        </View>
      ) : null}

      <FlatList
        data={catalogs}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <CatalogCard catalog={item} onPress={handleSelectCatalog} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            colors={['#208AEF']}
            tintColor="#208AEF"
          />
        }
        ListEmptyComponent={
          !isLoading && !error ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>利用可能なカタログがありません</Text>
              <Text style={styles.emptySubtitle}>
                現在公開されているデジタルカタログはありません。
              </Text>
              <Button title="再読み込み" variant="outline" onPress={refresh} style={styles.emptyButton} />
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
  listContent: {
    padding: 16,
  },
  errorWrapper: {
    padding: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
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
    marginBottom: 20,
    lineHeight: 18,
  },
  emptyButton: {
    width: 140,
  },
});
