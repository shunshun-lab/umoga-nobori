# スレッド全体で実施したことのまとめ

このドキュメントは、のぼり見積もり・注文システムに関する一連のやりとりで「何を決めて・何を実装し・何が残っているか」を整理したものです。

---

## 1. 達成した要件（実装済み）

### 全体コンセプト・画面
- **デザイン1種＝1会計・1品番**  
  Zustand の `addToCart` でカートを常に1行にし、React 側でも「完全データ入稿で2つ目を追加しようとしたらブロック」する制御を実装。
- **大きな見出しの商品別変更**  
  `ui-config` API ＋ AdminDashboard の「のぼりテキスト」で、タイトル・サブタイトルを設定から差し替え可能に。

### 入力ステップ（①〜⑨）
- ①サイズ・②生地・③棒通し（棒袋／チチ）・⑤枚数・⑥データ・デザイン・⑦オプション情報・⑧付属品・⑨出荷日  
  いずれも UI と `NoboriSpecs` への紐づけを実装。  
  ④縫製方法は「棒通し以外が増えたら検討」で保留。
- 納期：通常／お急ぎの日数表示とお急ぎチェック（`ScheduleSelector`）を実装。  
  実カレンダーでの出荷日選択は未実装（日付入力フィールドはあり）。

### 付属品・デザインデータ
- 付属品の個数選択と、見積もり内訳への「器具・付属品」金額の明示を実装。
- ZIP 入稿の受付、完全データ入稿の説明 URL・テンプレート最大10個（設定から管理）を実装。  
  実ファイル置き場（Cloudinary 等）の本番設計は未実施。

### レイアウト・画像
- サイズブロック上のバナー3種スライド（`BannerSlider`）と、サイズ・生地・オプションそれぞれ最大3画像を設定から差し替え可能に。  
  画像 URL は Firestore 想定の設定 API から取得する形に変更済み。

### 数量・見積もり UI
- PC でも数量変更できる UI、右のお見積もりの「変更」ボタンで該当ブロックへスクロールする挙動を実装。  
  line item properties への反映はコード上対応済みで、**本番での目視確認が残り**。

### その他
- サイト上段・下段は Shopify テーマのヘッダー／フッター利用。  
  お客様の声セクションは固定テキストで設置済み（レビュー連携は検討事項）。

---

## 2. Shopify 連携まわりでやったこと・決めたこと

### カート・チェックアウト
- **Storefront API（GraphQL）** はトークン必須で 403 になったため、**`/cart/add.js` に一本化**。  
  テーマに埋め込んだ JS から同一オリジンで呼ぶ前提（トークン不要）。
- **ローカル（localhost）から `cart/add.js` を叩くと CORS で弾かれる**ため、  
  **本番ストアの URL 上でテストする**方針に。  
  ビルド後に `dist` の JS を `shopify-theme/assets/nobori-estimator.js` にコピーし、テーマで読み込む運用。

### 商品・バリアント
- のぼり専用商品「オーダーのぼり旗（オンライン見積もり専用）」  
  - 管理画面: `.../products/7567423897687`  
  - バリアント: `.../variants/42512456712279`  
- `.env` に  
  `VITE_SHOPIFY_NOBORI_VARIANT_ID=gid://shopify/ProductVariant/42512456712279`  
  を設定。  
  `DeliveryEntry` から `addToCart` 呼び出し時にこのバリアント＋line item properties で追加。

### Admin API トークン
- Dev Dashboard の「nobori admin」ではインストール数0・Example Domain 表示などで、  
  **Admin API 用のトークンを簡単に取得できない**状況に。
- **「Admin API なし運用」** に方針転換：  
  - 注文確認は **Shopify 管理画面の「注文管理」のみ** で行う。  
  - 仕様は **line item properties に全部入れておき、注文詳細で読む**。  
  - AdminDashboard の「注文管理（Shopify）」タブと `api/admin-orders.ts` は **当面使わない**（将来トークンが取れるようになったら再検討）。

### ベストプラクティス
- 公式の「理想形」は Storefront API ＋ Checkout UI Extensions（Plus 向け）だが、  
  現状の規模・プランでは **`cart/add.js` ＋ line item properties で運用する構成を「現実的なベストチョイス」** と整理。  
  多チャネル化や Plus 移行時に改めて Storefront API 等を検討する、と記載。

---

## 3. テーマ・アセットまわりで起きたことと対応

### CSS 崩れ
- `nobori-styles.css` を **Vite ビルド結果（Tailwind の 1 行 minify）で上書き** したため、  
  テーマ用の `.nobori-estimator-container` 等のレイアウト用 CSS が消え、  
  上部に巨大な円や矢印アイコンが表示される状態に。
- **対応方針**:  
  - `git restore shopify-theme/assets/nobori-styles.css` で元のスタイルを復元。  
  - 以降は **JS だけ dist からコピーし、CSS は上書きしない**。  
  - 上部ヒーローはテーマエディタで非表示／縮小するか、必要なら CSS でアイコンだけ小さくする。

### テーマにファイルがない
- 「nobori-estimator.js がない」「page.nobori-estimator.liquid がない」という報告に対して、  
  **テーマエディタで「アセットを追加」「テンプレートを追加」し、ローカルの内容を貼り付ける** 手順を案内。  
  リポジトリの `shopify-theme/` にはテンプレートとアセットの雛形がある前提。

### nobori-estimator.js の役割
- **のぼり見積もりページを動かすフロント用 JS の本体**。  
  - `window.NOBORI_DATA` の読み込み、ステップ制御、価格計算、ファイルアップロード UI、  
    「注文確定」時の `/cart/add.js` 呼び出しとチェックアウト遷移までを担当。  
  - 現状は Vite ビルド結果をそのままコピーしたバンドル（ミニマムな別実装への置き換えは未実施）。

---

## 4. 設定・環境まわりで整理したこと

- **VITE_SHOPIFY_DOMAIN**  
  `tkyhct-fe.myshopify.com` でよい。  
  ローカル `.env` と Vercel の両方に入れておくのが望ましい。
- **Firestore**  
  設定データ（バナー・テンプレート・画像 URL・のぼりテキスト）の取得先として想定。  
  Firebase Storage は Spark では使えず、**画像は Cloudinary Free 等でホストする**方針を整理。  
  `FIREBASE_STORAGE_BUCKET` の場所や、env が必須かどうかも説明。
- **Admin API スコープ**  
  使う場合の例として `read_orders` / `write_orders`、必要なら `read_draft_orders` / `write_draft_orders` を記載。  
  現状は「Admin API なし」のため未設定でよい。

---

## 5. ユーザー体験・管理者体験の整理

- **ユーザー**:  
  のぼり見積もりページで仕様を入力 → 確認 → 注文確定で `/cart/add.js` に 1 商品追加 →  
  Shopify 公式チェックアウトへ遷移。  
  仕様は line item properties として注文に付与。
- **管理者**:  
  Shopify 管理画面の「注文管理」のみ使用。  
  注文詳細の line item properties でサイズ・生地・オプション・枚数・出荷日等を確認。  
  独自の Admin アプリや Admin API は必須ではない、と整理。