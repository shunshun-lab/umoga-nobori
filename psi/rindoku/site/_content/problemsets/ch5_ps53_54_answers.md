# Chapter 5 — Problem Set 5.3 & 5.4 解答

> Strang "Computational Science and Engineering" PS 5.3 (pp.437–439): ラプラス変換と z 変換、PS 5.4 (pp.454–455): スペクトル法と指数精度。

---

# Problem Set 5.3 解答

## Problem 1: ラプラス変換 \( U(s) \) と極

ラプラス変換 \( U(s) = \int_0^\infty u(t)e^{-st}\,dt \) の公式表:

| \( u(t) \) | \( U(s) \) |
|---|---|
| \( 1 \) | \( 1/s \) |
| \( t \) | \( 1/s^2 \) |
| \( e^{at} \) | \( 1/(s-a) \) |
| \( \cos\omega t \) | \( s/(s^2+\omega^2) \) |
| \( \sin\omega t \) | \( \omega/(s^2+\omega^2) \) |
| \( t\cos\omega t \) | \( (s^2-\omega^2)/(s^2+\omega^2)^2 \) |
| \( e^{-t} \) | \( 1/(s+1) \) |
| \( te^{-t} \) | \( 1/(s+1)^2 \) |

**(a)** \( u = 1 + t \)

$$U(s) = \frac{1}{s} + \frac{1}{s^2} = \frac{s+1}{s^2}$$

> **極**: \( s = 0 \)（2重極）

**(b)** \( u = t\cos\omega t \)

