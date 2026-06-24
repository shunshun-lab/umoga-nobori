# 琴平 空き家演劇祭 — プロジェクト一式

香川県琴平町の空き家を小さな劇場に、AiR × 演劇の芸術祭。2027年3月開催予定。

## このディレクトリの使い方（skill連携）
ユーザーグローバルに3つのskillがある（`~/.claude/skills/`）:

| skill | 役割 | 主に触るファイル |
|---|---|---|
| `/akiya` | プロジェクト全体ハブ。現状俯瞰→次の一手→振り分け | このREADME / board.md / 企画書 |
| `/akiya-stakeholder` | 協賛先・助成金・地域団体の交渉進行管理 | `stakeholders/board.md` |
| `/akiya-deck` | ピッチ・申請フォーム・ワンページ等の資料づくり | `docs/` `ref/` `*.html` |

迷ったら `/akiya` から始める。

## ファイル構成
- `docs/akiya-engekisai.md` — **企画書本体（一次ソース）**。数字・体制・スケジュールの根拠
- `docs/notebooklm-onepager-instruction.md` — NotebookLMでワンページを作る指示書
- `stakeholders/board.md` — ステークホルダー進捗ボード（交渉の単一の真実）
- `ref/助成金・補助金検討資料_v0.1.html` — 助成金検討資料
- `akiya-engekisai-onepage.html` / `akiya-engekisai-web.html` — 企画HTML
- `akiya-grants-dashboard.html` — 助成金ダッシュボード
- `photos/` — 企画用画像（akiya-*, concept, how-* 等）

## 公開済み資料
- ピッチ: https://slides-two-nu.vercel.app/docs/kotobus_pitch4.html

## 関連（別ディレクトリ）
- `../kotohira/` — 琴平デジタル町民・LINE・バスの調査、ホスピタリティ構想（空き家演劇祭とは別テーマ）

## 決定的要因（企画書 結論より）
1. 2026年春〜夏の助成金申請の本格化
2. 琴平バス・地元信金との協賛交渉を2026年度内に内諾レベルへ
3. アーティスト・ラインナップを2026年秋までに確定し広報資産化
