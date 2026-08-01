import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useCatalogChat } from '@/hooks/useCatalogChat';
import { useCatalogItems } from '@/hooks/useCatalogItems';
import { ChatBubble, ChatInput } from '@/components/chat';
import { ErrorMessage } from '@/components/ui';
import { CatalogRagSource } from '@/types';

export default function CatalogChatScreen() {
  const params = useLocalSearchParams<{ catalogId: string }>();
  const catalogId = parseInt(params.catalogId || '0', 10);
  const router = useRouter();

  const { catalog } = useCatalogItems(catalogId);
  const { messages, input, setInput, isSending, error, sendMessage } = useCatalogChat(catalogId);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isSending]);

  const handleSelectSource = (source: CatalogRagSource) => {
    router.push({
      pathname: '/(app)/catalogs/[catalogId]/items/[itemId]',
      params: { catalogId, itemId: source.item_id },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          title: catalog ? `AIアシスタント (${catalog.name})` : 'AIアシスタント',
          headerBackTitle: 'カタログ詳細',
        }}
      />

      <View style={styles.noticeBanner}>
        <Text style={styles.noticeTitle}>
          {catalog ? `「${catalog.name}」限定 AI検索` : 'カタログ限定 AI検索'}
        </Text>
        <Text style={styles.noticeSub}>
          ※ 価格・在庫・納期は商品詳細の正式情報をご確認ください。
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.timelineContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.introBox}>
          <Text style={styles.introText}>
            このカタログに掲載されている商品について自然言語で質問できます。用途、素材、サイズ、カテゴリなどを入力してください。
          </Text>
        </View>

        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} onSelectSource={handleSelectSource} />
        ))}

        {isSending ? (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color="#208AEF" />
            <Text style={styles.typingText}>AIが商品を検索・案内中...</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorWrapper}>
            <ErrorMessage message={error.message} />
          </View>
        ) : null}
      </ScrollView>

      <ChatInput
        value={input}
        onChangeText={setInput}
        onSend={() => sendMessage()}
        disabled={isSending}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  noticeBanner: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
  },
  noticeSub: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 2,
  },
  timelineContent: {
    padding: 16,
    paddingBottom: 24,
  },
  introBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  introText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typingText: {
    fontSize: 13,
    color: '#64748B',
  },
  errorWrapper: {
    marginTop: 8,
  },
});