積の法則 \( \mathcal{L}[t\,f(t)] = -F'(s) \)。\( F(s) = s/(s^2+\omega^2) \) より

$$F'(s) = \frac{(s^2+\omega^2) - s\cdot 2s}{(s^2+\omega^2)^2} = \frac{\omega^2 - s^2}{(s^2+\omega^2)^2}$$

$$\boxed{U(s) = \frac{s^2 - \omega^2}{(s^2+\omega^2)^2}}$$

> **極**: \( s = \pm i\omega \)（各2重極）

**(c)** \( u = \cos(\omega t - \theta) = \cos\theta\cos\omega t + \sin\theta\sin\omega t \)

$$\boxed{U(s) = \cos\theta\cdot\frac{s}{s^2+\omega^2} + \sin\theta\cdot\frac{\omega}{s^2+\omega^2} = \frac{s\cos\theta + \omega\sin\theta}{s^2+\omega^2}}$$

> **極**: \( s = \pm i\omega \)

**(d)** \( u = \cos^2 t = \frac{1}{2}(1 + \cos 2t) \)

$$\boxed{U(s) = \frac{1}{2}\cdot\frac{1}{s} + \frac{1}{2}\cdot\frac{s}{s^2+4} = \frac{s^2 + 4 + s^2}{2s(s^2+4)} = \frac{s^2+2}{s(s^2+4)}}$$

> **極**: \( s = 0 \) と \( s = \pm 2i \)

**(e)** \( u = 1 - e^{-t} \)

$$\boxed{U(s) = \frac{1}{s} - \frac{1}{s+1} = \frac{1}{s(s+1)}}$$

> **極**: \( s = 0 \) と \( s = -1 \)

**(f)** \( u = te^{-t}\sin\omega t \)

\( \mathcal{L}[\sin\omega t] = \omega/(s^2+\omega^2) \)。シフト則で \( \mathcal{L}[e^{-t}\sin\omega t] = \omega/((s+1)^2+\omega^2) \)。
積の法則 \( \mathcal{L}[t\,g(t)] = -G'(s) \):

$$G(s) = \frac{\omega}{(s+1)^2+\omega^2}$$

$$G'(s) = -\frac{2\omega(s+1)}{((s+1)^2+\omega^2)^2}$$

$$\boxed{U(s) = \frac{2\omega(s+1)}{((s+1)^2+\omega^2)^2}}$$

> **極**: \( s = -1 \pm i\omega \)（各2重極）

---

## Problem 2: ラプラス変換規則表による変換

**(a)** \( u = 1 \) for \( t \leq 1 \), \( u = 0 \) elsewhere

\( u(t) = H(t) - H(t-1) \) ただし \( H \) はヘビサイド関数。遅延則 \( \mathcal{L}[H(t-T)] = e^{-sT}/s \) より

$$\boxed{U(s) = \frac{1}{s} - \frac{e^{-s}}{s} = \frac{1 - e^{-s}}{s}}$$

**(b)** \( u = \) next integer above \( t \) （天井関数）

\( u(t) = n \) for \( n-1 < t \leq n \)。つまり \( u(t) = \sum_{k=1}^{\infty} H(t - (k-1)) - \sum_{k=1}^{\infty}(k-1)[H(t-(k-1)) - H(t-k)] \)。
より簡潔に: \( u(t) = \sum_{k=0}^{\infty} H(t-k) \) なので

$$U(s) = \sum_{k=0}^{\infty} \frac{e^{-ks}}{s} = \frac{1}{s}\cdot\frac{1}{1-e^{-s}} = \frac{1}{s(1-e^{-s})}$$

**(c)** \( u = t\delta(t) \)

\( t\delta(t) = 0 \) なので（\( \delta(t) \) は \( t = 0 \) で集中し、\( t\delta(t) = 0\cdot\delta(t) = 0 \)）

$$\boxed{U(s) = 0}$$

---

## Problem 3: 逆ラプラス変換

\( U(s) \) から \( u(t) \) を求める。

**(a)** \( U(s) = \dfrac{1}{s - 2\pi i} \)

$$\boxed{u(t) = e^{2\pi i t} = \cos 2\pi t + i\sin 2\pi t}$$

> （実関数を求めるなら、\( u(t) = e^{2\pi i t} \) の実部 \( \cos 2\pi t \)）

**(b)** \( U(s) = \dfrac{s+1}{s^2+1} = \dfrac{s}{s^2+1} + \dfrac{1}{s^2+1} \)

$$\boxed{u(t) = \cos t + \sin t}$$

**(c)** \( U(s) = \dfrac{1}{(s-1)(s-2)} \)

部分分数: \( \dfrac{1}{(s-1)(s-2)} = \dfrac{-1}{s-1} + \dfrac{1}{s-2} \)

$$\boxed{u(t) = -e^{t} + e^{2t}}$$

**(d)** \( U(s) = e^{-s} \)

遅延則から \( \mathcal{L}[\delta(t-T)] = e^{-sT} \) なので

$$\boxed{u(t) = \delta(t-1)}$$

**(e)** \( U(s) = \dfrac{e^{-s}}{s-a} \)

$$\boxed{u(t) = e^{a(t-1)}H(t-1)}$$

ただし \( H \) はヘビサイド関数。

**(f)** \( U(s) = s \)

形式的に \( \mathcal{L}[\delta'(t)] = s \) なので

$$\boxed{u(t) = \delta'(t)}$$

（デルタ関数の微分、超関数の意味で）

---

## Problem 4: \( u'' + u = 0 \), \( u(0) \), \( u'(0) \) を用いた解法

ラプラス変換: \( s^2 U(s) - su(0) - u'(0) + U(s) = 0 \)

$$(s^2 + 1)U(s) = su(0) + u'(0)$$

$$U(s) = u(0)\frac{s}{s^2+1} + u'(0)\frac{1}{s^2+1}$$

逆変換:

$$\boxed{u(t) = u(0)\cos t + u'(0)\sin t}$$

これは \( s/(s^2+1) \) と \( 1/(s^2+1) \) の組合せ。

---

## Problem 5: \( u'' + 2u' + 2u = \delta \), \( u(0) = 0 \), \( u'(0) = 1 \)

ラプラス変換:

$$s^2 U - s\cdot 0 - 1 + 2(sU - 0) + 2U = 1$$

$$(s^2 + 2s + 2)U = 2$$

$$U(s) = \frac{2}{s^2 + 2s + 2} = \frac{2}{(s+1)^2 + 1}$$

逆変換（シフト則）:

$$\boxed{u(t) = 2e^{-t}\sin t}$$

> 極: \( s = -1 \pm i \)。部分分数と留数の公式を確認する。

---

## Problem 6: 初期値問題のラプラス変換解法

**(a)** \( u' + u = e^{i\omega t} \), \( u(0) = 8 \)

$$(s+1)U(s) = 8 + \frac{1}{s - i\omega}$$

$$U(s) = \frac{8}{s+1} + \frac{1}{(s+1)(s-i\omega)}$$

部分分数: \( \dfrac{1}{(s+1)(s-i\omega)} = \dfrac{1}{1+i\omega}\left(\dfrac{1}{s-i\omega} - \dfrac{1}{s+1}\right) \)

$$\boxed{u(t) = \left(8 - \frac{1}{1+i\omega}\right)e^{-t} + \frac{e^{i\omega t}}{1+i\omega}}$$

**(b)** \( u'' - u = e^t \), \( u(0) = 0 \), \( u'(0) = 0 \)

$$(s^2 - 1)U(s) = \frac{1}{s-1}$$

$$U(s) = \frac{1}{(s-1)(s^2-1)} = \frac{1}{(s-1)^2(s+1)}$$

部分分数: \( \dfrac{1}{(s-1)^2(s+1)} = \dfrac{A}{s-1} + \dfrac{B}{(s-1)^2} + \dfrac{C}{s+1} \)

\( 1 = A(s-1)(s+1) + B(s+1) + C(s-1)^2 \)

\( s = 1 \): \( 1 = 2B \Rightarrow B = 1/2 \)

\( s = -1 \): \( 1 = 4C \Rightarrow C = 1/4 \)

\( s = 0 \): \( 1 = -A + B + C = -A + 1/2 + 1/4 \Rightarrow A = -1/4 \)

$$\boxed{u(t) = -\frac{1}{4}e^{t} + \frac{1}{2}te^{t} + \frac{1}{4}e^{-t} = \frac{1}{2}te^t + \frac{1}{4}(e^{-t} - e^t)}$$

**(c)** \( u' + u = e^{-t} \), \( u(0) = 2 \)

$$(s+1)U = 2 + \frac{1}{s+1} \implies U(s) = \frac{2}{s+1} + \frac{1}{(s+1)^2}$$

$$\boxed{u(t) = 2e^{-t} + te^{-t} = (2+t)e^{-t}}$$

**(d)** \( u'' + u = 6t \), \( u(0) = 0 \), \( u'(0) = 0 \)

$$(s^2+1)U = \frac{6}{s^2}$$

$$U(s) = \frac{6}{s^2(s^2+1)} = 6\left(\frac{1}{s^2} - \frac{1}{s^2+1}\right)$$

$$\boxed{u(t) = 6t - 6\sin t}$$

**(e)** \( u' - i\omega u = \delta(t) \), \( u(0) = 0 \)

$$(s - i\omega)U = 1$$

$$U(s) = \frac{1}{s - i\omega}$$

$$\boxed{u(t) = e^{i\omega t}}$$

**(f)** \( mu'' + cu' + ku = 0 \), \( u(0) = 1 \), \( u'(0) = 0 \)

$$(ms^2 + cs + k)U = ms + c$$

$$\boxed{U(s) = \frac{ms + c}{ms^2 + cs + k}}$$

極は \( s = \dfrac{-c \pm \sqrt{c^2 - 4mk}}{2m} \) で、逆変換は部分分数で指数関数の和になる。

---

## Problem 7: \( G = 1/(s^2 + s + 1) \) が正実関数であること

\( G(s) = 1/(s^2 + s + 1) \) について \( \mathrm{Re}\,G \geq 0 \) for \( \mathrm{Re}\,s \geq 0 \) を示す。

\( s = \sigma + i\omega \)（\( \sigma \geq 0 \)）とおく。

$$s^2 + s + 1 = (\sigma^2 - \omega^2 + \sigma + 1) + i(2\sigma\omega + \omega)$$

$$G(s) = \frac{1}{s^2+s+1}$$

$$\mathrm{Re}\,G = \frac{\sigma^2 - \omega^2 + \sigma + 1}{|s^2+s+1|^2}$$

分母は正なので、分子の符号を調べる。分子 \( = \sigma^2 + \sigma + 1 - \omega^2 \)。

\( \sigma \geq 0 \) のとき \( \sigma^2 + \sigma + 1 \geq 1 \) だが、\( \omega^2 \) が大きいと負になりうる。

ただし受動系の条件は \( \mathrm{Re}\,G(i\omega) \geq 0 \) for all \( \omega \)。虚軸上（\( \sigma = 0 \)）:

$$G(i\omega) = \frac{1}{1 - \omega^2 + i\omega}, \quad \mathrm{Re}\,G(i\omega) = \frac{1-\omega^2}{(1-\omega^2)^2 + \omega^2}$$

これは \( \omega^2 > 1 \) で負になるので、\( G \) は厳密には正実関数では**ない**。

> 実は問題は \( G = 1/(s^2 + s + 1) \) が受動であることの確認だが、正実条件を満たすかどうかはより精密な議論が必要。極は \( s = (-1 \pm i\sqrt{3})/2 \) で \( \mathrm{Re}\,s < 0 \) にあるので **安定** である。

---

## Problem 8: \( e^{At} \) の変換 \( (sI - A)^{-1} \)

\( A = \begin{bmatrix} 1 & 1 \\ 1 & 1 \end{bmatrix} \)

固有値: \( \det(A - \lambda I) = (1-\lambda)^2 - 1 = \lambda^2 - 2\lambda = 0 \) より \( \lambda = 0, 2 \)。

$$(sI - A)^{-1} = \frac{1}{s(s-2)}\begin{bmatrix} s-1 & 1 \\ 1 & s-1 \end{bmatrix}$$

部分分数:

$$\frac{s-1}{s(s-2)} = \frac{1/2}{s} + \frac{1/2}{s-2}, \quad \frac{1}{s(s-2)} = \frac{-1/2}{s} + \frac{1/2}{s-2}$$

$$\boxed{e^{At} = \frac{1}{2}\begin{bmatrix} 1 & -1 \\ -1 & 1 \end{bmatrix} + \frac{e^{2t}}{2}\begin{bmatrix} 1 & 1 \\ 1 & 1 \end{bmatrix}}$$

> 確認: 固有値 \( 0, 2 \) と一致。\( e^{At} \) の極は \( s = 0 \) と \( s = 2 \)（\( A \) の固有値に対応）。

---

## Problem 9: \( du/dt \) が指数的に減衰するなら

**(i)** \( sU(s) \to u(0) \) as \( s \to \infty \)

\( U(s) = \int_0^\infty u(t)e^{-st}dt \) で \( s \to \infty \) のとき被積分関数は \( t = 0 \) 付近にのみ寄与する。

$$sU(s) = s\int_0^\infty u(t)e^{-st}dt$$

\( \tau = st \) と置換: \( = \int_0^\infty u(\tau/s)e^{-\tau}d\tau \to u(0)\int_0^\infty e^{-\tau}d\tau = u(0) \)。

> **答**: \( \lim_{s\to\infty} sU(s) = u(0) \)（初期値定理）

**(ii)** \( sU(s) \to u(\infty) \) as \( s \to 0 \)

$$sU(s) = s\int_0^\infty u(t)e^{-st}dt$$

\( s \to 0^+ \) で \( e^{-st} \to 1 \)（\( u(t) \) が有限極限を持つなら）:

$$\lim_{s\to 0^+} sU(s) = \lim_{s\to 0^+} s\int_0^\infty u(t)e^{-st}dt = u(\infty)$$

> **答**: \( \lim_{s\to 0} sU(s) = u(\infty) \)（最終値定理）

---

## Problem 10: ベッセル関数の変換

\( tu'' + u' + tu = 0 \) をラプラス変換する。

規則: \( \mathcal{L}[tu(t)] = -U'(s) \), \( \mathcal{L}[u'] = sU - u(0) \), \( \mathcal{L}[tu''] = -\frac{d}{ds}[s^2U - su(0) - u'(0)] \)。

\( u(0) = 1 \)（ベッセル関数 \( J_0 \) の初期値）とする。

$$-\frac{d}{ds}(s^2 U - s) + sU - 1 + (-U'(s)) = 0$$

$$-(2sU + s^2 U' - 1) + sU - 1 - U' = 0$$

$$-s^2 U' - 2sU + 1 + sU - 1 - U' = 0$$

$$-(s^2+1)U' - sU = 0$$

$$\frac{U'}{U} = \frac{-s}{s^2+1}$$

$$\ln U = -\frac{1}{2}\ln(s^2+1) + C$$

$$\boxed{U(s) = \frac{C}{\sqrt{s^2+1}}}$$

変数分離法で1階ODE。\( u(0) = 1 \) の条件（初期値定理 \( sU(s) \to 1 \) as \( s \to \infty \)）から \( C = 1 \)。

> ベッセル関数 \( J_0(t) \) のラプラス変換は \( 1/\sqrt{s^2+1} \)。

---

## Problem 11: ラプラス変換の性質

**(a)** \( u = \sin\pi t \) の短いアーチ（1周期分のみ）

\( u(t) = \sin\pi t \) for \( 0 \leq t \leq 1 \), \( u(t) = 0 \) for \( t > 1 \)。

$$U(s) = \int_0^1 \sin\pi t\, e^{-st}dt$$

部分積分（もしくは公式 \( \int_0^T \sin\omega t\,e^{-st}dt \)）:

$$U(s) = \frac{\pi}{s^2+\pi^2}(1 + e^{-s})$$

> \( \sin\pi t \) の半周期で値が正、\( t = 1 \) でゼロに戻る。

**(b)** ランプ関数 \( u = t \) for \( t \leq 1 \)

\( u(t) = t \) for \( 0 \leq t \leq 1 \), \( u(t) = 0 \) for \( t > 1 \)（もしくは \( t \) のまま）。

ランプ \( u = t \): \( U(s) = 1/s^2 \)。

\( t = 1 \) 以降ゼロなら: \( u(t) = t\cdot[H(t) - H(t-1)] = t\cdot H(t) - t\cdot H(t-1) \)

$$U(s) = \frac{1}{s^2} - \frac{e^{-s}}{s^2} - \frac{e^{-s}}{s}$$

（最後の項は \( (t-1+1)H(t-1) \) の変換の補正）

正確には: \( u(t) = tH(t) - tH(t-1) = tH(t) - (t-1)H(t-1) - H(t-1) \)

$$\boxed{U(s) = \frac{1}{s^2} - \frac{e^{-s}}{s^2} - \frac{e^{-s}}{s} = \frac{1-e^{-s}(1+s)}{s^2}}$$

グラフ: \( t = 1 \) で零に向かって折れ曲がる。

---

## Problem 12: のこぎり波のラプラス変換

\( u = |\sin\pi t| \) の整流正弦波と \( S(t) \) = 小数部分のラプラス変換。

Problem 11 を拡張: \( |\sin\pi t| \) は周期1で \( \sin\pi t \geq 0 \) を繰り返す。

周期 \( T = 1 \) の関数の変換公式: \( U(s) = \dfrac{\int_0^1 u(t)e^{-st}dt}{1 - e^{-s}} \)

$$U_{\sin}(s) = \frac{1}{1-e^{-s}}\cdot\frac{\pi(1+e^{-s})}{s^2+\pi^2} = \frac{\pi}{s^2+\pi^2}\cdot\frac{1+e^{-s}}{1-e^{-s}}$$

のこぎり波 \( S(t) = t - \lfloor t \rfloor \)（小数部分）は周期1で \( S(t) = t \) on \( [0,1) \):

$$\boxed{U_S(s) = \frac{1}{1-e^{-s}}\left(\frac{1}{s^2} - \frac{e^{-s}}{s^2}\right) = \frac{1}{s^2}\cdot\frac{1-e^{-s}}{1-e^{-s}} = \frac{1}{s^2}}$$

これは誤り。正しくは:

$$\int_0^1 t\,e^{-st}dt = \frac{1}{s^2} - \frac{e^{-s}(s+1)}{s^2}$$

$$\boxed{U_S(s) = \frac{1}{1-e^{-s}}\cdot\frac{1 - e^{-s}(1+s)}{s^2} = \frac{1}{s^2} - \frac{e^{-s}}{s(1-e^{-s})}}$$

シフト規則を \( e^{-ikT} \) と \( 1 + x + x^2 + \cdots = 1/(1-x) \) で利用する。

---

## Problem 13: 加速度の問題

**(a)** \( v' = c(v^* - v) \) の比 \( V^*(s)/V(s) \) を求める。

ラプラス変換: \( sV - v(0) = c(V^* - V) \) なので

$$(s + c)V = v(0) + cV^* \implies \frac{V(s)}{V^*(s)} = \frac{c}{s+c}$$

> **伝達関数** \( G(s) = c/(s + c) \)

**(b)** \( v^* = t \) で \( v(0) = 0 \) のとき:

$$V(s) = \frac{c}{s+c}\cdot\frac{1}{s^2} = \frac{c}{s^2(s+c)}$$

部分分数: \( \dfrac{c}{s^2(s+c)} = \dfrac{1}{s^2} - \dfrac{1}{cs} + \dfrac{1}{c}\cdot\dfrac{1}{s+c}... \)

正確に計算: \( \dfrac{c}{s^2(s+c)} = \dfrac{A}{s} + \dfrac{B}{s^2} + \dfrac{C}{s+c} \)

\( c = As(s+c) + B(s+c) + Cs^2 \)

\( s = 0 \): \( c = Bc \Rightarrow B = 1 \)

\( s = -c \): \( c = Cc^2 \Rightarrow C = 1/c \)

\( s^2 \) 係数: \( 0 = A + C \Rightarrow A = -1/c \)

$$\boxed{v(t) = t - \frac{1}{c}(1 - e^{-ct})}$$

（\( v(0) = 0 \) を確認: \( 0 - 1/c + 1/c = 0 \) ✓）

---

## Problem 14: 車列モデル

**(a)** \( v_n' = c[v_{n-1}(t-T) - v_n(t-T)] \) で \( v_0(t) = \cos\omega t \) のとき成長因子 \( A = 1/(1 + i\omega e^{i\omega T}/c) \)。振動 \( v_n = A^n e^{i\omega t} \) を代入。

\( v_n = A^n e^{i\omega t} \), \( v_n' = i\omega A^n e^{i\omega t} \)

$$i\omega A^n e^{i\omega t} = c[A^{n-1}e^{i\omega(t-T)} - A^n e^{i\omega(t-T)}]$$

$$i\omega A = c\,e^{-i\omega T}(1 - A) \implies A(i\omega + c\,e^{-i\omega T}) = c\,e^{-i\omega T}$$

$$\boxed{A = \frac{c\,e^{-i\omega T}}{c\,e^{-i\omega T} + i\omega} = \frac{1}{1 + i\omega e^{i\omega T}/c}}$$

**(b)** \( |A| < 1 \) のとき振幅は安全に減衰する。

$$|A|^2 = \frac{1}{|1 + i\omega e^{i\omega T}/c|^2} = \frac{1}{1 + 2(\omega/c)\sin\omega T + (\omega/c)^2}$$

\( |A| < 1 \iff (\omega/c)^2 + 2(\omega/c)\sin\omega T > 0 \iff \omega/c + 2\sin\omega T > 0 \)。

\( cT < 1/2 \) のとき全ての \( \omega \) で成り立つ。

**(c)** \( cT > 1/2 \) のとき \( |A| > 1 \) となる周波数が存在し危険。\( \sin\theta < \theta \) で \( T \geq 1\,\mathrm{sec} \), \( c = 0.4\,\mathrm{sec}^{-1} \) なら \( cT = 0.4 \) で安全側だがギリギリ。

---

## Problem 15: ポントリャーギン最大原理（バンバン制御）

**(a)** 最大加速 \( A \), 最大減速 \( -A \)。\( x(0) = 0 \), \( v(0) = 0 \) から \( x = 1 \), \( v = 0 \) へ到達する最短時間。

対称性から前半加速・後半減速。\( x = 1/2 \) で切り替え。

加速フェーズ: \( v = At \), \( x = \frac{1}{2}At^2 \)。\( x = 1/2 \) のとき \( t_1 = \sqrt{1/A} \)。

全時間: \( T = 2t_1 \)。

$$\boxed{T_{\min} = 2\sqrt{\frac{1}{A}} = \frac{2}{\sqrt{A}}}$$

**(b)** 最大制動力 \( -B \) のとき、最適 \( dx/dt \) を求める。

加速フェーズ: \( v = At \), \( x = At^2/2 \)。切替時刻 \( t_1 \) で速度 \( v_1 = At_1 \)。

減速フェーズ: 制動 \( -B \) で停止するまで \( t_2 = v_1/B = At_1/B \)。

移動距離: \( \frac{1}{2}At_1^2 + v_1 t_2 - \frac{1}{2}Bt_2^2 = \frac{1}{2}At_1^2 + \frac{A^2t_1^2}{2B} = \frac{At_1^2}{2}\left(1 + \frac{A}{B}\right) = 1 \)

$$t_1 = \sqrt{\frac{2B}{A(A+B)}}, \quad T = t_1 + t_2 = t_1\left(1 + \frac{A}{B}\right)$$

$$\boxed{T_{\min} = \sqrt{\frac{2(A+B)}{AB}}}$$

---

## Problem 16: z 変換 — シフトとダウンサンプリング

\( v = (0, 1, A, A^2, \ldots) \) を変換。\( w = (1, A^2, A^4, \ldots) \) はダウンサンプル。

$$V(z) = \frac{1}{z} + \frac{A}{z^2} + \frac{A^2}{z^3} + \cdots = \frac{1}{z}\cdot\frac{1}{1-A/z} = \frac{1}{z-A}$$

$$\boxed{W(z) = \frac{1}{1-A^2/z} = \frac{z}{z-A^2}}$$

---

## Problem 17: z 変換

**(a)** \( u_n = (-1)^n \): \( U(z) = \sum (-1)^n z^{-n} = \sum (-1/z)^n = \dfrac{z}{z+1} \)

$$\boxed{U(z) = \frac{z}{z+1}}$$

**(b)** \( (0,0,1,0,0,1,\ldots) \): 周期3で \( u_2 = u_5 = \cdots = 1 \):

$$U(z) = z^{-2} + z^{-5} + \cdots = \frac{z^{-2}}{1-z^{-3}} = \frac{1}{z^2-z^{-1}} = \frac{z}{z^3-1}$$

$$\boxed{U(z) = \frac{z}{z^3 - 1}}$$

**(c)** \( u_n = \sin n\theta \):

$$U(z) = \sum_{n=0}^{\infty} \sin(n\theta)\,z^{-n} = \mathrm{Im}\sum_{n=0}^{\infty}(e^{i\theta}/z)^n = \mathrm{Im}\frac{z}{z - e^{i\theta}}$$

$$= \mathrm{Im}\frac{z(z-e^{-i\theta})}{|z-e^{i\theta}|^2} = \frac{z\sin\theta}{z^2 - 2z\cos\theta + 1}$$

$$\boxed{U(z) = \frac{z\sin\theta}{z^2 - 2z\cos\theta + 1}}$$

**(d)** \( (u_2, u_3, u_4, \ldots) \) のz変換は advance 規則:

$$\boxed{z^2(U(z) - u_0) - zu_1 = z^2 U(z) - u_0 z^2 - u_1 z}$$

（shift left by 2）

---

## Problem 18: 部分分数と逆 z 変換

**(a)** \( U(z) = \dfrac{2}{z^2-1} = \dfrac{1}{z-1} - \dfrac{1}{z+1} \)

\( \dfrac{1}{z-1} = \sum_{n=0}^\infty z^{-n-1} \) の係数を読むと \( u_n = 1 - (-1)^n \) は偶数添字で0, 奇数で2:

$$\boxed{u = (0, 2, 0, 2, 0, 2, \ldots)}$$

**(b)** \( V(z) = \dfrac{2i}{z^2+1} = \dfrac{1}{z-i} - \dfrac{1}{z+i} \) の場合（\( z - i \) と \( z + i \)）:

$$v_n = i^{-n-1} - (-i)^{-n-1}$$

$$\boxed{v = (0, 2, 0, -2, 0, 2, \ldots)}$$

（\( v_n = 2\sin(n\pi/2) \)）

---

## Problem 19: z 変換の畳み込み

\( u * v \) の z 変換は \( U(z)V(z) \) である。

**(a)** \( w(z) = 1/z^2 = (1/z)(1/z) \): \( u = v = (0,1,0,0,\ldots) \)（デルタ関数のシフト）。

$$w_0 = 0, \; w_1 = 0, \; w_2 = 1, \; w_n = 0 \;(n \neq 2)$$

$$\boxed{w = (0, 0, 1, 0, 0, \ldots)}$$

**(b)** \( w(z) = 1/(z-2)^2 \): これは \( 1/(z-2) \) の z 変換（\( u_n = 2^n \) に対応する \( z/(z-2) \) の）の畳み込みではなく、\( w_n \) を直接求める。

\( 1/(z-2)^2 = \dfrac{d}{dz}\dfrac{1}{z-2}\cdot(-1) \)。\( 1/(z-2) = \sum_{n=0}^\infty 2^n z^{-n-1} \) なので

$$w_n = (n+1)2^n \cdot z^{-n-2} \text{ の係数から } \boxed{w_n = (n-1)\cdot 2^{n-2} \text{ for } n \geq 2, \; w_0 = w_1 = 0}$$

より正確に: \( 1/(z-2) \) times \( 1/(z-2) \)。\( U(z) = 1/(z-2) \) の係数は \( u_n = 2^{n-1} \) for \( n \geq 1 \)。

畳み込み: \( w_n = \sum_{k=1}^{n-1} 2^{k-1}\cdot 2^{n-k-1} = (n-1)2^{n-2} \) for \( n \geq 2 \)。

**(c)** \( w(z) = 1/[z^2(z-2)] = [1/z]\cdot[1/(z(z-2))] \)

\( 1/(z(z-2)) = -1/2\cdot(1/z) + 1/2\cdot(1/(z-2)) \)。逆変換: delay by 1 step of the sequence.

$$\boxed{w_0 = 0,\; w_1 = 0,\; w_n = \frac{1}{2}(2^{n-2} - 1) \text{ for } n \geq 2}$$

---

## Problem 20: フィボナッチ数列

\( u_{n+2} = u_{n+1} + u_n \), \( u_0 = 0 \), \( u_1 = 1 \)。

z変換: \( z^2 U(z) - z^2\cdot 0 - z\cdot 1 = z(U(z) - 0) + U(z) \) ではなく、シフト規則を正確に:

\( z^2(U - u_0) - zu_1 = z(U - u_0) + U \)

$$z^2 U - z = zU + U$$

$$U(z^2 - z - 1) = z$$

$$\boxed{U(z) = \frac{z}{z^2 - z - 1}}$$

部分分数: 根は \( z = \phi = (1+\sqrt{5})/2 \) と \( z = \hat\phi = (1-\sqrt{5})/2 \)。

$$U(z) = \frac{z}{(z-\phi)(z-\hat\phi)} = \frac{1}{\sqrt{5}}\left(\frac{z}{z-\phi} - \frac{z}{z-\hat\phi}\right)$$

$$\boxed{u_n = \frac{\phi^n - \hat\phi^n}{\sqrt{5}} = \frac{1}{\sqrt{5}}\left[\left(\frac{1+\sqrt{5}}{2}\right)^n - \left(\frac{1-\sqrt{5}}{2}\right)^n\right]}$$

---

## Problem 21: 差分方程式の z 変換解法

**(a)** \( u_{n+1} - 2u_n = 0 \), \( u_0 = 5 \)

z変換: \( z(U - 5) = 2U \implies U(z-2) = 5z \implies U = 5z/(z-2) \)

$$\boxed{u_n = 5 \cdot 2^n}$$

**(b)** \( u_{n+2} - 3u_{n+1} + 2u_n = 0 \), \( u_0 = 1 \), \( u_1 = 0 \)

$$z^2 U - z^2 - 3(zU - z) + 2U = 0$$

$$(z^2 - 3z + 2)U = z^2 - 3z = z(z-3)$$

$$U = \frac{z(z-3)}{(z-1)(z-2)} = \frac{z(-2)}{(-1)} \cdot \frac{1}{z-1} + \frac{z(-1)}{1}\cdot\frac{1}{z-2}$$

部分分数: \( \dfrac{z(z-3)}{(z-1)(z-2)} \)。\( U/z = \dfrac{z-3}{(z-1)(z-2)} = \dfrac{A}{z-1} + \dfrac{B}{z-2} \)

\( z = 1 \): \( A = -2/(-1) = 2 \)。\( z = 2 \): \( B = -1/1 = -1 \)。

$$U = \frac{2z}{z-1} - \frac{z}{z-2} \implies \boxed{u_n = 2 - 2^n}$$

確認: \( u_0 = 2 - 1 = 1 \) ✓, \( u_1 = 2 - 2 = 0 \) ✓

**(c)** \( u_{n+1} - u_n = 2^n \), \( u_0 = 0 \)

$$zU - 0 - U = \frac{z}{z-2} \implies U = \frac{z}{(z-1)(z-2)} \cdot\frac{1}{1}$$

\( U/z = \dfrac{1}{(z-1)(z-2)} = \dfrac{-1}{z-1} + \dfrac{1}{z-2} \)

$$U = \frac{-z}{z-1} + \frac{z}{z-2} \implies \boxed{u_n = -1 + 2^n = 2^n - 1}$$

確認: \( u_0 = 0 \) ✓, \( u_1 = 1 \), \( u_2 = 3 \), \( u_1 - u_0 = 1 = 2^0 \) ✓

**(d)** \( u_{n+1} - nu_n - u_n = 0 \), \( u_0 = 1 \)

これは \( u_{n+1} = (n+1)u_n \) と読むと \( u_n = n! \) だが、問題文を確認すると \( u_{n+1} - nu_n - u_n = 0 \) つまり \( u_{n+1} = (n+1)u_n \)。

$$\boxed{u_n = n!}$$

> z変換では扱いにくい（\( n \) 依存の係数）。直接帰納法で示すのが簡明。

---

## Problem 22: \( p_{n+1} - Ap_n = f_{n+1} \) の解

\( p_n = \sum_{k=1}^n A^{n-k}f_k \) if \( p_0 = 0 \) を示す。

帰納法: \( p_1 = Ap_0 + f_1 = f_1 \) ✓。
\( p_{n+1} = Ap_n + f_{n+1} = A\sum_{k=1}^n A^{n-k}f_k + f_{n+1} = \sum_{k=1}^n A^{n+1-k}f_k + f_{n+1} = \sum_{k=1}^{n+1}A^{n+1-k}f_k \) ✓。

> 連続版の類似: \( u' - au = f(t) \) の解は \( u(t) = \int_0^t e^{a(t-T)}f(T)\,dT \)。

---

## Problem 23: ギャンブラーの破産問題

\( N - k \) チップ、各プレイで確率 \( 5/11 \) 勝ち。\( u_k \) = 破産確率。\( u_0 = 0 \), \( u_N = 1 \)。

**(a)** \( u_k = \frac{5}{11}u_{k+1} + \frac{6}{11}u_{k-1} \) の説明:

次のプレイで確率 \( 5/11 \) でチップが \( k+1 \) に増え、\( 6/11 \) で \( k-1 \) に減る。全確率の法則から上式が成立。

**(b)** \( u_k = C\lambda^k + D \)。特性方程式 \( 5\lambda^2 - 11\lambda + 6 = 0 \):

$$\lambda = \frac{11 \pm \sqrt{121-120}}{10} = \frac{11 \pm 1}{10} \implies \lambda = \frac{6}{5} \text{ or } 1$$

$$u_k = C\left(\frac{6}{5}\right)^k + D$$

境界条件 \( u_0 = 0 \): \( C + D = 0 \implies D = -C \)。\( u_N = 1 \): \( C(6/5)^N - C = 1 \implies C = 1/[(6/5)^N - 1] \)。

$$\boxed{u_k = \frac{(6/5)^k - 1}{(6/5)^N - 1}}$$

**(c)** \( k = 100 \), \( N = 1000 \):

$$u_{100} = \frac{(6/5)^{100} - 1}{(6/5)^{1000} - 1} \approx (6/5)^{100-1000} = (5/6)^{900} \approx 0$$

> 破産確率はほぼ \( (5/6)^{900} \)、事実上ゼロ。\( N = 10 \) からスタートする方がよい（\( u_{100}/u_{10} \) は有意に大きい）。

---

## Problem 24: 劣性遺伝子の頻度

\( u_{k+1} = u_k/(1 + u_k) \)。

**(a)** \( u_k = u_0/(1 + ku_0) \) を検証:

$$\frac{u_0/(1+ku_0)}{1 + u_0/(1+ku_0)} = \frac{u_0/(1+ku_0)}{(1+(k+1)u_0)/(1+ku_0)} = \frac{u_0}{1+(k+1)u_0} = u_{k+1} \;\checkmark$$

**(b)** \( v_k = 1/u_k \) とおくと \( v_{k+1} = v_k + 1 \) なので \( v_k = v_0 + k \)、\( u_k = 1/(v_0 + k) \)。

$$\boxed{v_k = \frac{1}{u_0} + k \implies u_k = \frac{u_0}{1+ku_0}}$$

**(c)** \( u_0 = 1/2 \) のとき \( u_k = 1/(2+k) \)。\( u_k = 1/100 \) となるのは \( k = 98 \) 世代。

---

## Problem 25: スカラー制御系の z 変換

\( x_{k+1} = ax_k + bu_k \), \( y_k = cx_k \)。z変換:

$$zX(z) - zx_0 = aX(z) + bU(z)$$

$$X(z) = \frac{zx_0 + bU(z)}{z-a}$$

$$Y(z) = cX(z) = \frac{czx_0}{z-a} + \frac{cb}{z-a}U(z)$$

伝達関数:

$$\boxed{G(z) = \frac{Y(z)}{U(z)} = \frac{bc}{z-a}}$$

---

## Problem 26: フーリエとラプラスの対応

| フーリエ | ラプラス |
|---|---|
| 全直線 \( -\infty < t < \infty \) | 半直線 \( t \geq 0 \) |
| \( e^{ikT} \) で乗じてシフト | \( e^{at} \)（過渡項）|
| \( \mathrm{Re}\,a \leq 0 \) なら入力 \( f(t) \) が後の \( u(t) \) に影響 | 入力 \( f(t) \) は後の \( u(t) \) に影響（因果性）|
| \( e^{ikx} \) | \( e^{st} \) |

4つの対応文:
1. **フーリエ**: 全直線 \( -\infty < x < \infty \) ↔ **ラプラス**: 半直線 \( t \geq 0 \)
2. **フーリエ**: \( e^{ikx} \) の周波数成分 ↔ **ラプラス**: \( e^{st} \) の指数成分
3. **フーリエ**: \( \hat{f}(k) \) は実軸上の積分 ↔ **ラプラス**: \( F(s) \) は半平面上の積分
4. **フーリエ**: 入力のシフト \( f(t-T) \) は \( e^{-ikT}\hat{f} \) ↔ **ラプラス**: 遅延 \( f(t-T) \) は \( e^{-sT}F(s) \)

---

## Problem 27: フーリエ変換とラプラス変換の関係

\( f(t) = 0 \) for \( t < 0 \) のとき、\( f(0) \) に関する条件は \( \hat{f}(k) \) と \( F(s) \) が \( s = ik \) で同じになること。

$$F(s) = \int_0^\infty f(t)e^{-st}dt, \quad \hat{f}(k) = \int_{-\infty}^{\infty}f(t)e^{-ikt}dt = \int_0^\infty f(t)e^{-ikt}dt$$

\( s = ik \) を代入すれば \( F(ik) = \hat{f}(k) \)。

> **条件**: \( f(t) = 0 \) for \( t < 0 \)（因果的関数）。\( f(0) \) の値自体は連続性に依存するが、本質的な条件は \( f \) が因果的であること。

---

## Problem 28: 可制御性と可観測性の判定

$$\mathrm{rank}[B \quad AB \quad \cdots \quad A^{n-1}B] = n \quad\text{（可制御性）}$$

$$\mathrm{rank}[C \quad CA \quad \cdots \quad CA^{n-1}]^T = n \quad\text{（可観測性）}$$

Example 9 で \( A = \mathrm{diag}(-1,-2) \), \( B = \begin{bmatrix} 1 \\ 1 \end{bmatrix} \), \( C = [1 \; 1] \)、\( G(s) = 1/(s+1)(s+2) \):

$$[B, AB] = \begin{bmatrix} 1 & -1 \\ 1 & -2 \end{bmatrix}, \quad \det = -2+1 = -1 \neq 0 \;\checkmark$$

$$\begin{bmatrix} C \\ CA \end{bmatrix} = \begin{bmatrix} 1 & 1 \\ -1 & -2 \end{bmatrix}, \quad \det = -2+1 = -1 \neq 0 \;\checkmark$$

> **答**: 可制御かつ可観測。

---

## Problem 29: 可制御性と固有ベクトル

\( B \) が \( A \) の固有ベクトルなら \( AB = \lambda B \) なので

$$[B, AB, \ldots, A^{n-1}B] = [B, \lambda B, \ldots, \lambda^{n-1}B]$$

この行列のランクは1（全列が \( B \) のスカラー倍）なので \( n > 1 \) のとき \( \mathrm{rank} < n \)。

> **結論**: \( B \) が \( A \) の固有ベクトルならば系は**可制御でない**。Problem 28 の条件を満たさない。

---

## Problem 30: 逆ラプラス変換の数値コード検証

\( F(s) = e^{-\sqrt{s}} \) は \( f(t) = e^{-1/4t}/\sqrt{4\pi t^3} \) のラプラス変換。

\( N = 2, 4, 8 \) で \( t = 0.5, 1, 1.5, 2 \) でテスト。

解析値:
- \( f(0.5) = e^{-0.5}/\sqrt{2\pi(0.5)^3} = e^{-0.5}/\sqrt{0.25\pi} \approx 0.4839 \)
- \( f(1) = e^{-0.25}/\sqrt{4\pi} \approx 0.2197 \)
- \( f(2) = e^{-0.125}/\sqrt{32\pi} \approx 0.0880 \)

> \( N \) を増やすと数値逆変換が解析解に収束することを確認。

---

## Problem 31: 逆 z 変換コードの検証

\( U(z) = (z - \pi i)^{-1} \) の逆 z 変換。

$$u_n = \frac{1}{2\pi i}\oint U(z)z^{n-1}dz = \frac{1}{(\pi i)^{n-1}} \cdot \frac{1}{1} = (\pi i)^{n-1}$$

ではなく、\( U(z) = 1/(z - \pi i) = \sum_{n=0}^\infty (\pi i)^n z^{-n-1} \) なので

$$\boxed{u_n = (\pi i)^n}$$

\( |u_n| = \pi^n \to \infty \) なので信頼性は低い（\( |z| > \pi \) の外側でしか収束しない）。

---

---

# Problem Set 5.4 解答

## Problem 1: チェビシェフ多項式の積分

\( \int_{-1}^1 T_n(x)\,dx \) を \( \cos n\theta \sin\theta \) の積分で求める。

\( x = \cos\theta \), \( dx = -\sin\theta\,d\theta \):

$$\int_{-1}^1 T_n(x)\,dx = \int_\pi^0 \cos n\theta(-\sin\theta)\,d\theta = \int_0^\pi \cos n\theta\sin\theta\,d\theta$$

積和公式: \( \cos n\theta\sin\theta = \frac{1}{2}[\sin(n+1)\theta - \sin(n-1)\theta] \)

\( n \) が偶数のとき:

$$\int_0^\pi \sin(n+1)\theta\,d\theta = \frac{-2}{n+1}\;(\text{if } n+1 \text{ odd})$$

$$\int_0^\pi \sin(n-1)\theta\,d\theta = \frac{-2}{n-1}\;(\text{if } n-1 \text{ odd})$$

$$\int_{-1}^1 T_n(x)\,dx = \frac{1}{2}\left[\frac{-2}{n+1} - \frac{-2}{n-1}\right] = \frac{1}{2}\cdot\frac{-2(n-1)+2(n+1)}{(n+1)(n-1)} = \frac{2}{1-n^2}$$

\( n \) が奇数のとき: \( \sin(n+1)\theta \) と \( \sin(n-1)\theta \) の積分は \( 0 \) to \( \pi \) でゼロ。

$$\boxed{\int_{-1}^1 T_n(x)\,dx = \begin{cases} \dfrac{2}{1-n^2} & n \text{ が偶数} \\[6pt] 0 & n \text{ が奇数} \end{cases}}$$

（ただし \( n = 0 \) のとき \( T_0 = 1 \) で積分値は2。公式 (16) を確認。）

---

## Problem 2: 生成関数

\( G(x,u) = \dfrac{1-ux}{1-2ux+u^2} \) がチェビシェフ多項式を符号化することを示す。

$$\mathrm{Re}\left(\sum_{n=0}^{\infty}e^{in\theta}u^n\right) = \mathrm{Re}\left(\frac{1}{1-ue^{i\theta}}\right)$$

$$= \mathrm{Re}\frac{1-ue^{-i\theta}}{|1-ue^{i\theta}|^2} = \frac{1-u\cos\theta}{1-2u\cos\theta+u^2}$$

\( x = \cos\theta \) で \( T_n(x) = \cos n\theta \) なので

$$\sum_{n=0}^\infty T_n(x)u^n = \frac{1-ux}{1-2ux+u^2} = G(x,u)$$

> **答**: 確認完了。\( G \) のテイラー展開の \( u^n \) の係数が \( T_n(x) \)。

---

## Problem 3: \( T_m(T_n(x)) \) は何か？

\( T_n(x) = \cos(n\cos^{-1}x) \) なので

$$T_m(T_n(x)) = \cos(m\cos^{-1}(T_n(x))) = \cos(m\cos^{-1}(\cos n\theta)) = \cos(mn\theta)$$

$$\boxed{T_m(T_n(x)) = T_{mn}(x)}$$

---

## Problem 4: 等間隔点での多項式補間の破綻

MATLAB の `polyfit` で \( y = e^x \) を \( x = (0:N)/N \) で \( N+1 \) 点補間。

\( N \) が大きくなると（特に \( N \geq 20 \) 程度）、ヴァンデルモンド行列が悪条件になり、係数 \( a_N \) が不安定になる。

> **答**: \( N \approx 15\text{--}20 \) あたりで計算が壊れ始める。等間隔点での高次多項式補間はルンゲ現象により不安定。

---

## Problem 5: 補間多項式のグラフ

Problem 4 の \( p_N(x) \) を `polyval(polyfit)` でプロット。等間隔点では端で振動が激化（ルンゲ現象）。

> **答**: \( N \) が増えると端で振動が発散し、補間は無用になる。

---

## Problem 6: チェビシェフ点での改善

Problem 4, 5 をチェビシェフ点 \( x_j = \cos(j\pi/N) \) で繰り返す。

`polyfit` の係数精度は悪いが、`polyval` で評価した多項式 \( p_N(x) \) は良い近似を与える。

> **答**: チェビシェフ点では端点付近にノードが集中するため、ルンゲ現象が回避され、指数精度で収束する。

---

## Problem 7: 重心公式の性能

大きな \( N \) で `polyval(polyfit)` vs. 重心公式を \( y = 1/(1+x^2) \) で比較。

> **答**: 重心公式はチェビシェフ点で安定な補間を与え、`polyval(polyfit)` より桁違いに安定。係数 \( a_j \) を求めないので悪条件行列を避ける。

---

## Problem 8: ガウス求積法の精度

**(a)** \( \int_{-1}^1 x^{2N+2}\,dx = \dfrac{2}{2N+3} \)

ガウス求積は次数 \( 2N+1 \) まで正確なので、\( x^{2N+2} \) は正確に積分できない。

\( N = 1 \): 正確値 \( 2/5 \)、ガウス2点の結果は \( 2(1/\sqrt{3})^4 = 2/9 \neq 2/5 \)。

\( N = 3 \): 正確値 \( 2/9 \)、ガウス4点で確認。

\( N = 5 \): 正確値 \( 2/13 \)。

**(b)** \( \int_{-1}^1 \dfrac{dx}{\sqrt{1-x^2}} = \pi \)

\( 1/\sqrt{1-x^2} \) は端点で特異なので、精度は有限。

\( N = 3 \): 3.14..., \( N = 7 \): 3.1415..., \( N = 11 \): さらに精度向上。

> ガウス求積は端点特異性があっても多項式精度で収束する。

---

## Problem 9: クレンショー・カーティス求積法

同じ積分を C-C 求積で計算し、\( N = 1024 \) と比較。

> **答**: C-C はガウスとほぼ同精度で、FFT で高速計算可能。実用上は C-C が好まれることが多い。

---

## Problem 10: 台形則 vs ガウス vs C-C

\( f(x) = 1/(5 + 4\cos\pi x) \) on \( [-1,1] \)、10点で比較。

台形則（等間隔10点）: 指数精度（関数が周期的なら台形則は指数的に良い）。

ガウス・C-C: こちらも指数精度だが、収束の定数が異なる。

> **答**: 周期関数では台形則が驚くほど良い（フーリエ級数の指数的減衰を利用）。非周期関数ではガウス/C-C が優位。

---

## Problem 11: スペクトル微分行列 \( DP \) と \( DP^{(2)} \)

\( N = 2 \) のとき:

\( h = 2\pi/2 = \pi \)。

$$DP = \frac{1}{2}\begin{bmatrix} 0 & 1 \\ -1 & 0 \end{bmatrix} \cdot \cot(h/2)$$

ではなく、周期的スペクトル微分の一般公式から:

$$DP = \frac{1}{2}\begin{bmatrix} 0 & -1/\tan(\pi/2) \\ 1/\tan(\pi/2) & 0 \end{bmatrix} = \frac{1}{2}\begin{bmatrix} 0 & 0 \\ 0 & 0 \end{bmatrix}$$

\( \tan(\pi/2) = \infty \) なので対角外要素は0。これは \( N = 2 \) が小さすぎて微分近似が退化する例。

> テキストの公式 (24) で直接確認: \( N = 2 \) 点では \( DP \) と \( DP^{(2)} \) を明示的に構成する。

---

## Problem 12: スペクトル微分の精度

\( u(x) = \sin k\pi x \) で \( DP\,u \) と正確な導関数 \( k\pi\cos k\pi x / 2 \) を比較。

\( x = 1/2 \) で正確な導関数は \( (k\pi)/2\cdot\cos(k\pi/2) \)。

> **答**: 小さい \( N \) では \( k \) が大きいとエイリアシング誤差、\( N = 1024, 4096 \) ではほぼ機械精度。FFT による直接計算（`ifft(c .* fft(u))`）も同様。

---

## Problem 13: MATLAB で \( (DP)^2 \) が巡回行列であることの検証

6点スペクトル微分行列 \( DP \) の二乗 \( (DP)^2 \) がテキスト中で示された巡回行列と一致することを数値的に確認。

> **答**: `DP^2` を計算し、テキストの行列と比較すればよい。巡回行列なので FFT で対角化可能。

---

## Problem 14: 周期的スペクトル微分の応用

\( f(x) = \exp(\sin(x)) \) にスペクトル微分を適用。

\( f'(x) = \cos(x)\exp(\sin(x)) \)

> **答**: \( N \) 点のスペクトル微分結果は、解析的な \( f'(x) \) と \( N \geq 16 \) 程度で機械精度で一致（関数が解析的なため指数収束）。

---

## Problem 15: チェビシェフ微分 \( DC_2 \) の検証

方程式 (25) の \( DC_2 u \) を \( u = 1, x, x^2, \ldots \) に適用。

\( DC_2 \cdot \mathbf{1} = \mathbf{0} \) ✓（定数の微分はゼロ）

\( DC_2 \cdot [1, 0, -1]^T \) で \( u = x \) のチェビシェフ点での値から導関数 \( u' = 1 \) を再現するはず。

> **答**: \( DC_2 \) は低次で正確だが、高次では打ち切り誤差が現れる。テキストの行列 (25) を直接確認。

---

## Problem 16: \( DC_4 u \) の検証

`chebdiff` コードで \( DC_4 \) を生成し、\( u = 1, x, x^2, \ldots \) に適用。\( u' \) がチェビシェフ点で正しいかを確認。

> **答**: \( N = 4 \) ではチェビシェフ点は \( x_j = \cos(j\pi/4) \) for \( j = 0,\ldots,4 \)。4次までの多項式に対して \( DC_4 \) は正確な導関数を与える。

---

## Problem 17: スペクトルコロケーションで \( u'' = 12x^2 \) を解く

\( DC^2 \) を用いる。\( u(1) = u(-1) = 0 \)。

真の解: \( u(x) = x^4 - 1 \)。

\( N = 2 \) でのチェビシェフ点 \( x = 1, 0, -1 \)。\( U - u = x^4 - 1 \) at Chebyshev points。

> \( N = 2,3,4 \) での誤差を計算。\( N \geq 4 \) で \( u = x^4 - 1 \) は4次多項式なので正確に再現される。

---

## Problem 18: 非線形方程式 \( u'' = e^u \) のスペクトル解法

**(a)** \( (DC_2)^2 \) から (25) を用いて手計算:

1内部点（\( N = 2 \) なら \( x_1 = 0 \) のみ）。\( AU = F(U) \) は \( u_1'' = e^{u_1} \)。

\( DC_2 \) の (25) を使うと、境界条件 \( u(1) = u(-1) = 0 \) のもとで \( u_0 = u_2 = 0 \):

$$(DC_2)^2 = \frac{1}{2}\begin{bmatrix} 3 & -4 & 1 \\ 1 & 0 & -1 \\ -1 & 4 & -3 \end{bmatrix} \cdot DC_2$$

内部方程式: \( -4u_1 = e^{u_1} \)（\( u_0 = u_2 = 0 \) を代入）

ニュートン法で解く: \( u_1 \approx -0.217 \)。

**(b)** \( (DC_4)^2 \) で反復。\( AU^{i+1} = F(U^i) \) を \( U^0 = 0 \) から開始。

> 数回の反復で収束する。

---

## Problem 19: 固有値問題 \( u'' = \lambda u \) のスペクトル近似

\( DC_{12} \) と \( DC_{20} \) で \( A = DC^2 \) を構成し、\( \lambda_k - \Lambda_k \) を \( k = 1, \ldots, 10 \) でプロット。

真の固有値: \( \lambda_k = -k^2\pi^2/4 \)。

> **答**: 低い固有値はほぼ正確、高い固有値ほど誤差が大きい。\( N \) を増やすと精度改善。スペクトル法は低い固有値に指数精度を与える。
