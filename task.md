# TRANSBOX Mobile Phase 1-A タスクリスト

- [x] 現状構成確認
- [x] 依存関係整理 (axios, zustand, expo-secure-store, react-hook-form)
- [x] 環境変数設定 (src/config/env.ts, .env.example, .gitignore)
- [x] 型定義 (src/types/auth.ts, src/types/api.ts, src/types/index.ts)
- [x] APIクライアント (src/api/client.ts) - 401リフレッシュ排他制御・動的BaseURL切替・URL安全検証
- [x] 認証API & public テナント解決 (src/api/auth.ts, backend/app/features/public_tenant_resolve)
- [x] SecureStore定数・キー管理 (src/api/secureStore.ts) - tokens + resolved tenant code & apiBaseUrl
- [x] Zustand認証ストア (src/stores/auth.ts)
- [x] 認証フック (src/hooks/useAuth.ts)
- [x] ルーティングと認証ガード (src/app/_layout.tsx, src/app/(auth)/_layout.tsx, src/app/(app)/_layout.tsx)
- [x] ログイン画面 (src/app/(auth)/login.tsx) - 3項目入力 (テナントコード, email, password) & バリデーション
- [x] ホーム画面 (src/app/(app)/index.tsx)
- [x] プロフィール画面 (src/app/(app)/profile/index.tsx) - 接続テナント情報表示
- [x] UI共通基盤 (SafeArea, ErrorMessage, LoadingOverlay, Button, Input)
- [x] 差分確認 (git status, diff)
- [x] ドキュメント更新 (README.md)
