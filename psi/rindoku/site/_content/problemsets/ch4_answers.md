# Chapter 4 — Problem Set 4.1 解答集

> Strang "Computational Science and Engineering" Chapter 4: Fourier Series and Integrals — フーリエ級数・DFT・畳み込みの全問解答。

---

# Problem Set 4.1（フーリエ級数 — 周期関数の展開）

---

## 問題 1 — 平方波のフーリエ正弦係数

**問題**: 平方波 \(SW(x) = 1\)（\(0 < x < \pi\)）を奇関数として \([-\pi, \pi]\) に拡張したとき、フーリエ正弦係数 \(b_k\) を求めよ。

**回答**:

奇関数なので余弦係数 \(a_k = 0\)、正弦係数のみ残る。

$$b_k = \frac{2}{\pi} \int_0^{\pi} \sin kx \, dx = \frac{2}{\pi} \left[-\frac{\cos kx}{k}\right]_0^{\pi} = \frac{2}{\pi k}(1 - \cos k\pi)$$

\(\cos k\pi = (-1)^k\) なので:

- **\(k\) が奇数**: \(1 - (-1) = 2\) より \(b_k = \dfrac{4}{\pi k}\)
- **\(k\) が偶数**: \(1 - 1 = 0\) より \(b_k = 0\)

よって平方波のフーリエ級数は:

$$\boxed{SW(x) = \frac{4}{\pi}\left(\sin x + \frac{\sin 3x}{3} + \frac{\sin 5x}{5} + \cdots\right) = \frac{4}{\pi}\sum_{n=0}^{\infty} \frac{\sin(2n+1)x}{2n+1}}$$

**核心**: 不連続関数の係数は \(1/k\) でしか減衰しない。これがギブス現象と収束の遅さの原因。正弦のみ（奇関数）。

---

## 問題 2 — 三角波（ランプ関数）の正弦係数

**問題**: \(T(x) = x\)（\(0 < x < \pi\)）の正弦係数 \(b_k\) を求めよ。平方波の係数と比較せよ。

**回答**:

$$b_k = \frac{2}{\pi}\int_0^{\pi} x \sin kx \, dx$$

部分積分（\(u = x\), \(dv = \sin kx \, dx\)）:

$$b_k = \frac{2}{\pi}\left[\left.-\frac{x\cos kx}{k}\right|_0^{\pi} + \frac{1}{k}\int_0^{\pi}\cos kx \, dx\right]$$

$$= \frac{2}{\pi}\left[-\frac{\pi\cos k\pi}{k} + \frac{\sin k\pi}{k^2}\right] = \frac{2}{\pi}\cdot\frac{-\pi(-1)^k}{k} = \frac{2(-1)^{k+1}}{k}$$

$$\boxed{b_k = \frac{2(-1)^{k+1}}{k}}$$

すなわち:

$$T(x) = 2\left(\sin x - \frac{\sin 2x}{2} + \frac{\sin 3x}{3} - \frac{\sin 4x}{4} + \cdots\right)$$

**比較**:

| | 平方波 \(SW(x)\) | 三角波 \(T(x) = x\) |
|---|---|---|
| 減衰率 | \(b_k \sim 1/k\) | \(b_k \sim 1/k\) |
| 非零の \(k\) | 奇数のみ | 全ての \(k\) |
| 不連続 | あり（\(x=0, \pi\)） | なし（連続だが角がある） |

**核心**: \(T(x) = x\) は \([0, \pi]\) では連続だが、奇拡張で \(x = \pm\pi\) にジャンプが生じる。そのため減衰率は \(1/k\) のまま。真に滑らかな関数なら \(1/k^2\) 以上で減衰する。

---

## 問題 3 — ギブス現象の定量化

**問題**: 平方波の部分和 \(S_N(x)\) が不連続点付近で示すオーバーシュートを定量化せよ。\(N \to \infty\) で消えるか？

**回答**:

部分和 \(S_N(x) = \frac{4}{\pi}\sum_{n=0}^{N} \frac{\sin(2n+1)x}{2n+1}\) の最大値は \(x = \pi/(N+1)\) 付近で生じる。

この点での値を評価する。リーマン和から積分への移行により:

$$S_N\!\left(\frac{\pi}{N+1}\right) \approx \frac{2}{\pi}\int_0^{\pi}\frac{\sin t}{t}\,dt = \frac{2}{\pi}\operatorname{Si}(\pi)$$

正弦積分の値: \(\operatorname{Si}(\pi) = \int_0^{\pi}\frac{\sin t}{t}\,dt \approx 1.8519\)

$$\boxed{S_N\!\left(\frac{\pi}{N+1}\right) \approx \frac{2}{\pi}\operatorname{Si}(\pi) \approx \frac{2 \times 1.8519}{3.1416} \approx 1.1790}$$

不連続点でのジャンプ先の値は \(1\) なので、**オーバーシュートは約 \(9\%\)**。

$$\text{オーバーシュート} = \frac{1.179 - 1}{1} \approx 8.95\%$$

