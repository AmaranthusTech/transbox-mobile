import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage, CatalogRagSource } from '@/types';
import { RagItemCard } from './RagItemCard';

interface ChatBubbleProps {
  message: ChatMessage;
  onSelectSource: (source: CatalogRagSource) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onSelectSource }) => {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>

        {message.answerMode === 'fallback' ? (
          <Text style={styles.fallbackBadge}>※定型案内・検索補完</Text>
        ) : null}
      </View>

      {!isUser && message.sources && message.sources.length > 0 ? (
        <View style={styles.sourcesContainer}>
          <Text style={styles.sourcesTitle}>候補商品 ({message.sources.length})</Text>
          {message.sources.map((src) => (
            <RagItemCard key={src.catalog_item_listing_id} source={src} onPress={onSelectSource} />
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: '88%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#208AEF',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#0F172A',
  },
  fallbackBadge: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  sourcesContainer: {
    marginTop: 8,
    width: '100%',
  },
  sourcesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
});
