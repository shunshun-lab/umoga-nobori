# 輪読サイト（`notes/`・`notebook/` を表示）

親ディレクトリの **`notes/`・`notebook/`** をビルド時に `site/_content/` へ同期してから `next build` します（`package.json` の `prebuild`）。

**`site/_content/` は Git に含めます。** Vercel が `site/` だけをアップロードする場合でも、ホームの一覧と各ドキュメントが欠けません。`notes/` や `notebook/` を編集したあと `npm run build`（または `npm run prebuild`）を一度走らせてから、更新された `_content/` をコミットしてください。

- **CLI**: **`rindoku` リポジトリのルート**から `vercel deploy site --prod` でも、上記で `_content` がコミットされていれば問題ありません。

## Getting Started

```bash
cd site
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

**ダッシュボード（推奨）**

1. リポジトリをインポート
2. **Root Directory** を **`site`** に設定
3. Framework: **Next.js** のままデプロイ

**CLI（ログイン済みの場合）** — ルートから:

```bash
cd /path/to/rindoku
vercel deploy site --prod
```

詳細は [Next.js deployment](https://nextjs.org/docs/app/building-your-application/deploying) を参照。
