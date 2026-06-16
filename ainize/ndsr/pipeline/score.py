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
GATE = {"build": 80, "authentic": 80, "structure": 75, "license": 80, "meta": 70}
WEIGHTS = {"build": 1.0, "authentic": 1.6, "structure": 1.0, "license": 1.1, "meta": 0.8}

# NSDR 20 分版の標準構造（docs/00_master_plan §3.2）。role と理想尺比。
NSDR_ROLES = ["intro", "breathing", "body_scan", "visualization", "silence", "wake_up"]
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


class Diag:
    """1 件の指摘。axis=どの軸, severity=fatal|warn|info, fix=AIへの具体的指示。"""
    def __init__(self, axis, severity, msg, fix, penalty):
        self.axis, self.severity, self.msg, self.fix, self.penalty = axis, severity, msg, fix, penalty

    def as_dict(self):
        return {"axis": self.axis, "severity": self.severity, "msg": self.msg,
                "fix": self.fix, "penalty": self.penalty}


class Scorer:
    def __init__(self, ep_path, mp4=None):
        self.ep_path = ep_path
        self.ep = json.loads(ep_path.read_text())
        self.root = ep_path.parent
        self.mp4 = Path(mp4) if mp4 else None
        self.diags = []
        self.scores = {}

    def add(self, axis, severity, msg, fix, penalty):
        self.diags.append(Diag(axis, severity, msg, fix, penalty))

    def _score_from(self, axis, fatal=False):
        pen = sum(d.penalty for d in self.diags if d.axis == axis)
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
                         "narration/bgm の実 wav を assets/audio に置く（人手調達）。配置後は LUFS が出る", 0)
            elif lufs is not None and abs(lufs + 16) > 2.0:
                self.add("build", "warn", f"測定 LUFS {lufs:.1f} が -16 から {abs(lufs+16):.1f}dB 外れ",
                         "loudness.i/tp/lra を見直す。素材無音だと -inf になり得る点に注意", 15)
        else:
            self.add("build", "info", "mp4 未指定 — ビルド健全性は未測定",
                     "build.py を --fast で走らせ --mp4 で渡す", 10)

        # placeholder 混入率：file が実在しない shot の尺合計 / 全尺
        shots = self.ep.get("shots", [])
        missing = 0.0
        for s in shots:
            f = (self.root / s["file"]).resolve()
            if not f.exists():
                missing += (s["t_end"] - s["t_start"])
        if target and missing / target > 0.0:
            ratio = missing / target
            sev = "warn" if ratio < 0.999 else "info"
            self.add("build", sev, f"placeholder 比率 {ratio*100:.0f}%（実素材未配置）",
                     "assets/footage に実クリップを置く。全 placeholder では本番判定不可", int(min(20, ratio * 20)))
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
        #    「ストックをそのまま並べた」= inauthentic 直撃帯
        edited = sum(1 for s in shots if any(k in s for k in ("speed", "crop", "grade", "color", "edit")))
        if n and edited / n < 0.3:
            self.add("authentic", "warn", f"独自編集パラメータを持つ shot が {edited}/{n} と少ない",
                     "shot に speed(スロー)/crop/grade 等の編集フィールドを足し、変形性を担保する", 16)
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

    def run(self):
        self.score_build()
        self.score_authentic()
        self.score_structure()
        self.score_license()
        self.score_meta()
        total = sum(self.scores[a] * WEIGHTS[a] for a in self.scores) / sum(WEIGHTS.values())
        gate = {a: self.scores[a] >= GATE[a] for a in GATE}
        return {
            "episode": self.ep.get("id"),
            "mp4": str(self.mp4) if self.mp4 else None,
            "scores": self.scores,
            "weighted_total": round(total, 1),
            "gate": GATE,
            "gate_pass": all(gate.values()),
            "gate_detail": gate,
            "diagnostics": sorted(
                [d.as_dict() for d in self.diags],
                key=lambda d: (-d["penalty"], d["axis"])),
        }


def main():
    ap = argparse.ArgumentParser(description="NDSR episode scorer")
    ap.add_argument("episode", type=Path)
    ap.add_argument("--mp4", type=Path, default=None, help="採点対象の出力 mp4（build.py の結果）")
    args = ap.parse_args()
    if not args.episode.exists():
        sys.exit(f"not found: {args.episode}")
    result = Scorer(args.episode, args.mp4).run()
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
