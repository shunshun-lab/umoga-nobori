# Firestore / Storage セットアップ手順（オーナー作業用）

このプロジェクトで Firestore + Storage を本番運用するために、**あなたがやるべき作業だけ**をまとめています。  
実装側（コード）はすでに API の受け口を用意しているので、下記が終われば接続を有効化できます。

---

## 1. Firebase プロジェクトの用意

- [ ] Firebase Console で新規プロジェクトを作成 or 既存プロジェクトを使用
- [ ] 対象プロジェクトで下記を有効化
  - [ ] Firestore（ネイティブモード）
  - [ ] Cloud Storage

メモ：  
プロジェクトID（例）: `your-project-id`  

---

## 2. サービスアカウントの発行（Admin SDK 用）

**目的**: Vercel の API（`/api/ui-config`）から Firestore / Storage にアクセスするため。

- [ ] GCP コンソールで、Firebase プロジェクトに紐づく **サービスアカウント** を確認/作成
  - 例: `firebase-adminsdk-XXXX@your-project-id.iam.gserviceaccount.com`
- [ ] そのサービスアカウントに、最低限以下のロールを付与
  - [ ] Firestore → `Cloud Datastore User` or 同等権限
  - [ ] Storage → `Storage Object Admin`（画像アップロード用）
- [ ] サービスアカウントの **JSON キー** を作成し、ローカルにダウンロード

---

## 3. Vercel / 環境変数の設定

ダウンロードした JSON キーから、以下の情報を `.env` / Vercel の Environment Variables に設定します。

- [ ] `FIREBASE_PROJECT_ID`  
  - JSON の `"project_id"` の値
- [ ] `FIREBASE_CLIENT_EMAIL`  
  - JSON の `"client_email"` の値
- [ ] `FIREBASE_PRIVATE_KEY`  
  - JSON の `"private_key"` の値をコピペ  
  - その際、改行は `\n` にエスケープする（Vercel の UI から貼るときは自動でいい場合もある）
- [ ] `FIREBASE_STORAGE_BUCKET`  
  - Storage のデフォルトバケット名（例: `your-project-id.appspot.com`）

※ 既に `.env.example` があれば、そこにも追記しておくと他環境で迷わないです。

---

## 4. Firestore コレクション / ドキュメントの初期化

最初は空でも動きますが、管理画面で編集しやすくするために、最低限のドキュメントだけ作っておくと安心です。

作成すべきコレクション / ドキュメント：

- [ ] コレクション `ui_config`
  - [ ] ドキュメント `banners`
    - フィールド `items: []`（配列）
  - [ ] ドキュメント `templates`
    - フィールド `items: []`
  - [ ] ドキュメント `optionImages`
    - フィールド `byOptionId: {}`（Map）
  - [ ] ドキュメント `sizeImages`
    - フィールド `bySizeId: {}`
  - [ ] ドキュメント `fabricImages`
    - フィールド `byFabricId: {}`
- [ ] コレクション `nobori_settings`
  - [ ] ドキュメント `default`
    - フィールド `title: ""`（任意の初期タイトル）
    - フィールド `subtitle: ""`（任意）

これらは、後から **管理画面（UI設定タブ）から上書き** されます。

---

## 5. Firestore セキュリティルールの方針

このプロジェクトでは、**本番サイトからの読み取りはサーバー（Admin SDK）経由** を想定しています。

そのため、デフォルトでは：

- [ ] クライアントから Firestore へ直接アクセスしない（Admin SDK 経由のみ）
- [ ] Firestore のルールは「ほぼ閉じた状態」で OK
  - Admin SDK はルールをバイパスするため

将来的に「フロントから直接 Firestore を読む」場合だけ、クライアント用のルールを別途検討します。

---

## 6. Storage バケットの整理（画像アップロード用）

**目的**: UI設定（バナー画像など）で使うパブリックURLを発行できるようにする。

- [ ] Storage バケットを確認（`your-project-id.appspot.com`）
- [ ] 画像アップロード用のパスを決める（例：`ui-images/banners/`、`ui-images/templates/` など）
- [ ] 必要に応じて、**公開用の読み取り権限** を設定
  - 例: 特定パス配下のオブジェクトを「公開URLで表示できる」ようにする
  - もしくは Cloud CDN / Image 変換サービスをあとから噛ませる

アップロード自体は、サーバー側 API から Storage に署名付きURL(or 直接書き込み)で行い、  
**最終的な公開URLだけを Firestore の `imageUrl` として保存する** 形を取ります。

---

## 7. 接続確認の流れ（終わったかどうかのチェック）

上記 1〜6 が終わったら、次のように動作確認します：

- [ ] `pnpm dev` でローカル起動
- [ ] 管理画面（`AdminDashboard` の「UI設定」タブ）を開く
- [ ] 「設定を読み込む」ボタンを押して、Firestore の内容が反映されることを確認
- [ ] バナー or テンプレートを編集し、「保存」ボタンを押す
- [ ] Firestore の `ui_config` ドキュメントに変更が反映されていることを Console で確認

ここまでできれば、**Firestore 接続まわりはあなた側の作業完了**です。  
この先は、画像アップロード API やより細かい UI をこちら側で実装していきます。

