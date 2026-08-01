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
- **公開カタログ一覧画面** (`/(app)/catalogs`):
  - ログイン中ユーザーの所属カスタマーに割り当てられた公開デジタルカタログの一覧表示。
  - `FlatList` + `RefreshControl` による Pull to Refresh。
  - 受付可能状態（受付中 / 受付期間外）のバッジ表示。
- **カタログ詳細 & 商品一覧画面** (`/(app)/catalogs/[catalogId]`):
  - 掲載商品のページネーション付き無限スクロール。
  - リアルタイム検索バー (350ms デバウンス, AbortController キャンセル制御付き)。
  - 商品名、コード、ブランド、カテゴリ、掲載 SKU 数、最小〜最大価格範囲を表示。
- **商品詳細 & 掲載 SKU 一覧画面** (`/(app)/catalogs/[catalogId]/items/[itemId]`):
  - 商品詳細情報 (表示名, 説明, 仕様, ブランド, カテゴリ, 画像)。
  - 掲載対象 SKU 一覧 (SKUコード, JANコード, 色・サイズ, 適用価格, カタログ価格適用バッジ)。
  - カート追加ボタンは disabled 表示 (Phase 1-D で対応予定)。
- **価格・画像処理**:
  - バックエンド解決済みの有効金額 (`effective_amount`) を返却・表示。サプライヤー向け原価 (`cost_price`) は完全除外。
  - `expo-image` による `thumbnail_url` > `preview_url` > `url` 優先描画、プレースホルダーフォールバック、PSD 派生 PNG 表示対応。

---

## バックエンドエンドポイント (Phase 1-B)

- `GET /api/end-user/catalogs/` - カタログ一覧 (ページネーション対応)
- `GET /api/end-user/catalogs/{catalog_id}/` - カタログ詳細
- `GET /api/end-user/catalogs/{catalog_id}/items/` - カタログ掲載商品一覧 (`page`, `page_size`, `search` クエリ)
- `GET /api/end-user/catalogs/{catalog_id}/items/{item_id}/` - 商品詳細 & SKU 一覧

---

## 手動検証手順

1. `npx expo start` を実行し、アプリを起動。
2. ログイン完了後、ホーム画面の「デジタルカタログを閲覧」カードまたは「カタログ一覧を見る」をタップ。
3. 利用可能なカタログ一覧が表示され、Pull to Refresh で更新できることを確認。
4. カタログをタップし、掲載商品一覧が開くことを確認。
5. 検索バーにキーワード（例: 商品名や商品コードの一部）を入力し、350ms 後に検索結果が更新されることを確認。
6. リストをスクロールし、追加商品が読み込まれることを確認。
7. 商品をタップし、商品詳細・説明・仕様・掲載 SKU 一覧および価格が正しく表示されることを確認。