**重要**: この \(9\%\) のオーバーシュートは \(N \to \infty\) でも**消えない**。\(N\) が大きくなるとオーバーシュートの位置は不連続点に近づくが、高さは一定のまま。これがギブス現象の本質。

**核心**: フーリエ部分和は不連続点の近傍で常に約 \(9\%\) のオーバーシュートを示す。各点収束とは異なり、一様収束は不連続点では成立しない。

---

## 問題 4 — 繰り返しランプ \(RR(x)\) と up-down \(UD(x)\) の余弦係数

**問題**: 繰り返しランプ \(RR(x) = |x|\)（\(-\pi < x < \pi\)）と、その微分 up-down 関数 \(UD(x)\) のフーリエ余弦係数を求めよ。

**回答**:

**\(RR(x) = |x|\)**: 偶関数なので余弦級数のみ。

$$a_0 = \frac{1}{2\pi}\int_{-\pi}^{\pi}|x|\,dx = \frac{1}{2\pi}\cdot 2\int_0^{\pi}x\,dx = \frac{1}{2\pi}\cdot\pi^2 = \frac{\pi}{2}$$

$$a_k = \frac{1}{\pi}\int_{-\pi}^{\pi}|x|\cos kx\,dx = \frac{2}{\pi}\int_0^{\pi}x\cos kx\,dx$$

部分積分:

$$a_k = \frac{2}{\pi}\left[\frac{x\sin kx}{k}\bigg|_0^{\pi} - \frac{1}{k}\int_0^{\pi}\sin kx\,dx\right] = \frac{2}{\pi}\left[0 + \frac{\cos kx}{k^2}\bigg|_0^{\pi}\right] = \frac{2}{\pi k^2}((-1)^k - 1)$$

- \(k\) 奇数: \(a_k = -\dfrac{4}{\pi k^2}\)
- \(k\) 偶数: \(a_k = 0\)

$$\boxed{RR(x) = \frac{\pi}{2} - \frac{4}{\pi}\sum_{n=0}^{\infty}\frac{\cos(2n+1)x}{(2n+1)^2} = \frac{\pi}{2} - \frac{4}{\pi}\left(\cos x + \frac{\cos 3x}{9} + \frac{\cos 5x}{25} + \cdots\right)}$$

**\(UD(x)\)**: \(RR(x)\) の微分。\(UD(x) = -1\)（\(-\pi < x < 0\)）、\(UD(x) = +1\)（\(0 < x < \pi\)）。

項別微分により:

$$UD(x) = \frac{4}{\pi}\sum_{n=0}^{\infty}\frac{\sin(2n+1)x}{2n+1}$$

これは Problem 1 の平方波と同じ！ **係数は \(1/k\) 減衰**（不連続だから）。

**核心**: 微分と係数減衰の対応。連続な \(RR(x)\) の係数は \(1/k^2\) 減衰。その微分 \(UD(x)\) は不連続で係数は \(1/k\) 減衰。微分するたびに \(k\) が1つ掛かり、減衰が1段階遅くなる。

---

## 問題 5 — 方形パルスのフーリエ係数

**問題**: 方形パルス \(F(x) = 1\)（\(0 < x < h\)）、\(F(x) = 0\)（\(h < x < 2\pi\)）のフーリエ係数を求めよ。

**回答**:

周期 \(2\pi\) のフーリエ係数:

$$a_0 = \frac{1}{2\pi}\int_0^{2\pi}F(x)\,dx = \frac{1}{2\pi}\int_0^{h}1\,dx = \frac{h}{2\pi}$$

$$a_k = \frac{1}{\pi}\int_0^{h}\cos kx\,dx = \frac{1}{\pi}\left[\frac{\sin kx}{k}\right]_0^{h} = \frac{\sin kh}{\pi k}$$

$$b_k = \frac{1}{\pi}\int_0^{h}\sin kx\,dx = \frac{1}{\pi}\left[-\frac{\cos kx}{k}\right]_0^{h} = \frac{1-\cos kh}{\pi k}$$

$$\boxed{a_0 = \frac{h}{2\pi}, \quad a_k = \frac{\sin kh}{\pi k}, \quad b_k = \frac{1 - \cos kh}{\pi k}}$$

**減衰率**: \(a_k, b_k \sim 1/k\)。\(F(x)\) は不連続（\(x=0\) と \(x=h\) でジャンプ）なので \(1/k\) 減衰。

**特殊ケース**: \(h = \pi\) とすると \(\sin k\pi = 0\) なので \(a_k = 0\)、\(b_k = (1-\cos k\pi)/(\pi k)\)。これは平方波の係数に帰着する。

**核心**: パルス幅 \(h\) が狭いほど、周波数成分は広がる（時間-周波数の不確定性原理の離散版）。

---

## 問題 6 — パーセバルの等式の検証

**問題**: パーセバルの等式を平方波 \(SW(x)\) で検証せよ。導かれる数値的恒等式は何か。

**回答**:

パーセバルの等式:

$$\frac{1}{\pi}\int_{-\pi}^{\pi}|f(x)|^2\,dx = 2a_0^2 + \sum_{k=1}^{\infty}(a_k^2 + b_k^2)$$

