# TRANSBOX Mobile iPhone実機テスト・ログイン認証監査 & 実装完了レポート

## 概要

本レポートは、`TRANSBOX Mobile` (React Native / Expo) から既存の `TRANSBOX` beta テナント環境 (`https://bg-beta.transbox.tech`, `https://e2e072738-beta.transbox.tech` 等) へ iPhone 実機でログイン・接続検証を行うための **必須修正完了報告および手動検証ガイド** です。

---

## 1. 実装済み修正項目 (Completed Fixes)

| 区分 | 対象ファイル / 設定 | 実装内容 |
|---|---|---|
| **iOS Bundle Identifier** | `app.json` | `ios.bundleIdentifier: "tech.transbox.mobile"` を追加 |
| **Android Package** | `app.json` | `android.package: "tech.transbox.mobile"` を追加 |
| **Development Client** | `package.json` | `expo-dev-client` を SDK 57 互換で追加 |
| **EAS 設定** | `eas.json` [新規作成] | `development` (internal/non-simulator), `preview`, `production` プロファイルを定義 |
| **テナントコード正規化** | `src/api/tenantResolver.ts` [新規作成] | `normalizeTenantCode()` を実装。サイレントな自動変換を廃止し、`http(s)://`, `.transbox.tech`, `tenant_` (内部schema), 記号・ドット・アンダースコア・連続ハイフン等を明示的に拒否。`/^[a-z0-9]+(-[a-z0-9]+)*$/` に完全一致する値のみ許可 |
| **動的 Base URL 構築** | `src/api/tenantResolver.ts` | `buildTenantBaseUrl()` を実装。アプリ環境変数 `EXPO_PUBLIC_TENANT_HOST_SUFFIX` (規定値: `-beta.transbox.tech`) を結合し、`https://${normalizedCode}-beta.transbox.tech` を動的構築 |
| **認証 API の最適化** | `src/api/auth.ts` | 外部 resolver への依存を解消し、`normalizeTenantCode` & `buildTenantBaseUrl` を用いて直接 `https://${code}-beta.transbox.tech/api/tenant/auth/login/` へ接続。サーバーログアウト API (`POST /api/tenant/auth/logout/`) の呼出追加 |
| **障害耐性 & セッション** | `src/api/client.ts`, `src/stores/auth.ts` | 401 時のみ Promise Queue による Single-flight リフレッシュを実行。500/502/503/504 や 403、ネットワーク切断時はトークンを削除せず維持 |
| **ログイン画面 UI / バリデーション** | `src/app/(auth)/login.tsx` | ラベル `「テナントコード」`, プレースホルダー `「例: bg, e2e072738」` へ変更。リアルタイム入力バリデーションを追加 |
| **環境変数設計** | `.env`, `.env.example`, `src/config/env.ts` | `EXPO_PUBLIC_TRANSBOX_ENV=beta`, `EXPO_PUBLIC_TENANT_HOST_SUFFIX=-beta.transbox.tech` を追加 |

---

## 2. 環境変数設定 (.env)

```ini
# TRANSBOX Mobile Environment Configuration
EXPO_PUBLIC_TRANSBOX_ENV=beta
EXPO_PUBLIC_TENANT_HOST_SUFFIX=-beta.transbox.tech
EXPO_PUBLIC_API_TIMEOUT_MS=30000
EXPO_PUBLIC_TENANT_SCHEMA=tenant_bg_beta
```

---

## 3. iPhone Development Build 作成 & 端末登録手順

### Step 3.1: Apple Developer アカウントとの連携
EAS CLI を使って Apple Developer アカウントで証明書と Provisioning Profile を自動構成します。
```bash
npx eas device:create
```

### Step 3.2: Development Build の作成 (iPhone 実機用)
```bash
npx eas build --profile development --platform ios
```

### Step 3.3: iPhone 実機へのインストール
1. ビルド完了後に表示される QR コードを iPhone の標準カメラアプリでスキャン。
2. 表示されるインストールの指示に従い、Development Build アプリを端末にインストール。
3. iPhone の「設定」>「プライバシーとセキュリティ」>「デベロッパーモード」を有効化して再起動。

---

## 4. 手動確認チェックリスト (iPhone 実機動作確認)

ユーザーが手動で実機ログインおよび各種挙動を検証するためのチェックリストです。

### 4.1 正常系テスト (`bg` テナント)
- [ ] テナントコードに `bg` と入力。
- [ ] 有効なメールアドレス・パスワードを入力して「ログイン」をタップ。
- [ ] `https://bg-beta.transbox.tech/api/tenant/auth/login/` へリクエストが送信され、アクセストークンおよびリフレッシュトークンが SecureStore へ暗号化保存されること。
- [ ] ログイン成功後、アプリホーム画面へ自動遷移すること。
- [ ] マイページまたはヘッダーにて `GET /api/tenant/auth/me/` が成功し、ユーザー情報が表示されること。

### 4.2 正常系テスト (`e2e072738` テナント)
- [ ] テナントコードに `e2e072738` と入力。
- [ ] 正しいログイン情報でログインが完了し、`https://e2e072738-beta.transbox.tech` へ接続されること。

### 4.3 セッション復帰 & リフレッシュテスト
- [ ] ログイン状態でアプリを完全終了（タスクキル）し、再起動する。
- [ ] ログイン画面をスキップして即座にアプリホーム画面が自動復元されること。
- [ ] トークン有効期限切れ時 (401 応答時) に、バックグラウンドで自動的に `POST /api/tenant/auth/refresh/` が呼出され、新しいアクセストークンで通信が継続されること。

### 4.4 異常系 & 表記揺れ入力テスト
- [ ] テナントコードに `https://bg-beta.transbox.tech` や `bg-beta` と入力 ──> 自動クレンジングにより `bg` として正常ログインできること。
- [ ] 存在しないテナントコード (例: `invalid-tenant-999`) を入力 ──> 適切なネットワーク/404 エラーメッセージが表示されること。
- [ ] 不正な文字 (例: `bg@domain`, `bg_test`, `--bg`) を入力 ──> 「テナントコードは半角英小文字・数字・ハイフンで入力してください」のエラーが表示されること。
- [ ] 誤ったパスワードを入力 ──> 「認証エラーが発生しました」などのエラーメッセージが表示されること。
- [ ] ネットワーク切断 (機内モード) の状態でアプリ起動 ──> ローカルのトークンが勝手に消去されず、接続エラーメッセージが表示されること。

### 4.5 ログアウト & テナント切替テスト
- [ ] 設定画面などから「ログアウト」を実行。
- [ ] サーバー側へ `POST /api/tenant/auth/logout/` が送信され、SecureStore から全トークンが削除されてログイン画面へ戻ること。
- [ ] ログアウト後、別のテナントコード (`bg` から `e2e072738`) で再ログインが問題なく行えること。

---

## 5. 変更ファイル一覧

- `app.json` (bundleIdentifier, android package 追加)
- `eas.json` [新規作成]
- `package.json` / `package-lock.json` (expo-dev-client 追加)
- `.env` / `.env.example` (環境変数統合)
- `src/config/env.ts` (EnvConfig 拡張)
- `src/api/tenantResolver.ts` [新規作成] (正規化 & Base URL 構築)
- `src/api/auth.ts` (直接接続ログイン & サーバーログアウト)
- `src/stores/auth.ts` (ログアウト統合)
- `src/app/(auth)/login.tsx` (UI プレースホルダー & 入力バリデーション)
- `docs/transbox_mobile_device_test_audit.md` (正本レポート更新)
- `docs/transbox_device_test_audit.md` [削除 (重複解消)]
