#!/usr/bin/env python3
"""
NDSR episode scorer — episode.json と関連成果物を 5 軸で採点し JSON を吐く。

設計意図（docs/02_video_generation_decision.md の「設計の第一級要件＝inauthentic
判定回避」を採点の中心に据える）:
  build.py が出す mp4 と episode.json/関連md を静的に解析し、
  「再帰ループが何を直せばスコアが上がるか」を機械可読な diagnostics として返す。
  AI（/ndsr-loop skill）はこの JSON を読んで episode.json / md にパッチを当て、
  再ビルド→再採点する。トークンを使わず堅牢に測れる部分は全部ここでやる。

5 軸（各 0-100、致命は fatal フラグ）:
  build      ビルド健全性（尺一致 / -16 LUFS 近傍 / placeholder 混入率）
  authentic  inauthentic/収益化リスク（同一クリップ多用・尺の単純伸縮・独自性）★最重要
  structure  構成（NSDR 標準構造との整合・segment と shot の時間的整合）
  license    ライセンス台帳の完全性（license_refs 全解決・永続ライセンス種別）
  meta       メタ/サムネ/SEO の差別化（多言語・タイトル独自性）

使い方:
  python3 pipeline/score.py episodes/001/episode.json --mp4 out/001_en_fast.mp4
  python3 pipeline/score.py episodes/001/episode.json            # mp4 無しでも静的軸は出る
出力: stdout に JSON 1 個（{scores, total, gate_pass, diagnostics:[...]}）。
"""
import argparse
import json
import math
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

# --- ゲート閾値（ループの停止条件）。ここを上げれば要求が厳しくなる ------------
GATE = {"build": 80, "authentic": 80, "structure": 75, "license": 80, "meta": 70, "pacing": 75, "content": 75}
WEIGHTS = {"build": 1.0, "authentic": 1.6, "structure": 1.0, "license": 1.1, "meta": 0.8, "pacing": 1.3, "content": 1.2}

# content 軸（LLM 補助）の採点ルーブリック。score.py は静的・オフラインを保つため
# ここでは LLM を呼ばない。代わりに /ndsr-loop が読むプロンプト素材を payload に詰め、
# LLM の判定（{score, diagnostics:[{msg,fix,penalty}]}）を --llm-result で受け取る。
CONTENT_RUBRIC = [
    "誘導文の医学的妥当性（NSDR/Yoga Nidra として安全・無誤誘導か。睡眠/呼吸の指示に害がないか）",
    "Huberman / NSDR 商標リスク（本人の権威を騙らず、Yoga Nidra へのクレジットが適切か）",
    "CTA の過剰さ（睡眠コンテンツに不似合いな登録煽り・連投リンクが無いか）",
    "タイトル/メタの独自性（連番頼みでなく固有の語彙・ロケーションで差別化されているか）",
    "誘導文体の質（命令調の硬さ・繰り返しの単調さ・機械翻訳臭が無いか）",
]

# NSDR 20 分版の標準構造（docs/00_master_plan §3.2）。role と理想尺比。
NSDR_ROLES = ["intro", "breathing", "body_scan", "visualization", "silence", "wake_up"]
# 各 role の理想尺比（target に対する割合）。逸脱は pacing 軸で減点。
NSDR_IDEAL_RATIO = {
    "intro": 0.025, "breathing": 0.10, "body_scan": 0.475,
    "visualization": 0.20, "silence": 0.125, "wake_up": 0.075,
}
# 誘導ナレの語数密度（words/分）の許容帯。睡眠誘導は遅いほどよいが、
# 無音だらけも離脱。役割ごとに上限/下限を変える。
NSDR_WPM_BAND = {
    "intro": (8, 40), "breathing": (4, 25), "body_scan": (6, 30),
    "visualization": (6, 30), "silence": (0, 4), "wake_up": (8, 45),
}
# 永続ライセンスとみなせる license_type（docs §7 ライセンス存続条項）
PERSISTENT_LICENSE_HINTS = ("artgrid", "pexels", "pixabay", "envato", "cc0", "buyout", "perpetual", "owned")


