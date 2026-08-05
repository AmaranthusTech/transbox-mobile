import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, ErrorMessage } from '@/components/ui';
import { LoginPayload } from '@/types';
import { normalizeTenantCode } from '@/api/tenantResolver';

export default function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>({
    defaultValues: {
      tenant_code: '',
      email: '',
      password: '',
    },
  });

  const tenantCodeValue = watch('tenant_code');
  const emailValue = watch('email');
  const passwordValue = watch('password');

  // Disable button until all 3 fields are filled in
  const isFormFilled =
    Boolean(tenantCodeValue && tenantCodeValue.trim()) &&
    Boolean(emailValue && emailValue.trim()) &&
    Boolean(passwordValue && passwordValue.trim());

  const onSubmit = async (data: LoginPayload) => {
    clearError();
    const success = await login(data);
    if (success) {
      router.replace('/(app)');
    }
  };

  const isPending = isLoading || isSubmitting;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoBadgeText}>TB</Text>
              </View>
              <Text style={styles.title}>TRANSBOX Mobile</Text>
              <Text style={styles.subtitle}>
                注文申請・会話型商品検索アプリへログイン
              </Text>
            </View>

            <View style={styles.formCard}>
              <ErrorMessage message={error?.message} />

              <Controller
                control={control}
                name="tenant_code"
                rules={{
                  required: 'テナントコードを入力してください',
                  validate: (val) => {
                    try {
                      normalizeTenantCode(val);
                      return true;
                    } catch (err: any) {
                      return err?.message || 'テナントコードは英小文字・数字・ハイフンで入力してください。';
                    }
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="テナントコード"
                    placeholder="例: bg, e2e072738"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.tenant_code?.message}
                    editable={!isPending}
                    accessibilityLabel="テナントコード入力フィールド"
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'メールアドレスを入力してください',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: '正しいメールアドレスの形式で入力してください',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="メールアドレス"
                    placeholder="user@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.email?.message}
                    editable={!isPending}
                    accessibilityLabel="メールアドレス入力フィールド"
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                rules={{
                  required: 'パスワードを入力してください',
                  minLength: {
                    value: 4,
                    message: 'パスワードは4文字以上で入力してください',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="パスワード"
                    placeholder="••••••••"
                    isPassword
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.password?.message}
                    editable={!isPending}
                    accessibilityLabel="パスワード入力フィールド"
                  />
                )}
              />

              <Button
                title={isPending ? 'ログイン中...' : 'ログイン'}
                onPress={handleSubmit(onSubmit)}
                loading={isPending}
                disabled={!isFormFilled || isPending}
                style={styles.submitButton}
                accessibilityLabel="ログインボタン"
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#208AEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  formCard: {
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
  submitButton: {
    marginTop: 16,
  },
});
