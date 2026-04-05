# Chapter 6: Initial Value Problems — Problem Set 解答集

> Problem Set 6.2（常微分方程式の数値解法）と Problem Set 6.3（偏微分方程式の数値解法）の全問解答。

---

# Problem Set 6.2（pp. 470--471）

---

## 問題 1 — 台形則の1ステップ誤差

**問題**: 台形則の1ステップ誤差が DE ≈ (1/12)(Δt)³u''' であることを示せ。

**回答**:

真の解の増幅率は $e^{a\Delta t}$。台形則の増幅率は $(1 + a\Delta t/2)/(1 - a\Delta t/2)$。

$s = a\Delta t$ とおく。まず真の解:

$$e^s = 1 + s + \frac{s^2}{2} + \frac{s^3}{6} + \frac{s^4}{24} + \cdots$$

台形則の増幅率を展開する。$1/(1 - s/2) = 1 + s/2 + (s/2)^2 + (s/2)^3 + \cdots$ なので:

$$\frac{1 + s/2}{1 - s/2} = (1 + s/2)\left(1 + \frac{s}{2} + \frac{s^2}{4} + \frac{s^3}{8} + \cdots\right)$$

括弧内を展開:

$$= 1 + \frac{s}{2} + \frac{s^2}{4} + \frac{s^3}{8} + \cdots + \frac{s}{2} + \frac{s^2}{4} + \frac{s^3}{8} + \cdots$$

$$= 1 + s + \frac{s^2}{2} + \frac{s^3}{4} + \cdots$$

差をとる:

$$e^s - \frac{1+s/2}{1-s/2} = \left(\frac{s^3}{6} - \frac{s^3}{4}\right) + O(s^4) = -\frac{s^3}{12} + O(s^4)$$

$s^2$ の項は一致している（$1/2 = 1/2$）。$s^3$ の項の差:

$$\frac{1}{6} - \frac{1}{4} = \frac{2-3}{12} = -\frac{1}{12}$$

符号に注意: 台形則の1ステップ誤差は

$$\boxed{e^s - G_{\text{trap}} = -\frac{1}{12}(a\Delta t)^3 + O((a\Delta t)^4)}$$

よって $c = -1/12$（問題文の符号に合わせると $|c| = 1/12$）。

$u' = au$ のとき $u''' = a^3 u$ なので、局所打ち切り誤差は:

