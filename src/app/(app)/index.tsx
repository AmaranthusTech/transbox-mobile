import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
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
      <View style={styles.card}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>Phase 1-A 完了</Text>
        </View>

        <Text style={styles.welcomeTitle}>
          ようこそ、{user?.display_name || 'ユーザー'} さん
        </Text>
        <Text style={styles.welcomeSubtitle}>
          認証基盤、動的テナントドメイン解決、および共通APIクライアントの設定が完了しました。
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

        <View style={styles.nextPhaseCard}>
          <Text style={styles.nextPhaseTitle}>準備完了</Text>
          <Text style={styles.nextPhaseText}>
            Phase 1-B（カタログ閲覧）、Phase 1-C（会話型RAG検索）、Phase 1-D（注文申請）の実装準備が整いました。
          </Text>
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
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusBadgeText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 20,
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
  nextPhaseCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
  },
  nextPhaseTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 4,
  },
  nextPhaseText: {
    fontSize: 13,
    color: '#0284C7',
    lineHeight: 18,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
});
