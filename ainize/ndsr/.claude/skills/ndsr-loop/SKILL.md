---
name: ndsr-loop
description: NDSR動画(episode.json駆動のFFmpegパイプライン)を、AIが評価→修正→再ビルドで自律的にブラッシュアップするクローズドループ。ビルド健全性とinauthentic/収益化リスクを5軸採点し、品質ゲートを全軸通すまで episode.json と関連md(script/metadata/shotlist)を実際に書き換えて回す。「動画を再帰的に改善したい / ループで品質を詰めたい / episodeを自動で磨きたい」時に使う。
---

# NDSR 動画ブラッシュアップ・ループ

`episodes/<id>/episode.json` を真実源とする NSDR 動画パイプライン（`pipeline/build.py`）に対し、
**ビルド → 採点 → AI 修正 → 再ビルド** を品質ゲートが全軸通るまで自律的に回す。

最重要の採点軸は `authentic`（YouTube inauthentic / 収益化判定の回避）。
docs/02_video_generation_decision.md が「設計の第一級要件」と明記しており、ループはここを最優先で詰める。

## 起動引数

`/ndsr-loop <episode_id> [lang] [max_iters]`
- `episode_id`: 例 `001`（省略時はリポジトリ唯一の episode を使う）
- `lang`: ビルドする言語トラック。省略時は `episode.json` の `lang_default`
- `max_iters`: 上限イテレーション。省略時 **5**

## ループ手順（厳守）

### 0. 準備（1回だけ）
1. `git status` で作業ツリーがクリーンか確認。dirty なら「未コミット変更があるが続けるか」をユーザーに確認。
2. 安全のため作業ブランチを切る: `git checkout -b ndsr-loop/<episode_id>-$(現在時刻は不明なのでイテレーション連番で代用)`。
   実際には `git checkout -b ndsr-loop/<episode_id>` で良い（既存なら `-B`）。
3. `ffmpeg -version` で ffmpeg があることを確認。無ければループ不能なので静的採点のみに切替える旨を伝える。

### 1. ビルド（毎イテレーション、必ず --fast）
```
python3 pipeline/build.py episodes/<id>/episode.json --lang <lang> --fast
```
- `--fast` は尺 1/4・640x360 で速い。**毎回これでビルドする**（本番尺は最後に任意で 1 回）。
- 標準出力末尾の mp4 パス（`out/<id>_<lang>_fast.mp4`）を控える。
- ビルドが落ちたら、それ自体が `build` 軸の致命欠陥。エラーを読んで episode.json のフィルタ破綻
  （t_start/t_end の不整合、crossfade_s > shot 尺 など）を直してから再ビルド。

### 2. 採点
```
python3 pipeline/score.py episodes/<id>/episode.json --mp4 out/<id>_<lang>_fast.mp4
```
- 返る JSON の `scores`(5軸) / `weighted_total` / `gate_pass` / `diagnostics`(penalty 降順) を読む。
- **`gate_pass: true` なら成功終了**（→ 手順5）。

### 3. 修正（diagnostics を上から潰す）
`diagnostics` は penalty の大きい順。各 diag の `fix` フィールドがそのまま AI への指示。
ゲート未通過の軸に属する diag を、penalty 大きい順に**この優先順で**潰す:

1. **`authentic`（最優先）** — 独自性の欠如は事業の生死。具体的には:
   - 同一クリップ多用 → `shots` の `file` を別素材にするか、各 shot に独自編集フィールド
     （`speed`（例 0.7 でスロー）/ `crop` / `grade` / `color`）を足して変形性を担保。
   - desc の独自性が低い → 各 shot の `desc` に固有のロケーション/被写体/動きを与える。
   - silence 水増し → 尺を silence 単純伸縮で稼がない。`segments` を構成・映像・導入で意味差分化。
   - ai_disclosure 欠如 → episode.json に `"ai_disclosure": true` を足し、`metadata.md` に開示文を追記。
2. **`build`** — 尺乖離 / LUFS ずれ / placeholder。t_start/t_end の連続性と `duration_target_s` を整合。
3. **`license`** — `license_refs` 未登録や台帳欠如。`episodes/<id>/assets.json`（または repo 直下）に
   `{asset_id, source, license_type, download_date, content_id_safe, used_in}` の台帳を作り、
   永続/CC0/買い切りライセンスのみ（解約で消える形態は不可）。`license_refs` に全 ref を登録。
4. **`structure`** — 標準 role 欠落 / segment 時間ギャップ。`NSDR_ROLES`（intro→breathing→body_scan
   →visualization→silence→wake_up）を満たし、segment を 0 始まり連続・末尾 = target に。
5. **`meta`** — タイトル独自性 / 多言語。`title.<lang>` を SEO 語彙（NSDR/Yoga Nidra/尺/言語）で拡充。

**書き換えてよい対象**: `episode.json`、`episodes/<id>/script_*.md`、`metadata.md`、`shotlist.md`、
`assets.json`。`pipeline/*.py` のロジックは原則いじらない（採点基準を甘くする改変は禁止）。

修正は **1 イテレーションで複数 diag をまとめて当ててよい**が、build を壊さない範囲で。
各修正後にイテレーションをコミット: `git add -A && git commit -m "ndsr-loop iter N: <直した軸>"`。

### 4. ループ
手順 1〜3 を繰り返す。次のいずれかで停止:
- `gate_pass: true` → 成功（手順5へ）
- `weighted_total` が **2 イテレーション連続で改善しない**（差 < 1.0）→ 停滞。ユーザーに残課題を提示して停止。
- `max_iters` 到達 → 打ち切り。到達時点のスコアと残 diag を提示。

各イテレーション後に一行で進捗を出す:
`iter N: total 83.6 → 88.2 | gate build✗ authentic✗ structure✓ license✓ meta✓ | 残 3 diag`

### 5. 終了レポート
- 各イテレーションの `weighted_total` 推移（折れ線が分かる表）と最終 `scores`。
- 通過しなかった軸があればその理由と「人手でしか直せない項目」（実素材の調達、ナレ録音など）を明記。
- 任意: ユーザーが望めば最後に本番尺ビルド（`--fast` 無し）を 1 回実行して最終 mp4 を出す。
- このループは **ファイルを実際に書き換える**ので、ブランチを切ったことと、`git diff main` で全変更を
  確認できることを伝える。マージは**ユーザーが判断**（こちらからは勝手に main へマージしない）。

## 不変条件（破ってはいけない）
- 採点を甘くするために `pipeline/score.py` の閾値や penalty を下げてゲートを通すのは**禁止**。
  スコアはコンテンツ改善でのみ上げる。
- placeholder 100%（実素材ゼロ）の状態では `build` 軸は構造上満点にならない。これは正常で、
  「実クリップ調達は人手タスク」としてレポートに回す。ループはそれ以外を満点近くまで詰める。
- 無人称制約（顔・声の主・ランドマーク・商標を出さない）を破る shot 記述を足さない。
- 各イテレーションをコミットし、いつでも `git reset` で巻き戻せる状態を保つ。

## 参照
- 採点基準の根拠: `docs/02_video_generation_decision.md`（§7 法的・収益化の地雷が authentic 軸の出典）
- 標準構造: `docs/00_master_plan.md` §3.2
- ビルダ仕様: `pipeline/build.py` の docstring
- スコアラ仕様と閾値: `pipeline/score.py`（`GATE` / `WEIGHTS` を変えると要求水準が変わる）
