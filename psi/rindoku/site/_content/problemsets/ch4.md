# Chapter 4: Fourier Series and Integrals — 主要問題回答集

> フーリエ係数・直交性・Gibbs 現象・FFT の核心を確認する7問。

---

## PS 4.1 — Problem 1: 平方波のフーリエ正弦係数

**問題**: 奇関数の平方波 SW(x) = 1（0 < x < π）のフーリエ正弦係数 bₖ を求めよ。

**回答**:

$$b_k = \frac{2}{\pi}\int_0^\pi 1 \cdot \sin kx \, dx = \frac{2}{\pi}\left[\frac{-\cos kx}{k}\right]_0^\pi = \frac{2}{\pi k}(1 - \cos k\pi)$$

cos kπ = (−1)ᵏ なので:

$$b_k = \begin{cases} 4/(\pi k) & k \text{ 奇数} \\ 0 & k \text{ 偶数} \end{cases}$$

$$SW(x) = \frac{4}{\pi}\left(\frac{\sin x}{1} + \frac{\sin 3x}{3} + \frac{\sin 5x}{5} + \cdots\right)$$

**核心**: 不連続関数の係数は 1/k でしか減衰しない。これが Gibbs 現象の根本原因。滑らかな関数なら係数はもっと速く減衰する。

---

## PS 4.1 — Problem 3: 三角波のフーリエ係数

**問題**: 三角波 T(x) = x（0 < x < π, 奇拡張）のフーリエ正弦係数を求め、平方波の係数と比較せよ。

**回答**:

$$b_k = \frac{2}{\pi}\int_0^\pi x \sin kx \, dx$$

部分積分: ∫ x sin kx dx = −x cos kx/k + sin kx/k²。

$$b_k = \frac{2}{\pi}\left[\frac{-\pi\cos k\pi}{k}\right] = \frac{2(-1)^{k+1}}{k}$$

$$T(x) = 2\left(\frac{\sin x}{1} - \frac{\sin 2x}{2} + \frac{\sin 3x}{3} - \cdots\right)$$

**比較**:
| 関数 | 滑らかさ | bₖ の減衰 | Gibbs |
|---|---|---|---|
| 平方波（不連続） | C⁻¹ | O(1/k) | あり |
| 三角波（連続、角あり） | C⁰ | O(1/k) | 軽減 |
| 放物線（滑らか） | C¹ | O(1/k²) | なし |

**核心**: 滑らかさが係数の減衰率を決める。微分するたびに係数に k が掛かる（= 減衰が1段遅くなる）。

---

## PS 4.1 — Gibbs 現象の定量化

**問題**: 平方波の部分和 Sₙ(x) = Σᵏ₌₁ⁿ bₖ sin kx の最大値が、N→∞ で約 1.09 に近づくことを示せ（Gibbs の高さ ≈ 9%）。

**回答**:

不連続点 x=0 の近くで、部分和の最大は x ≈ π/(N+1) で達成される。

$$S_N\left(\frac{\pi}{N+1}\right) \approx \frac{2}{\pi}\int_0^\pi \frac{\sin t}{t} dt \approx \frac{2}{\pi}(1.8519) \approx 1.179$$

正確な Gibbs 比: Si(π)/π·2 ≈ 1.0895...

項数を増やしても overshoot の**高さ**（約9%）は変わらず、幅だけ狭くなる。

**核心**: Gibbs は「消えない」。不連続がある限り、フーリエ部分和は必ず約9%の overshoot を持つ。実務ではフィルタや窓関数で抑制する。

---

## PS 4.3 — DFT と FFT

**問題**: N=4 のデータ (1, 0, −1, 0) の DFT を手計算で求めよ。

**回答**:

DFT: ĉₖ = Σ cⱼ w^{jk}、w = e^{2πi/4} = i。

