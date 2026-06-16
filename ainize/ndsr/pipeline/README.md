# NDSR build pipeline

`episode.json`（真実源）から 1 本の mp4 を組み立てる最小パイプライン。
設計の根拠は [`docs/02_video_generation_decision.md`](../docs/02_video_generation_decision.md) §2「組み立て」。

## 何ができるか

`episode.json` を読み、以下を 1 コマンドで実行する:

1. **映像** — `shots[]` を尺どおりに並べ、`crossfade_s` でクロスフェード連結
2. **ナレ** — `narration.<lang>` を `start_offset_s` 分の無音後ろに配置
3. **BGM** — loop して全尺に伸ばし、gain・fade・**ナレ中はサイドチェインでダッキング**
4. **テロップ** — 冒頭に土地名（`telop.place_name.<lang>`）をフェード表示
5. **正規化** — `-16 LUFS`（loudnorm, docs の `I=-16:TP=-1.5:LRA=11`）→ `out/<id>_<lang>.mp4`

## 素材が無くても通る（骨格優先）

実素材（`assets/footage/S0x.mp4`・`assets/audio/*.wav`）が**無い場合は自動でプレースホルダ**
（ショット説明を焼いた暗幕映像 / 無音）に差し替えて最後まで通る。
本素材を `assets/` に置くだけで本番ビルドに切り替わる — JSON もコマンドも変えない。

## 使い方

```bash
# 検証（低解像度・尺1/4で数十秒）
python3 pipeline/build.py episodes/001/episode.json --lang en --fast

# 本番（1920x1080・1200秒フル）
python3 pipeline/build.py episodes/001/episode.json --lang hi
```

出力は `out/<id>_<lang>.mp4`。`--fast` は `_fast` サフィックス付き。

## 本素材を入れる場所

| 種別 | 置き場所 | episode.json のキー |
|---|---|---|
| 映像 8 カット | `episodes/001/assets/footage/S01.mp4 … S08.mp4` | `shots[].file` |
| ナレ wav | `episodes/001/assets/audio/narration_{hi,en}.wav` | `narration.<lang>.file` |
| BGM wav | `episodes/001/assets/audio/bgm_ndsr_theme.wav` | `bgm.file` |

映像は尺より短ければ自動 loop、解像度は scale+crop で統一されるので、
ストック素材をそのまま置けばよい（trim 不要）。

## 依存

`ffmpeg` / `ffprobe`（8.0 で確認）, `python3`（3.9+）。追加ライブラリ無し。

## 採点とクローズドループ（`score.py` + `/ndsr-loop`）

`score.py` は episode と出力 mp4 を **5 軸**で採点し、機械可読な diagnostics（penalty 降順・
各 diag に AI 向け `fix` 付き）を JSON で返す。最重要軸は `authentic`（inauthentic/収益化判定の回避,
docs §7 が出典）。

```bash
python3 pipeline/score.py episodes/001/episode.json --mp4 out/001_en_fast.mp4
```

5 軸: `build`(尺一致/LUFS/placeholder率) `authentic`(同一クリップ多用・独自編集の有無・水増し)
`structure`(NSDR標準構造) `license`(台帳完全性) `meta`(タイトル/多言語)。
`gate_pass: true` で全軸が閾値（`GATE`）通過。閾値・重みは `score.py` 冒頭の `GATE`/`WEIGHTS`。

**`/ndsr-loop <id> [lang] [iters]`** スキルがこれを駆動し、
**ビルド → 採点 → AI が episode.json/関連md を修正 → 再ビルド** をゲート全通過まで自律ループする
（ブランチを切り、イテレーション毎にコミット）。定義は `.claude/skills/ndsr-loop/SKILL.md`。

## まだ無いもの（次の一手）

- WhisperX forced-alignment による CC(SRT) 生成（docs §2 のステージ）— 現状ナレ字幕は未生成
- 実素材（footage/audio）の調達 — 現状 placeholder。これは人手タスク（ループでは埋まらない）
- ライセンス台帳 `assets.json` の実データ投入（スキーマ照合は `score.py` が実装済み）