（あるいは正弦級数版として）:

$$\frac{2}{\pi}\int_0^{\pi}|f(x)|^2\,dx = \sum_{k=1}^{\infty}b_k^2$$

**左辺**: 平方波は \(|SW(x)| = 1\) なので:

$$\frac{2}{\pi}\int_0^{\pi}1^2\,dx = \frac{2}{\pi}\cdot\pi = 2$$

**右辺**: \(b_k = 4/(\pi k)\)（\(k\) 奇数）、\(b_k = 0\)（\(k\) 偶数）より:

$$\sum_{k=1}^{\infty}b_k^2 = \sum_{n=0}^{\infty}\frac{16}{\pi^2(2n+1)^2} = \frac{16}{\pi^2}\sum_{n=0}^{\infty}\frac{1}{(2n+1)^2}$$

等号 \(2 = \dfrac{16}{\pi^2}\sum\dfrac{1}{(2n+1)^2}\) より:

$$\boxed{\sum_{n=0}^{\infty}\frac{1}{(2n+1)^2} = 1 + \frac{1}{9} + \frac{1}{25} + \frac{1}{49} + \cdots = \frac{\pi^2}{8}}$$

これは有名な恒等式。さらに全ての正の整数について:

$$\sum_{k=1}^{\infty}\frac{1}{k^2} = \underbrace{\sum_{\text{奇数}}}_{\pi^2/8} + \underbrace{\sum_{\text{偶数}}}_{(1/4)\sum 1/k^2} \implies \frac{3}{4}\sum\frac{1}{k^2} = \frac{\pi^2}{8} \implies \sum_{k=1}^{\infty}\frac{1}{k^2} = \frac{\pi^2}{6}$$

**核心**: パーセバルの等式は「時間領域のエネルギー ＝ 周波数領域のエネルギー」。具体的な関数に適用すると数論的恒等式が得られる。

---

## 問題 7 — \(N=4\) の離散フーリエ変換 (DFT)

**問題**: \(c = (1, 0, -1, 0)\) に対して \(N=4\) の DFT \(\hat{c} = F_4 c\) を計算せよ。逆変換で確認せよ。

**回答**:

\(N=4\) の DFT 行列。\(\omega = e^{2\pi i/4} = i\):

$$F_4 = \begin{bmatrix} 1 & 1 & 1 & 1 \\ 1 & i & i^2 & i^3 \\ 1 & i^2 & i^4 & i^6 \\ 1 & i^3 & i^6 & i^9 \end{bmatrix} = \begin{bmatrix} 1 & 1 & 1 & 1 \\ 1 & i & -1 & -i \\ 1 & -1 & 1 & -1 \\ 1 & -i & -1 & i \end{bmatrix}$$

計算:

$$\hat{c} = F_4 \begin{pmatrix}1\\0\\-1\\0\end{pmatrix} = \begin{pmatrix}1+0-1+0\\1+0+1+0\\1+0-1+0\\1+0+1+0\end{pmatrix} = \begin{pmatrix}0\\2\\0\\2\end{pmatrix}$$

$$\boxed{\hat{c} = (0, 2, 0, 2)}$$

**逆変換で確認**: \(F_4^{-1} = \frac{1}{4}\overline{F_4}\):

$$c = \frac{1}{4}\overline{F_4}\hat{c} = \frac{1}{4}\begin{bmatrix}1&1&1&1\\1&-i&-1&i\\1&-1&1&-1\\1&i&-1&-i\end{bmatrix}\begin{pmatrix}0\\2\\0\\2\end{pmatrix} = \frac{1}{4}\begin{pmatrix}4\\0\\-4\\0\end{pmatrix} = \begin{pmatrix}1\\0\\-1\\0\end{pmatrix} \checkmark$$

**核心**: DFT は \(F_N\) による行列ベクトル積。逆変換は \(\frac{1}{N}\overline{F_N}\)。\(F_N\) はユニタリ（\(\frac{1}{\sqrt{N}}F_N\) が）。

---

## 問題 8 — 畳み込み定理の証明

**問題**: フーリエ変換における畳み込み定理 \(\widehat{f * g}(k) = \hat{f}(k)\cdot\hat{g}(k)\) を証明せよ。

**回答**:

畳み込みの定義:

$$(f * g)(x) = \int_{-\infty}^{\infty} f(t) \, g(x-t) \, dt$$

そのフーリエ変換:

$$\widehat{f*g}(k) = \int_{-\infty}^{\infty}\left[\int_{-\infty}^{\infty}f(t)\,g(x-t)\,dt\right]e^{-ikx}\,dx$$

積分順序を交換し、変数変換 \(s = x - t\)（\(dx = ds\)）:

$$= \int_{-\infty}^{\infty}f(t)\left[\int_{-\infty}^{\infty}g(s)\,e^{-ik(s+t)}\,ds\right]dt$$

$$= \int_{-\infty}^{\infty}f(t)\,e^{-ikt}\,dt \cdot \int_{-\infty}^{\infty}g(s)\,e^{-iks}\,ds$$

