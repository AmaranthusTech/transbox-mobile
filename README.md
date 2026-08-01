# TRANSBOX Mobile

TRANSBOX v2 のカスタマーエンドユーザー向け React Native / Expo 会話型注文申請モバイルアプリケーション。

---

## Phase 1-A 実装概要

本フェーズ (Phase 1-A) では、動的テナント解決 (パターンB) を含む以下の共通基盤および認証機能を実装しています。

- **動的テナント解決**: `POST /api/public/tenant-resolve/`
  - ユーザーが入力したテナントコード (例: `bg-beta`) を public schema 上で検索し、アクティブなテナントの接続ドメイン (`bg-beta.transbox.tech`) を取得。
  - 安全な HTTPS URL (`https://bg-beta.transbox.tech`) を動的に構築し、Axios の `baseURL` を切り替えてログインを実行。
- **認証状態管理**: Zustand (`src/stores/auth.ts`, `src/hooks/useAuth.ts`)
- **安全なトークン保存**: `expo-secure-store` による Keychain / Keystore への暗号化保存 (`src/api/secureStore.ts`)
  - `access_token`, `refresh_token`, `resolved_tenant_code`, `resolved_api_base_url`
- **APIクライアント**: Axios ラッパー (`src/api/client.ts`)
  - 動的 BaseURL 変更および安全な URL 形式チェック
  - JWT Bearer Token 自動付与
  - 本番環境では `X-Tenant-Schema` を非付与 (`__DEV__` かつ設定時のみのデバッグ利用)
  - 401 発生時の自動 Token Refresh & 1回リトライ制御 (Promise Queue による Single-flight 排他制御)
  - Refresh 失敗時の SecureStore データ削除および自動ログアウト処理
  - エラーの正規化 (`ApiError`)
- **ルーティング & 認証ガード**: Expo Router v4/v5 (`src/app/` ベース)
  - 未認証時: `/(auth)/login` へ遷移
  - 認証済み時: `/(app)` ホーム画面へ遷移
  - アプリ起動時の自動 token/user/URL 復元 (Hydration)
- **画面**:
  - `/(auth)/login`: テナントコード・メール・パスワードの3項目ログイン、入力完了までボタン無効化、エラー表示、SafeArea/キーボード対応
  - `/(app)`: ホーム画面 (ログインユーザー情報表示、Phase 1-A 完了確認)
  - `/(app)/profile`: プロフィール情報 & 接続テナント情報表示、ログアウト機能

---

## バックエンド追加機能

- **Public テナント解決 API**: `POST /api/public/tenant-resolve/`
  - パッケージ: `app/features/public_tenant_resolve/`
  - 引数: `{ "code": "bg-beta" }`
  - 返却: `{ "code": "bg-beta", "name": "bg-beta", "domain": "bg-beta.transbox.tech" }`
  - 認証なし・public schema 実行、レート制限 (30 req/min) 適用。

---

## セットアップ & 環境変数

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数設定

ルートディレクトリに `.env` ファイルを作成し、以下のように設定してください (`.env.example` 参照)。

```env
# API Base URL (ルート/初期ドメイン解決用)
EXPO_PUBLIC_API_BASE_URL=https://bg-beta.transbox.tech

# オプション: テナントスキーマヘッダー (開発・デバッグ用のみ)
EXPO_PUBLIC_TENANT_SCHEMA=tenant_bg_beta

# API タイムアウト (ミリ秒)
EXPO_PUBLIC_API_TIMEOUT_MS=30000
```

---

## 手動検証手順 (開発者用)

1. **アプリ起動と初回ルーティング**
   - トークンが未保存の場合、即座にログイン画面 (`/(auth)/login`) へ遷移することを確認。
2. **動的テナント解決 & ログイン**
   - テナントコード (例: `bg-beta`)、メールアドレス、パスワードを入力（3項目揃うまでログインボタンは押せません）。
   - 「ログイン」をタップすると `POST /api/public/tenant-resolve/` が呼ばれ、ドメイン解決後に該当テナントへログインすることを確認。
3. **認証情報の永続化 (Hydration)**
   - ログイン後にアプリをリロード/再起動しても、保存された Base URL が復元され、ホーム画面へ自動的に復元されることを確認。
4. **401 Token Refresh**
   - アクセストークン失効時に API リクエストを行うと、自動的に Refresh API が呼ばれ、新しいアクセストークンでリトライが成功することを確認。
5. **ログアウト**
   - プロフィール画面 (`/(app)/profile`) またはホーム画面から「ログアウト」をタップ。
   - SecureStore からトークン・テナント情報がクリアされ、ログイン画面へ遷移することを確認。
