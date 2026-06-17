---
name: ndsr-loop
description: NDSR動画(episode.json駆動のFFmpegパイプライン)を、AIが評価→修正→再ビルドで自律的にブラッシュアップするクローズドループ。ビルド健全性とinauthentic/収益化リスク・NSDR誘導品質・LLMによる本文評価を7軸採点し、品質ゲート(draft)を全軸通すまで episode.json と関連md(script/metadata/shotlist)を実際に書き換えて回す。採点はmp4の実フレーム/波形を実測するハック耐性付き。「動画を再帰的に改善したい / ループで品質を詰めたい / episodeを自動で磨きたい」時に使う。
---

# NDSR 動画ブラッシュアップ・ループ

`episodes/<id>/episode.json` を真実源とする NSDR 動画パイプライン（`pipeline/build.py`）に対し、
**ビルド → 採点 → AI 修正 → 再ビルド** を品質ゲートが全軸通るまで自律的に回す。

最重要の採点軸は `authentic`（YouTube inauthentic / 収益化判定の回避）。
docs/02_video_generation_decision.md が「設計の第一級要件」と明記しており、ループはここを最優先で詰める。

**採点は 7 軸**: `build` `authentic` `structure` `license` `meta` `pacing` `content`。
- `score.py` は mp4 の**実フレーム/波形を ffmpeg で実測**する（黒幕比率・フリーズ比率・無音比率・
  音量レンジ）。だから「episode.json に `speed`/`crop` キーを足すだけ」では `authentic`/`build` は
  上がらない — 実際に映像へ変形が効いていないと実測でバレる。**自己申告ハックは通らない**。
- `pacing` は NSDR 固有品質（role 尺配分の理想比・script から実測した誘導ナレの words/分）。
- `content` は **LLM 補助軸**。`score.py` 自身は LLM を呼ばず、`content_payload` を出力する。
  ループ側（このスキル＝あなた）がそれを読んで採点し、`--llm-result` で食わせ直す（手順 2.5）。

**2 段ゲート**: ループは `--gate draft` で回す。draft は「実素材が無いと構造上直せない減点
（黒幕 placeholder・無音・素材調達）」を免除し、**JSON/script だけで詰められる品質**を判定する。
最終出荷判定は `--gate ship`（全軸厳格）で、実素材を入れてから人手で行う。

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

### 2. 採点（draft ゲートで回す）
```
python3 pipeline/score.py episodes/<id>/episode.json --mp4 out/<id>_<lang>_fast.mp4 --gate draft
```
- 返る JSON の `scores`(7軸) / `weighted_total` / `gate_pass` / `gate_detail` / `diagnostics`(penalty 降順) を読む。
- `diagnostics` の各件には `asset_dependent` がある。draft では `true` の項は減点免除済み（＝スコアに
  反映されない）。**ループで潰すのは `asset_dependent:false` の diag だけ**。`true` のものは人手タスク
  としてレポートに回す（実クリップ調達・ナレ録音）。

### 2.5 content 軸の LLM 採点（`content_payload` が非 null のとき）
返り JSON の `content_payload` が `null` でなければ、`content` 軸はまだ未採点（暫定で閾値ちょうど）。
あなた自身が payload を読んで採点する:
1. `content_payload.rubric`（医学的妥当性 / Huberman・NSDR 商標リスク / CTA 過剰さ / タイトル独自性 /
   文体の質）の各観点で、`content_payload.scripts`・`title`・`metadata_md` を読んで 0-100 採点する。
2. 判定を `episodes/<id>/.content_verdict.json` に書く:
   `{"score": <int>, "diagnostics":[{"axis":"content","severity":"warn","msg":"<該当箇所を引用>","fix":"<具体策>","penalty":<int>}]}`
3. 再採点して content 軸を確定させる:
   ```
   python3 pipeline/score.py episodes/<id>/episode.json --mp4 out/<id>_<lang>_fast.mp4 --gate draft --llm-result episodes/<id>/.content_verdict.json
   ```
- **`gate_pass: true` なら成功終了**（→ 手順5）。
- content の指摘は手順 3 で script/metadata を直して潰す（次イテレーションで verdict を更新し再採点）。

### 3. 修正（diagnostics を上から潰す）
`diagnostics` は penalty の大きい順。各 diag の `fix` フィールドがそのまま AI への指示。
ゲート未通過の軸に属する diag を、penalty 大きい順に**この優先順で**潰す:

1. **`authentic`（最優先）** — 独自性の欠如は事業の生死。具体的には:
   - 同一クリップ多用 → `shots` の `file` を別素材にするか、各 shot に独自編集フィールド
     （`speed`（例 0.7 でスロー）/ `crop` / `grade` / `color`）を足して変形性を担保。
   - desc の独自性が低い → 各 shot の `desc` に固有のロケーション/被写体/動きを与える。
   - silence 水増し → 尺を silence 単純伸縮で稼がない。`segments` を構成・映像・導入で意味差分化。
   - ai_disclosure 欠如 → episode.json に `"ai_disclosure": true` を足し、`metadata.md` に開示文を追記。
   - 編集申告と実フレームの不一致（`freezedetect` で実測） → speed/crop は JSON だけでなく
     **実際に映像へ効かせる**。draft では asset_dependent 免除だが、ship では効く。