$$\boxed{\widehat{f*g}(k) = \hat{f}(k)\cdot\hat{g}(k)}$$

**逆の関係**: 周波数領域の畳み込みは時間領域の積に対応:

$$\widehat{f \cdot g}(k) = \frac{1}{2\pi}(\hat{f} * \hat{g})(k)$$

**核心**: 畳み込み定理はフーリエ解析の最も強力な道具。時間領域の畳み込み（\(O(N^2)\)）を周波数領域の点ごとの積（\(O(N)\)）に変える。FFT と組み合わせて \(O(N \log N)\) で畳み込みが計算可能。

---

## 問題 9 — デコンボリューション

**問題**: 畳み込み \(h = f * g\) から、\(g\) が既知のとき \(f\) を復元する「デコンボリューション」を論ぜよ。困難点と正則化を説明せよ。

**回答**:

**素朴なアプローチ**: 畳み込み定理より周波数領域で:

$$\hat{h}(k) = \hat{f}(k)\cdot\hat{g}(k) \implies \hat{f}(k) = \frac{\hat{h}(k)}{\hat{g}(k)}$$

**困難点**: \(\hat{g}(k)\) が高周波で小さくなると（ぼかし・低域通過フィルタの場合）、割り算でノイズが爆発的に増幅される。

$$\hat{f}(k) = \frac{\hat{h}(k)}{\hat{g}(k)} \approx \frac{\text{信号} + \text{ノイズ}}{\text{小さな値}} \to \text{発散}$$

**正則化** (Wiener / Tikhonov):

$$\boxed{\hat{f}_{\text{reg}}(k) = \frac{\overline{\hat{g}(k)}}{|\hat{g}(k)|^2 + \alpha}\cdot\hat{h}(k)}$$

- \(\alpha > 0\) は正則化パラメータ
- \(|\hat{g}(k)| \gg \sqrt{\alpha}\) のとき: \(\hat{f}_{\text{reg}} \approx \hat{h}/\hat{g}\)（通常の逆畳み込み）
- \(|\hat{g}(k)| \ll \sqrt{\alpha}\) のとき: \(\hat{f}_{\text{reg}} \approx 0\)（ノイズ増幅を抑制）

**核心**: 逆問題は本質的に不良設定（ill-posed）。フーリエ領域での割り算は小さな分母でノイズを増幅する。正則化はバイアス-バリアンスのトレードオフで安定性を確保する。

---

## 問題 10 — デルタ関数 \(\delta(x)\) のフーリエ係数

**問題**: 周期 \(2\pi\) のデルタ関数 \(\delta(x)\) のフーリエ係数を求めよ。

**回答**:

$$a_0 = \frac{1}{2\pi}\int_{-\pi}^{\pi}\delta(x)\,dx = \frac{1}{2\pi}$$

$$a_k = \frac{1}{\pi}\int_{-\pi}^{\pi}\delta(x)\cos kx\,dx = \frac{\cos 0}{\pi} = \frac{1}{\pi}$$

$$b_k = \frac{1}{\pi}\int_{-\pi}^{\pi}\delta(x)\sin kx\,dx = \frac{\sin 0}{\pi} = 0$$

複素形式では:

$$c_k = \frac{1}{2\pi}\int_{-\pi}^{\pi}\delta(x)\,e^{-ikx}\,dx = \frac{1}{2\pi}$$

よって:

$$\boxed{\delta(x) = \frac{1}{2\pi} + \frac{1}{\pi}\sum_{k=1}^{\infty}\cos kx = \frac{1}{2\pi}\sum_{k=-\infty}^{\infty}e^{ikx}}$$

**注意**: この等式は**弱い意味**（超関数の意味）で成立する。右辺の級数は通常の意味では収束しない。任意の滑らかな関数 \(\varphi(x)\) を掛けて積分すると:

$$\int_{-\pi}^{\pi}\delta(x)\varphi(x)\,dx = \varphi(0) = \frac{1}{2\pi}\sum_{k=-\infty}^{\infty}\int_{-\pi}^{\pi}e^{ikx}\varphi(x)\,dx$$

**核心**: デルタ関数は全ての周波数を等しく含む（「白色スペクトル」）。係数は一定値 \(1/(2\pi)\) で、減衰しない。これはデルタ関数が最も特異な「関数」であることの反映。

---

## 問題 11 — \(f(x) = x\) on \([-\pi, \pi]\) の完全フーリエ級数

**問題**: \(f(x) = x\)（\(-\pi < x < \pi\)）の完全フーリエ級数（複素形式と実形式）を求めよ。

**回答**:

\(f(x) = x\) は**奇関数**なので \(a_0 = 0\)、\(a_k = 0\)。正弦係数のみ残る。

$$b_k = \frac{1}{\pi}\int_{-\pi}^{\pi}x\sin kx\,dx = \frac{2}{\pi}\int_0^{\pi}x\sin kx\,dx$$

部分積分（Problem 2 と同じ計算）:

