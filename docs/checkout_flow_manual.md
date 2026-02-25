# のぼり見積もりアプリ — 決済フローマニュアル

## 全体概要

のぼり見積もりアプリは、ユーザーがのぼり旗の仕様を選んで見積もり→カート→決済まで行えるWebアプリです。
決済には Shopify Admin API の **Draft Order（下書き注文）** を使い、見積もりエンジンが算出した任意単価をそのまま請求書に反映します。

---

## 1. ユーザー側フロー（購入者）

```
商品一覧 → のぼり見積もり → カート → お客様情報入力 → Shopify決済ページ
```

### ① 商品一覧（ProductList）

- 「のぼり旗」を選択して見積もり画面へ

### ② のぼり見積もり（NoboriEstimator）

- サイズ・生地・印刷方法・数量・オプションを選択
- リアルタイムで単価・合計金額が算出される
- 「カートに追加」でカートへ（複数回追加可能）

### ③ カート確認（Cart）

- 追加した商品が一覧表示される（複数商品・仕様違いOK）
- **配送方法の選択**
  - 通常便：追加料金なし
  - お急ぎ便：商品合計の20%割増（管理画面で変更可能）
- 出荷予定日がカレンダーで表示される
- 「見積書を発行 (PDF)」でブラウザ印刷
- 「注文手続きへ進む」→ お客様情報入力画面へ
- ※ 規定外サイズを含む場合は「見積もり依頼」→ メール送信に切り替わる

### ④ お客様情報入力（DeliveryEntry）

入力項目は **3つだけ**:


| 項目      | 必須  | 備考                   |
| ------- | --- | -------------------- |
| お名前     | ○   |                      |
| 電話番号    | ○   |                      |
| メールアドレス | ○   | Shopify の注文メールもここに届く |


- **住所は入力しない** — Shopify チェックアウト側で入力させる設計
- 「Shopify決済へ進む」ボタンで送信

### ⑤ Shopify決済ページ

- Shopify の請求書ページ（`invoiceUrl`）にリダイレクト
- ここで **配送先住所の入力** と **支払い（クレカ等）** を行う
- 決済完了後、Shopify から注文確認メールが届く
- アプリ側のカートは自動的にクリアされる

### カートの永続化

- カートの中身と配送モードは **localStorage に保存** される
- ページをリロードしてもカートは消えない
- 決済完了時（`clearCart()`）またはユーザーが手動で削除した時にクリアされる

---

## 2. 管理者・出品者側フロー

```
Shopify管理画面 → 注文(Draft Orders) → 注文詳細で仕様確認 → 製造 → 発送
```

### Shopify管理画面で確認できる情報

Draft Order が作成されると、Shopify管理画面の **注文 → 下書き** に表示される。

#### 各 line item の properties（仕様詳細）


| key    | 表示例                |
| ------ | ------------------ |
| サイズ    | 60×180cm（レギュラー）    |
| 生地     | ポンジ（標準）            |
| 印刷方法   | フルカラー印刷            |
| 数量     | 5枚                 |
| オプション  | ヒートカット, チチ         |
| デザイン区分 | 完全データ入稿 / デザイン制作依頼 |
| _商品番号  | 1/3（3商品中の1つ目）      |
| 注文名    | （任意：ユーザーが入力した場合）   |
| デザイン要望 | （デザイン制作依頼の場合の詳細）   |
| 分割数    | 2分割 等（分割のぼりの場合）    |


#### 注文メモ（note）

```
お名前: 山田太郎
電話番号: 090-1234-5678
メール: yamada@example.com
```

#### タグ

- `nobori-app` — このアプリからの注文であることを示す
- `standard` or `rush` — 配送モード

#### お急ぎ便手数料

お急ぎ便選択時は、商品 line items とは別に以下が追加される:

```
お急ぎ便手数料  ×1  ¥3,000（例）
  種別: お急ぎ便手数料
  requiresShipping: false（配送不要）
```

### 管理者の作業手順

1. Shopify管理画面 → **注文** → **下書き** で新規 Draft Order を確認
2. 各 line item の properties で製造仕様を確認
3. 顧客が請求書ページで決済完了すると **「注文済み」** に変わる
4. 通常の Shopify 出荷フローで発送処理

---

## 3. 決済の仕組み（技術詳細）

### なぜ Draft Order を使うのか


| 方式                               | 問題点                            |
| -------------------------------- | ------------------------------ |
| Storefront API `/cart/add.js`    | バリアント価格が固定。見積もり金額を反映できない       |
| **Admin API `draftOrderCreate`** | `**priceOverride` で任意単価を設定可能** |


