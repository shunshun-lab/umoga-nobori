# Shopify 連携アーキテクチャ

本ドキュメントでは、**Nobori App** がどのようにShopifyと連携し、カスタム製品の見積もりと注文処理を行っているかを解説します。

## 概要

本アプリケーションは **ヘッドレスアーキテクチャ** を採用しており、フロントエンド（Vercel）がUIと価格計算を担当し、Shopifyは純粋にバックエンドとして以下の機能のみを担当します。

- 注文管理（チェックアウト）
- 決済処理
- 顧客管理

「のぼり旗」はサイズやオプションの組み合わせが無限にあるため、Shopify上にすべてのバリエーションを商品として事前登録することは**行いません**。代わりに、**下書き注文 (Draft Order) API** を使用して、注文のたびに動的に商品を生成します。

## アーキテクチャ図

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Frontend as フロントエンド (Vercel)
    participant API as API (Vercel Serverless)
    participant Shopify as Shopify (管理画面)

    User->>Frontend: サイズ・オプション・数量を選択
    Frontend->>Frontend: 価格を計算 (ローカルロジック)
    User->>Frontend: 「注文手続きへ進む」をクリック
    Frontend->>API: POST /api/checkout (カート情報)
    API->>API: 明細行(Line Items)の検証・整形
    API->>Shopify: POST /admin/api/draft_orders.json
    Note right of API: カスタム明細と価格情報を持つ<br/>「下書き注文」を作成
    Shopify-->>API: 下書き注文情報（請求書URL含む）を返却
    API-->>Frontend: チェックアウトURLを返却
    Frontend->>User: Shopifyの決済画面へリダイレクト
    User->>Shopify: 決済完了
```

## 詳細な実装フロー

### 1. ストア接続 (Storefront API)
- **ファイル**: `src/lib/shopify.ts`
- **目的**: ストアの基本情報（名前、説明）を取得し、接続確認を行います。
- **認証**: **Public Access Token** を使用（または公開データの場合はトークンレス）。
- **用途**: 主にヘルスチェックや、必要に応じて静的コンテンツを取得するために使用します。

### 2. チェックアウト処理 (Admin API)
- **ファイル**: `api/checkout.ts`
- **目的**: Shopify上に実際の注文データを作成します。
- **認証**: **Admin API Access Token** (機密情報) を使用します。
- **仕組み**:
    1. フロントエンドからカートデータを受け取ります。
    2. 各アイテムを（既存の商品IDではなく）カスタム明細行としてマッピングします。
    3. フロントエンドで計算された価格を明示的にセットします。
    4. メタデータ（生地、サイズ、オプション）を `properties` として付与します。
    5. ユーザーをShopifyの決済画面に誘導するための `invoice_url` を返します。

### 3. 自動注文同期 (Webhooks)
- **ファイル**: `api/webhooks/order-paid.ts`
- **目的**: 決済完了（支払い済み）時に自動的に注文詳細をGoogleスプレッドシートに記録します。
- **認証**: **SHOPIFY_WEBHOOK_SECRET** を使用したHMAC検証。
- **仕組み**:
    1. Shopifyから `orders/paid` Webhookを受け取ります。
    2. 注文情報から、カスタム属性（生地、サイズ、オプション）や顧客情報を抽出します。
    3. Google Sheets APIを使用して、指定されたスプレッドシートの末尾に新しい行を追加（Append）します。

## セットアップ要件

本システムを動作させるには、Vercel側で以下の環境変数が必要です。

| 変数名 | 説明 | 設定例 |
|---|---|---|
| `SHOPIFY_SHOP_DOMAIN` | 対象 of myshopify.com ドメイン | `example.myshopify.com` |
| `SHOPIFY_ACCESS_TOKEN` | Admin API トークン (`shpat_` で始まるもの) | `shpat_xxxxxxxx` |
| `SHOPIFY_WEBHOOK_SECRET` | WebhookのHMAC検証用シークレット | `xxxxxxxxxxxxxx` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google Sheets操作用のサービスアカウント | `order-sync@...gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | Googleサービスアカウントの秘密鍵 | `-----BEGIN PRIVATE KEY----- ...` |

### Adminトークンに必要な権限 (Scope)
カスタムアプリの設定にて、Adminトークンには以下のスコープが必要です。
- `write_draft_orders`
- `read_draft_orders`
- `read_orders` (Webhookで注文情報を詳細に取得する場合)

### Webhookの登録方法
1. Shopify管理画面 > 設定 > 通知 > Webhooks (最下部) へ移動。
2. 「Webhookを作成」をクリック。
3. イベント: `支払い済みの注文` (orders/paid)
4. 形式: `JSON`
5. URL: `https://your-domain.vercel.app/api/webhooks/order-paid`
6. APIバージョン: `最新`
7. 本番環境以外（プレビュー等）でテストする場合は、適宜URLを変更してください。

## トラブルシューティング

### "Shopify credentials not configured" エラー
- **原因**: Vercelの環境変数が設定されていません。
- **対応**: Vercelの `Settings` > `Environment Variables` を確認してください。

### チェックアウトへのリダイレクト失敗 (403/Forbidden)
- **原因**: APIトークンに `write_draft_orders` 権限が付与されていない可能性があります。
- **対応**: Shopify管理画面 > 設定 > アプリと販売チャネル > (対象アプリ) > API認証情報 > Admin APIのスコープを構成 から権限を追加してください。

### Shopify上での価格不整合
- **注意**: 本システムは価格を**明示的に**指定してShopifyに送信するため、Shopify側での再計算は行われません。`src/utils/priceCalculator.ts` の計算ロジックが正しいことを常に確認してください。

## 現在の実装状況と未実装部分

現状（2026年1月時点）では、バックエンドAPIの実装は完了していますが、**フロントエンドからの呼び出し処理が未実装**の状態です。

### 1. 実装済みの部分 ( Backend )
- `api/checkout.ts`: カート情報を受け取り、Shopify APIを叩いて下書き注文を作成し、決済URLを発行する処理は実装完了しています。

### 2. 未実装の部分 ( Frontend )
- `src/components/DeliveryEntry.tsx`: 現在は「注文を確定する」ボタンを押しても `onComplete` (デモ用の完了アラート) を呼ぶだけで、**実際のAPI呼び出しを行っていません**。

### 3. 実装手順 (Next Steps)
実際の決済を有効にするには、`src/components/DeliveryEntry.tsx` を以下のように改修する必要があります。

1. **API呼び出し処理の追加**:
   ボタンクリック時に `axios.post('/api/checkout', { cart, ... })` を実行する処理を追加します。

2. **リダイレクト処理**:
   APIから返却された `checkoutUrl` (Shopifyの決済画面URL) にユーザーをリダイレクト (`window.location.href = ...`) させます。

3. **環境変数の本番設定**:
   Vercel上で本番用のShopifyアクセストークンを設定します。