$$b_k = \frac{2}{\pi}\left[-\frac{x\cos kx}{k}\bigg|_0^{\pi} + \frac{\sin kx}{k^2}\bigg|_0^{\pi}\right] = \frac{2}{\pi}\cdot\frac{-\pi(-1)^k}{k} = \frac{2(-1)^{k+1}}{k}$$

$$\boxed{x = 2\sum_{k=1}^{\infty}\frac{(-1)^{k+1}}{k}\sin kx = 2\left(\sin x - \frac{\sin 2x}{2} + \frac{\sin 3x}{3} - \cdots\right)}$$

**複素形式**: \(c_k = \frac{1}{2\pi}\int_{-\pi}^{\pi}x\,e^{-ikx}\,dx\)

\(k \neq 0\) の場合、部分積分:

$$c_k = \frac{1}{2\pi}\left[\frac{x\,e^{-ikx}}{-ik}\bigg|_{-\pi}^{\pi} - \frac{1}{-ik}\int_{-\pi}^{\pi}e^{-ikx}\,dx\right] = \frac{1}{2\pi}\cdot\frac{-2\pi(-1)^k}{ik} = \frac{(-1)^{k+1}}{ik} = \frac{i(-1)^k}{k}$$

$$x = \sum_{k \neq 0}\frac{i(-1)^k}{k}e^{ikx}$$

**核心**: \(f(x) = x\) の周期拡張は \(x = \pm\pi\) でジャンプするため \(b_k \sim 1/k\)。Problem 2 の \(T(x) = x\) on \([0,\pi]\) と同じ係数。

---

## 問題 12 — フーリエ級数の項別微分

**問題**: フーリエ級数の微分と係数減衰率の関係を説明せよ。

**回答**:

\(f(x) = \sum b_k \sin kx\) を項別微分すると:

$$f'(x) = \sum k\,b_k \cos kx$$

