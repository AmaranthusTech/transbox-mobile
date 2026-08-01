import { useState, useCallback, useRef, useEffect } from 'react';
import { aiAssistantApi } from '@/api/aiAssistant';
import { ChatMessage, ApiError } from '@/types';

export function useCatalogChat(catalogId: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const sendInFlightRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const sendMessage = useCallback(
    async (customText?: string) => {
      const textToSend = (customText ?? input).trim();

      // 1. Synchronous lock check
      if (sendInFlightRef.current || !textToSend || isSending) {
        return;
      }

      // Max length validation
      if (textToSend.length > 500) {
        setError({
          message: '質問文は最大500文字以内で入力してください。',
        });
        return;
      }

      // Acquire lock & reset state
      sendInFlightRef.current = true;
      setIsSending(true);
      setError(null);

      const userMsgId = `user-${Date.now()}`;
      const nowIso = new Date().toISOString();

      const userMessage: ChatMessage = {
        id: userMsgId,
        role: 'user',
        content: textToSend,
        createdAt: nowIso,
        status: 'sent',
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await aiAssistantApi.searchCatalogItems(
          {
            catalogId,
            query: textToSend,
            searchLimit: 5,
          },
          controller.signal
        );

        const assistantMsgId = `assistant-${Date.now()}`;
        const assistantMessage: ChatMessage = {
          id: assistantMsgId,
          role: 'assistant',
          content: res.answer,
          sources: res.sources || [],
          answerMode: res.answer_mode,
          createdAt: new Date().toISOString(),
          status: 'sent',
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: any) {
        if (err.name === 'CanceledError' || err.name === 'AbortError') {
          return;
        }

        const apiErr: ApiError = err as ApiError;
        setError(apiErr);

        // Add fallback assistant message explaining the error
        const fallbackMsgId = `assistant-error-${Date.now()}`;
        let fallbackText =
          'AI検索でエラーが発生しました。時間を置いて再度お試しいただくか、商品一覧より直接お探しください。';

        if (apiErr.status === 404) {
          fallbackText = 'カタログが見つからないか、閲覧権限がありません。';
        } else if (apiErr.status === 403) {
          fallbackText = 'このカタログを検索する権限がありません。';
        } else if (apiErr.status === 429) {
          fallbackText = 'アクセスが集中しています。少し時間をおいて再度お試しくさい。';
        }

        const assistantErrorMessage: ChatMessage = {
          id: fallbackMsgId,
          role: 'assistant',
          content: fallbackText,
          sources: [],
          answerMode: 'fallback',
          createdAt: new Date().toISOString(),
          status: 'error',
        };

        setMessages((prev) => [...prev, assistantErrorMessage]);
      } finally {
        setIsSending(false);
        sendInFlightRef.current = false;
      }
    },
    [catalogId, input, isSending]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    input,
    setInput,
    isSending,
    error,
    sendMessage,
    clearMessages,
  };
}