見積もりエンジンが算出した1枚あたりの単価（割引適用後）をそのまま Shopify 請求書に反映できる。

### 処理フロー図

```
ブラウザ                    Vercel Functions             Shopify Admin API
  │                              │                              │
  │  POST /api/checkout          │                              │
  │  {cart, deliveryInfo,        │                              │
  │   deliveryMode, surcharge}   │                              │
  │ ─────────────────────────▶  │                              │
  │                              │  GraphQL draftOrderCreate    │
  │                              │  {lineItems, priceOverride}  │
  │                              │ ────────────────────────────▶│
  │                              │                              │
  │                              │  draftOrder {id, invoiceUrl} │
  │                              │◀────────────────────────────│
  │                              │                              │
  │                              │  ポーリング: ready=true?     │
  │                              │ ────────────────────────────▶│
  │                              │  ready=true, invoiceUrl      │
  │                              │◀────────────────────────────│
  │                              │                              │
  │  {invoiceUrl}                │                              │
  │◀─────────────────────────   │                              │
  │                              │                              │
  │  window.location.href =     │                              │
  │  invoiceUrl                  │                              │
  │ ──────────────────────────────────────────────────────────▶│
  │                              │           Shopify請求書ページ │
  │                              │           (住所入力・決済)    │
```

### 関連ファイル


| ファイル                               | 役割                                              |
| ---------------------------------- | ----------------------------------------------- |
| `api/checkout.ts`                  | Vercel Functions。GraphQL `draftOrderCreate` を実行 |
| `src/hooks/useShopify.ts`          | フロントから `/api/checkout` を呼ぶフック                   |
| `src/components/DeliveryEntry.tsx` | お客様情報入力 → 送信 → リダイレクト                           |
| `src/components/Cart.tsx`          | カート画面。配送モード選択                                   |
| `src/store/index.ts`               | Zustand ストア。カートの状態管理・永続化                        |
| `src/types/nobori.types.ts`        | `DeliveryInfo` 型定義                              |
| `src/utils/constants.ts`           | サイズ・生地・印刷・オプションのマスターデータ                         |


### GraphQL mutation

```graphql
mutation DraftOrderCreate($input: DraftOrderInput!) {
  draftOrderCreate(input: $input) {
    draftOrder {
      id
      invoiceUrl
      status
    }
    userErrors {
      field
      message
    }
  }
}
```

### lineItems の構造

カート商品1つにつき1エントリ:

```json
{
  "variantId": "gid://shopify/ProductVariant/42512456712279",
  "quantity": 5,
  "priceOverride": {
    "amount": "900",
    "currencyCode": "JPY"
  },
  "customAttributes": [
    { "key": "サイズ", "value": "60×180cm（レギュラー）" },
    { "key": "生地", "value": "ポンジ（標準）" },
    { "key": "印刷方法", "value": "フルカラー印刷" },
    { "key": "数量", "value": "5枚" },
    { "key": "オプション", "value": "ヒートカット, チチ" },
    { "key": "デザイン区分", "value": "完全データ入稿" },
    { "key": "_商品番号", "value": "1/3" }
  ]
}
```

お急ぎ便手数料（発生時のみ）:

```json
{
  "title": "お急ぎ便手数料",
  "quantity": 1,
  "requiresShipping": false,
  "priceOverride": { "amount": "3000", "currencyCode": "JPY" }
}
```

### ready ポーリング

Draft Order 作成直後は `invoiceUrl` がまだ使えない場合がある。
バックエンド側で以下のクエリを最大5回（500ms間隔）実行し、`ready=true` になってから URL を返す:

```graphql
query DraftOrderReady($id: ID!) {
  node(id: $id) {
    ... on DraftOrder {
      id
      ready
      invoiceUrl
    }
  }
}
```

タイムアウト（2.5秒以内に ready にならない場合）は `invoiceUrl` をそのまま返す。

---

## 4. 環境変数の設定

Vercel のプロジェクト設定 → Environment Variables に以下を登録する:


| 変数名                              | 値の例                                           | 説明                         |
| -------------------------------- | --------------------------------------------- | -------------------------- |
| `SHOPIFY_SHOP_DOMAIN`            | `tkyhct-fe.myshopify.com`                     | ストアドメイン                    |
| `SHOPIFY_ADMIN_ACCESS_TOKEN`     | `shpat_xxxxx`                                 | Admin API アクセストークン         |
| `SHOPIFY_API_VERSION`            | `2025-01`                                     | API バージョン（**2025-01以上必須**） |
| `VITE_SHOPIFY_NOBORI_VARIANT_ID` | `gid://shopify/ProductVariant/42512456712279` | のぼり旗バリアントの GID             |
| `VITE_DEV_MODE`                  | `true` / 未設定                                  | `true` で API スキップ（開発用）     |