$$F_4 = \begin{bmatrix} 1 & 1 & 1 & 1 \\ 1 & i & -1 & -i \\ 1 & -1 & 1 & -1 \\ 1 & -i & -1 & i \end{bmatrix}$$

$$\hat{c} = F_4 c = \begin{bmatrix}1&1&1&1\\1&i&-1&-i\\1&-1&1&-1\\1&-i&-1&i\end{bmatrix}\begin{bmatrix}1\\0\\-1\\0\end{bmatrix} = \begin{bmatrix}0\\2\\0\\2\end{bmatrix}$$

成分 ĉ₁ = 2, ĉ₃ = 2。他は0。

逆変換で確認: c = F⁻¹ĉ = (1/4)F̄ĉ。

**核心**: DFT は行列-ベクトル積。FFT はこの O(N²) を O(N log N) に落とす。周期境界 + 定数係数の問題で最強の道具。

---

## PS 4.4 — 畳み込みとフーリエ

**問題**: 畳み込み (f * g)(x) = ∫ f(t)g(x−t) dt のフーリエ変換が f̂(k)·ĝ(k) になることを示せ。

**回答**:

$$\widehat{f*g}(k) = \int_{-\infty}^{\infty}\left(\int_{-\infty}^{\infty} f(t)g(x-t)dt\right)e^{-ikx}dx$$

変数変換 s = x − t:

$$= \int_{-\infty}^{\infty} f(t)e^{-ikt}\left(\int_{-\infty}^{\infty} g(s)e^{-iks}ds\right)dt = \hat{f}(k)\cdot\hat{g}(k)$$

**離散版**: circulant 行列 C の積 Cx は「循環畳み込み」。フーリエ行列で対角化: C = F⁻¹ΛF なので Cx の計算は FFT + 成分ごとの積 + IFFT = O(N log N)。

**核心**: 畳み込み定理は「空間側の畳み込み = 周波数側の積」。フィルタ設計・信号処理の基礎。

---

## PS 4.5 — パーセバルの等式

**問題**: ∫|f(x)|² dx = Σ|ĉₖ|² を平方波で検証せよ。

**回答**:

平方波: ∫₀^π 1² dx = π（半周期で積分）。全周期では 2π · (1/2) = π。

係数: bₖ = 4/(πk)（k 奇数のみ）。

$$\sum_{k=1,3,5,...} |b_k|^2 \cdot \frac{\pi}{2} = \sum_{k \text{ odd}} \frac{16}{\pi^2 k^2}\cdot\frac{\pi}{2} = \frac{8}{\pi}\sum_{k \text{ odd}}\frac{1}{k^2}$$

Σ 1/k²（k奇数）= π²/8 なので、合計 = (8/π)(π²/8) = π ✓。

副産物: 1 + 1/9 + 1/25 + ... = π²/8 → 1 + 1/4 + 1/9 + ... = π²/6（バーゼル問題）。

**核心**: エネルギー保存。時間/空間領域のエネルギー = 周波数領域のエネルギー。

---

## PS 4.6 — デコンボリューション

**問題**: 畳み込み f * g = h から f を復元する（デコンボリューション）際の困難を説明せよ。

**回答**:

周波数領域では f̂ = ĥ/ĝ。問題: ĝ(k) が小さい周波数 k で、ĥ のノイズが増幅される。

例: g がガウシアンフィルタなら ĝ(k) = e^{−k²σ²} は高周波で指数的に小さい。ĥ の高周波ノイズが e^{k²σ²} 倍に増幅 → 解が暴れる。

**対策**: 正則化（Ch8）。ĝ が小さい成分を切り捨てるか、ペナルティ項を加えて安定化する:

$$\hat{f}_{\text{reg}} = \frac{\hat{g}^*}{|\hat{g}|^2 + \alpha}\hat{h} \quad \text{（Wiener フィルタ / Tikhonov）}$$

**核心**: 逆問題の不適切性。Ch8 の正則化が必要になる典型例。
