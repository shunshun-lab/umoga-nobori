# UMOGA様 - オンライン見積もりシステム

React + Vite + TypeScript + Shopify で構築した、のぼり製作の自動見積もり・注文管理システムです。

> [!IMPORTANT]
> **現在のデモ環境（Vercel/Google Cloud）の提供期限について**<br>
> 現在稼働しているデモ環境および連携サービスの管理は、**2026年1月末** をもって終了いたします。<br>
> それ以降の運用や環境維持については、別途ご相談ください。

## 📖 システム運用・管理ガイド

本システムは、**価格ロジック（割引ルール）**と**商品情報**をそれぞれ以下の外部ツールで管理・連携しています。コードを書き換えることなく、営業上の変更を即座に反映させることが可能です。

### 1. 数量割引ルールの変更 (Google Sheets)

大量注文時の割引率（ボリュームディスカウント）は、連携済みの Google スプレッドシートで管理しています。

- **管理シート**: [Nobori Pricing Rules](https://docs.google.com/spreadsheets/d/1vVLc_q4F4i186AuzSo82N-9VBs1rQt3DQKRtFiM7r-8/edit?usp=sharing)
- **変更手順**:
  1. 上記シートを開き、直接セルを編集します（行の追加・削除、割引率の変更など）。
  2. アプリケーション内の管理画面（管理タブ）にアクセスします。
  3. **「Google Sheets 同期」**ボタンをクリックします。
  4. 「同期に成功しました」と表示されれば、即座に新しいルールがシステム全体に適用されます。

### 2. 商品・在庫情報の変更 (Shopify)

注文データや商品ベースの情報は ShopifyAdmin（管理画面）で管理します。

- **商品マスタ**: Shopifyの商品管理画面で登録・編集します。
- **注文管理**: ユーザーからの注文は全て Shopify の「注文管理」に集約されます。
- **決済・配送**: 決済フローや配送通知も Shopify の標準機能を利用します。

---

## 💻 開発・セットアップガイド（システム管理者向け）

以下は、システムの保守・改修を行うエンジニア向けの環境構築手順です。

### 🚀 ゼロからのシステム構築（重要）

リポジトリを受け取った状態から、ShopifyストアやGoogle Cloud設定を含めてゼロから環境を構築する場合は、以下のマニュアルを参照してください。

👉 **[ゼロからのシステム構築マニュアル (docs/manual_setup.md)](docs/manual_setup.md)**

### 前提条件

- Node.js 20+
- pnpm (推奨) または npm
- Shopify アカウント (Admin API Access Token)
- Google Cloud Platform アカウント (Sheets API Service Account)

### ローカル環境の構築

```bash
# 1. 依存関係のインストール
pnpm install

# 2. 環境変数の設定
cp .env.example .env
# .env ファイルを開き、ShopifyおよびGoogleの認証鍵を設定してください
# ※ 設定値の詳細は docs/manual_setup.md を参照

# 3. 開発サーバーの起動
pnpm dev
```

起動後、ブラウザで `http://localhost:5173` にアクセスして動作を確認してください。

### プロジェクト構造

```
nobori-app/
├── src/
│   ├── components/       # UIコンポーネント (見積もりフォーム、管理画面等)
│   ├── utils/            # 計算ロジック (priceCalculator.ts)
│   ├── store/            # 状態管理 (Zustand)
│   └── hooks/            # カスタムフック
├── docs/
│   ├── howtomake.md      # 詳細設計書
│   ├── handover.md       # 運用・権限移譲ガイド
│   └── manual_setup.md   # ★構築全手順マニュアル
└── README.md             # 本書
```

### デプロイ（本番公開）

本番環境（Vercel推奨）へのデプロイ手順です。

```bash
# ビルド & デプロイ
pnpm build
vercel --prod
```

**注意**: 本番環境の管理画面（Vercel Dashboard等）にて、ローカルと同じ環境変数（特に `GOOGLE_PRIVATE_KEY`）が正しく設定されていることを確認してください。

## 🔒 ライセンス・権利表記

Copyright (c) 2026 Nobori Online System. All Rights Reserved.
