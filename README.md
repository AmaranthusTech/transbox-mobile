# TRANSBOX Mobile

TRANSBOX v2 のカスタマーエンドユーザー向け React Native / Expo 会話型注文申請モバイルアプリケーション。

---

## 実装状態

### Phase 1-A (認証 & 共通基盤) - 完了
- 動的テナントドメイン解決 (`POST /api/public/tenant-resolve/`)
- Zustand 認証ストア (`src/stores/auth.ts`)
- `expo-secure-store` による暗号化トークン・ドメイン保持
- 401 発生時の Promise Queue による Single-flight 自動 Refresh 制御
- Expo Router 認証ガードリダイレクト
- ログイン、ホーム、プロフィール画面

### Phase 1-B (カタログ一覧・商品閲覧) - 完了
- 公開カタログ一覧画面 (`/(app)/catalogs`)
- カタログ詳細 & 商品一覧画面 (`/(app)/catalogs/[catalogId]`)
- 商品詳細 & 掲載 SKU 一覧画面 (`/(app)/catalogs/[catalogId]/items/[itemId]`)
- バックエンド解決済みの有効金額 (`effective_amount`) 表示
- `expo-image` による派生 PNG/プレースホルダーフォールバック画像描画

### Phase 1-C (会話型RAG検索) - 完了
- **カタログ限定 AI 会話型検索画面** (`/(app)/catalogs/[catalogId]/chat`):
  - カタログ詳細画面の「AIアシスタントに質問する」ボタンより遷移。
  - 自然言語質問の送信と Ollama LLM / pgvector による RAG 回答表示。
  - 検索結果の商品候補カード (`RagItemCard`) から直接商品詳細画面 (`/(app)/catalogs/[catalogId]/items/[itemId]`) へ遷移。
- **バックエンドセキュリティ & スコープ制御**:
  - `POST /api/end-user/catalogs/{catalog_id}/ai-search/`
  - 該当 `catalog_id` に掲載中の商品 (`CatalogItemListing.is_listed=True`, `Item.is_active=True`) のみに DB レベルで pgvector 検索を 100% 制限。
  - 価格・在庫・納期の本文生成は禁止、テキスト回答は一般的な案内に限定。
  - クライアントメモリでの会話履歴管理、二重送信防止ロック、画面アンマウント時の AbortController キャンセル制御。

### Phase 1-D-1 (カート基盤) - 完了
- **バックエンドカート API**:
  - `EndUserOrderRequest` (status="draft") を永続型カートとして再利用。
  - カート取得 (`GET /api/end-user/cart/`)、明細追加 (`POST /api/end-user/cart/items/`)、置き換え追加 (`POST /api/end-user/cart/replace/`)、数量変更 (`PATCH /api/end-user/cart/items/{id}/`)、明細削除/一括クリア (`DELETE`)。
  - 1 カート 1 カタログ制約 & 409 Conflict 判定。
  - カート取得・操作ごとのリアルタイム動的適用価格計算。
- **モバイルアプリ機能**:
  - Zustand カートストア (`src/stores/cart.ts`) による表示用キャッシュとヘッダーバッジ動的更新 (`CartBadgeButton`)。
  - 商品詳細画面 (`itemId.tsx`) の SKU カード (`SkuCard`) に数量操作 (`QuantitySelector`) と「カート追加」ボタンを連動。
  - 別カタログ混在時の Alert 確認ダイアログ & カート置き換え追加機能。
### Phase 1-D-2A (注文確認画面) - 完了
- **注文確認画面** (`/(app)/order-confirm`):
  - カート画面の「注文内容を確認する」ボタンより画面遷移。
  - バックエンド最新カート API (`GET /api/end-user/cart/`) を再呼び出しして最新の適用価格・受入状態・申請者情報を表示。
  - 所属カスタマー名、注文申請者名、連絡先メールアドレス、対象カタログ名、注文明細一覧、単価・数量・小計・税込合計金額のプレビュー表示。
  - 空カート・削除済みカート時の保護表示および 注文受付不可時の赤系警告ボックス表示。

### Phase 1-F-1 (AI会話から直接カート追加) - 完了
- **AI 会話からの安全なカート追加フロー**:
  - AI 候補商品カードに「SKUを選んでカートに追加」ボタンを追加。
  - 選択時に既存の商品詳細 API (`getItemDetail`) から最新構造化 SKU 情報を動的取得。AI/LLM に推測させず全数ユーザーに確認・指定させる設計。
  - `SkuSelectionModal` (React Native 標準 Modal) による SKU ラジオ選択, 適用単価・注文不可理由表示, `QuantitySelector` 数量指定。
  - Zustand `cartStore` 連動、別カタログ競合 (HTTP 409) 時の「カートを置き換える」確認アラート対応、ヘッダーバッジ同期および「カートを見る 🛒」/「会話を続ける」選択肢の提供。

### Phase 1-F-2 (ロール別注文確定 & customer 直接注文の正式注文自動変換) - 完了
- **ロールごとの注文確定経路統合**:
  - `customer`: カスタマ代表ユーザーの直接注文。確定後カスタマ内承認不要で `convert_single_order_request_to_order` により即座に正式注文 (`Order`: `OD-YYYYMMDDHHMMSS-XXXXXX`) を作成し `converted_order` へ紐付け。
  - `customer_end_user`: エンドユーザーからの注文申請。確定後所属カスタマーの承認待ち (`submitted` / `"カスタマ承認待ち"`) となる。所属カスタマーの承認 (`CustomerRoleEndUserRequestApproveView`) を経て正式注文へ変換。
  - `customer_admin`: モバイルからの直接注文不可。HTTP 403 権限拒否および画面上の明示警告バナー表示。
- **排他制御 & 二重処理防止**: `select_for_update()` による変換・承認・却下 API のアトミック更新保護と冪等性担保。
- **画面反映**: モバイルの完了画面・注文履歴カード・注文詳細画面にて「正式注文作成済み」バッジと正式注文番号 (`converted_order_number`) を明示表示。






---

## 手動検証手順 (Phase 1-C)

1. `npx expo start` を実行し、アプリを起動してログイン。
2. ホーム画面より「カタログ一覧」→ 任意のデジタルカタログをタップしてカタログ詳細画面を開く。
3. ヘッダーエリアの「AIアシスタントに質問する →」ボタンをタップし、AI チャット画面を開く。
4. 検索窓に「防水シート」や「ネイルケア」など自然言語で質問を入力し、「送信」をタップ。
5. AI の回答バブルと、下部に掲載商品候補カードが表示されることを確認。
6. 商品候補カードをタップし、該当商品の詳細画面へスムーズに遷移することを確認。
