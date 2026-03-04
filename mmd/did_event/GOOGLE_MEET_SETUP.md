# Google Meetセットアップガイド

このアプリケーションでは、Google Meet URLを自動生成する機能があります。

## 現在の状態

✅ Google Meetの自動生成コードは既に実装済みです
✅ 環境変数が正しければ自動的に動作します

## 2系統のGoogle OAuthクライアント

| 用途 | 環境変数 | 説明 |
|------|----------|------|
| **ログイン用** | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | NextAuth の Google サインイン。リダイレクトURI に `…/api/auth/callback/google` を登録。**既存のまま維持**。 |
| **Meet 専用** | `GOOGLE_MEET_CLIENT_ID` / `GOOGLE_MEET_CLIENT_SECRET` / `GOOGLE_MEET_REFRESH_TOKEN` | Calendar API でMeetリンクを発行。**Meet用として別のOAuthクライアントを登録して使用**（本番では例: `114313188710-cotgql268p2eqgantbvjjsc0r9o4e449.apps.googleusercontent.com` を採用）。 |

ログイン用の `GOOGLE_CLIENT_ID` はそのままでよく、Meet 用には **Meet専用のクライアント** を新規作成（または既存のMeet用クライアント）の値を `GOOGLE_MEET_*` に設定してください。

## 必要な環境変数（Meet 用）

Meet 自動作成を使う場合、以下を `.env` および **Vercel の環境変数** に設定してください：

```bash
GOOGLE_MEET_CLIENT_ID=your_meet_client_id
GOOGLE_MEET_CLIENT_SECRET=your_meet_client_secret
GOOGLE_MEET_REFRESH_TOKEN=your_refresh_token
```

**注意**: これらはログイン用の `GOOGLE_CLIENT_ID` とは別のOAuthクライアントです。

## セットアップ手順（認証のやり方）

### 1. Google Cloud Console で Meet 用 OAuth クライアントを用意

