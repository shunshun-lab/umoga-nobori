## Shopify API 現状報告（2026-02 時点）

本ドキュメントは、現在のリポジトリにおける **Shopify 連携まわりの実装状況と問題点** を整理したものです。  
「Shopify 側がどうなっているのか」「なぜ API が見当たらない／使われていないように見えるのか」を説明します。

---

## 1. 全体サマリ

- **Shopify API 自体が「無い」わけではなく、コード上は複数ルートが存在**している。
  - Storefront API 用（`src/lib/shopify.ts`）
  - Admin API 用（`api/checkout.ts`, `api/admin-orders.ts`, `api/webhooks/order-paid.ts`）
- ただし **Shopify 側の仕様変更・新体制（カスタムアプリ前提など）と、このアプリ側の方針転換がかみ合っておらず**、
  - Storefront API ルートは「トークンなし前提」で実装されており、**現行仕様ではほぼ動作しない設計**。
  - Admin API ルートは「Admin API を使わない運用」に切り替えた結果、**トークン未設定＋フロントからも呼ばれていない**。
- その一方で、「本番で実際に使う想定のルート」は **Shopify テーマ内 JS からの `/cart/add.js`** に寄せてある。  
  → そのため、**Vercel で動かしている SPA からは「Shopify API が見当たらない／呼ばれていない」ように見える状態**。

---

## 2. 実装されている Shopify API ルート

### 2-1. Storefront API（Tokenless 想定）

- **関連ファイル**
  - `src/lib/shopify.ts`
    - `shopifyFetch`, `getShopInfo`, `getProducts`, `createCart`, `addToCart`
- **エンドポイント**
  - `https://{VITE_SHOPIFY_DOMAIN}/api/2024-10/graphql.json`
- **認証**
  - ヘッダーにトークンを付けず、「**ドメインだけ指定すれば読める**」前提の実装。
- **問題点**
  - 現在の Shopify では、ヘッドレス利用時は **Storefront API 用のアクセストークン（パブリックトークン）前提**。
  - 外部ドメイン（Vercel など）からトークンなしで Storefront API を叩くと、**403/401 になりやすい**。
  - 結果として、**コードは存在するが、実運用の前提とはズレた「古い期待値」のまま止まっている**。

### 2-2. Admin API（Draft Order／注文管理）

- **関連ファイル**
  - `api/checkout.ts` … Draft Order を作成し、`invoice_url` を返す API
  - `api/admin-orders.ts` … Admin API から注文一覧を取るための API
  - `api/webhooks/order-paid.ts` … `orders/paid` Webhook の受け口
- **期待する環境変数**
  - `SHOPIFY_SHOP_DOMAIN`
  - `SHOPIFY_ACCESS_TOKEN`（Admin API token, `shpat_...`）
  - `SHOPIFY_WEBHOOK_SECRET`
- **現状**
  - thread_summary 上で **「Admin API なし運用」に方針転換した**と明記されている。
  - そのため **トークンは発行・設定されておらず**、Vercel 側でも上記 env は前提としていない。
  - フロント（`Cart.tsx`）からの `/api/checkout` 呼び出しは **コメントアウト済み** で、**実際には一切使っていない**。

---

## 3. 実際に使う想定のルート：テーマ内 JS ＋ `/cart/add.js`

### 3-1. 方針転換の背景

- Storefront API（GraphQL）は **トークン必須** かつ CORS 制約がきつく、  
  ローカルや Vercel から素直に叩くスタイルが現実的でなくなってきた。
- Admin API についても、
  - カスタムアプリ作成 → スコープ設定 → Admin API トークン発行
  と手順が増え、「簡単に取れるプライベートアプリトークン」という前提が崩れている。
- このため **「API 連携で全部やる」方針から、「テーマ内 JS だけで完結させる」方針に寄せた**。

### 3-2. いまの想定フロー

- **ストア**
  - `tkyhct-fe.myshopify.com`（thread_summary より）
- **のぼり専用商品・バリアント**
  - 商品: `.../products/7567423897687`
  - バリアント: `.../variants/42512456712279`
  - `.env`: `VITE_SHOPIFY_NOBORI_VARIANT_ID=gid://shopify/ProductVariant/42512456712279`
- **本番での理想的なフロー**
  1. ビルドした JS（のぼり見積もり SPA）を `shopify-theme/assets/nobori-estimator.js` としてテーマに組み込み。
  2. テーマ内のページ（`page.nobori-estimator.liquid` 等）から、同一オリジンでこの JS を読み込む。
  3. 「注文確定」ボタンで `/cart/add.js` を呼び、上記バリアント＋line item properties を 1 行だけカートに追加。
  4. Shopify 標準のチェックアウトに遷移。
  5. 管理者は Shopify 管理画面の「注文詳細」画面から line item properties に埋め込まれた仕様（サイズ・生地・オプション等）を参照。
