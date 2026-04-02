# MMD Participation Platform (MMD DID Event)

100万人DAO構想に向けた、イベント参加とコミュニティ交流のためのプラットフォームです。
Next.js (App Router) と SQLite を使用したモノリス構成で、イベント管理、参加証明(VC)、コミュニティ交流、コンテスト機能を提供します。

## 主な機能

### 1. イベント管理 & 参加証明 (Core)
- **イベント探索**: 定例イベントや特別イベントの一覧・詳細表示。
- **参加登録**: ワンクリックでイベントに参加登録。
- **チェックイン**: QRコード（管理者用）による現地チェックイン。
- **参加証明 (VC)**: 参加完了後、ブロックチェーン(Cardano)上に記録されるVerifiable Credentialを発行（※現在はMock実装）。
### 1. イベント管理 & 参加証明 (Core)
- **イベント探索**: 定例イベントや特別イベントの一覧・詳細表示。
- **参加登録**: ワンクリックでイベントに参加登録。
- **チェックイン**: QRコード（管理者用）による現地チェックイン。
- **参加証明 (VC)**: 参加完了後、ブロックチェーン(Cardano)上に記録されるVerifiable Credentialを発行（※現在はMock実装）。

### 5. Project OS (Internal)
- **Ticket Management**: 会話や思考を構造化チケットに変換。
- **Kanban Board**: 進捗を可視化・管理。
- **Export**: コンテキストをLLM等に共有可能な形式で出力。

- **ポイント獲得**: チェックインやイベント参加でポイントを付与。
- **アイテム交換**: 貯めたポイントでデジタルアイテムと交換。

### 3. ソーシャル (Community)
- **公式コミュニティ**: 運営からの発信やユーザー同士の交流の場。
- **投稿 & コメント**: テキストや画像による投稿、それに対するコメント機能。

### 4. コンテスト (Contest)
- **作品応募**: テーマに沿った作品（画像・テキスト）の応募。
- **投票**: ユーザーによる投票機能で優秀作品を決定。

## ドキュメント

- [docs 総合入口](docs/index.md) — 設計・手順・トラブルシューティング
- [クイックスタート](docs/getting-started/quickstart.md) — 5分で試す
- [セットアップガイド](docs/getting-started/setup-guide.md) — ローカル環境構築
- [アーキテクチャ](docs/architecture/) — 全体設計
- [運用手順](docs/runbooks/) — デプロイ・連携設定

## 技術スタック

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite (via Prisma ORM)
- **Auth**: NextAuth.js (Google, LINE, Credentials)
- **Styling**: Tailwind CSS
- **Testing**: Vitest（ユニット）, Playwright (E2E)。ユニットテストの実行と方針は [runbooks/unit-testing](docs/runbooks/unit-testing.md) を参照。

## セットアップ手順

### 1. インストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.local` を作成し、以下の変数を設定してください（`.env.example` 参照）。
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
# LINE Login (Optional for local dev)
LINE_CLIENT_ID=""
LINE_CLIENT_SECRET=""
```

### 3. データベースのセットアップ
```bash
# データベース作成とスキーマ適用
npx prisma db push

# シードデータの投入（初期ユーザー、コミュニティ、コンテストデータの作成）
npx prisma db seed
```

### 4. 開発サーバーの起動
```bash
npm run dev
```
`http://localhost:3000` にアクセスしてください。

## テスト

### E2Eテスト (Playwright)
```bash
# 全テスト実行
npx playwright test

# UIモードで実行
npx playwright test --ui
```

## ディレクトリ構成

- `src/app`: Next.js App Router ページ
  - `(routes)`: 一般ユーザー向けページ
  - `admin`: 管理者向けページ
  - `api`: バックエンド API Route
- `src/components`: 再利用可能なUIコンポーネント
- `prisma`: データベーススキーマ (`schema.prisma`) とシードスクリプト (`seed.ts`)
- `e2e`: Playwright E2Eテストコード

## 管理者機能
以下のURLから管理者機能にアクセスできます（管理者権限を持つユーザーでログインが必要）。
- `/admin/communities`: コミュニティ管理
- `/admin/contests`: コンテスト管理
- `/admin/events/[id]/checkin`: イベントチェックイン管理

