import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const tenantCode = useAuthStore((state) => state.tenantCode);
  const apiBaseUrl = useAuthStore((state) => state.apiBaseUrl);

  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.display_name ? user.display_name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.display_name || '-'}</Text>
        <Text style={styles.userEmail}>{user?.email || '-'}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionHeader}>基本情報</Text>

        <View style={styles.row}>
          <Text style={styles.label}>ユーザー ID</Text>
          <Text style={styles.value}>{user?.id ?? '-'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>ロール</Text>
          <Text style={styles.value}>{user?.role || '-'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>テナント管理者権限</Text>
          <Text style={styles.value}>{user?.is_tenant_admin ? 'あり' : 'なし'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>アカウント状態</Text>
          <Text style={styles.value}>{user?.is_active ? '有効' : '無効'}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionHeader}>接続テナント情報</Text>

        <View style={styles.row}>
          <Text style={styles.label}>テナントコード</Text>
          <Text style={styles.value}>{tenantCode || '-'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>接続 API Base URL</Text>
          <Text style={styles.valueSmall}>{apiBaseUrl || '-'}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionHeader}>カスタマー連携情報</Text>

        {user?.customer_membership ? (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>カスタマー名</Text>
              <Text style={styles.value}>{user.customer_membership.customer_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>カスタマーコード</Text>
              <Text style={styles.value}>{user.customer_membership.customer_code}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>主担当フラグ</Text>
              <Text style={styles.value}>
                {user.customer_membership.is_primary_contact ? '主担当者' : '一般'}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.emptyText}>カスタマー連携情報はありません</Text>
        )}

        <View style={styles.logoutWrapper}>
          <Button title="ログアウト" variant="danger" onPress={handleLogout} />
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
    alignItems: 'stretch',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#208AEF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  label: {
    fontSize: 14,
    color: '#64748B',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  valueSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  logoutWrapper: {
    marginTop: 28,
  },
});