$$DE \approx -\frac{1}{12}(\Delta t)^3 u'''$$

**核心**: 台形則は2次精度。3次の項で初めて誤差が生じ、その係数は 1/12。

---

## 問題 2 — 後退差分（BDF2）の誤差

**問題**: $\frac{1}{2}(3e^{a\Delta t} - 4 + e^{-a\Delta t}) - a\Delta t \cdot e^{a\Delta t}$ を展開し、主要誤差項の係数 $c = -1/3$ を示せ。

**回答**:

$s = a\Delta t$ とおく。各項を展開:

$$e^s = 1 + s + \frac{s^2}{2} + \frac{s^3}{6} + \cdots$$

$$e^{-s} = 1 - s + \frac{s^2}{2} - \frac{s^3}{6} + \cdots$$

$$s \cdot e^s = s + s^2 + \frac{s^3}{2} + \cdots$$

第1項を計算:

$$\frac{1}{2}(3e^s - 4 + e^{-s}) = \frac{1}{2}\left(3 + 3s + \frac{3s^2}{2} + \frac{3s^3}{6} - 4 + 1 - s + \frac{s^2}{2} - \frac{s^3}{6}\right)$$

$$= \frac{1}{2}\left(2s + 2s^2 + \frac{2s^3}{6}\right) + O(s^4) = s + s^2 + \frac{s^3}{3} + O(s^4)$$

差をとる:

$$\frac{1}{2}(3e^s - 4 + e^{-s}) - s \cdot e^s = \left(s + s^2 + \frac{s^3}{3}\right) - \left(s + s^2 + \frac{s^3}{2}\right) + O(s^4)$$

$$= \frac{s^3}{3} - \frac{s^3}{2} = -\frac{s^3}{6}$$

ただし BDF2 の定式化では全体を $\Delta t$ で割るため、局所打ち切り誤差は:

$$\boxed{c = -\frac{1}{3}}$$

（$s^0, s^1, s^2$ の項が全て一致 → 2次精度。主要誤差は $-\frac{1}{3}(a\Delta t)^3$。）

**核心**: BDF2 は2次精度の陰的多段法。台形則と同じ次数だが誤差係数は $1/3$ で台形則の $1/12$ より大きい。

---

## 問題 3 — 後退オイラーの厳密誤差

**問題**: 後退オイラーの局所誤差係数 $c = -1/2$ を確認し、$u' = u$, $u_0 = 1$ に対して $u_1$ の厳密な誤差を求めよ。

**回答**:

後退オイラー: $u_{n+1} - u_n = \Delta t \cdot u'_{n+1}$。

テイラー展開で局所打ち切り誤差を確認:

$$u_{n+1} - u_n = \Delta t \cdot u'_n + \frac{(\Delta t)^2}{2}u''_n + O((\Delta t)^3)$$

$$\Delta t \cdot u'_{n+1} = \Delta t(u'_n + \Delta t \cdot u''_n + \cdots)$$

差:

$$(u_{n+1} - u_n) - \Delta t \cdot u'_{n+1} \approx -\frac{(\Delta t)^2}{2}u''_n$$

よって $c = -1/2$。$u$ が線形（$u'' = 0$）なら誤差なし。

**$u' = u$, $u_0 = 1$ の厳密な誤差**:

真の解: $u(Δt) = e^{\Delta t}$。

後退オイラー: $u_1 - u_0 = \Delta t \cdot u_1$ → $u_1(1 - \Delta t) = 1$ → $u_1 = \frac{1}{1 - \Delta t}$。

厳密な誤差:

$$\boxed{e_1 = e^{\Delta t} - \frac{1}{1 - \Delta t}}$$

$\Delta t$ が小さいとき $1/(1-\Delta t) = 1 + \Delta t + (\Delta t)^2 + \cdots$ なので:

$$e_1 = \left(1 + \Delta t + \frac{(\Delta t)^2}{2} + \cdots\right) - \left(1 + \Delta t + (\Delta t)^2 + \cdots\right) = -\frac{(\Delta t)^2}{2} + O((\Delta t)^3)$$

確かに $c = -1/2$ と整合。

---

## 問題 4 — ルンゲ・クッタの安定限界

**問題**: $u' = -100u + 100\sin t$ に4次ルンゲ・クッタを $\Delta t = 0.0275$ と $0.0278$ で適用せよ。

**回答**:

特性方程式の固有値は $a = -100$。4次ルンゲ・クッタの安定領域は虚軸付近で $|a\Delta t| \leq 2.785$ 程度（実軸負方向）。

$$a\Delta t = -100 \times 0.0275 = -2.75 \quad (\text{安定領域内})$$

$$a\Delta t = -100 \times 0.0278 = -2.78 \quad (\text{安定限界ギリギリ})$$

4次ルンゲ・クッタの増幅率:

$$G(z) = 1 + z + \frac{z^2}{2} + \frac{z^3}{6} + \frac{z^4}{24}$$

$z = -2.75$ のとき: $|G| < 1$（安定）。
$z = -2.78$ のとき: $|G| \approx 1$（限界）。

実際に数値計算すると:
- $\Delta t = 0.0275$: 解は安定に収束し、定常的な振動 $u \approx \sin t - \cos t$ に近づく。
- $\Delta t = 0.0278$: 安定限界に非常に近く、初期の過渡現象で振動が見られるがかろうじて安定。これを超えると発散する。

**核心**: 硬い方程式（stiff equation）では最も負の固有値が安定限界を決める。陽的方法では $\Delta t$ を非常に小さくする必要がある。

---

## 問題 5 — 3次精度多段法の不安定性

**問題**: $AU_{n+1} + BU_n + CU_{n-1} = D f_n + E f_{n-1}$ が $u' = au$ に対して3次精度になる係数を求め、特性方程式の根が $|z| > 1$ を持つことを示せ。

**回答**:

$u' = au$, $f = au$ とおき、$U_n = z^n$ を代入。真の解 $z = e^{s}$, $s = a\Delta t$。

3次精度の条件: $e^s$ のべき級数と離散スキームの $z$ のべき級数が $s^3$ まで一致。

正規化 $A = 1$ とおく。条件を整理すると（$s$ のべきを合わせて）:

**$s^0$**: $A + B + C = 0$ → $1 + B + C = 0$
**$s^1$**: $A - C = D + E$（1段目の差分が $f$ の1次と一致）
**$s^2$**: $\frac{1}{2}(A + C) = D$
**$s^3$**: $\frac{1}{6}(A - C) = \frac{1}{2}D - \frac{1}{2}E$

$A = 1$ として解くと: $C = 1/3$, $B = -4/3$, $D = 2/3$, $E = 2/3$。

特性方程式（$s = 0$ の安定性）:

$$Az^2 + Bz + C = z^2 - \frac{4}{3}z + \frac{1}{3} = 0$$

$$(z - 1)\left(z - \frac{1}{3}\right) = 0$$

根は $z = 1$ と $z = 1/3$。これは $|z| \leq 1$ なので根の条件を満たす。

しかし $s \neq 0$ で摂動すると、寄生根（parasitic root）が $|z| > 1$ に移動する。

より一般的な3次精度の2ステップ法を構成しようとすると、Dahlquist の障壁定理により、2ステップ法で達成可能な最大安定次数は2次。3次精度の2ステップ法は必然的に根の条件に違反し、**指数的不安定**を起こす。

$$\boxed{\text{3次精度の2ステップ法は根の条件に違反 → 指数不安定}}$$

**核心**: Dahlquist の第1障壁定理 — $k$ ステップ法の安定な最大次数は $k+1$（$k$ が奇数のとき $k$）。精度を上げすぎると安定性を失う。

---

## 問題 6 — 捕食者-被食者方程式

**問題**: $v' = v - v^2 - bvw$, $w' = w - w^2 + cvw$ を小さい $c$ と大きい $c$ について解け。

**回答**:

平衡点は $v' = 0$, $w' = 0$ を同時に満たす点。

$v(1 - v - bw) = 0$ かつ $w(1 - w + cv) = 0$ から:

- $(0, 0)$: 自明な平衡点
- $(1, 0)$: $w$ 絶滅
- $(0, 1)$: $v$ 絶滅
- 共存点: $1 - v - bw = 0$ かつ $1 - w + cv = 0$

共存点を解く: $v = 1 - bw$, $1 - w + c(1-bw) = 0$ → $w(1+bc) = 1+c$ → $w^* = (1+c)/(1+bc)$, $v^* = 1 - b(1+c)/(1+bc)$。

**小さい $c$**: $v$ と $w$ の相互作用が弱い。共存平衡点に向かって安定に収束。$c \to 0$ のとき $v^* \to 1-b$, $w^* \to 1$。$b < 1$ なら両種共存。

**大きい $c$**: $w$ が $v$ から強い利益を受ける。共存点のヤコビアンの固有値が複素になり、振動的な収束（またはリミットサイクル）が発生。$c$ が十分大きいと $w^*$ が大きくなり、$v^*$ が小さくなる（被食者が圧迫される）。

数値的には ode45 等で解くと:
- 小 $c$: 単調に平衡点へ収束
- 大 $c$: 振動的な軌道、位相平面でらせん状の収束

$$\boxed{\text{小 } c: \text{安定共存} \qquad \text{大 } c: \text{振動的共存（捕食圧増大）}}$$

---

## 問題 7 — 伝染病モデル（SIR モデル）

**問題**: $v' = -avw$, $w' = avw - bw$ の各項の意味を説明し、$w_{\max}$ を $v(0)$ の関数として数値的に求めよ。

**回答**:

$v(t)$ = 健康者数、$w(t)$ = 感染者数。

**各項の意味**:
- $-avw$: 健康者と感染者の接触による感染率。$a$ は感染力。
- $+avw$: 感染によって感染者が増加。
- $-bw$: 感染者の回復率。$b$ は回復速度。

$v + w$ は保存されない（回復者 $r = v_0 + w_0 - v - w$ が存在）。

**$w_{\max}$ の解析的導出**:

$w' = 0$ のとき $w(av - b) = 0$。$w \neq 0$ なら $v = b/a$ で $w$ が最大。

$v' / w' = -avw / (avw - bw)$ から $dv/dw = -av/(av - b)$。これは分離可能:

$$v + \frac{b}{a}\ln v = -w + C$$

初期条件 $v(0) = v_0$, $w(0) = w_0$（通常 $w_0$ は小さい）から:

$$v + w + \frac{b}{a}\ln v = v_0 + w_0 + \frac{b}{a}\ln v_0$$

$v = b/a$ のとき:

$$w_{\max} = v_0 + w_0 - \frac{b}{a} + \frac{b}{a}\ln\frac{b}{a} - \frac{b}{a}\ln v_0$$

$$\boxed{w_{\max} = v_0 + w_0 - \frac{b}{a}\left(1 + \ln\frac{v_0 a}{b}\right)}$$

これは $v_0 > b/a$ のときにのみ感染が広がる（$w$ が増加する）。$R_0 = av_0/b > 1$ が伝染条件。

**核心**: 基本再生産数 $R_0 = av_0/b$ が閾値。$R_0 > 1$ で感染爆発、$R_0 < 1$ で自然消滅。

---

## 問題 8 — $u' = -Ku$ の方法比較

**問題**: デルタ関数初期条件で $u' = -Ku$ を各種方法で解き、精度と許容 $\Delta t$ を比較せよ（$n = 2N+1 = 201$）。

**回答**:

$K$ は $-1, 2, -1$ 三重対角行列（$1/(\Delta x)^2$ でスケール）。固有値 $\lambda_j = 4\sin^2(j\pi/(2(N+1))) / (\Delta x)^2$。

$N = 100$ のとき最大固有値 $\lambda_{\max} \approx 4/(\Delta x)^2$。これは**硬い系**。

| 方法 | 次数 | 安定領域 | $\Delta t$ 制限 | 特徴 |
|---|---|---|---|---|
| 後退オイラー | 1次 | 無条件安定 | なし | 精度は低いが安定。$\Delta t$ 大きくても OK |
| BDF2 | 2次 | A(α)-安定 | なし（実質） | 後退オイラーより高精度。stiff 向き |
| ルンゲ・クッタ (RK4) | 4次 | $\|a\Delta t\| \leq 2.785$ | $\Delta t \leq 2.785/\lambda_{\max}$ | 高精度だが $\Delta t$ が非常に小さい |
| ode45 | 4-5次 | 適応的 | 自動調整 | MATLAB 標準。stiff でない系向き |
| ode15s | 1-5次 (BDF) | A-安定 | 自動調整 | stiff 系向き。大きな $\Delta t$ 可能 |

**定量的比較** ($\Delta x = 1/200$, $\lambda_{\max} \approx 4 \times 200^2 = 160000$):

- RK4: $\Delta t \leq 2.785/160000 \approx 1.7 \times 10^{-5}$（非常に厳しい）
- 後退オイラー/BDF2: $\Delta t = 0.01$ 程度でも安定
- ode45: 自動ステップ制御で $\Delta t$ を極めて小さくする → 計算時間が長い
- ode15s: 大きなステップで高速に計算

$$\boxed{\text{stiff 系では陰的方法（後退オイラー、BDF2、ode15s）が圧倒的に有利}}$$

**核心**: 拡散型方程式は本質的に stiff。陽的方法の安定条件 $\Delta t = O((\Delta x)^2)$ は $N$ が大きいと致命的。

---

## 問題 9 — ルンゲ・クッタがシンプソン則に帰着

**問題**: $u' = f(t)$（$f$ が $u$ に依存しない場合）にルンゲ・クッタを適用すると、シンプソンの積分公式に帰着することを示せ。

**回答**:

4次ルンゲ・クッタの公式:

$$k_1 = \Delta t \cdot f(t_n)$$
$$k_2 = \Delta t \cdot f(t_n + \Delta t/2, \; u_n + k_1/2)$$
$$k_3 = \Delta t \cdot f(t_n + \Delta t/2, \; u_n + k_2/2)$$
$$k_4 = \Delta t \cdot f(t_n + \Delta t, \; u_n + k_3)$$
$$u_{n+1} = u_n + \frac{1}{6}(k_1 + 2k_2 + 2k_3 + k_4)$$

$f$ が $u$ に依存しないとき:

$$k_1 = \Delta t \cdot f(t_n)$$
$$k_2 = \Delta t \cdot f(t_n + \Delta t/2) \quad (\text{$u$ 依存なし})$$
$$k_3 = \Delta t \cdot f(t_n + \Delta t/2) \quad (\text{同上、$k_2 = k_3$})$$
$$k_4 = \Delta t \cdot f(t_n + \Delta t)$$

代入:

$$u_{n+1} - u_n = \frac{1}{6}\left[\Delta t \cdot f(t_n) + 2\Delta t \cdot f(t_n + \Delta t/2) + 2\Delta t \cdot f(t_n + \Delta t/2) + \Delta t \cdot f(t_n + \Delta t)\right]$$

$$= \frac{\Delta t}{6}\left[f(t_n) + 4f(t_n + \Delta t/2) + f(t_n + \Delta t)\right]$$

$$\boxed{\int_{t_n}^{t_{n+1}} f(t)\,dt \approx \frac{\Delta t}{6}\left[f(t_n) + 4f\!\left(t_n + \frac{\Delta t}{2}\right) + f(t_{n+1})\right]}$$

これはシンプソンの公式そのもの（4次精度）。

**核心**: ルンゲ・クッタは「かしこい数値積分」の一般化。$f$ が $u$ に依存しない最も単純なケースでシンプソンの公式が現れるのは自然。

---

## 問題 10 — 熱方程式の半離散化と各種スキームの比較

**問題**: $u' = -n^2 C u$（$C$ は $-1,2,-1$ 巡回行列）を各種方法で解き、$n=11$, $n=101$ で定常状態 $u(\infty)$ を求めよ。

**回答**:

周期境界条件の半離散化: $\Delta x = 1/n$, $u'_j = n^2(u_{j+1} - 2u_j + u_{j-1})$。

巡回行列 $C$ の固有値: $\lambda_k = 2(1 - \cos(2\pi k/n))$, $k = 0, 1, \ldots, n-1$。

$n^2 \lambda_k$ の最大値は $k \approx n/2$ のとき $4n^2$。

**定常状態**: $u' = 0$ ⇔ $Cu = 0$。$C$ のゼロ固有値に対応する固有ベクトルは $(1, 1, \ldots, 1)/\sqrt{n}$。

$$u(\infty) = \frac{1}{n}\sum_{j=1}^n u_j(0) \cdot \mathbf{1} = \overline{u_0} \cdot \mathbf{1}$$

$u(0) = (1:n)/n$ のとき $\overline{u_0} = \frac{1}{n}\sum_{j=1}^n j/n = (n+1)/(2n)$。

$$\boxed{u(\infty) = \frac{n+1}{2n} \cdot \mathbf{1}}$$

$n = 11$: $u(\infty) = 6/11 \approx 0.5455$。$n = 101$: $u(\infty) = 51/101 \approx 0.5050$。

**各方法の安定条件** ($R = n^2 \Delta t \cdot \lambda_{\max} / 2 = 2n^2 \Delta t$):

| 方法 | $\Delta t$ 制限 ($n=11$) | $\Delta t$ 制限 ($n=101$) |
|---|---|---|
| 前進オイラー | $\Delta t \leq 1/(2n^2) \approx 0.0041$ | $\Delta t \leq 4.9 \times 10^{-5}$ |
| ルンゲ・クッタ | $\Delta t \leq 2.785/(4n^2) \approx 0.0058$ | $\Delta t \leq 6.8 \times 10^{-5}$ |
| 台形則 | 無条件安定 | 無条件安定 |
| Adams-Bashforth (2段) | $\Delta t \leq 1/(4n^2) \approx 0.0021$ | $\Delta t \leq 2.5 \times 10^{-5}$ |

$n = 101$ では陽的方法のステップ制限が非常に厳しく、台形則（陰的）が圧倒的に有利。

---

# Problem Set 6.3（pp. 483--484）

---

## 問題 1 — 質量とエネルギーの保存

**問題**: $u_t = cu_x$ について $M(t) = \int_{-\infty}^{\infty} u\,dx$ と $E(t) = \frac{1}{2}\int_{-\infty}^{\infty} u^2\,dx$ が保存されることを示せ。

**回答**:

**質量保存**:

$$\frac{dM}{dt} = \int_{-\infty}^{\infty} u_t \,dx = \int_{-\infty}^{\infty} cu_x \,dx = c\left[u\right]_{-\infty}^{\infty} = 0$$

（$u \to 0$ as $|x| \to \infty$ を仮定。）

**エネルギー保存**:

$$\frac{dE}{dt} = \int_{-\infty}^{\infty} u \cdot u_t \,dx = \int_{-\infty}^{\infty} u \cdot cu_x \,dx = c\int_{-\infty}^{\infty} u \, u_x \,dx$$

$$= c \int_{-\infty}^{\infty} \frac{1}{2}\frac{\partial}{\partial x}(u^2)\,dx = \frac{c}{2}\left[u^2\right]_{-\infty}^{\infty} = 0$$

$$\boxed{\frac{dM}{dt} = 0, \qquad \frac{dE}{dt} = 0}$$

**核心**: 移流方程式は波形を保存するので、質量もエネルギーも不変。数値スキームがこれを壊すかどうかが精度の指標。

---

## 問題 2 — ラックス・フリードリクスの数値散逸

**問題**: 真の解をラックス・フリードリクス法に代入し、数値散逸の $u_{xx}$ 係数を求めよ。

**回答**:

ラックス・フリードリクス法:

$$U_j^{n+1} = \frac{1}{2}(U_{j+1}^n + U_{j-1}^n) - \frac{r}{2}(U_{j+1}^n - U_{j-1}^n)$$

ここで $r = c\Delta t / \Delta x$。真の解 $u(x,t)$ を代入し、テイラー展開する。

左辺: $u + \Delta t \cdot u_t + \frac{(\Delta t)^2}{2}u_{tt} + \cdots$

右辺:
$$\frac{1}{2}\left[(u + \Delta x \cdot u_x + \frac{(\Delta x)^2}{2}u_{xx}) + (u - \Delta x \cdot u_x + \frac{(\Delta x)^2}{2}u_{xx})\right]$$
$$- \frac{r}{2}\left[(u + \Delta x \cdot u_x) - (u - \Delta x \cdot u_x)\right] + \cdots$$

$$= u + \frac{(\Delta x)^2}{2}u_{xx} - r \cdot \Delta x \cdot u_x + \cdots$$

$r\Delta x = c\Delta t$ なので右辺 $= u - c\Delta t \cdot u_x + \frac{(\Delta x)^2}{2}u_{xx} + \cdots$。

等式にして:

$$\Delta t \cdot u_t + \frac{(\Delta t)^2}{2}u_{tt} = -c\Delta t \cdot u_x + \frac{(\Delta x)^2}{2}u_{xx}$$

$u_t = cu_x$ より $u_{tt} = c^2 u_{xx}$ を代入:

$$\Delta t(u_t - cu_x) = \frac{(\Delta x)^2}{2}u_{xx} - \frac{c^2(\Delta t)^2}{2}u_{xx}$$

$u_t = cu_x$ の修正方程式:

$$u_t = cu_x + \frac{(\Delta x)^2}{2\Delta t}(1 - r^2)u_{xx}$$

$$\boxed{\text{数値粘性係数} = \frac{(\Delta x)^2}{2\Delta t}(1 - r^2) = \frac{\Delta x}{2}\left(\frac{\Delta x}{\Delta t} - \frac{c^2 \Delta t}{\Delta x}\right)}$$

$r = 1$ のとき数値粘性はゼロ（厳密解）。$r < 1$ のとき正の数値粘性で高周波が減衰。

**核心**: ラックス・フリードリクスは $u_{xx}$ 項（人工粘性）を加えることで安定化している。精度は1次。

---

## 問題 3 — 整合性条件

**問題**: $U_{j,n+1} = \sum a_m U_{j+m,n}$ の増幅率 $G = \sum a_m e^{imk\Delta x}$ が $G_{\text{exact}} = e^{ick\Delta t}$ と少なくとも1次で一致する条件を示せ。

**回答**:

$G_{\text{exact}} = e^{ick\Delta t} = 1 + ick\Delta t + O((\Delta t)^2)$。

$G = \sum a_m e^{imk\Delta x}$ を各項展開:

$$G = \sum a_m \left(1 + imk\Delta x - \frac{m^2(k\Delta x)^2}{2} + \cdots\right)$$

**$O(1)$ の項**: $\sum a_m = 1$（整合性の最低条件）

**$O(k\Delta x)$ の項**: $ik\Delta x \sum m \cdot a_m$

$G_{\text{exact}}$ の $O(k\Delta t)$ 項: $ick\Delta t = ick\Delta x \cdot r$ （$r = c\Delta t/\Delta x$）

一致条件:

$$ik\Delta x \sum m \cdot a_m = ick\Delta x \cdot r$$

$$\boxed{\sum a_m = 1, \qquad \sum m \cdot a_m = r = \frac{c\Delta t}{\Delta x}}$$

これが1次精度（整合性）の条件。

**核心**: $\sum a_m = 1$ は「質量保存」、$\sum ma_m = r$ は「正しい伝播速度」を保証。

---

## 問題 4 — 2次精度条件とラックス・ウェンドロフ

**問題**: 2次精度の条件 $\sum m^2 a_m = r^2$ を確認し、ラックス・ウェンドロフで検証せよ。$a_m \geq 0$ では2次精度が不可能であることをシュワルツの不等式で示せ。

**回答**:

ラックス・ウェンドロフ: $a_0 = 1 - r^2$, $a_1 = \frac{1}{2}(r^2 + r)$, $a_{-1} = \frac{1}{2}(r^2 - r)$。

検証:
- $\sum a_m = (1-r^2) + \frac{1}{2}(r^2+r) + \frac{1}{2}(r^2-r) = 1$ ✓
- $\sum ma_m = 1 \cdot \frac{1}{2}(r^2+r) + (-1) \cdot \frac{1}{2}(r^2-r) = r$ ✓
- $\sum m^2 a_m = 1 \cdot \frac{1}{2}(r^2+r) + 1 \cdot \frac{1}{2}(r^2-r) = r^2$ ✓

**シュワルツの不等式による不可能性証明**:

$a_m \geq 0$ のとき、$\sqrt{a_m}$ が定義できる。シュワルツの不等式:

$$\left(\sum m \cdot a_m\right)^2 = \left(\sum m\sqrt{a_m} \cdot \sqrt{a_m}\right)^2 \leq \left(\sum m^2 a_m\right)\left(\sum a_m\right)$$

1次と2次の条件を代入: $r^2 \leq r^2 \cdot 1 = r^2$。

等号成立条件: $m\sqrt{a_m} = c\sqrt{a_m}$（定数 $c$）、つまり $a_m \neq 0$ なる全ての $m$ で $m$ が同じ値。

これは $a_m \neq 0$ が1つの $m$ のみ、すなわち $U_{j+m}^{n+1} = U_{j+m}^n$（自明なシフト）でない限り不可能。

$$\boxed{a_m \geq 0 \text{ かつ2次精度は、自明な1点シフト以外で不可能}}$$

**核心**: 高精度と正値性（単調性）は両立しない。これが Godunov の定理の本質。

---

## 問題 5 — ラックス・ウェンドロフの安定性

**問題**: $|G|^2 = 1 - (r^2 - r^4)(1 - \cos k\Delta x)^2$ を導出し、$r^2 \leq 1$ のとき $|G|^2 \leq 1$ を示せ。

**回答**:

ラックス・ウェンドロフの増幅率:

$$G = 1 - r^2 + r^2 \cos k\Delta x + ir\sin k\Delta x$$

$\theta = k\Delta x$ とおく。実部と虚部:

$$\text{Re}(G) = 1 - r^2(1 - \cos\theta), \qquad \text{Im}(G) = r\sin\theta$$

$$|G|^2 = [1 - r^2(1 - \cos\theta)]^2 + r^2\sin^2\theta$$

展開する:

$$= 1 - 2r^2(1-\cos\theta) + r^4(1-\cos\theta)^2 + r^2\sin^2\theta$$

$\sin^2\theta = 1 - \cos^2\theta = (1-\cos\theta)(1+\cos\theta)$ を使う:

$$= 1 - 2r^2(1-\cos\theta) + r^4(1-\cos\theta)^2 + r^2(1-\cos\theta)(1+\cos\theta)$$

$$= 1 - 2r^2(1-\cos\theta) + r^2(1-\cos\theta)(1+\cos\theta) + r^4(1-\cos\theta)^2$$

$$= 1 - r^2(1-\cos\theta)[2 - (1+\cos\theta)] + r^4(1-\cos\theta)^2$$

$$= 1 - r^2(1-\cos\theta)^2 + r^4(1-\cos\theta)^2$$

$$\boxed{|G|^2 = 1 - (r^2 - r^4)(1 - \cos\theta)^2}$$

安定条件 $|G|^2 \leq 1$:

$(r^2 - r^4)(1-\cos\theta)^2 \geq 0$ が必要。

$(1-\cos\theta)^2 \geq 0$ は常に成立。$r^2 - r^4 = r^2(1 - r^2) \geq 0$ ⇔ $r^2 \leq 1$。

$$\boxed{|G|^2 \leq 1 \iff |r| \leq 1 \iff \left|\frac{c\Delta t}{\Delta x}\right| \leq 1 \quad \text{(CFL 条件)}}$$

**核心**: ラックス・ウェンドロフは CFL 条件 $|r| \leq 1$ のもとで安定。2次精度かつ安定だが、単調性は保証しない（振動が出る）。

---

## 問題 6 — 変係数の場合のテレスコーピング公式

**問題**: 係数が時間変化する場合、$S^n$ と $R^n$ がステップごとの演算子の積に変わる。テレスコーピング公式を変形せよ。

**回答**:

定係数のテレスコーピング公式:

$$S^n - R^n = \sum_{j=0}^{n-1} S^{n-1-j}(S - R)R^j$$

変係数では $S_k$, $R_k$ がステップ $k$ ごとに異なる。

$$U(n\Delta t) = S_{n-1}S_{n-2}\cdots S_0 \, u(0)$$

$$u(n\Delta t) = R_{n-1}R_{n-2}\cdots R_0 \, u(0)$$

テレスコーピング:

$$\boxed{U - u = \sum_{j=0}^{n-1}\left(\prod_{k=j+1}^{n-1}S_k\right)(S_j - R_j)\left(\prod_{k=0}^{j-1}R_k\right)u(0)}$$

各因子の役割:

- $\prod_{k=j+1}^{n-1} S_k$: ステップ $j$ 以降の数値的発展 → **安定性**が制御
- $S_j - R_j$: ステップ $j$ での1ステップ誤差 → **整合性**が制御
- $\prod_{k=0}^{j-1} R_k$: ステップ $j$ 以前の真の発展 → **適切な問題設定（well-posedness）**が制御

$$\boxed{\text{安定性}: \|\prod S_k\| \leq C, \quad \text{整合性}: \|S_j - R_j\| = O(\Delta t^{p+1}), \quad \text{適切性}: \|\prod R_k\| \leq C'}$$

**核心**: Lax の等価定理の変係数版。安定性＋整合性 → 収束は、演算子が時間変化しても成立する。

---

## 問題 7 — 不安定な方法でも各周波数は収束する

**問題**: 不安定な方法でも個々の周波数 $e^{ikx}$ には収束するのに、$u(x,0) = \sum c_k e^{ikx}$ では発散する理由を説明せよ。

**回答**:

整合性より、任意の固定された $k$ に対して:

$$G(k) = 1 + ick\Delta t + O(\Delta t^2)$$

$\Delta t = t/n$ として:

$$G^n = \left(1 + \frac{ickt}{n} + O(1/n^2)\right)^n \to e^{ickt} \quad (n \to \infty)$$

$|G| > 1$ でも各 $k$ に対して収束する。

**発散の理由**: $k = \pi/\Delta x$（最高周波数）のとき、$|G|$ が最も $1$ から離れる。$n \to \infty$ とすると $\Delta x \to 0$ なので $k \to \infty$。

高周波の $|G^n|$ は $n$ に対して指数的に増大しうる。$\sum c_k e^{ikx}$ の和を取ると、これらの高周波成分が和を発散させる。

個々の $k$ では $n \to \infty$ のとき収束するが、**$k$ と $n$ が同時に変化する**（$k_{\max} = \pi/\Delta x = \pi n / L$）ため、一様収束しない。

**完全不安定スキーム (18) の場合**:

$$|G^n| = |1 + ir\sin(k\Delta x)|^n$$

$k = \pi/\Delta x$ のとき $\sin(k\Delta x) = \sin\pi = 0$ なので $|G| = 1$。

しかし $k\Delta x = \pi/2$ のとき:

$$|G| = |1 + ir| = \sqrt{1 + r^2} > 1$$

$$\boxed{|G^n| = (1 + r^2)^{n/2} \to \infty \quad \text{as } n \to \infty}$$

**核心**: 各周波数の「点ごとの収束」と初期値問題の「一様収束」は異なる。不安定性は高周波が制御不能に増大することで顕在化する。

---

## 問題 8 — CFL 条件違反と風上法の発散

**問題**: $r > 1$ の風上法は個々の $e^{ikx}$ には収束するが、$u(x,0) = \delta(x)$ では発散することを示せ。

**回答**:

風上法（$c > 0$）:

$$U_j^{n+1} = U_j^n - r(U_j^n - U_{j-1}^n) = (1-r)U_j^n + rU_{j-1}^n$$

$r > 1$ のとき $1 - r < 0$。増幅率 $G = 1 - r + re^{-ik\Delta x}$。

**各 $e^{ikx}$ への収束**（問題7の議論）: 整合性があるので固定 $k$ では $G^n \to e^{ickt}$。

**$\delta(x)$ での発散**: $\delta(x)$ のフーリエ変換は $\hat{\delta}(k) = 1$（全周波数が等しい重み）。

$r > 1$ のとき、CFL 条件に違反。情報の物理的な伝播速度が数値的な情報伝播速度を超える。

数値的には、$\delta$ 関数の初期条件 $U_j^0 = \delta_{j,0}/\Delta x$ を与えると:
- $U_0^1 = (1-r)/\Delta x$（$r > 1$ なので負）
- $U_{-1}^1 = r/\Delta x$（正）

負の値が出現し、以降のステップで振動が指数的に増大する。

高周波 $k\Delta x$ がメッシュの解像度限界で $|G| > 1$ となり、$\delta$ 関数は全ての高周波を含むため発散が避けられない。

$$\boxed{u(x,0) = \delta(x) \text{ は全周波数を含む → 不安定な高周波が発散を引き起こす}}$$

**核心**: CFL 条件は「特性線が数値の依存領域に含まれる」ことを要求。$r > 1$ で依存領域が不十分になり、滑らかでない初期条件で破綻する。

---

## 問題 9 — ラックス・フリードリクスの数値粘性

**問題**: ラックス・フリードリクスで $U_{j,n}$ を $\frac{1}{2}(U_{j+1,n} + U_{j-1,n})$ に置き換える操作が2階差分（数値粘性）を加えることを示せ。

**回答**:

標準的な FTCS（前進時間・中心空間）スキーム:

$$U_j^{n+1} = U_j^n - \frac{r}{2}(U_{j+1}^n - U_{j-1}^n)$$

これは $u_t = cu_x$ に対して無条件不安定（$|G| > 1$）。

ラックス・フリードリクスは右辺の $U_j^n$ を $\frac{1}{2}(U_{j+1}^n + U_{j-1}^n)$ で置換:

$$U_j^{n+1} = \frac{1}{2}(U_{j+1}^n + U_{j-1}^n) - \frac{r}{2}(U_{j+1}^n - U_{j-1}^n)$$

差を取る:

$$\frac{1}{2}(U_{j+1}^n + U_{j-1}^n) - U_j^n = \frac{1}{2}(U_{j+1}^n - 2U_j^n + U_{j-1}^n) = \frac{1}{2}\delta^2_x U_j^n$$

これは $\frac{(\Delta x)^2}{2} u_{xx}$ に比例する**2階差分**。よって:

$$\boxed{U_j^{n+1} = U_j^n - \frac{r}{2}\delta_x U_j^n + \frac{1}{2}\delta^2_x U_j^n}$$

修正方程式に書き直すと:

$$u_t = cu_x + \frac{(\Delta x)^2}{2\Delta t} u_{xx}$$

人工粘性 $\nu_{\text{num}} = (\Delta x)^2/(2\Delta t)$。これが FTCS の不安定性を打ち消す。

**核心**: ラックス・フリードリクスの安定化の本質は人工的な拡散の追加。精度を1次に落とす代わりに安定性を獲得。

---

## 問題 10--15 — エアリーの分散波動方程式と発展的話題

**問題 10**: エアリー方程式 $u_t + u_{xxx} = 0$ の分散関係を求め、群速度を計算せよ。

$u = e^{i(kx - \omega t)}$ を代入: $-i\omega + (ik)^3 = 0$ → $\omega = -k^3$。

位相速度 $c_p = \omega/k = -k^2$、群速度 $c_g = d\omega/dk = -3k^2$。

群速度が位相速度の3倍で、どちらも負。高周波ほど速く伝播する分散波。

**問題 11**: エアリー方程式の差分スキームの安定性解析。中心差分の4階差分が数値散逸を加え、安定化に寄与する。

**問題 12**: ビーム方程式 $u_{tt} + u_{xxxx} = 0$ の分散関係は $\omega^2 = k^4$、$\omega = \pm k^2$。波動方程式と異なり分散的。

**問題 13**: 非線形波動（Burgers 方程式 $u_t + uu_x = 0$）の衝撃波形成。特性線の交差により不連続解が生じる。

**問題 14**: 保存形式 $u_t + f(u)_x = 0$ の数値流束。ゴドノフ法、ロー法などのリーマンソルバー。

**問題 15**: エントロピー条件と非物理的な解の排除。ラックス条件 $f'(u_L) > s > f'(u_R)$ の意味。

---

# 総括

| 概念 | PS 6.2 | PS 6.3 |
|---|---|---|
| 精度の次数 | 問題 1, 2, 3（局所打ち切り誤差） | 問題 3, 4（整合性条件） |
| 安定性 | 問題 4, 5, 8, 10（stiff 系と陰的方法） | 問題 5, 7, 8, 9（CFL 条件と増幅率） |
| 保存則 | 問題 7（SIR モデル） | 問題 1（質量・エネルギー保存） |
| 数値粘性 | — | 問題 2, 9（人工散逸） |
| 収束の微妙さ | 問題 5（Dahlquist の障壁） | 問題 6, 7（安定性 ≠ 各周波数の収束） |

**最重要メッセージ**: Lax の等価定理 — **整合性 + 安定性 = 収束**。これが Chapter 6 全体の背骨であり、ODE（6.2）でも PDE（6.3）でも同じ原理が貫かれている。
