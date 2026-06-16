#!/usr/bin/env python3
"""
NDSR build pipeline — episode.json を真実源に 1 本の mp4 を組み立てる。

設計（docs/02_video_generation_decision.md §2「組み立て」に対応）:
  episode.json → [映像 concat+crossfade] + [ナレ無音オフセット] + [BGM duck/amix]
              → ffmpeg-normalize 相当の -16 LUFS 正規化 → out/<id>_<lang>.mp4

素材が無くても通る:
  - 映像ショット file が無ければ、shot.desc を焼いたカラーバー的プレースホルダを尺ぴったりで生成
  - ナレ wav が無ければ無音、BGM が無ければ無音を生成
これにより「いま実行すれば #001 の 1200 秒 mp4 が出る骨格」になり、
後で assets/ に本素材を置くだけで本番ビルドに切り替わる。

使い方:
  python3 pipeline/build.py episodes/001/episode.json --lang en
  python3 pipeline/build.py episodes/001/episode.json --lang hi --fast   # 検証用に低解像度・短縮
"""
import argparse
import json
import os
import shlex
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import List, Optional, Tuple


def run(cmd, **kw):
    print("  $ " + " ".join(shlex.quote(c) for c in cmd), file=sys.stderr)
    return subprocess.run(cmd, check=True, **kw)


def ffprobe_duration(path):
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=nw=1:nk=1", str(path)],
            check=True, capture_output=True, text=True,
        ).stdout.strip()
        return float(out)
    except (subprocess.CalledProcessError, ValueError):
        return None


def esc_drawtext(s):
    # drawtext の特殊文字をエスケープ
    return s.replace("\\", "\\\\").replace(":", "\\:").replace("'", "’")