すなわち、\(f'\) の余弦係数は \(k \cdot b_k\)。

**滑らかさ ↔ 係数減衰の対応**:

| 関数の性質 | フーリエ係数の減衰 |
|---|---|
| 不連続（ジャンプあり） | \(\sim 1/k\) |
| 連続だが微分不可能（角あり） | \(\sim 1/k^2\) |
| \(C^1\)（1回微分可能） | \(\sim 1/k^3\) |
| \(C^{m}\)（\(m\) 回微分可能） | \(\sim 1/k^{m+1}\) （\(m+1\) 階微分が不連続）|
| \(C^{\infty}\) | 任意の \(k^{-n}\) より速い |
| 解析的 | 指数的減衰 \(\sim e^{-\alpha k}\) |

**例**:

- 平方波: 不連続 → \(b_k \sim 1/k\)
- 三角波 \(|x|\): 連続・角あり → \(a_k \sim 1/k^2\)
- 放物線 \(x^2\): \(C^1\) → \(a_k \sim 1/k^2\)（周期拡張で角）

**逆方向**: 微分すると \(b_k \to kb_k\)、積分すると \(b_k \to b_k/k\)。微分で減衰が1段遅くなり、積分で1段速くなる。

**核心**: フーリエ係数の減衰率は関数の滑らかさの正確な指標。数値計算ではスペクトル法の収束速度を決定する。

---

## 問題 13 — \(N=8\) の DFT 行列と FFT

**問題**: \(N=8\) の DFT 行列 \(F_8\) の構造と、FFT（高速フーリエ変換）のバタフライ構造を説明せよ。

**回答**:

\(\omega = e^{2\pi i/8} = e^{i\pi/4} = \frac{1+i}{\sqrt{2}}\) として:

$$[F_8]_{jk} = \omega^{jk}, \quad j,k = 0, 1, \ldots, 7$$

**逆行列**: \(F_8^{-1} = \frac{1}{8}\overline{F_8}\)

**FFT の鍵**: \(F_8\) を偶数番目と奇数番目に分解:

$$F_8 \begin{pmatrix}c_0\\c_1\\c_2\\c_3\\c_4\\c_5\\c_6\\c_7\end{pmatrix} = \begin{bmatrix}I_4 & D_4 \\ I_4 & -D_4\end{bmatrix}\begin{bmatrix}F_4 & 0 \\ 0 & F_4\end{bmatrix}\begin{bmatrix}c_{\text{even}}\\c_{\text{odd}}\end{bmatrix}$$

ここで \(D_4 = \operatorname{diag}(1, \omega, \omega^2, \omega^3)\)。

**バタフライ演算**:

$$\begin{cases} \hat{c}_j = \hat{c}_j^{\text{even}} + \omega^j \hat{c}_j^{\text{odd}} \\ \hat{c}_{j+4} = \hat{c}_j^{\text{even}} - \omega^j \hat{c}_j^{\text{odd}} \end{cases} \quad (j = 0,1,2,3)$$

**計算量**:

- 直接計算: \(O(N^2) = O(64)\)
- FFT: \(O(N \log_2 N) = O(8 \cdot 3) = O(24)\)

再帰的に \(F_4\) も分解 → \(F_2\) まで分解。\(\log_2 8 = 3\) 段のバタフライ。

**核心**: FFT は DFT 行列の再帰的分解。\(O(N^2)\) を \(O(N\log N)\) にする。\(N = 2^m\) が最も効率的（Cooley-Tukey アルゴリズム）。

---

## 問題 14 — 巡回行列の対角化

**問題**: 巡回行列 \(C\) が \(C = F^{-1}\Lambda F\) と対角化できることを示し、畳み込みとの関係を説明せよ。

**回答**:

**巡回行列**: 第1行が \((c_0, c_1, \ldots, c_{N-1})\) のとき、各行は前行の巡回シフト:

$$C = \begin{bmatrix}c_0 & c_1 & c_2 & \cdots & c_{N-1}\\ c_{N-1} & c_0 & c_1 & \cdots & c_{N-2}\\ c_{N-2} & c_{N-1} & c_0 & \cdots & c_{N-3}\\ \vdots & & & \ddots & \vdots\\ c_1 & c_2 & c_3 & \cdots & c_0\end{bmatrix}$$

**固有ベクトル**: DFT 行列 \(F_N\) の列 \(f_k = (1, \omega^k, \omega^{2k}, \ldots, \omega^{(N-1)k})^T\)。

$$Cf_k = \lambda_k f_k, \quad \lambda_k = \sum_{j=0}^{N-1}c_j\,\omega^{jk} = \hat{c}_k$$

よって:

$$\boxed{C = F_N^{-1}\Lambda F_N, \quad \Lambda = \operatorname{diag}(\hat{c}_0, \hat{c}_1, \ldots, \hat{c}_{N-1})}$$

**畳み込みとの関係**: \(Cx = c \circledast x\)（巡回畳み込み）。

$$c \circledast x = F^{-1}(\hat{c} \odot \hat{x})$$

**高速計算**: \(O(N\log N)\) で計算可能（3回の FFT）:

1. \(\hat{c} = F c\)（\(O(N\log N)\)）
2. \(\hat{x} = F x\)（\(O(N\log N)\)）
3. \(\hat{c} \odot \hat{x}\)（\(O(N)\)）
4. \(F^{-1}(\hat{c}\odot\hat{x})\)（\(O(N\log N)\)）

**核心**: 全ての巡回行列は同じ固有ベクトル（フーリエ基底）を共有する。固有値は第1行の DFT。これが「FFT で畳み込みを高速化」の数学的基盤。

---

## 問題 15 — \(1/(2 - \cos x)\) のフーリエ係数

**問題**: \(f(x) = 1/(2 - \cos x)\) のフーリエ係数を求めよ。減衰率を論ぜよ。

**回答**:

\(z = e^{ix}\) とおくと \(\cos x = (z + z^{-1})/2\):

$$\frac{1}{2 - \cos x} = \frac{1}{2 - (z + z^{-1})/2} = \frac{2}{4 - z - z^{-1}} = \frac{2z}{-z^2 + 4z - 1}$$

分母を因数分解: \(z^2 - 4z + 1 = 0\) の根は \(z = 2 \pm \sqrt{3}\)。

部分分数展開と幾何級数を利用して:

$$\frac{1}{2 - \cos x} = \frac{1}{\sqrt{3}}\sum_{k=-\infty}^{\infty}r^{|k|}e^{ikx}, \quad r = 2 - \sqrt{3} = \frac{1}{2+\sqrt{3}}$$

実数形式:

$$a_0 = \frac{1}{2\sqrt{3}}, \quad a_k = \frac{2}{\sqrt{3}}(2 - \sqrt{3})^k$$

$$\boxed{a_k = \frac{2}{\sqrt{3}}(2-\sqrt{3})^k \approx \frac{2}{\sqrt{3}}(0.2679)^k}$$

**減衰率**: **指数的減衰** \(\sim r^k\)（\(r = 2 - \sqrt{3} \approx 0.268\)）。

**理由**: \(f(x) = 1/(2 - \cos x)\) は実軸上で解析的（\(2 - \cos x > 0\) for all real \(x\)）。解析関数のフーリエ係数は指数的に減衰する。特異点が虚軸方向 \(\pm i\ln(2+\sqrt{3})\) にあり、そこまでの距離が減衰率を決める。

**核心**: 解析関数 → 指数的減衰。特異点の複素平面での位置が減衰率を支配する。スペクトル法ではこのような関数に対して「超高速収束」が得られる。

---

## 問題 16 — 平方波の部分和のスケッチ

**問題**: 平方波のフーリエ部分和 \(S_1(x), S_3(x), S_5(x)\) をスケッチせよ。ギブス振動を観察せよ。

**回答**:

$$S_1(x) = \frac{4}{\pi}\sin x$$

$$S_3(x) = \frac{4}{\pi}\left(\sin x + \frac{\sin 3x}{3}\right)$$

$$S_5(x) = \frac{4}{\pi}\left(\sin x + \frac{\sin 3x}{3} + \frac{\sin 5x}{5}\right)$$

**スケッチの要点**:

- **\(S_1\)**: 単純な正弦波。振幅 \(4/\pi \approx 1.27\)。平方波の大まかな形。
- **\(S_3\)**: 角がより鋭くなる。不連続点付近にわずかな振動（リプル）が出現。
- **\(S_5\)**: さらに平方波に近づく。不連続点付近のオーバーシュートがより鮮明に。

**ギブス振動の観察**:

1. 項数を増やすほど平坦部分は \(\pm 1\) に近づく
2. 不連続点 \(x = 0, \pi\) 付近のオーバーシュートは**高さ約 9%** のまま（Problem 3）
3. オーバーシュートの「幅」は狭くなるが「高さ」は一定
4. 中点 \(x = 0, \pi\) では常に \(0\)（不連続の中間値）

**核心**: 有限項のフーリエ近似は不連続点でギブス振動を避けられない。信号処理ではウィンドウ関数（ハニング、ブラックマン等）でギブス現象を軽減する。

---

## 問題 17 — ライプニッツ級数

**問題**: 平方波のフーリエ級数で \(x = \pi/2\) とおき、ライプニッツの公式を導け。

**回答**:

Problem 1 の結果:

$$SW(x) = \frac{4}{\pi}\left(\sin x + \frac{\sin 3x}{3} + \frac{\sin 5x}{5} + \cdots\right)$$

\(x = \pi/2\) で \(SW(\pi/2) = 1\)。また:

$$\sin\frac{\pi}{2} = 1, \quad \sin\frac{3\pi}{2} = -1, \quad \sin\frac{5\pi}{2} = 1, \quad \sin\frac{7\pi}{2} = -1, \ldots$$

代入:

$$1 = \frac{4}{\pi}\left(1 - \frac{1}{3} + \frac{1}{5} - \frac{1}{7} + \cdots\right)$$

$$\boxed{\frac{\pi}{4} = 1 - \frac{1}{3} + \frac{1}{5} - \frac{1}{7} + \cdots = \sum_{n=0}^{\infty}\frac{(-1)^n}{2n+1}}$$

これが**ライプニッツ級数**（Gregory-Leibniz 級数）。\(\pi\) を表す最も有名な無限級数の一つ。

**収束の遅さ**: 交代級数なので収束するが、\(1/k\) の減衰のため非常に遅い。6桁の精度に \(10^6\) 項以上必要。

**核心**: フーリエ級数の特定の点での値が数論的恒等式を生む。\(x = \pi/2\) は「ちょうど良い」点で、\(\sin k\pi/2\) が \(0, \pm 1\) の値を交互にとる。

---

## 問題 18 — パーセバルから \(\pi^2/8\)

**問題**: パーセバルの等式から \(\pi^2/8 = 1 + 1/9 + 1/25 + \cdots\) を導け。

**回答**:

これは Problem 6 で導出済み。改めて整理する。

平方波のフーリエ係数: \(b_k = 4/(\pi k)\)（\(k\) 奇数）、\(b_k = 0\)（\(k\) 偶数）。

パーセバルの等式（半区間版）:

$$\frac{2}{\pi}\int_0^{\pi}|SW(x)|^2\,dx = \sum_{k=1}^{\infty}b_k^2$$

左辺: \(\dfrac{2}{\pi}\cdot\pi = 2\)

右辺:

$$\sum_{k \text{ odd}} \frac{16}{\pi^2 k^2} = \frac{16}{\pi^2}\left(1 + \frac{1}{9} + \frac{1}{25} + \frac{1}{49} + \cdots\right)$$

等号:

$$2 = \frac{16}{\pi^2}\sum_{n=0}^{\infty}\frac{1}{(2n+1)^2}$$

$$\boxed{\sum_{n=0}^{\infty}\frac{1}{(2n+1)^2} = 1 + \frac{1}{9} + \frac{1}{25} + \frac{1}{49} + \cdots = \frac{\pi^2}{8}}$$

**関連**: Problem 6 で示した通り、ここからバーゼル問題 \(\sum 1/k^2 = \pi^2/6\) も導ける。

**核心**: パーセバルの等式はエネルギー保存の別表現。具体的な関数に適用すると無限級数の和が閉じた形で得られる。

---

## 問題 19 — \(f(x) = x^2\) on \([-\pi, \pi]\) のフーリエ級数

**問題**: \(f(x) = x^2\)（\(-\pi < x < \pi\)）のフーリエ級数を求めよ。

**回答**:

\(f(x) = x^2\) は**偶関数**なので \(b_k = 0\)。余弦係数のみ。

**定数項**:

$$a_0 = \frac{1}{2\pi}\int_{-\pi}^{\pi}x^2\,dx = \frac{1}{2\pi}\cdot\frac{2\pi^3}{3} = \frac{\pi^2}{3}$$

**余弦係数** (\(k \geq 1\)):

$$a_k = \frac{1}{\pi}\int_{-\pi}^{\pi}x^2\cos kx\,dx = \frac{2}{\pi}\int_0^{\pi}x^2\cos kx\,dx$$

2回の部分積分:

$$\int_0^{\pi}x^2\cos kx\,dx = \left[\frac{x^2\sin kx}{k}\right]_0^{\pi} - \frac{2}{k}\int_0^{\pi}x\sin kx\,dx$$

$$= 0 - \frac{2}{k}\left[-\frac{x\cos kx}{k}\bigg|_0^{\pi} + \frac{1}{k}\int_0^{\pi}\cos kx\,dx\right]$$

$$= -\frac{2}{k}\left[-\frac{\pi(-1)^k}{k} + 0\right] = \frac{2\pi(-1)^k}{k^2}$$

よって:

$$a_k = \frac{2}{\pi}\cdot\frac{2\pi(-1)^k}{k^2} = \frac{4(-1)^k}{k^2}$$

$$\boxed{x^2 = \frac{\pi^2}{3} + 4\sum_{k=1}^{\infty}\frac{(-1)^k}{k^2}\cos kx = \frac{\pi^2}{3} - 4\left(\cos x - \frac{\cos 2x}{4} + \frac{\cos 3x}{9} - \cdots\right)}$$

**減衰率**: \(a_k \sim 1/k^2\)。\(x^2\) は連続だが周期拡張で微分が不連続（\(x = \pm\pi\) で傾きが \(\pm 2\pi\) から \(\mp 2\pi\) にジャンプ）→ \(1/k^2\) 減衰。

**核心**: 偶関数なので余弦のみ。\(1/k^2\) 減衰は連続性の反映。次の Problem 20 で重要な恒等式が得られる。

---

## 問題 20 — バーゼル問題 \(\sum 1/k^2 = \pi^2/6\)

**問題**: Problem 19 の結果で \(x = \pi\) とおき、バーゼル問題の解を導け。

**回答**:

Problem 19 の結果:

$$x^2 = \frac{\pi^2}{3} + 4\sum_{k=1}^{\infty}\frac{(-1)^k\cos kx}{k^2}$$

\(x = \pi\) を代入。\(\cos k\pi = (-1)^k\) より:

$$\pi^2 = \frac{\pi^2}{3} + 4\sum_{k=1}^{\infty}\frac{(-1)^k\cdot(-1)^k}{k^2} = \frac{\pi^2}{3} + 4\sum_{k=1}^{\infty}\frac{1}{k^2}$$

$$\pi^2 - \frac{\pi^2}{3} = 4\sum_{k=1}^{\infty}\frac{1}{k^2}$$

$$\frac{2\pi^2}{3} = 4\sum_{k=1}^{\infty}\frac{1}{k^2}$$

$$\boxed{\sum_{k=1}^{\infty}\frac{1}{k^2} = 1 + \frac{1}{4} + \frac{1}{9} + \frac{1}{16} + \cdots = \frac{\pi^2}{6}}$$

これが**バーゼル問題**（1734年、オイラーが解決）。

**別の代入**: \(x = 0\) とすると \(\cos 0 = 1\) より:

$$0 = \frac{\pi^2}{3} + 4\sum_{k=1}^{\infty}\frac{(-1)^k}{k^2} \implies \sum_{k=1}^{\infty}\frac{(-1)^{k+1}}{k^2} = \frac{\pi^2}{12}$$

**Problem 6, 18 との整合性**:

$$\sum_{\text{奇数}}\frac{1}{k^2} = \frac{\pi^2}{8}, \quad \sum_{\text{偶数}}\frac{1}{k^2} = \frac{1}{4}\cdot\frac{\pi^2}{6} = \frac{\pi^2}{24}$$

$$\frac{\pi^2}{8} + \frac{\pi^2}{24} = \frac{3\pi^2 + \pi^2}{24} = \frac{4\pi^2}{24} = \frac{\pi^2}{6} \checkmark$$

**核心**: フーリエ級数の特定の点での値から、数論の有名問題が解ける。オイラーの方法の現代的理解。\(\zeta(2) = \pi^2/6\) はリーマンゼータ関数の最初の非自明な値。

---

# まとめ — Problem Set 4.1 の全体像

| テーマ | 問題番号 | キーワード |
|---|---|---|
| **基本的なフーリエ係数** | 1, 2, 5, 10, 11, 19 | 正弦・余弦係数の計算 |
| **ギブス現象** | 3, 16 | 9% オーバーシュート、部分和 |
| **滑らかさと減衰** | 4, 12, 15 | \(1/k\), \(1/k^2\), 指数的減衰 |
| **パーセバル・数論** | 6, 17, 18, 20 | \(\pi^2/8\), \(\pi/4\), \(\pi^2/6\) |
| **DFT・FFT** | 7, 13 | 離散フーリエ変換、バタフライ |
| **畳み込み** | 8, 9, 14 | 畳み込み定理、デコンボリューション、巡回行列 |

**中心思想**: フーリエ級数は「関数 ↔ 周波数成分」の対応。滑らかさが減衰率を決め、エネルギー保存（パーセバル）が成り立ち、畳み込みが積になる。DFT/FFT はこれの離散版で計算科学の基盤。