### アクセストークンの取得方法

1. Shopify管理画面 → **設定** → **アプリと販売チャネル** → **アプリを開発**
2. カスタムアプリを作成（または既存を選択）
3. **Admin API スコープ**: `write_draft_orders` を付与（必須）
4. アプリをインストール → **Admin API access token** をコピー
5. Vercel 環境変数に `SHOPIFY_ADMIN_ACCESS_TOKEN` として設定

---

## 5. 開発モード（DEV_MODE）

`VITE_DEV_MODE=true` を `.env` に設定すると:

- `/api/checkout` への API 呼び出しを **スキップ**
- Draft Order 用ペイロードが **ブラウザのコンソール** に出力される
- 送信成功時に **緑色の成功パネル** が表示される（Shopifyへのリダイレクトは行わない）
- カートはクリアされない（繰り返しテスト可能）

### 開発時の確認手順

1. 異なる仕様でのぼりを2〜3個カートに追加
2. カート → お客様情報入力 → 名前・電話・メール入力 → 送信
3. ブラウザのコンソール（F12）で Draft Order ペイロードを確認
4. 緑の成功パネルが表示されることを確認
5. ページリロード後もカートが残ることを確認（永続化）

---

## 6. 本番デプロイ後の確認手順

1. 環境変数をすべて Vercel に設定
2. `VITE_DEV_MODE` は **設定しない**（または `false`）
3. デプロイ後、以下を確認:


| #   | 確認項目                                             |
| --- | ------------------------------------------------ |
| 1   | 見積もり → カート → お客様情報入力 → 送信が通ること                   |
| 2   | Vercel Functions ログで `draftOrderCreate` 成功を確認    |
| 3   | Shopify 請求書ページにリダイレクトされること                       |
| 4   | 請求書に line item properties（サイズ・生地等）と正しい金額が表示されること |
| 5   | 支払い完了後、Shopify管理画面 → 注文詳細で全 properties が見えること    |
| 6   | お急ぎ便選択時に手数料が別 line item として表示されること               |


---

## 7. 注意事項・制約


| 項目               | 詳細                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| API バージョン        | `**2025-01` 以上が必須**。`priceOverride` は 2025-01 で追加されたフィールド。`2024-10` では `field not defined` エラーになる                 |
| API スコープ         | `write_draft_orders` が必須。不足すると 403 エラー                                                                            |
| priceOverride    | `variantId` 付き line item では `priceOverride` 一択。`originalUnitPriceWithCurrency` は `variantId` 付きでは無視される Shopify 仕様 |
| 通貨               | `presentmentCurrencyCode: "JPY"` を指定                                                                              |
| 属性文字数制限          | Shopify の attribute value は最大255文字。デザイン要望（`designRequestDetails`）は自動で切り詰め                                         |
| バリアント価格          | `priceOverride` で上書きするため、Shopify上のバリアント自体の価格設定は何でもよい                                                              |
| Draft Order 自動削除 | 2025/4/1 以降に作成された Draft Order は1年非アクティブで自動削除される                                                                   |
| 在庫予約             | 必要なら `reserveInventoryUntil` を `DraftOrderInput` に追加可能                                                            |


---

## 8. トラブルシューティング

### `Shopify credentials not configured.`

→ Vercel 環境変数 `SHOPIFY_SHOP_DOMAIN` と `SHOPIFY_ADMIN_ACCESS_TOKEN` が未設定

### `Variant ID not configured.`

→ Vercel 環境変数 `VITE_SHOPIFY_NOBORI_VARIANT_ID` が未設定

### `field not defined: priceOverride`

→ `SHOPIFY_API_VERSION` が `2024-10` 以下になっている。`2025-01` 以上に変更する

### 403 Forbidden

→ カスタムアプリの Admin API スコープに `write_draft_orders` がない。Shopify管理画面でスコープを追加してアプリを再インストール

### invoiceUrl にリダイレクト後にエラー画面

→ Draft Order が ready になる前にリダイレクトしている可能性。バックエンド側の ready ポーリングが正しく動作しているか Vercel ログを確認

### カートが消えない

→ `clearCart()` は本番決済成功時（`invoiceUrl` リダイレクト直前）にのみ実行される。DEV_MODE ではカートをクリアしない仕様