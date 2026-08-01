import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.heroCard}
        onPress={() => router.push('/(app)/catalogs')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="カタログ一覧を見る"
      >
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>Phase 1-B</Text>
        </View>
        <Text style={styles.heroTitle}>デジタルカタログを閲覧</Text>
        <Text style={styles.heroSubtitle}>
          公開カタログ一覧、掲載商品および価格・SKU一覧を確認できます。
        </Text>
        <View style={styles.heroButtonRow}>
          <Text style={styles.heroButtonText}>カタログ一覧を見る →</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.heroCard, styles.historyHeroCard]}
        onPress={() => router.push('/orders')}
        activeOpacity={0.8}
      >
        <Text style={styles.heroBadge}>ORDER HISTORY</Text>
        <Text style={styles.heroTitle}>過去の注文履歴</Text>
        <Text style={styles.heroDescription}>
          過去に提出した注文申請の一覧・ステータスおよび申請詳細を確認できます。
        </Text>
        <View style={styles.heroButtonRow}>
          <Text style={styles.heroButtonText}>注文履歴を見る →</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.welcomeTitle}>
          ようこそ、{user?.display_name || 'ユーザー'} さん
        </Text>

        <View style={styles.divider} />

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>アカウント概要</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>表示名</Text>
            <Text style={styles.infoValue}>{user?.display_name || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>メールアドレス</Text>
            <Text style={styles.infoValue}>{user?.email || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>権限ロール</Text>
            <Text style={styles.infoValue}>{user?.role || '-'}</Text>
          </View>

          {user?.customer_membership ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>所属カスタマー</Text>
              <Text style={styles.infoValue}>
                {user.customer_membership.customer_name} ({user.customer_membership.customer_code})
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Link href="/(app)/profile" asChild>
            <Button
              title="プロフィール・デバッグ詳細"
              variant="outline"
              style={styles.actionButton}
            />
          </Link>

          <Button
            title="ログアウト"
            variant="danger"
            onPress={handleLogout}
            style={styles.actionButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heroCard: {
    backgroundColor: '#1E40AF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  historyHeroCard: {
    backgroundColor: '#0F766E',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroSubtitle: {
    color: '#E0F2FE',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  heroButtonRow: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  heroButtonText: {
    color: '#208AEF',
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
});