- このルートは **Shopify の Online Store テーマ機能として残っているレイヤー**なので、  
  新しい「カスタムアプリ」体制とは独立して動作する。

---

## 4. Vercel 上の SPA と Shopify の関係

### 4-1. 画面ごとの挙動

- `NoboriEstimator.tsx`
  - Zustand の `addToCart` を呼んで、**アプリ内のカート（メモリ上）にだけ積む**。
  - Shopify API（Storefront / Admin / `/cart/add.js`）はここでは一切呼ばない。

- `Cart.tsx`
  - 以前は `/api/checkout` 経由で Draft Order を作るコードが存在していたが、  
    現在は **その部分がコメントアウトされており**、
    - 「注文手続きへ進む」→ 配送情報入力画面（DeliveryEntry）へ遷移するだけ。
  - つまり **Vercel 上の SPA からは、Shopify への注文送信は行われていない**。

- `DeliveryEntry.tsx`
  - 「注文を確定する」ボタンで `onComplete()` を呼び、  
    デモ用のアラートを出すのみ（API 呼び出しなし）。

### 4-2. 結果としてどう見えるか

- Vercel / ローカルで SPA を触っても、
  - Shopify カートに商品が追加されない
  - Shopify 決済画面に遷移しない
  → **「Shopify API がどこにもいない／使われていないように見える」状態**になっている。
- 実際には、
  - Storefront API も Admin API もコード上は存在するが、
  - **どちらも「現行方針の本流」ではなくなっている**。
  - 本流は「テーマ内 JS ＋ `/cart/add.js`」に切り替えている。

---

## 5. 「Shopify 側の新体制」の影響について

### 5-1. 何が変わったか（簡略）

- 旧「プライベートアプリ」 → 新「カスタムアプリ」体制に移行。
  - Admin API トークンは **カスタムアプリ経由で発行**する前提になった。
  - スコープ設定・審査・権限管理がより明示的に。
- Storefront API も
  - 「ヘッドレスチャネル＋ Storefront API アクセストークン」で使う前提が強くなり、
  - 外部ドメインからトークンレスで叩くスタイルは **現実的ではなくなっている**。

### 5-2. このプロジェクトへの影響

- Storefront API 用コードは **「トークンなしで動かす」時代の期待値**で実装されており、  
  現行 Shopify ではそのままでは通らない。
- Admin API 用コードも、「簡単に取れるプライベートアプリトークン」前提から、  
  実際には **カスタムアプリ作成〜スコープ設定〜トークン発行**が必要になっており、  
  そこで一旦「Admin API なし運用」方針に切り替えている。
- したがって、**「Shopify 側の新体制（アプデ）による影響を受けている」という理解はほぼ正しい**が、  
  同時に **このリポジトリ側の実装・方針も途中で変わっており、その結果として「API が見当たらない」状態になっている**のが実情。

---

## 6. 今後、問題特定と復旧を進める場合の選択肢

1. **テーマ内 JS ＋ `/cart/add.js` 路線を本命として固める**
   - Shopify テーマ側の `nobori-estimator.js` / `page.nobori-estimator.liquid` を整備。
   - 「注文確定」時に `/cart/add.js` を叩き、line item properties に仕様をすべて積む。
   - この場合、Vercel SPA は「UI 開発用のプレビュー」と割り切り、  
     **最終的なチェックアウトは常に本番ストア URL 上でテストする**運用。

2. **Admin API Draft Order ルートを復活させる**
   - Shopify 管理画面でカスタムアプリを作成し、`write_draft_orders` などのスコープを付与。
   - `SHOPIFY_SHOP_DOMAIN` / `SHOPIFY_ACCESS_TOKEN` を Vercel / `.env` に設定。
   - `Cart.tsx` の `/api/checkout` 呼び出し部分（コメントアウト箇所）を元に戻し、  
     決済 URL へリダイレクトするフローを有効化。

3. **Storefront API（ヘッドレス）路線をきちんと組み直す**
   - Storefront API 用のアクセストークンを発行し、  
     `VITE_SHOPIFY_STOREFRONT_TOKEN` などの env を導入。
   - `src/lib/shopify.ts` に認証ヘッダーを追加。
   - `useShopify().addToCart` をフロントの本流に接続し直す。

---

## 7. ひとまずの結論

- **「Shopify API がどこにも見当たらない（＝実装されていない）」わけではない**が、  
  - Storefront / Admin の両方とも、**現行の Shopify 体制とは噛み合っていない or 実運用の本流から外れている**。
- **本番として想定されているのは「テーマ内 JS ＋ `/cart/add.js`」の構成**であり、  
  Vercel 単体の SPA から Shopify 決済までつながるフローは、現時点では無効化されている。
- 「Shopify 側のアプデ・新体制移行に伴い、当初想定していた API の使い方がそのままでは成立しなくなった」  
  という理解は妥当であり、上記 3 つの方向性のどれかを選んで再設計する必要がある。