2. **`pacing`** — NSDR 誘導品質。role 尺配分が理想比から逸脱（body_scan を削って silence で
   水増し等）→ `segments` の尺を理想比へ。誘導ナレが速すぎ（words/分が役割帯超過）→ 該当
   `script_<lang>.md` セクションのナレを削るか `[pause Ns]` を増やす。遅すぎ（デッドエア）→ 誘導文を足す。
3. **`content`**（LLM 軸） — 手順 2.5 の verdict の diag を script/metadata で潰す。医学的に危うい
   誘導文の修正、Huberman 騙りの言い換え＋Yoga Nidra クレジット、過剰 CTA の削除、タイトルの固有語彙化。
4. **`build`** — 尺乖離 / LUFS ずれ / 音量レンジ過大。t_start/t_end の連続性と `duration_target_s` を整合。
   音量レンジ警告は BGM gain・ダッキングを均す。（黒幕/無音は asset_dependent で draft 免除）
5. **`license`** — `license_refs` 未登録や台帳欠如。`episodes/<id>/assets.json`（または repo 直下）に
   `{asset_id, source, license_type, download_date, content_id_safe, used_in}` の台帳を作り、
   永続/CC0/買い切りライセンスのみ（解約で消える形態は不可）。`license_refs` に全 ref を登録。
6. **`structure`** — 標準 role 欠落 / segment 時間ギャップ。`NSDR_ROLES`（intro→breathing→body_scan
   →visualization→silence→wake_up）を満たし、segment を 0 始まり連続・末尾 = target に。
7. **`meta`** — タイトル独自性 / 多言語。`title.<lang>` を SEO 語彙（NSDR/Yoga Nidra/尺/言語）で拡充。

**書き換えてよい対象**: `episode.json`、`episodes/<id>/script_*.md`、`metadata.md`、`shotlist.md`、
`assets.json`、`.content_verdict.json`。`pipeline/*.py` のロジックは原則いじらない（採点基準を甘くする改変は禁止）。

修正は **1 イテレーションで複数 diag をまとめて当ててよい**が、build を壊さない範囲で。
各修正後にイテレーションをコミット: `git add -A && git commit -m "ndsr-loop iter N: <直した軸>"`。

### 4. ループ
手順 1〜3 を繰り返す。次のいずれかで停止:
- `gate_pass: true` → 成功（手順5へ）
- `weighted_total` が **2 イテレーション連続で改善しない**（差 < 1.0）→ 停滞。ユーザーに残課題を提示して停止。
- `max_iters` 到達 → 打ち切り。到達時点のスコアと残 diag を提示。

各イテレーション後に一行で進捗を出す:
`iter N: total 83.6 → 88.2 | gate build✓ authentic✗ pacing✗ content✓ structure✓ license✓ meta✓ | 残 3 diag`

### 5. 終了レポート
- 各イテレーションの `weighted_total` 推移（折れ線が分かる表）と最終 `scores`。
- 通過しなかった軸があればその理由と「人手でしか直せない項目」（実素材の調達、ナレ録音など）を明記。
- 任意: ユーザーが望めば最後に本番尺ビルド（`--fast` 無し）を 1 回実行して最終 mp4 を出す。
- このループは **ファイルを実際に書き換える**ので、ブランチを切ったことと、`git diff main` で全変更を
  確認できることを伝える。マージは**ユーザーが判断**（こちらからは勝手に main へマージしない）。

## 不変条件（破ってはいけない）
- 採点を甘くするために `pipeline/score.py` の閾値や penalty を下げてゲートを通すのは**禁止**。
  スコアはコンテンツ改善でのみ上げる。
- placeholder 100%（実素材ゼロ）でも **draft ゲートなら build 軸は満点になりうる**（黒幕/無音は
  asset_dependent で免除）。これは正常。`--gate ship` では黒幕動画は build が落ちる — 出荷判定は
  実素材を入れてから人手で行う。ループは draft で JSON/script 品質を満点近くまで詰めるのが仕事。
- 採点をすり抜けるための「キーだけ足す」自己申告ハックは禁止かつ無効。score.py は実フレーム/波形を
  実測するので、`speed` キーを足しても映像が静止していれば `freezedetect` で減点される。
  スコアは**実際のコンテンツ変形**でのみ上げる。
- 無人称制約（顔・声の主・ランドマーク・商標を出さない）を破る shot 記述を足さない。
- 各イテレーションをコミットし、いつでも `git reset` で巻き戻せる状態を保つ。

## 参照
- 採点基準の根拠: `docs/02_video_generation_decision.md`（§7 法的・収益化の地雷が authentic 軸の出典）
- 標準構造: `docs/00_master_plan.md` §3.2
- ビルダ仕様: `pipeline/build.py` の docstring
- スコアラ仕様と閾値: `pipeline/score.py`（`GATE` / `WEIGHTS` を変えると要求水準が変わる）
