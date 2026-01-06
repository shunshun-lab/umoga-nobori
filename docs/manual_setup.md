# ゼロからのシステム構築マニュアル

本ドキュメントでは、コード（リポジトリ）以外の外部環境を含め、本システムをゼロから完全に再現・構築する手順を解説します。
開発者以外の担当者が引き継ぎを受けた際も、この手順に従えばシステムを稼働させることができます。

---

## 🏗️ 全体構成

本システムは3つの要素で構成されています。

1. **Frontend (Vercel)**: アプリケーション本体。
2. **Backend (Shopify)**: 注文管理・決済・顧客管理を担当。
3. **Database (Google Sheets)**: 割引ルールの管理を担当。

---

## 1. Google Cloud (Sheets連携) の構築

割引ルール（数量割引）を管理するための環境を作ります。

### 1-1. Google Cloud Project の作成
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセスし、Googleアカウントでログインします。
2. 画面上部のプロジェクト選択部をクリックし、「新しいプロジェクト」を作成します。
   - プロジェクト名: `nobori-app` など（任意）

### 1-2. Google Sheets API の有効化
1. 左メニュー「APIとサービス」>「ライブラリ」を選択。
2. 検索バーに「Google Sheets API」と入力して検索。
3. 「有効にする」をクリック。

### 1-3. サービスアカウント (ロボット) の作成
1. 左メニュー「IAMと管理」>「サービスアカウント」を選択。
2. 「サービスアカウントを作成」をクリック。
   - 名前: `sheets-sync-bot` など
   - 完了まで進む（権限設定はスキップ可）。
3. 作成されたアカウントの「メールアドレス」（例: `sheets-sync-bot@...`）をコピーしてメモしておきます。

### 1-4. 認証キー (JSON) の発行
1. 作成したサービスアカウントをクリックし、「キー」タブを開きます。
2. 「鍵を追加」>「新しい鍵を作成」>「JSON」を選択し「作成」。
3. JSONファイルがダウンロードされます。
   - ⚠️ このファイル内の `private_key` と `client_email` が後で必要になります。

### 1-5. スプレッドシートの作成
1. 以下のURL（テンプレート）にアクセスしてください。
   👉 [**Nobori Pricing Rules (テンプレート)**](https://docs.google.com/spreadsheets/d/1vVLc_q4F4i186AuzSo82N-9VBs1rQt3DQKRtFiM7r-8/edit?usp=sharing)
2. メニューの **「ファイル」>「コピーを作成」** をクリックし、ご自身のGoogleドライブに保存します。
   - このコピーしたシートが、あなたの環境での管理シートになります。
3. 右上の「共有」ボタンを押し、**1-3でコピーしたサービスアカウントのメールアドレス** を「編集者」として招待します。

---

## 2. Shopify (注文・決済) の構築

商品マスタの登録は**不要**です。本システムは注文内容を動的に生成してShopifyに送信します。

### 2-1. ストア開設
Shopify公式サイトからストアを開設します（開発用ストアでも可）。

### 2-2. カスタムアプリの作成
Admin API（管理機能）へのアクセス権を持つアプリを作成します。

1. 管理画面 > 設定 > アプリと販売チャネル > 「アプリを開発」をクリック。
2. 「アプリを作成」をクリック。
   - アプリ名: `Nobori Estimator` など
3. **「APIスコープを設定」** をクリックし、以下にチェックを入れます。
   - `write_draft_orders` (下書き注文の作成)
   - `read_draft_orders`
4. 保存し、画面右上の「アプリをインストール」をクリック。

### 2-3. トークンの取得
1. 「API認証情報」タブを開きます。
2. **「Admin APIのアクセストークン」** (shpat_...から始まる文字列) をコピーし、厳重に保管します。

---

## 3. アプリケーションのデプロイ (Vercel)

### 3-1. リポジトリのインポート
1. [Vercel](https://vercel.com) にログインし、「Add New」>「Project」。
2. GitHubリポジトリを選択してインポートします。
   - ※リポジトリ名が `mmdid` 以外の場合（例: `your-private-repo`）は、そのリポジトリを選択してください。

### 3-2. 環境変数の設定 (Environment Variables)
デプロイ設定画面で、以下の変数を入力します。

| 変数名 | 値の例 / 説明 |
|--------|--------------|
| **Shopify設定** | |
| `SHOPIFY_SHOP_DOMAIN` | `your-shop.myshopify.com` (ドメインのみ) |
| `SHOPIFY_ACCESS_TOKEN` | 手順2-3で取得した `shpat_...` トークン |
| **Google設定** | |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | 手順1-3のメールアドレス |
| `GOOGLE_PRIVATE_KEY` | 手順1-4のJSON内の `private_key` (改行コード含む) |
| **アプリ設定** | |
| `VITE_DEV_MODE` | `false` (本番時はfalse推奨) |

### 3-3. デプロイ実行
「Deploy」ボタンを押します。

---

## 4. 更新の反映について (GAS)

本システムは、**アプリ内の同期ボタンを押すことで最新データを取得する「プル型」** の設計になっています。そのため、**基本的にはGoogle Apps Script (GAS) の作成は不要です。**

しかし、もし「スプレッドシートの変更を**自動的に通知・反映**させたい」等の高度な要件がある場合は、Google Apps Script を利用することも可能です。

### (参考) もしGASを作る場合
以下のようなスクリプトをスプレッドシートの拡張機能から作成し、トリガーを設定することで実装可能です。

```javascript
// サンプル: シート変更時にWebhookを叩くGAS
function onEdit(e) {
  // 反映先のAPIエンドポイント (VercelのURL)
  var endpoint = "https://your-app.vercel.app/api/sync-sheet";
  
  // POSTリクエスト
  // ※注: 現在のAPI実装は認証情報(Body)を求めているため、
  // ここでAPIキー等をPayloadに含める改修が別途必要になります。
  /*
  var payload = {
    trigger: "auto-update"
  };
  UrlFetchApp.fetch(endpoint, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  });
  */
}
```

**現状はより安全で確実な「管理画面からのボタン同期」を推奨しています。** GASによる自動更新は予期せぬタイミングでの価格変更リスクがあるためです。