- **既に Meet 用クライアント（例: 114313188710-...）がある場合**: そのクライアントを開き、下記「リダイレクトURI」を追加するだけでよい。
- **新規で作る場合**:
  1. [Google Cloud Console](https://console.cloud.google.com/) → 「APIとサービス」→「認証情報」
  2. 「認証情報を作成」→「OAuth クライアント ID」
  3. アプリの種類: **「ウェブアプリケーション」** を選択（デスクトップでも可だが、下記リダイレクトURIを使うならウェブが無難）
  4. 名前を入力（例: `MMD Event Google Meet`）
  5. **「承認済みのリダイレクト URI」** に以下を **1行で追加** して保存：
     - ローカル: `http://localhost:3020/api/auth/callback/google-meet-token`
     - 本番でトークン取得する場合: `https://<あなたのドメイン>/api/auth/callback/google-meet-token`
  6. 作成後、**クライアント ID** と **クライアント シークレット** をコピー

### 2. Google Calendar API を有効化

1. 「APIとサービス」→「ライブラリ」
2. 「Google Calendar API」を検索して「有効にする」

### 3. 環境変数に Meet 用クライアントを設定

`.env` または `.env.local` に、Meet 用の **クライアント ID とシークレットだけ** 先に書く（リフレッシュトークンは次のステップで取得する）：

```bash
GOOGLE_MEET_CLIENT_ID=114313188710-cotgql268p2eqgantbvjjsc0r9o4e449.apps.googleusercontent.com
GOOGLE_MEET_CLIENT_SECRET=GOCSPX-xxxx
# GOOGLE_MEET_REFRESH_TOKEN=  ← まだ空でOK
```

### 4. リフレッシュトークンを取得（認証の実行）

**開発サーバーを起動した状態で**、別のターミナルで次を実行する：

```bash
npx tsx scripts/get-google-refresh-token.ts
```

1. ターミナルに **認証URL** が表示される（`auth_url.txt` にも書き出される）
2. そのURLをブラウザで開く
3. Meet 用に使う **Google アカウント** でログインし、カレンダーへのアクセスを許可する
4. リダイレクト先のページに **「認証コード」** が表示されるので、**コピー** する
5. ターミナルに戻り、「Enter the code from that page here:」の後に **貼り付けて Enter**
6. 表示された `GOOGLE_MEET_REFRESH_TOKEN=1//...` をコピーし、`.env` または `.env.local` に追加する

```bash
GOOGLE_MEET_REFRESH_TOKEN=1//0e...   # ターミナルに表示された値をそのまま貼る
```

**注意（redirect_uri_mismatch が出る場合）**:
- リダイレクトURI は **一字一句同じ** で登録する必要があります。
- 登録する値（コピーしてそのまま使う）: `http://localhost:3020/api/auth/callback/google-meet-token`
  - `http` のまま（localhost では `https` にしない）
  - 末尾に `/` を付けない
  - ポートが `3020` であること（`NEXTAUTH_URL` や `npm run dev` のポートと一致させる）
- 上記を **114313188710-... の Meet 用 OAuth クライアント** の「承認済みのリダイレクト URI」に追加して保存し、数分待ってから再度試す。

### 5. ローカル・Vercel に環境変数を設定

- **ローカル**: `.env` または `.env.local` に上記3つを追加。
- **デプロイ環境（Vercel）**: プロジェクトの Environment Variables に以下を追加（本番・プレビュー両方に設定推奨）。
  - `GOOGLE_MEET_CLIENT_ID` … Meet専用OAuthクライアントのID（本番では例: `114313188710-cotgql268p2eqgantbvjjsc0r9o4e449.apps.googleusercontent.com` を採用）
  - `GOOGLE_MEET_CLIENT_SECRET`
  - `GOOGLE_MEET_REFRESH_TOKEN`

## 動作確認

### 状態確認API（推奨）

本番・ステージングで「Google Meet が使えるか」を確認するには、次のAPIを利用できます。

| 用途 | URL | 説明 |
|------|-----|------|
| 認証のみ確認 | `GET /api/google-meet/status` | 環境変数の有無と利用方式（oauth2 / service_account）を返す。イベントは作らない |
| 実際に作成して確認 | `GET /api/google-meet/status?test=1` | 上記に加え、テスト用のカレンダーイベント＋Meetを1件作成し、結果（`meetLink`・`source`・成否）を返す |
| 原因切り分け（診断） | `GET /api/google-meet/status?check=1` | 認証＋**診断情報**（使用中のカレンダーID、サービスアカウントで見えているカレンダー数・エラー、対処ヒント）を返す |

例（ローカル）:
```bash
curl -s http://localhost:3020/api/google-meet/status
curl -s "http://localhost:3020/api/google-meet/status?check=1"   # 原因切り分け用
curl -s "http://localhost:3020/api/google-meet/status?test=1"
```

監視やcronで定期チェックする場合は `?test=1` なしの `GET /api/google-meet/status` が安全です（カレンダーにテストイベントが増えません）。

### 手動での確認

環境変数が正しく設定されていれば：

1. イベント作成時に「オンライン」形式を選択
2. 自動的にGoogle Meet URLが生成されます

## チェックの仕方（原因の切り分け）

Meetがフォールバックになる場合、次の3つを順に確認します。

### 1. 診断APIで一括確認（推奨）

```bash
curl -s "http://localhost:3020/api/google-meet/status?check=1"
```

返却の見方:

| 項目 | 見方 | 対処 |
|------|------|------|
| `check.calendarIdInUse` | `primary` のままか | サービスアカウントでは `primary` は空のことが多い。下記「2. GOOGLE_CALENDAR_ID」を確認 |
| `check.serviceAccount.calendarCount` | 0 か 1以上か | 0 → 共有カレンダーが無い。下記「1. サービスアカウントの権限」を実施 |
| `check.serviceAccount.error` | メッセージの有無 | あり → 権限不足やAPI無効などのエラー。メッセージを手がかりに設定を確認 |
| `check.howToFix` | 配列でヒント | 表示された項目を順に対応する |

### 2. サービスアカウントのカレンダー権限

**確認**: `?check=1` で `serviceAccount.calendarCount` が 0 なら、共有がありません。

**対処**:

1. Google Calendar（人間のアカウント）を開く
2. 使いたいカレンダーの「設定と共有」
3. 「特定のユーザーと共有」に、**サービスアカウントのメール**（`GOOGLE_SERVICE_ACCOUNT_EMAIL` の値）を追加
4. 権限は「予定の変更」以上にする

### 3. GOOGLE_CALENDAR_ID の指定

**確認**: 環境変数 `GOOGLE_CALENDAR_ID` が未設定だと、コード内で `primary` が使われます。サービスアカウントの「primary」は多くの場合空です。

**対処**:

1. 上記「2」で共有した**そのカレンダー**のIDを取得する  
   （カレンダー設定 → 「カレンダーを統合」などで「カレンダーID」をコピー）
2. `.env` に設定: `GOOGLE_CALENDAR_ID=取得したID`
3. 再起動後に `?test=1` で再度確認

### 4. 本番では OAuth2 を推奨

サービスアカウント＋共有設定は手順が多く、失敗しやすいです。本番で確実にやりたい場合は、**OAuth2**（`GOOGLE_MEET_CLIENT_ID` / `GOOGLE_MEET_CLIENT_SECRET` / `GOOGLE_MEET_REFRESH_TOKEN`）を設定し、人間のGoogleアカウントの「primary」でMeetを作る方式にするとよいです。手順は本ドキュメントの「セットアップ手順」を参照してください。

---

## トラブルシューティング

### "No Google credentials" 警告が出る場合

環境変数が設定されていません。上記の手順を確認してください。

### 「フォールバックMeet URLを使用」と表示される場合

認証情報が不完全です。3つの環境変数すべてが正しく設定されているか確認してください。

### リフレッシュトークンの有効期限切れ / invalid_grant

- **invalid_grant** が出る場合: リフレッシュトークンが無効（取り消し・再発行済み・テストユーザー制限など）です。
- 対処: 手順4を再実行して新しいリフレッシュトークンを取得し、`GOOGLE_MEET_REFRESH_TOKEN` を更新してください。
  ```bash
  npx tsx scripts/get-google-refresh-token.ts
  ```

## 参考リンク

- [Google Calendar API ドキュメント](https://developers.google.com/calendar)
- [OAuth 2.0 ガイド](https://developers.google.com/identity/protocols/oauth2)
