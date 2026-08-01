# TRANSBOX Mobile Phase 1-A / 1-B / 1-C タスクリスト

## Phase 1-A (認証 & 共通基盤)
- [x] 現状構成確認
- [x] 依存関係整理 (axios, zustand, expo-secure-store, react-hook-form)
- [x] 環境変数設定 (src/config/env.ts, .env.example, .gitignore)
- [x] 型定義 (src/types/auth.ts, src/types/api.ts, src/types/index.ts)
- [x] APIクライアント (src/api/client.ts)
- [x] 認証API & public テナント解決 (src/api/auth.ts)
- [x] SecureStore定数・キー管理 (src/api/secureStore.ts)
- [x] Zustand認証ストア (src/stores/auth.ts)
- [x] 認証フック (src/hooks/useAuth.ts)
- [x] ルーティングと認証ガード (src/app/_layout.tsx, src/app/(auth)/_layout.tsx, src/app/(app)/_layout.tsx)
- [x] ログイン画面 (src/app/(auth)/login.tsx)
- [x] ホーム画面 (src/app/(app)/index.tsx)
- [x] プロフィール画面 (src/app/(app)/profile/index.tsx)

## Phase 1-B (カタログ一覧・商品閲覧)
- [x] バックエンド API の拡張・新設 (GET /api/end-user/catalogs/, detail, items, item detail)
- [x] カタログ・商品・SKU・画像・価格の型定義 (`src/types/catalog.ts`)
- [x] API クライアント (`src/api/catalogs.ts`)
- [x] カスタムフック (`useCatalogs`, `useCatalogItems`, `useItemDetail`)
- [x] 共通コンポーネント (`CatalogCard`, `ItemCard`, `SkuCard`, `ItemImage`, `PriceDisplay`)
- [x] ホーム画面「カタログを見る」導線追加 (`src/app/(app)/index.tsx`)
- [x] カタログ一覧画面 (`src/app/(app)/catalogs/index.tsx`)
- [x] カタログ詳細 & 商品一覧画面 (`src/app/(app)/catalogs/[catalogId]/index.tsx`)
- [x] 商品詳細 & SKU 一覧画面 (`src/app/(app)/catalogs/[catalogId]/items/[itemId].tsx`)

## Phase 1-C (会話型RAG検索)
- [x] バックエンド専用API追加 (`POST /api/end-user/catalogs/{catalog_id}/ai-search/`)
- [x] カタログスコープ pgvector ベクトル検索の DB レベル適用
- [x] RAG シリアライザー (`EndUserCatalogRagQuerySerializer`, `ResponseSerializer`)
- [x] RAG & チャット型定義 (`src/types/chat.ts`)
- [x] RAG API クライアント (`src/api/aiAssistant.ts`)
- [x] チャットフック (`src/hooks/useCatalogChat.ts`) - 二重送信防止・同期ロック・キャンセル
- [x] コンポーネント (`ChatBubble`, `RagItemCard`, `ChatInput`)
- [x] チャット画面 (`src/app/(app)/catalogs/[catalogId]/chat.tsx`)
- [x] カタログ詳細「AIアシスタントに質問する」導線追加
- [x] ドキュメント更新 (README.md, 仕様書)
- [x] 差分確認 (git status, diff)
