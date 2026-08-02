# Task: customer 直接注文の正式注文 (Order) 自動変換・接続

## 概要
TRANSBOX Mobile および TRANSBOX 本体の注文フローにおいて、customer 自身がモバイルから提出した直接注文を、顧客内部承認不要で自動的に正式注文 (`Order` / `OrderLine`) へ変換し、テナント注文管理への表示およびモバイル注文履歴への正式注文番号反映を行う。

---

## 業務ルールと役割
1. **customer**
   - カスタマ自身の注文主体（`end_user = None`）。
   - モバイル注文確定時、自カスタマ承認は不要で自動的に正式注文 (`Order`: `OD-YYYYMMDDHHMMSS-XXXXXX`) を作成し、`converted_order` に紐付ける。
   - モバイル履歴・詳細には「正式注文作成済み」および正式注文番号を表示。
2. **customer_end_user**
   - customer に紐づくエンドユーザ (`end_user = user.customer_end_user`)。
   - 注文確定後、まず所属 customer の承認待ち (`submitted` / `"カスタマ承認待ち"`) になる。
   - customer が承認 (`approved`) して初めて正式注文へ変換される。
3. **customer_admin**
   - テナント側でカスタマを管理する管理ロール。
   - モバイル注文主体としては未対応。明示的に 403 権限エラーで拒否し、承認者としても扱わない。

---

## 実装手順タスク

- [x] **1. 既存TRANSBOX本体の注文・正式注文変換調査**
  - [x] 実データ（ID=26: `customer_end_user` 変換済み, ID=25: `customer` 直接注文）のステータス・フィールド構造調査
  - [x] バックエンド既存 API (`CustomerRoleEndUserRequestConvertToOrderView`, `EndUserCartSubmitView` 等) の動作確認
  - [x] `EndUserOrderRequestSerializer` の `get_can_convert_to_order` および `get_status_label` 挙動調査

- [x] **2. バックエンド (`transbox_v2`) の正式注文自動変換・共通ヘルパー実装**
  - [x] 共通関数 `convert_single_order_request_to_order` の抽出と `select_for_update` / 二重作成防止（冪等性）の実装
  - [x] `EndUserCartSubmitView` において `customer` 直接注文（`end_user_id is None`）の確定時に `convert_single_order_request_to_order` を自動実行
  - [x] `EndUserOrderRequestSerializer` の `get_status_label` で `converted_order_id` 存在時に `"正式注文作成済み"` を返却
  - [x] `get_can_convert_to_order` で `end_user_id is None` の場合も `submitted` / `approved` で `True` になるよう修正

- [x] **3. モバイルアプリ (`transbox-mobile`) の表示対応**
  - [x] `src/types/cart.ts`: `SubmittedOrder` に `converted_order_number`, `converted_order_id`, `status_label` を追加
  - [x] `order-confirm.tsx`: `router.replace` で `order-complete` に `converted_order_number` を引き渡し
  - [x] `order-complete.tsx`: 正式注文番号 (`converted_order_number`) バッジと「正式注文作成済み」案内メッセージを表示
  - [x] `OrderHistoryCard.tsx`: 正式注文番号と「正式注文作成済み」緑系バッジを表示
  - [x] `orders/[requestId].tsx`: 申請概要カード内に「正式注文番号」を表示

- [x] **4. ドキュメント更新**
  - [x] バックエンド仕様書 `docs/md/notes/expo_conversational_order_app_spec.md` (Section 32 追加)
  - [x] モバイル仕様書 `docs/expo_conversational_order_app_spec.md` (Section 32 追加)
  - [x] `README.md`, `task.md`

- [x] **5. 安全な確認コマンド実行**
  - [x] `git status --short`
  - [x] `git diff --stat`
  - [x] `git diff --check`
