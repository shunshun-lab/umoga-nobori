# Firebase 関連 TODO

現在の状態：API (`/api/ui-config`) は `firebase-admin` を import しているが、
`package.json` に `firebase-admin` が未追加のため **Vercel上で500エラー（FUNCTION_INVOCATION_FAILED）** になる。
フロントエンド側はフォールバックで動作するよう修正済み。

---

## 1. 基盤セットアップ（ブロッカー）

- [ ] `firebase-admin` を `dependencies` に追加（`pnpm add firebase-admin`）
- [ ] Firebase プロジェクトの作成 or 既存プロジェクトの選定
- [ ] Firestore をネイティブモードで有効化
- [ ] Cloud Storage を有効化（Spark プランでは使えないため Cloudinary Free 等で代替する方針も検討）

---

## 2. サービスアカウント・環境変数

- [ ] GCP コンソールでサービスアカウントを作成/確認
  - ロール: `Cloud Datastore User` + `Storage Object Admin`
- [ ] サービスアカウントの JSON キーを発行
- [ ] Vercel に環境変数を設定
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`
  - `FIREBASE_STORAGE_BUCKET`
- [ ] `.env.example` にも追記

---

## 3. Firestore 初期データ

- [ ] コレクション `ui_config` を作成
  - `banners` → `{ items: [] }`
  - `templates` → `{ items: [] }`
  - `optionImages` → `{ byOptionId: {} }`
  - `sizeImages` → `{ bySizeId: {} }`
  - `fabricImages` → `{ byFabricId: {} }`
- [ ] コレクション `nobori_settings` を作成
  - `default` → `{ title: "", subtitle: "" }`

---

## 4. 画像ストレージ

- [ ] 画像ホスティング先の決定（Firebase Storage / Cloudinary Free / その他）
- [ ] アップロード用パス設計（例: `ui-images/banners/`, `ui-images/templates/`）
- [ ] テンプレートPDFの実ファイル置き場の決定
- [ ] 公開URL発行の仕組み（署名付きURL or 公開バケット）

---

## 5. セキュリティ

- [ ] Firestore ルールの設定（Admin SDK 経由のみなので基本クローズドでOK）
- [ ] 将来フロントから直接読む場合のルール検討

---

## 6. 接続確認

- [ ] ローカルで `pnpm dev` → 管理画面（UI設定タブ）で読み込み確認
- [ ] バナー/テンプレートの編集→保存→Firestore反映を確認
- [ ] Vercel デプロイ後に `/api/ui-config` が200で返ることを確認
- [ ] 本番でエラー表示が出ないことを確認

---

## 現状の回避策

- `TemplateDownload`: APIエラー時はフォールバックテンプレート（4件）を静かに表示
- `BannerSlider`: APIエラー時はフォールバックバナー（3件）を表示
- `NoboriEstimator`: APIエラー時はデフォルト文言を使用
