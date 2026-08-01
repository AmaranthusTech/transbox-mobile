# TRANSBOX Mobile Phase 1-A / 1-B / 1-C / 1-D-1 タスクリスト

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

## Phase 1-D-1 (カート基盤 - 実装完了)
- [x] バックエンド既存モデル・サービス調査 (`OrderDraft`, `EndUserOrderRequest`, `pricing_services`)
- [x] モバイルアプリ既存構造調査 (`itemId.tsx`, `SkuCard.tsx`, Zustand `authStore`)
- [x] カート保存方式比較・決定 (サーバー永続型 `EndUserOrderRequest` (status="draft") の採用)
- [x] API仕様案およびエラーハンドリング設計
- [x] 実装計画書作成 (`implementation_plan.md`)
- [x] バックエンド カート API 追加 (`GET /api/end-user/cart/`, `POST /items/`, `POST /replace/`, `PATCH`, `DELETE`)
- [x] 1 カート 1 カタログ制約 & 409 Conflict 処理
- [x] カート取得・操作ごとのリアルタイム動的適用価格計算
- [x] モバイル 型定義・API クライアント・Zustand カートストア (`src/stores/cart.ts`) 実装
- [x] 商品詳細 SKU カード (`SkuCard`) への数量セレクター・カート追加・別カタログ置き換えダイアログ連動
- [x] カート画面 (`src/app/(app)/cart.tsx`) & 明細カード (`CartLineCard`) 実装
## Phase 1-D-2A (注文確認画面 - 実装完了)
- [x] バックエンド カート API レスポンス最小拡張 (`customer_name`, `requester_name`, `requester_email`)
- [x] カート画面 (`cart.tsx`) の「注文内容を確認する」ボタン有効化 & ルーティング設定
- [x] 注文確認画面 (`src/app/(app)/order-confirm.tsx`) の新設
- [x] 画面表示時の最新カート API (`GET /api/end-user/cart/`) 自動再取得
- [x] 申請者情報・所属カスタマー名・対象カタログ名・明細プレビュー・単価・数量・小計・税込金額の表示
- [x] 空カート保護表示 & 注文受付不可エラーボックス表示
- [x] 固定フッター「注文を申請する (Phase 1-D-2B)」ボタン (disabled) 配置
- [x] ドキュメント更新 (仕様書, README.md, task.md)