class Builder:
    def __init__(self, episode_path, lang, fast):
        self.ep = json.loads(episode_path.read_text())
        self.root = episode_path.parent
        self.lang = lang
        self.fast = fast
        self.fps = int(self.ep.get("fps", 30))
        res = self.ep.get("resolution", {"w": 1920, "h": 1080})
        if fast:
            self.w, self.h = 640, 360
        else:
            self.w, self.h = int(res["w"]), int(res["h"])
        self.scale = 0.25 if fast else 1.0  # fast は尺も 1/4 にして検証を速く
        self.tmp = Path(tempfile.mkdtemp(prefix=f"ndsr_{self.ep['id']}_"))
        self.out_dir = self.root.parent.parent / "out"
        self.out_dir.mkdir(exist_ok=True)
        if lang not in self.ep["langs"]:
            sys.exit(f"lang {lang!r} not in episode langs {self.ep['langs']}")

    def dur(self, t_start, t_end):
        return (t_end - t_start) * self.scale

    def resolve(self, rel):
        return (self.root / rel).resolve()

    # ---- placeholder generators ----------------------------------------
    def placeholder_clip(self, shot, dur):
        out = self.tmp / f"{shot['id']}.mp4"
        label = f"{shot['id']}  {shot['desc']}"
        # 暗い背景にショット説明を焼いた静止映像（無人称の長尺ホールドの代役）
        vf = (
            f"drawtext=text='{esc_drawtext(label)}':fontcolor=0xb0b0c0:fontsize={max(14, self.h//40)}:"
            f"x=(w-text_w)/2:y=h-80:box=1:boxcolor=0x000000aa:boxborderw=10"
        )
        run([
            "ffmpeg", "-y", "-f", "lavfi",
            "-i", f"color=c=0x0a0e1a:s={self.w}x{self.h}:r={self.fps}:d={dur:.3f}",
            "-vf", vf, "-pix_fmt", "yuv420p", str(out),
        ], capture_output=True)
        return out

    def silent_audio(self, dur):
        out = self.tmp / f"silence_{dur:.3f}.wav"
        if out.exists():
            return out
        run([
            "ffmpeg", "-y", "-f", "lavfi",
            "-i", f"anullsrc=r=48000:cl=stereo", "-t", f"{dur:.3f}", str(out),
        ], capture_output=True)
        return out

    # ---- video track ----------------------------------------------------
    def build_video(self):
        clips = []
        for shot in self.ep["shots"]:
            d = self.dur(shot["t_start"], shot["t_end"])
            src = self.resolve(shot["file"])
            if src.exists():
                # 実素材: 尺に合わせて trim/loop し、解像度を統一
                clip = self.tmp / f"{shot['id']}_real.mp4"
                run([
                    "ffmpeg", "-y", "-stream_loop", "-1", "-i", str(src),
                    "-t", f"{d:.3f}",
                    "-vf", f"scale={self.w}:{self.h}:force_original_aspect_ratio=increase,"
                           f"crop={self.w}:{self.h},fps={self.fps}",
                    "-an", "-pix_fmt", "yuv420p", str(clip),
                ], capture_output=True)
                clips.append((clip, d))
            else:
                print(f"  [placeholder] {shot['id']} ({shot['file']} not found)", file=sys.stderr)
                clips.append((self.placeholder_clip(shot, d), d))

        xf = float(self.ep.get("crossfade_s", 3)) * self.scale
        if len(clips) == 1 or xf <= 0:
            concat_list = self.tmp / "vconcat.txt"
            concat_list.write_text("".join(f"file '{c}'\n" for c, _ in clips))
            out = self.tmp / "video.mp4"
            run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_list),
                 "-c", "copy", str(out)], capture_output=True)
            return out

        # xfade をチェーン: offset は累積尺 - クロスフェード分
        inputs, filters, labels = [], [], []
        for i, (c, _) in enumerate(clips):
            inputs += ["-i", str(c)]
        prev = "0:v"
        offset = clips[0][1] - xf
        for i in range(1, len(clips)):
            out_label = f"vx{i}"
            filters.append(
                f"[{prev}][{i}:v]xfade=transition=fade:duration={xf:.3f}:offset={offset:.3f}[{out_label}]"
            )
            prev = out_label
            offset += clips[i][1] - xf
        out = self.tmp / "video.mp4"
        run(["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(filters),
             "-map", f"[{prev}]", "-r", str(self.fps), "-pix_fmt", "yuv420p", str(out)],
            capture_output=True)
        return out

    # ---- audio track ----------------------------------------------------
    def build_audio(self, total):
        # ナレーション: start_offset 分の無音 + ナレ wav（無ければ全無音）
        nar = self.ep["narration"].get(self.lang, {})
        nar_src = self.resolve(nar["file"]) if nar.get("file") else None
        offset = float(nar.get("start_offset_s", 0)) * self.scale
        nar_track = self.tmp / "narration.wav"
        if nar_src and nar_src.exists():
            run(["ffmpeg", "-y", "-i", str(self.silent_audio(offset)), "-i", str(nar_src),
                 "-filter_complex", "[0:a][1:a]concat=n=2:v=0:a=1[a]",
                 "-map", "[a]", "-t", f"{total:.3f}", str(nar_track)], capture_output=True)
            has_nar = True
        else:
            print(f"  [silent narration] ({self.lang}: wav not found)", file=sys.stderr)
            nar_track = self.silent_audio(total)
            has_nar = False

        # BGM: loop して total に合わせ、gain + fade。無ければ無音
        bgm = self.ep.get("bgm", {})
        bgm_src = self.resolve(bgm["file"]) if bgm.get("file") else None
        bgm_gain = float(bgm.get("gain_db", -24))
        fi = float(bgm.get("fade_in_s", 5)) * self.scale
        fo = float(bgm.get("fade_out_s", 8)) * self.scale
        bgm_track = self.tmp / "bgm.wav"
        if bgm_src and bgm_src.exists():
            run(["ffmpeg", "-y", "-stream_loop", "-1", "-i", str(bgm_src),
                 "-t", f"{total:.3f}",
                 "-af", f"volume={bgm_gain}dB,afade=t=in:st=0:d={fi:.3f},"
                        f"afade=t=out:st={total-fo:.3f}:d={fo:.3f}",
                 str(bgm_track)], capture_output=True)
            has_bgm = True
        else:
            print("  [silent bgm] (bgm wav not found)", file=sys.stderr)
            bgm_track = self.silent_audio(total)
            has_bgm = False

        out = self.tmp / "mix.wav"
        if has_nar and has_bgm:
            # サイドチェイン: ナレが鳴る間 BGM をダッキング
            duck = float(bgm.get("duck_db", -28))
            run(["ffmpeg", "-y", "-i", str(bgm_track), "-i", str(nar_track),
                 "-filter_complex",
                 f"[1:a]asplit=2[nar][sc];"
                 f"[0:a][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=600[bgmduck];"
                 f"[bgmduck][nar]amix=inputs=2:duration=longest:normalize=0[a]",
                 "-map", "[a]", "-t", f"{total:.3f}", str(out)], capture_output=True)
        else:
            run(["ffmpeg", "-y", "-i", str(bgm_track), "-i", str(nar_track),
                 "-filter_complex", "[0:a][1:a]amix=inputs=2:duration=longest:normalize=0[a]",
                 "-map", "[a]", "-t", f"{total:.3f}", str(out)], capture_output=True)
        return out

    # ---- mux + normalize -----------------------------------------------
    def build(self):
        total = self.dur(0, self.ep["duration_target_s"])
        print(f"[1/4] video track ({total:.0f}s, {self.w}x{self.h})", file=sys.stderr)
        video = self.build_video()
        print("[2/4] audio track (narration + bgm duck)", file=sys.stderr)
        audio = self.build_audio(total)

        print("[3/4] mux + place-name telop", file=sys.stderr)
        tl = self.ep.get("telop", {})
        place = tl.get("place_name", {}).get(self.lang) or tl.get("place_name", {}).get("en", "")
        muxed = self.tmp / "muxed.mp4"
        vfilters = []
        if place:
            f0 = float(tl.get("show_from_s", 2)) * self.scale
            f1 = float(tl.get("show_until_s", 10)) * self.scale
            vfilters.append(
                f"drawtext=text='{esc_drawtext(place)}':fontcolor=white:fontsize={max(20, self.h//22)}:"
                f"x=(w-text_w)/2:y=h*0.18:alpha='if(lt(t,{f0}),0,if(lt(t,{f0}+1),(t-{f0}),"
                f"if(lt(t,{f1}-1),1,if(lt(t,{f1}),({f1}-t),0))))'"
            )
        vf_args = ["-vf", ",".join(vfilters)] if vfilters else []
        run(["ffmpeg", "-y", "-i", str(video), "-i", str(audio), *vf_args,
             "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset",
             "veryfast" if self.fast else "medium", "-crf", "20",
             "-c:a", "aac", "-b:a", "192k", "-shortest", "-pix_fmt", "yuv420p",
             str(muxed)], capture_output=True)

        print("[4/4] loudness normalize (-16 LUFS, 2-pass)", file=sys.stderr)
        ln = self.ep.get("loudness", {"i": -16, "tp": -1.5, "lra": 11})
        out = self.out_dir / f"{self.ep['id']}_{self.lang}{'_fast' if self.fast else ''}.mp4"
        run(["ffmpeg", "-y", "-i", str(muxed),
             "-af", f"loudnorm=I={ln['i']}:TP={ln['tp']}:LRA={ln['lra']}",
             "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", str(out)],
            capture_output=True)
        return out


def main():
    ap = argparse.ArgumentParser(description="NDSR episode.json → mp4 builder")
    ap.add_argument("episode", type=Path, help="path to episode.json")
    ap.add_argument("--lang", required=True, help="language track to build (e.g. en, hi)")
    ap.add_argument("--fast", action="store_true",
                    help="低解像度・尺1/4で素早く検証（本番出力ではない）")
    args = ap.parse_args()
    if not args.episode.exists():
        sys.exit(f"not found: {args.episode}")
    b = Builder(args.episode, args.lang, args.fast)
    out = b.build()
    dur = ffprobe_duration(out)
    size_mb = out.stat().st_size / 1e6
    print(f"\n✓ {out}  ({dur:.1f}s, {size_mb:.1f} MB)", file=sys.stderr)
    print(out)


if __name__ == "__main__":
    main()