def ffprobe(path, entries):
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", entries,
             "-of", "json", str(path)],
            check=True, capture_output=True, text=True).stdout
        return json.loads(out)
    except Exception:
        return None


def measure_lufs(path):
    """loudnorm を analyze モードで 1 回流して測定 LUFS を取る。失敗時 None。"""
    try:
        p = subprocess.run(
            ["ffmpeg", "-hide_banner", "-i", str(path), "-af",
             "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
            capture_output=True, text=True)
        m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", p.stderr, re.S)
        if m:
            return float(json.loads(m.group(0))["input_i"])
    except Exception:
        pass
    return None


# 実測パスの解析尺上限（秒）。長尺 mp4 で全フレーム 4 回デコードは遅いので、
# 等間隔サンプルでなく先頭からこの尺だけ解析する。--fast 出力(≈300s)は全尺解析される。
PROBE_ANALYZE_CAP_S = 360


def _ffmpeg_filter(path, vf=None, af=None, extra=None, cap_s=None):
    """指定フィルタで 1 パス流し、stderr 全文を返す（検出系フィルタはここに出力する）。
    cap_s を渡すと先頭 cap_s 秒だけ解析（長尺の実測パス高速化）。"""
    cmd = ["ffmpeg", "-hide_banner", "-nostats"]
    if cap_s:
        cmd += ["-t", str(cap_s)]
    cmd += ["-i", str(path)]
    if vf:
        cmd += ["-vf", vf]
    if af:
        cmd += ["-af", af]
    if extra:
        cmd += extra
    cmd += ["-f", "null", "-"]
    try:
        return subprocess.run(cmd, capture_output=True, text=True, timeout=120).stderr
    except Exception:
        return ""


def probe_mp4(path):
    """mp4 の実体を ffmpeg フィルタで測る。自己申告でなく実フレーム/波形を見るのが要点。

    返り値 dict:
      black_ratio  : ほぼ黒のフレームが占める時間比（placeholder 暗幕の実検出）
      freeze_ratio : 静止（フリーズ）が占める時間比（同一クリップ/伸縮の実痕跡）
      silent_ratio : 無音区間が占める時間比（ナレ/BGM 欠落の実検出）
      rms_range_db : 音量レンジ（max-min RMS）。過大なら急な音量変化＝離脱要因
      duration     : 実尺
    どれも測れなければ None を持つ。
    """
    res = {"black_ratio": None, "freeze_ratio": None, "silent_ratio": None,
           "rms_range_db": None, "duration": None, "analyzed_s": None, "sampled": False}
    meta = ffprobe(path, "format=duration")
    dur = float(meta["format"]["duration"]) if meta and meta.get("format", {}).get("duration") else None
    res["duration"] = dur
    # 解析は先頭 PROBE_ANALYZE_CAP_S 秒まで。長尺はサンプル扱い（ratio はこの span で割る）。
    cap = PROBE_ANALYZE_CAP_S if (dur and dur > PROBE_ANALYZE_CAP_S) else None
    span = min(dur, PROBE_ANALYZE_CAP_S) if dur else None
    res["analyzed_s"] = span
    res["sampled"] = bool(cap)

    # 黒幕フレーム：placeholder は暗幕に説明を焼いた映像なので黒比率が高い
    err = _ffmpeg_filter(path, vf="blackdetect=d=0.5:pic_th=0.98:pix_th=0.10", cap_s=cap)
    if span:
        black = sum(float(m) for m in re.findall(r"black_duration:(\d+\.?\d*)", err))
        res["black_ratio"] = min(1.0, black / span)

    # フリーズ：同一クリップ多用や尺の単純伸縮は静止区間として現れる
    err = _ffmpeg_filter(path, vf="freezedetect=n=-50dB:d=2", cap_s=cap)
    if span:
        spans = re.findall(r"freeze_start:\s*(\d+\.?\d*).*?freeze_end:\s*(\d+\.?\d*)", err, re.S)
        froze = sum(float(e) - float(s) for s, e in spans)
        res["freeze_ratio"] = min(1.0, froze / span)

    # 無音：実音声が無ければ全編無音。ナレ欠落の実検出（LUFS=-inf と相補）
    err = _ffmpeg_filter(path, af="silencedetect=n=-50dB:d=1.0", cap_s=cap)
    if span:
        sil = sum(float(m) for m in re.findall(r"silence_duration:\s*(\d+\.?\d*)", err))
        res["silent_ratio"] = min(1.0, sil / span)

    # 音量レンジ：astats の overall RMS peak/trough 差。睡眠コンテンツで急変は致命
    err = _ffmpeg_filter(path, af="astats=metadata=1:reset=0", cap_s=cap)
    peaks = [float(m) for m in re.findall(r"RMS level dB:\s*(-?\d+\.?\d*)", err)]
    if len(peaks) >= 2:
        finite = [p for p in peaks if math.isfinite(p)]
        if len(finite) >= 2:
            res["rms_range_db"] = max(finite) - min(finite)
    return res


class Diag:
    """1 件の指摘。axis=どの軸, severity=fatal|warn|info, fix=AIへの具体的指示。

    asset_dependent=True の指摘は「実素材（footage/audio）が無いと構造的に解消不能」で、
    調達は人手タスク。draft ゲートではこれを除外し、ループが自律で詰められる項目だけで
    判定する。ship ゲート（最終出荷）では全件を含めて厳格に採点する。
    """
    def __init__(self, axis, severity, msg, fix, penalty, asset_dependent=False):
        self.axis, self.severity, self.msg, self.fix, self.penalty = axis, severity, msg, fix, penalty
        self.asset_dependent = asset_dependent

    def as_dict(self):
        return {"axis": self.axis, "severity": self.severity, "msg": self.msg,
                "fix": self.fix, "penalty": self.penalty, "asset_dependent": self.asset_dependent}


class Scorer:
    def __init__(self, ep_path, mp4=None, llm_result=None, gate_mode="ship"):
        self.ep_path = ep_path
        self.ep = json.loads(ep_path.read_text())
        self.root = ep_path.parent
        self.mp4 = Path(mp4) if mp4 else None
        self.llm_result = llm_result  # LLM が返した content 軸の判定（dict）or None
        self.gate_mode = gate_mode    # "draft"=素材依存を免除 / "ship"=全軸厳格
        self.diags = []
        self.scores = {}
        self.content_payload = None  # LLM 未実行時、ループに渡す採点素材
        # mp4 の実体を 1 回だけ測る（自己申告でなく実測。全軸で共有）
        self.probe = probe_mp4(self.mp4) if (self.mp4 and self.mp4.exists()) else {}

    def add(self, axis, severity, msg, fix, penalty, asset_dependent=False):
        self.diags.append(Diag(axis, severity, msg, fix, penalty, asset_dependent))

    def _score_from(self, axis, fatal=False):
        # draft ゲート時は asset_dependent な指摘の penalty を免除して採点する。
        # ship 時は全件加算。素材未配置でもループが詰められる品質だけを draft で測る。
        draft = self.gate_mode == "draft"
        pen = sum(d.penalty for d in self.diags
                  if d.axis == axis and not (draft and d.asset_dependent))
        s = max(0, 100 - pen)
        if fatal:
            s = min(s, 40)
        self.scores[axis] = s
        return s

    # ---- build：実際に出た mp4 を測る -----------------------------------
    def score_build(self):
        target = float(self.ep.get("duration_target_s", 0))
        fatal = False
        if self.mp4 and self.mp4.exists():
            meta = ffprobe(self.mp4, "format=duration")
            dur = float(meta["format"]["duration"]) if meta else None
            if dur:
                # --fast は尺 1/4。target/4 と実尺の乖離を見る（full も許容）
                expected = [target, target / 4]
                err = min(abs(dur - e) / e for e in expected if e > 0)
                if err > 0.05:
                    self.add("build", "warn",
                             f"出力尺 {dur:.0f}s が target {target:.0f}s(or /4) から {err*100:.1f}% 乖離",
                             "shots/segments の t_start/t_end の連続性と duration_target_s の整合を直す", 25)
            else:
                self.add("build", "fatal", "mp4 の尺が読めない（壊れた出力）",
                         "build.py のエラーログを確認。ffmpeg フィルタ式の破綻を疑う", 60)
                fatal = True
            lufs = measure_lufs(self.mp4)
            if lufs is not None and not math.isfinite(lufs):
                # 無音（実音声素材ゼロ）→ -inf。これは調整ミスでなく素材未配置。
                # placeholder 比率の方で別途減点するので、ここは info 扱い（人手タスク）。
                self.add("build", "info", "測定 LUFS が -inf（音声素材が無く無音）",
                         "narration/bgm の実 wav を assets/audio に置く（人手調達）。配置後は LUFS が出る", 0,
                         asset_dependent=True)
            elif lufs is not None and abs(lufs + 16) > 2.0:
                self.add("build", "warn", f"測定 LUFS {lufs:.1f} が -16 から {abs(lufs+16):.1f}dB 外れ",
                         "loudness.i/tp/lra を見直す。素材無音だと -inf になり得る点に注意", 15)
            # 急な音量変化：睡眠コンテンツで RMS レンジが広いと離脱要因
            rng = self.probe.get("rms_range_db")
            if rng is not None and rng > 18:
                self.add("build", "warn", f"音量レンジが {rng:.0f}dB と広い（急な音量変化＝離脱要因）",
                         "BGM/ナレの gain・ダッキングを均し、区間ごとの RMS 差を圧縮する", 12)
        else:
            self.add("build", "info", "mp4 未指定 — ビルド健全性は未測定",
                     "build.py を --fast で走らせ --mp4 で渡す", 10)

        # placeholder 混入率：まず JSON 上の file 実在で測り、mp4 があれば
        # 実フレームの黒幕比率（blackdetect）で上書き検証する。
        # 後者は「file キーは埋めたが中身が暗幕」という自己申告ハックを潰す。
        shots = self.ep.get("shots", [])
        missing = 0.0
        for s in shots:
            f = (self.root / s["file"]).resolve()
            if not f.exists():
                missing += (s["t_end"] - s["t_start"])
        ratio = (missing / target) if target else 0.0
        black = self.probe.get("black_ratio")
        if black is not None:
            # 実測の黒幕比率を真実とみなす（JSON 申告より厳しい方を採用）
            ratio = max(ratio, black)
            if black > 0.10 and missing == 0:
                self.add("build", "warn",
                         f"file は実在するが実フレームの {black*100:.0f}% が黒幕（中身が placeholder/破綻）",
                         "assets/footage の実クリップが暗すぎないか確認。黒幕焼き込みのまま出していないか", int(min(20, black * 20)),
                         asset_dependent=True)
        if ratio > 0.0:
            sev = "warn" if ratio < 0.999 else "info"
            self.add("build", sev, f"placeholder 比率 {ratio*100:.0f}%（実素材未配置/暗幕）",
                     "assets/footage に実クリップを置く。全 placeholder では本番判定不可", int(min(20, ratio * 20)),
                     asset_dependent=True)
        return self._score_from("build", fatal)

    # ---- authentic：inauthentic / 収益化リスク（最重要軸）---------------
    def score_authentic(self):
        shots = self.ep.get("shots", [])
        n = len(shots)
        # 1) 同一クリップ多用（同一 file を複数 shot が指す＝Content ID 衝突＋既視感）
        files = [s.get("file") for s in shots]
        dup = [(f, c) for f, c in Counter(files).items() if c > 1]
        for f, c in dup:
            self.add("authentic", "warn", f"同一クリップ {f} を {c} shot で再利用（既視感/誤申立リスク）",
                     "各 shot を別クリップにするか、speed/crop/color の独自編集パラメータで差分化する", 12 * (c - 1))
        # 2) shot の多様性（desc の語彙が痩せていると単調＝機械生成的）
        descs = [s.get("desc", "") for s in shots]
        uniq_desc = len(set(descs))
        if n and uniq_desc / n < 0.8:
            self.add("authentic", "warn", f"shot desc の独自性が低い（{uniq_desc}/{n} ユニーク）",
                     "各カットに固有のロケーション/被写体/動きを与え、汎用ストック感を崩す", 14)
        # 3) 独自編集の証跡：speed/crop/color/grade 等の編集指示が shot に無いと
        #    「ストックをそのまま並べた」= inauthentic 直撃帯。
        #    ただしキーの有無は自己申告。mp4 があれば「実際に動いているか」を
        #    freezedetect の実測で裏取りし、申告だけの水増しを潰す。
        edited = sum(1 for s in shots if any(k in s for k in ("speed", "crop", "grade", "color", "edit")))
        if n and edited / n < 0.3:
            self.add("authentic", "warn", f"独自編集パラメータを持つ shot が {edited}/{n} と少ない",
                     "shot に speed(スロー)/crop/grade 等の編集フィールドを足し、変形性を担保する", 16)
        freeze = self.probe.get("freeze_ratio")
        if freeze is not None and freeze > 0.15:
            # 編集を申告していても実フレームが静止していれば変形は実在しない。
            # 申告で減点を逃れたぶんを実測ペナルティで取り返す（ハック耐性の核）。
            self.add("authentic", "warn",
                     f"実フレームの {freeze*100:.0f}% が静止（freezedetect）。編集申告と中身が不一致",
                     "speed/crop は JSON だけでなく実際に映像へ適用する。静的素材は動きのある別クリップに差し替え",
                     int(min(24, freeze * 30)), asset_dependent=True)
        # 4) AI 開示フラグ（docs §7-6）。合成ナレを使うなら disclosure 必須
        if not self.ep.get("ai_disclosure") and self.ep.get("narration"):
            self.add("authentic", "info", "ai_disclosure フラグが無い（合成音声なら開示必須）",
                     "episode.json に ai_disclosure:true と metadata の開示文を持たせる", 8)
        # 5) 尺の単純伸縮で派生していないか（silence が異常に長い＝水増し兆候）
        for seg in self.ep.get("segments", []):
            if seg.get("role") == "silence":
                dur = seg["t_end"] - seg["t_start"]
                if dur / max(1, self.ep.get("duration_target_s", 1)) > 0.4:
                    self.add("authentic", "warn", f"silence が全体の {dur/self.ep['duration_target_s']*100:.0f}%（水増し疑い）",
                             "尺は silence 単純伸縮でなく構成・映像・導入で意味差分化する", 12)
        return self._score_from("authentic")

    # ---- structure：NSDR 標準構造との整合 -------------------------------
    def score_structure(self):
        segs = self.ep.get("segments", [])
        roles = [s.get("role") for s in segs]
        for r in NSDR_ROLES:
            if r not in roles:
                self.add("structure", "warn", f"標準 role '{r}' が segments に無い",
                         f"segments に role:'{r}' のセクションを足す（docs 00 §3.2 の標準構造）", 12)
        # segment と shot の時間被覆が一致しているか
        target = self.ep.get("duration_target_s", 0)
        if segs:
            if segs[0]["t_start"] != 0:
                self.add("structure", "warn", "最初の segment が 0s 始まりでない",
                         "segments の t_start を 0 から連続させる", 8)
            if segs[-1]["t_end"] != target:
                self.add("structure", "warn", f"最後の segment 終端 {segs[-1]['t_end']} != target {target}",
                         "最終 segment の t_end を duration_target_s に合わせる", 10)
            for a, b in zip(segs, segs[1:]):
                if a["t_end"] != b["t_start"]:
                    self.add("structure", "warn", f"segment 間にギャップ/重複（{a['t_end']}→{b['t_start']}）",
                             "segment の t_end と次の t_start を連続させる", 8)
        return self._score_from("structure")

    # ---- license：台帳の完全性 -----------------------------------------
    def score_license(self):
        refs = set(self.ep.get("license_refs", []))
        used = set()
        for s in self.ep.get("shots", []):
            if s.get("license_ref"):
                used.add(s["license_ref"])
        if self.ep.get("bgm", {}).get("license_ref"):
            used.add(self.ep["bgm"]["license_ref"])
        missing = used - refs
        for m in missing:
            self.add("license", "fatal" if True else "warn", f"license_ref '{m}' が license_refs に未登録",
                     f"license_refs に '{m}' を足し、台帳(assets.json)に出所/種別/取得日を記録", 18)
        # 台帳ファイルの存在と永続ライセンス種別
        ledger = self.root / "assets.json"
        if not ledger.exists():
            ledger = self.root.parent.parent / "assets.json"
        if not ledger.exists():
            self.add("license", "warn", "ライセンス台帳 assets.json が無い",
                     "{asset_id, source, license_type, download_date, content_id_safe, used_in} の台帳を作る", 20)
        else:
            try:
                led = json.loads(ledger.read_text())
                entries = led if isinstance(led, list) else led.get("assets", [])
                idx = {e.get("asset_id"): e for e in entries}
                for ref in used:
                    e = idx.get(ref)
                    if not e:
                        self.add("license", "warn", f"台帳に asset '{ref}' のエントリが無い",
                                 f"assets.json に {ref} の license_type/source/download_date を追記", 10)
                    elif not any(h in str(e.get("license_type", "")).lower() for h in PERSISTENT_LICENSE_HINTS):
                        self.add("license", "warn", f"asset '{ref}' のライセンスが永続と確認できない",
                                 "解約で権利が消える形態は不可。永続/CC0/買い切りに限定（docs §7-7）", 8)
            except Exception:
                self.add("license", "warn", "assets.json が壊れている", "JSON を修復する", 15)
        return self._score_from("license")

    # ---- meta：差別化 / 多言語 -----------------------------------------
    def score_meta(self):
        langs = self.ep.get("langs", [])
        if len(langs) < 2:
            self.add("meta", "info", f"言語が {len(langs)} 言語（多言語展開の余地）",
                     "langs に 2 言語以上（hi/en）を持たせ多言語音声トラックを使う", 8)
        titles = self.ep.get("title", {})
        for l in langs:
            t = titles.get(l, "")
            if not t:
                self.add("meta", "warn", f"{l} のタイトルが空",
                         f"title.{l} を独自性のある語彙で埋める（連番だけは弱い）", 10)
            elif len(t) < 20:
                self.add("meta", "info", f"{l} タイトルが短い（{len(t)}字, SEO 弱）",
                         f"title.{l} にキーワード(NSDR/Yoga Nidra/言語/尺)を含め拡充", 5)
        if not self.ep.get("telop", {}).get("place_name"):
            self.add("meta", "info", "telop.place_name が無い（土地名テロップは識別子）",
                     "telop.place_name に各言語の固有地名を入れる", 5)
        return self._score_from("meta")

    # ---- pacing：NSDR 固有の品質（尺配分・誘導ナレ密度）-----------------
    def _parse_script(self, lang):
        """script_<lang>.md を `## mm:ss – mm:ss Role` 見出しで分割し、
        各セクションの (role推定, 正味語数, 明示pause秒) を返す。誘導密度の実測用。"""
        names = {"en": "script_english.md", "hi": "script_hindi.md"}
        p = self.root / names.get(lang, f"script_{lang}.md")
        if not p.exists():
            return None
        text = p.read_text()
        # `## 00:30 – 02:30  Breathing` 形式。区切りは – or - or 〜。
        parts = re.split(r"\n##\s+\d{1,2}:\d{2}\s*[–\-〜~].*?\n", "\n" + text)
        heads = re.findall(r"\n##\s+\d{1,2}:\d{2}\s*[–\-〜~]\s*\d{1,2}:\d{2}\s+(.+)", "\n" + text)
        out = []
        known = set(NSDR_ROLES)
        for idx, (head, body) in enumerate(zip(heads, parts[1:])):
            # 見出しは英語role直書き(Breathing)か、多言語+英語括弧(श्वास (breathing))。
            # 括弧内に既知 role があればそれを優先採用し、無ければ素の正規化。
            paren = re.findall(r"\(([a-z_ -]+)\)", head.lower())
            role = None
            for cand in paren + [head.strip().lower()]:
                norm = cand.strip().replace(" ", "_").replace("-", "_")
                if norm in known:
                    role = norm
                    break
            if role is None:
                # 見出しが多言語のみで英語 role を含まない場合、NSDR は固定 6 role 順なので
                # セクション位置から role を補完する（順序ズレが無い前提・docs 00 §3.2）。
                if idx < len(NSDR_ROLES):
                    role = NSDR_ROLES[idx]
                else:
                    role = head.strip().lower().replace(" ", "_").replace("-", "_")
            # [pause 10s] / [4s] / (silence 5s) などの明示 break 秒を抜き、語は除外
            pause_s = sum(float(x) for x in re.findall(r"\[(?:pause\s*)?(\d+\.?\d*)\s*s\]", body))
            pause_s += sum(float(x) for x in re.findall(r"\(silence\s+(\d+\.?\d*)\s*s", body))
            clean = re.sub(r"\[[^\]]*\]", " ", body)
            clean = re.sub(r"\([^)]*\)", " ", clean)
            words = len([w for w in re.split(r"\s+", clean) if w.strip()])
            out.append((role, words, pause_s))
        return out

    def score_pacing(self):
        target = float(self.ep.get("duration_target_s", 0)) or 1.0
        segs = self.ep.get("segments", [])
        # 1) role 尺配分：理想比からの逸脱（body_scan を削って silence で水増し等を検出）
        for s in segs:
            role = s.get("role")
            ideal = NSDR_IDEAL_RATIO.get(role)
            if ideal is None:
                continue
            actual = (s["t_end"] - s["t_start"]) / target
            dev = abs(actual - ideal)
            if dev > 0.10:
                self.add("pacing", "warn",
                         f"{role} の尺比 {actual*100:.0f}% が理想 {ideal*100:.0f}% から {dev*100:.0f}pt 逸脱",
                         f"{role} を理想比 {ideal*100:.0f}% 付近へ。body_scan を削って silence 等で埋める水増しは不可",
                         int(min(14, dev * 60)))
        # 2) 誘導ナレ密度：script を実パースし words/分 が役割帯から外れていないか
        lang = self.ep.get("lang_default", (self.ep.get("langs") or ["en"])[0])
        sections = self._parse_script(lang)
        if sections is None:
            self.add("pacing", "info", f"script_{lang}.md が読めず誘導密度を実測できない",
                     "episodes/<id>/script_<lang>.md を `## mm:ss – mm:ss Role` 見出しで用意する", 6)
        else:
            seg_dur = {s.get("role"): (s["t_end"] - s["t_start"]) for s in segs}
            for role, words, pause_s in sections:
                band = NSDR_WPM_BAND.get(role)
                dur = seg_dur.get(role)
                if not band or not dur:
                    continue
                speaking = max(1.0, dur - pause_s)  # 明示pauseを除いた実発話尺
                wpm = words / (speaking / 60.0)
                lo, hi = band
                if wpm > hi:
                    self.add("pacing", "warn",
                             f"{role} の誘導が速い（{wpm:.0f} wpm > {hi}）。睡眠誘導として急ぎすぎ",
                             f"{role} のナレを削るか pause を増やし {lo}–{hi} wpm に収める", int(min(16, (wpm - hi))))
                elif wpm < lo and role != "silence":
                    self.add("pacing", "info",
                             f"{role} のナレが希薄（{wpm:.0f} wpm < {lo}）。間延び/デッドエア気味",
                             f"{role} に誘導文を足し {lo}–{hi} wpm に。無音だけで持たせない", int(min(8, (lo - wpm))))
        return self._score_from("pacing")

    # ---- content：LLM 補助（script 本文/メタの質）。score.py は LLM を呼ばない ----
    def score_content(self):
        if self.llm_result is not None:
            # ループが回した LLM の判定をそのまま軸に反映（補助＝静的軸を覆さない重み）
            for d in self.llm_result.get("diagnostics", []):
                self.add("content", d.get("severity", "warn"),
                         d.get("msg", "LLM 指摘"), d.get("fix", ""), int(d.get("penalty", 0)))
            # LLM が直接 score を返した場合はそれを優先（penalty 合算より上位）
            if "score" in self.llm_result:
                self.scores["content"] = max(0, min(100, int(self.llm_result["score"])))
                return self.scores["content"]
            return self._score_from("content")
        # LLM 未実行：採点素材（script 全文＋メタ＋ルーブリック）を payload に詰め、
        # ループ側が LLM を 1 パス走らせて --llm-result で食わせ直す。
        lang = self.ep.get("lang_default", (self.ep.get("langs") or ["en"])[0])
        names = {"en": "script_english.md", "hi": "script_hindi.md"}
        scripts = {}
        for l in self.ep.get("langs", []):
            p = self.root / names.get(l, f"script_{l}.md")
            if p.exists():
                scripts[l] = p.read_text()
        meta_md = self.root / "metadata.md"
        self.content_payload = {
            "rubric": CONTENT_RUBRIC,
            "title": self.ep.get("title", {}),
            "scripts": scripts,
            "metadata_md": meta_md.read_text() if meta_md.exists() else None,
            "instruction": "上記 rubric の各観点で 0-100 採点し、"
                           "{score:int, diagnostics:[{axis:'content',severity,msg,fix,penalty}]} を返す。"
                           "penalty 合計は 100 を超えない。具体的な該当箇所を msg に引用する。",
        }
        self.add("content", "info", "content 軸は LLM 未実行（補助軸）。payload を /ndsr-loop が採点する",
                 "score.py --llm-result <verdict.json> に LLM の判定を渡すと content 軸が確定する", 0)
        # 未実行時は満点扱いにせずニュートラル（ゲートを誤って塞がない／誤って通さない）
        self.scores["content"] = GATE["content"]
        return self.scores["content"]

    def run(self):
        self.score_build()
        self.score_authentic()
        self.score_structure()
        self.score_license()
        self.score_meta()
        self.score_pacing()
        self.score_content()
        total = sum(self.scores[a] * WEIGHTS[a] for a in self.scores) / sum(WEIGHTS.values())
        gate = {a: self.scores[a] >= GATE[a] for a in GATE}
        return {
            "episode": self.ep.get("id"),
            "mp4": str(self.mp4) if self.mp4 else None,
            "gate_mode": self.gate_mode,
            "scores": self.scores,
            "weighted_total": round(total, 1),
            "gate": GATE,
            "gate_pass": all(gate.values()),
            "gate_detail": gate,
            "diagnostics": sorted(
                [d.as_dict() for d in self.diags],
                key=lambda d: (-d["penalty"], d["axis"])),
            # LLM 未実行時のみ非 null。/ndsr-loop はこれを見たら content 採点パスを回す。
            "content_payload": self.content_payload,
        }


def main():
    ap = argparse.ArgumentParser(description="NDSR episode scorer")
    ap.add_argument("episode", type=Path)
    ap.add_argument("--mp4", type=Path, default=None, help="採点対象の出力 mp4（build.py の結果）")
    ap.add_argument("--llm-result", type=Path, default=None,
                    help="content 軸の LLM 判定 JSON（{score, diagnostics:[...]}）。"
                         "省略時は content_payload を出力しループが採点する")
    ap.add_argument("--gate", choices=["draft", "ship"], default="ship",
                    help="draft=素材依存の減点を免除しJSON/script品質で判定（ループ用）/ "
                         "ship=全軸厳格な最終出荷判定（デフォルト）")
    args = ap.parse_args()
    if not args.episode.exists():
        sys.exit(f"not found: {args.episode}")
    llm = None
    if args.llm_result and args.llm_result.exists():
        try:
            llm = json.loads(args.llm_result.read_text())
        except Exception as e:
            sys.exit(f"--llm-result 読み込み失敗: {e}")
    result = Scorer(args.episode, args.mp4, llm_result=llm, gate_mode=args.gate).run()
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
