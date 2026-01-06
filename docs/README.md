# ラクスル風印刷通販プラットフォーム - ドキュメント

## 📚 ドキュメント一覧

1. **[プロジェクト概要・アーキテクチャ](./01-project-architecture.md)**
   - プロジェクト概要
   - ビジョン・ミッション
   - 技術スタック
   - システムアーキテクチャ
   - セキュリティ設計

2. **[バックエンド設計](./02-backend-design.md)**
   - データベース設計（ER図・テーブル定義）
   - API仕様書（全エンドポイント）
   - 認証・認可
   - エラーハンドリング

3. **[フロントエンド設計](./03-frontend-design.md)**
   - コンポーネント設計
   - 状態管理
   - ルーティング
   - UI/UXガイドライン

4. **[機能実装](./04-features-implementation.md)**
   - 価格計算ロジック
   - ファイルアップロード
   - Stripe決済統合
   - メール通知

5. **[デプロイ・運用](./05-deployment-operations.md)**
   - 環境構築手順
   - デプロイ手順
   - 監視・ロギング
   - トラブルシューティング
   - 開発ガイド

---

## 🚀 クイックスタート
```bash1. リポジトリクローン
git clone https://github.com/your-org/raksul-app.git
cd raksul-app2. 依存関係インストール
pnpm install3. 環境変数設定
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
.env ファイルを編集して必要な値を設定4. データベースセットアップ
cd apps/backend
pnpm prisma migrate dev
pnpm prisma generate
pnpm prisma db seed5. 開発サーバー起動
cd ../..
pnpm dev

**アクセス**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

---

## 📖 ドキュメント規約

### 更新ルール
1. コード変更時は関連ドキュメントも同時更新
2. 大きな設計変更はレビュー必須
3. 図表は `docs/assets/` に配置

### フォーマット
- Markdown形式
- 見出しは `#` で階層化
- コードブロックは言語指定 (\`\`\`typescript)
- リンクは相対パス

---

## 🤝 コントリビューション

ドキュメントの改善提案は Issue または Pull Request でお願いします。

### Issue作成時
- [ ] 該当ドキュメント名を記載
- [ ] 問題点を具体的に説明
- [ ] 改善案があれば提示

### PR作成時
- [ ] 変更内容を詳細に記載
- [ ] 関連するコードとの整合性確認
- [ ] レビュアーをアサイン