- 現在のフェーズでは、外部のブロックチェーン連携（Kyoso Cloud Agent）はモック化されています。
- データベースは SQLite ファイル (`prisma/dev.db`) としてローカルに保存されます。

### テストアカウント
- **開発用 (Shunsuke)**: `+818000000000`
  - 確認コードはFirebaseテスト設定により固定可能です（例: 123456）。
  - 開発全般で使用します。

## デプロイと設定 (Deployment & Configuration)

### 1. LINE Developers Console 設定
LINEログインを使用するには、以下の「コールバックURL」を LINE Developers Console に登録する必要があります。

| 環境 | NEXTAUTH_URL | コールバックURL (Redirect URL) |
| :--- | :--- | :--- |
| **Local** | `http://localhost:3020` | `http://localhost:3020/api/auth/callback/line` |
| **Vercel** | `https://did-event-japanxcollege-2889-jxcs-projects-579395f6.vercel.app` | `https://did-event-japanxcollege-2889-jxcs-projects-579395f6.vercel.app/api/auth/callback/line` |

### 2. Vercel 環境変数設定
Vercelのダッシュボード (Settings > Environment Variables) に以下を設定してください。

- **MOCK_DB**: `true` (DB接続をスキップするため必須)
- **NEXTAUTH_URL**: `https://did-event-japanxcollege-2889-jxcs-projects-579395f6.vercel.app`
- **NEXTAUTH_SECRET**: (ランダムな文字列)
- **LINE_CHANNEL_ID**: (あなたのLINEチャネルID)
- **LINE_CHANNEL_SECRET**: (あなたのLINEチャネルシークレット)
- **LINE_CHANNEL_ACCESS_TOKEN**: (LINE通知用アクセストークン)
- **OPENAI_API_KEY**: (AI機能用APIキー)
- **FIREBASE_SERVICE_ACCOUNT_KEY**: (Firebase Admin SDK用サービスアカウントJSON)
- **PHONE_HASH_SALT**: (電話番号ハッシュ化用ソルト)
- **KYOSO_ISSUER_API_KEY**: (DID発行用Issuer APIキー)

## 認証とDID発行フロー (Auth & DID)
v2アップデートにより、以下のフローに変更されました。
1. **LINEログイン**: `post-login` でFirebase Custom Token (sub=userId) を発行。
2. **電話番号認証**: `/verify-phone` にて電話番号を確認・ハッシュ化保存。
3. **DID発行 (Internal)**: 電話番号認証完了時に、Issuerキーを用いてDIDを作成 (create-only)。
4. **APIアクセス**: クライアントはFirebase ID Token (sub=userId) を用いて Kyoso API にアクセス。


## CI & AI Fix Setup
本リポジトリは GitHub Actions による CI および、Self-Hosted Runner 上での「Claude Code による自動修正」ワークフローを実装しています。

### CI (GitHub Actions)
- `main` ブランチへの push および手動実行 (`workflow_dispatch`) でトリガーされます。
- Build, Lint, E2Eテスト (Playwright) を実行します。

### AI Fix Loop (Self-Hosted Runner)
CI で E2E テストが失敗した場合、自動的に Self-Hosted Runner 上で修復フローが走ります。
Self-Hosted Runner には以下のタグとツールが必要です。

**必須タグ**: `ai`

**必要なツール**:
- `node` (v20以上推奨)
- `npm`
- `gh` (GitHub CLI, ログイン済みであること)
- `claude` (Anthropic Claude Code CLI, ログイン済みであること)
- Playwright 依存関係 (ブラウザバイナリ等。`npx playwright install --with-deps` 済みであること)

**セットアップ例 (Mac)**:
1. GitHub リポジトリ設定 > Actions > Runners > New self-hosted runner からランナーを追加する際に、タグ `ai` を追加してください。
2. ランナーのマシンで `claude login` を実行し、認証を完了させてください。
3. ランナーのマシンで `gh auth login` を実行し、認証を完了させてください。
