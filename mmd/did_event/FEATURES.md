# 実装済み機能一覧

このドキュメントでは、MMD DID Event アプリケーションで実装済みの機能を詳しく説明します。

## 目次

1. [認証システム](#1-認証システム)
2. [イベント管理](#2-イベント管理)
3. [定例イベント機能](#3-定例イベント機能)
4. [VC（検証可能資格情報）発行](#4-vc検証可能資格情報発行)
5. [LINE通知機能](#5-line通知機能)
6. [Google Calendar連携](#6-google-calendar連携)
7. [管理者機能](#7-管理者機能)

---

## 1. 認証システム

### サポートする認証方式

#### 1.1 Google OAuth
- Googleアカウントでログイン
- メールアドレス、名前、プロフィール画像を取得
- 実装: `/src/lib/auth.ts`

#### 1.2 LINE Login
- LINEアカウントでログイン
- LINE User ID、名前、プロフィール画像を取得
- `lineUserId` をデータベースに保存（通知機能で使用）
- 実装: `/src/lib/auth.ts`

#### 1.3 管理者ログイン
- ユーザー名・パスワードによる認証
- デフォルト認証情報:
  - ユーザー名: `admin`
  - パスワード: `admin` (bcryptでハッシュ化)
- 管理者フラグ (`isAdmin: true`) を付与
- 実装: `/src/lib/auth.ts:147-192`

#### 1.4 テストユーザー
開発用に4つのテストアカウントを用意:
- `test1@example.com` / `password1`
- `test2@example.com` / `password2`
- `test3@example.com` / `password3`
- `test4@example.com` / `password4`

実装: `/src/lib/auth.ts:194-266`

### 認証フロー

```
ユーザー
  ↓
ログイン画面 (/auth/signin)
  ↓
NextAuth.js で認証
  ↓
- Google OAuth
- LINE Login
- 管理者ログイン (Credentials)
- テストユーザー (Credentials)
  ↓
JWT セッション生成
  ↓
ダッシュボードへリダイレクト
```

### 1.5 オンボーディング (Tutorial)
- **ページ**: `/tutorial` (`/src/app/tutorial/page.tsx`)
- **概要**: 新規登録後のユーザーを導く「冒険の書」ステップリスト
- **機能**:
  - **シンプルリスト形式**: 複雑なマップ形式から、分かりやすい垂直リスト("STEP 01"〜"STEP 05")に刷新
  - **ステップ内容**:
    1. プロフィール作成
    2. イベント参加方法
    3. コミュニティ参加
    4. クエスト確認
    5. **デザイン設定**: テーマカラーとデザインスタイル（Standard/Dark/Pop/Minimal）を選択可能


---

## 2. イベント管理

### 2.1 一般ユーザー機能

#### イベント一覧の閲覧・検索
- **ページ**: `/events` (`/src/app/events/page.tsx`)
- **機能**:
  - **キーワード検索**: タイトル、説明、場所、キーワードによる検索 (`q`パラメータ)
  - **フィルタリング**: カテゴリー、開催形式、日付範囲
  - **ソート**: 開催日順
  -Debounce機能による検索負荷軽減

#### イベント詳細の確認
- **ページ**: `/events/[id]` (`/src/app/events/[id]/page.tsx`)
- **機能**:
  - イベントの全情報を表示
  - 開催形式（オンライン / オフライン / ハイブリッド）
  - オンライン会議URL（該当する場合）
  - 参加登録ボタン
  - 参加済みの場合は「参加済み」表示

#### イベント参加登録
- **API**: `POST /api/events/[id]/join` (`/src/app/api/events/[id]/join/route.ts`)
- **機能**:
  - Participant レコードを作成
  - VC（参加証明）を発行（Kyoso Cloud Agent 経由）
  - VC発行に失敗しても参加登録は成功
  - EventCredential レコードを作成

### 2.2 イベント主催者機能

#### 主催イベントの管理
- **ページ**: `/dashboard` の「主催イベント」タブ (`/src/app/dashboard/page.tsx:178-308`)
- **機能**:
  - 自分が作成したイベント一覧を表示
  - 各イベントの参加者数を表示
  - 「編集」ボタンでイベント編集ページへ
  - 「詳細」ボタンでイベント詳細へ
  - 「新規イベント作成」ボタン

#### イベントの作成
- **API**: `POST /api/events` (`/src/app/api/events/route.ts`)
- **入力項目**:
  - タイトル (必須)
  - 説明
  - 画像URL
  - 開始日時 (必須)
  - 終了日時
  - 開催形式: オンライン / オフライン / ハイブリッド (必須)
  - オンライン会議URL（オンライン/ハイブリッドの場合）
  - 場所（オフライン/ハイブリッドの場合）
  - 定員
  - ステータス: 下書き / 公開 / キャンセル

#### イベントの編集
- **ページ**: `/events/[id]/edit` (`/src/app/events/[id]/edit/page.tsx`)
- **API**: `PATCH /api/events/[id]` (`/src/app/api/events/[id]/route.ts:61-118`)
- **機能**:
  - 全イベント情報の編集
  - 主催者のみアクセス可能（権限チェック）
  - リアルタイムフォーム検証
  - 開催形式に応じた項目の表示/非表示
  - **LINE通知セクション**（後述）

#### イベントの削除
- **API**: `DELETE /api/events/[id]` (`/src/app/api/events/[id]/route.ts:123-165`)
- **機能**:
  - 確認ダイアログ表示
  - 主催者のみ実行可能
  - 関連する Participant、EventCredential も削除

### 2.3 マイページ・プロフィール
- **ページ**: `/dashboard` (`/src/app/dashboard/page.tsx`)
- **タブ**:
  1. **参加イベント**: 自分が参加したイベント一覧
  2. **主催イベント**: 自分が作成したイベント一覧
  3. **発行されたVC**: 自分に発行されたVC一覧

- **プロフィール編集**: `/profile` (`/src/app/profile/page.tsx`)
  - **基本情報**: 名前、Bio、SNSリンク、ロケーション
  - **デザイン**: テーマカラー、背景画像、レイアウトブロック
  - **公開設定 (Visibility Control)**:
    - 「コミュニティ」「イベント」「クエスト」セクションの公開/非公開を個別切替可能
    - 設定はプレビューおよび公開プロフィールページ (`/users/[id]`) に即時反映


---

## 3. コミュニティマップ機能

### 概要
地域のコミュニティやイベントスポットを地図上で可視化・管理する機能です。

### 3.1 ユーザー機能
- **コミュニティ一覧**: `/communities` - リスト表示に加え、"Map"リンクを提供
- **コミュニティマップ**: `/c/[id]/map` - Leaflet.js を使用したフルスクリーンマップ
- **スポット一覧**: `/c/[id]` - コミュニティに関連するスポット（Places）のリスト表示
- **スポット提案**: `/c/[id]/suggest` - ユーザーが新しいスポットを提案（ステータス: `draft` で保存）

### 3.2 管理者機能
- **スポット管理**: `/admin/c/[id]` - 提案されたスポットの承認（`draft` -> `published`）や削除
- **Google Sheets 連携**: `PLACES` シートでスポットデータを管理

---

## 4. 定例イベント機能

### 概要

毎週同じ曜日・時刻に開催されるイベントを自動管理する機能です。

### 3.1 定例イベントテンプレート

#### テンプレートの作成
- **API**: `POST /api/admin/recurring-templates` (`/src/app/api/admin/recurring-templates/route.ts:63-168`)
- **入力項目**:
  - タイトル
  - 説明
  - 画像URL
  - 曜日（0=日曜, 1=月曜, ..., 6=土曜）
  - 開始時刻（HH:mm形式）
  - 終了時刻（HH:mm形式）
  - 場所
  - 開催形式
  - 定員
  - 最大未来イベント数（デフォルト: 2）

#### 自動イベント生成
テンプレート作成時に、指定した「最大未来イベント数」分のイベントを自動生成します。

**例**:
- 曜日: 2（火曜日）
- 開始時刻: 19:00
- 最大未来イベント数: 2

→ 次の火曜日と、その次の火曜日のイベントを自動生成

実装: `/src/app/api/admin/recurring-templates/route.ts:117-158`

### 3.2 承認フロー

#### 未承認イベント一覧
- **API**: `GET /api/admin/unapproved-events` (`/src/app/api/admin/unapproved-events/route.ts`)
- **機能**:
  - `isRecurring: true` かつ `isApproved: false` のイベントを取得
  - 定例イベントテンプレート情報も含む

#### イベント承認
- **API**: `POST /api/admin/events/[id]/approve` (`/src/app/api/admin/events/[id]/approve/route.ts`)
- **機能**:
  - `isApproved: true` に更新
  - 管理者のみ実行可能

### 3.3 次回イベント自動追加（未実装）

**今後の実装予定**:
- イベント終了後、次回分を自動的に追加
- Cron ジョブまたはイベントトリガーで実装

---

## 4. VC（検証可能資格情報）発行

### 4.1 発行フロー

```
ユーザーがイベントに参加
  ↓
POST /api/events/[id]/join
  ↓
Participant レコード作成
  ↓
Kyoso Cloud Agent に VC 発行ジョブを依頼
  ↓
EventCredential レコード作成 (status: ISSUING)
  ↓
（非同期）Kyoso が VC を発行
  ↓
（ポーリング）VC 発行完了を確認
  ↓
EventCredential を更新 (status: ISSUED, vcRecordId 保存)
```

### 4.2 VC のクレーム内容

発行される VC には以下の情報が含まれます:

```json
{
  "name": "ユーザー名",
  "email": "user@example.com",
  "eventId": "evt_123",
  "eventTitle": "イベント名",
  "startAt": "2024-01-01T19:00:00Z",
  "organizerName": "主催者名",
  "participantId": "part_456",
  "joinedAt": "2024-01-01T10:00:00Z"
}
```

実装: `/src/app/api/events/[id]/join/route.ts:79-89`

### 4.3 エラーハンドリング

**Kyoso Cloud Agent が起動していない場合**:
- VC 発行処理は失敗するが、エラーをキャッチ
- イベント参加登録は成功
- `credential: null` を返す

実装: `/src/app/api/events/[id]/join/route.ts:91-112`

```typescript
try {
  const vcJobResponse = await issueEventVcToUser({ claims });
  credential = await prisma.eventCredential.create({ ... });
} catch (vcError) {
  console.error("Error issuing event VC:", vcError);
  // VC発行エラーは無視して参加登録は成功させる
}
```

### 4.4 VC 一覧の確認

- **API**: `GET /api/user/credentials` (`/src/app/api/user/credentials/route.ts`)
- **ページ**: `/dashboard` の「発行されたVC」タブ
- **表示内容**:
  - イベント名
  - 発行日時
  - VC ステータス（ISSUING / ISSUED / FAILED）
  - VC レコードID

---

## 5. LINE通知機能

### 5.1 概要

イベント主催者が参加者に、または管理者が任意のユーザーに、LINE プッシュ通知を送信できます。

### 5.2 主催者による参加者通知

#### 実装場所
- **ページ**: `/events/[id]/edit` の「参加者へLINE通知」セクション (`/src/app/events/[id]/edit/page.tsx:353-389`)
- **API**: `POST /api/events/[id]/notify` (`/src/app/api/events/[id]/notify/route.ts`)

#### 機能
1. イベント編集ページに通知フォームを配置
2. メッセージを入力して送信
3. LINE連携済みの参加者全員に通知
4. 送信件数と全参加者数をフィードバック

#### 制限事項
- イベント主催者のみ実行可能
- `lineUserId` が保存されているユーザーのみに送信
- LINE公式アカウントを友だち追加しているユーザーのみ受信可能

#### メッセージフォーマット
```
【イベント名】からのお知らせ

メッセージ本文
```

実装: `/src/lib/lineNotify.ts:63-68`

### 5.3 管理者による任意ユーザー通知

#### 実装場所
- **API**: `POST /api/admin/notify` (`/src/app/api/admin/notify/route.ts`)

#### 機能
- 管理者のみ実行可能
- 任意のユーザーID配列を指定
- オプションでイベントIDを指定可能

#### リクエスト例
```json
{
  "userIds": ["user1", "user2", "user3"],
  "message": "重要なお知らせです",
  "eventId": "evt_123"  // オプション
}
```

#### メッセージフォーマット
- イベントIDを指定した場合:
  ```
  【イベント名】からのお知らせ

  メッセージ本文
  ```

- イベントIDを指定しない場合:
  ```
  【管理者】からのお知らせ

  メッセージ本文
  ```

### 5.4 LINE Messaging API 連携

#### ライブラリ
`/src/lib/lineNotify.ts` に以下の関数を実装:

- `sendLineNotification(lineUserId, message)` - 単一ユーザーに送信
- `sendLineNotificationToMultiple(lineUserIds, message)` - 複数ユーザーに一括送信（500人ずつ処理）
- `formatEventNotificationMessage(eventTitle, customMessage)` - メッセージフォーマット

#### 設定
環境変数 `LINE_CHANNEL_ACCESS_TOKEN` が必要です。

取得方法:
1. LINE Developers でMessaging APIチャネルを作成
2. 「Messaging API設定」タブを開く
3. 「チャネルアクセストークン（長期）」を発行
4. `.env.local` に設定

---

## 6. Google Calendar連携

### 6.1 Google Meet リンク自動生成

イベント作成時に自動的に Google Meet リンクを生成し、イベントに紐付けます。

#### 実装
- **ライブラリ**: `/src/lib/googleCalendar.ts`
- **関数**: `createEventWithMeetLink(eventData)`

#### 認証方式

##### サービスアカウント認証（推奨）
- バックエンドで使用
- 環境変数:
  - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
  - `GOOGLE_PRIVATE_KEY`

##### OAuth認証
- ユーザー個別のカレンダーにアクセス
- 環境変数:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REFRESH_TOKEN`

#### リフレッシュトークン取得
スクリプトを用意済み:
```bash
node scripts/get-google-refresh-token.js
```

実装: `/scripts/get-google-refresh-token.js`

### 6.2 カレンダーイベント作成

Google Calendar に以下の情報でイベントを作成:
- イベント名
- 説明
- 開始日時
- 終了日時
- Google Meet リンク（自動生成）

---

## 7. 管理者機能

### 7.1 管理者権限

#### 付与方法
- 管理者ログイン（admin/admin）
- データベースで `User.isAdmin = true` に設定

#### 確認方法
JWT トークンの `isAdmin` フラグで確認:
```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.isAdmin) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### 7.2 管理者専用API

以下のAPIは管理者のみアクセス可能:

#### 定例イベント管理
- `GET /api/admin/recurring-templates` - テンプレート一覧
- `POST /api/admin/recurring-templates` - テンプレート作成
- `PATCH /api/admin/recurring-templates/[id]` - テンプレート更新
- `DELETE /api/admin/recurring-templates/[id]` - テンプレート削除

#### イベント承認
- `GET /api/admin/unapproved-events` - 未承認イベント一覧
- `POST /api/admin/events/[id]/approve` - イベント承認

#### 通知送信
- `POST /api/admin/notify` - 任意ユーザーに通知

---

## データベーススキーマ補足

### 主要なフィールド

#### User
- `lineUserId`: LINE連携時に保存（通知で使用）
- `isAdmin`: 管理者フラグ
- `did`: Kyoso DID（VC発行で使用）

#### Event
- `ownerId`: イベント作成者のUser ID
- `isRecurring`: 定例イベントフラグ
- `recurringTemplateId`: 定例イベントテンプレートID
- `instanceNumber`: 定例イベントの何回目か
- `isApproved`: 承認済みフラグ

#### EventCredential
- `vcJobId`: Kyoso VC発行ジョブID
- `vcRecordId`: Kyoso VCレコードID
- `status`: ISSUING / ISSUED / FAILED

---

## 次に実装すべき機能

### 高優先度
1. **管理画面UI**
   - 定例イベントテンプレート管理画面
   - 未承認イベント一覧・承認画面
   - ユーザー管理画面

2. **VC検証機能**
   - QRコード生成
   - QRコードスキャンでVC検証
   - `/events/new`
   - 主催イベント管理から「新規作成」で遷移

4. **VC検証機能**
   - QRコード生成
   - QRコードスキャンでVC検証

### 中優先度
5. **イベント画像アップロード**
   - 画像URLではなくファイルアップロード
   - AWS S3 または Cloudinary 連携

6. **メール通知**
   - イベント参加確認メール
   - イベント開始リマインダー

7. **参加者リスト詳細**
   - イベント編集ページに参加者リスト表示
   - CSV エクスポート

### 低優先度
8. **イベント統計ダッシュボード**
9. **イベントカテゴリー・タグ**
10. **イベントレビュー機能**

---

## トラブルシューティング

### イベント参加時に "Internal server error"
- **原因**: Kyoso Cloud Agent が起動していない
- **対処**: 現在の実装では、VC発行に失敗してもイベント参加は成功します
- **確認**: サーバーログで `Error issuing event VC` を確認

### LINE通知が送信されない
1. `LINE_CHANNEL_ACCESS_TOKEN` が設定されているか確認
2. ユーザーの `lineUserId` が保存されているか確認（Prisma Studio で確認）
3. LINE公式アカウントを友だち追加しているか確認
4. サーバーログで `Error sending LINE notifications` を確認

### Google Meet リンクが生成されない
1. `GOOGLE_SERVICE_ACCOUNT_EMAIL` と `GOOGLE_PRIVATE_KEY` が設定されているか確認
2. Google Calendar API が有効になっているか確認
3. サービスアカウントにカレンダーの編集権限があるか確認

---

## まとめ

このアプリケーションは以下の7つの主要機能を実装しています:

1. ✅ **認証システム** - Google、LINE、管理者、テストユーザー
2. ✅ **イベント管理** - 作成、編集、削除、参加
3. ✅ **定例イベント** - テンプレート管理、自動生成、承認フロー
4. ✅ **VC発行** - Kyoso連携、エラーハンドリング
5. ✅ **LINE通知** - 主催者→参加者、管理者→任意ユーザー
6. ✅ **Google Calendar連携** - Meet リンク自動生成
7. ✅ **管理者機能** - 定例イベント管理、承認、通知

次のステップとして、管理画面UIの実装、イベント検索機能、VC検証機能などが推奨されます。
