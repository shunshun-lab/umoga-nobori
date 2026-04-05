# Chapter 6 — Problem Set 6.4, 6.6, 6.7 解答

> Strang "Computational Science and Engineering" 第6章 — 波動方程式とスタッガードリープフロッグ (PS 6.4)、非線形フローと保存則 (PS 6.6)、流体力学とNavier-Stokes (PS 6.7) の全問解答。

---

# Problem Set 6.4（pp. 498--499）— 波動方程式とスタッガードリープフロッグ

---

## 問題 1 — 水の壁のダランベール解

**問題**: 箱関数（$-1 \le x \le 1$ で $u(x,0) = 1$）から出発し、$u_t(x,0) = 0$ で静止開始。ダランベールの公式 (8) から $u(x,t)$ を求めよ。

**回答**:

ダランベールの公式 (8) は、$u_t(x,0) = 0$ のとき:

$$u(x,t) = \frac{u(x+ct, 0) + u(x-ct, 0)}{2}$$

$c = 1$ とし、初期条件を $u(x,0) = S(x)$（$|x| \le 1$ で 1、それ以外 0）とする。

$$\boxed{u(x,t) = \frac{S(x+t) + S(x-t)}{2}}$$

これは2つの半分の高さの壁が左右に速度 $c$ で伝播する解。時刻 $t$ で $u = 1/2$ の領域は $-1-t < x < -1+t$ と $1-t < x < 1+t$、$u = 1$ の領域は $|x+t| < 1$ かつ $|x-t| < 1$ を満たす部分。

---

## 問題 2 — 変数分離と $\sin nx \sin nt$

**問題**: $u(x,t) = (\sin nx)(\sin nt)$ と同様の $2\pi$ 周期解が3つ。複素関数 $e^{ikx}e^{int}$ はいつ波動方程式を解くか？

**回答**:

$u_{tt} = u_{xx}$ に代入: $u = e^{ikx}e^{i\omega t}$ なら $-\omega^2 = -k^2$ つまり $\omega = \pm k$。

$2\pi$ 周期で $c = 1$ の場合、$k = n$（整数）で $\omega = n$。3つの解:

1. $u_1 = \sin(nx)\sin(nt)$
2. $u_2 = \sin(nx)\cos(nt)$
3. $u_3 = \cos(nx)\sin(nt)$

$$\boxed{e^{ikx}e^{i\omega t} \text{ が波動方程式を解く条件}: \omega^2 = k^2 \text{ すなわち } \omega = \pm k}$$

---

## 問題 3 — のこぎり波と方形波のフーリエ級数

**問題**: $SW(x), ST(x)$ を用い、$u_{tt} = u_{xx}$、$u_t(x,0) = 0$ として二重フーリエ級数で解け。

**回答**:

$u_t(x,0) = 0$ なので $u(x,t) = \sum b_n \cos(nt) \sin(nx)$（もしくは同様のフーリエ級数）。

**方形波** $SW(x)$ のフーリエ係数: $b_n = 4/(\pi n)$（$n$ 奇数）、0（$n$ 偶数）。

$$u_{SW}(x,t) = \frac{4}{\pi}\sum_{n \text{ odd}} \frac{\cos nt \sin nx}{n}$$

**のこぎり波** $ST(x)$ のフーリエ係数: $b_n = 2(-1)^{n+1}/(\pi n)$。

$$\boxed{u_{ST}(x,t) = \frac{2}{\pi}\sum_{n=1}^{\infty} \frac{(-1)^{n+1}}{n} \cos(nt)\sin(nx)}$$

---

## 問題 4 — $SW(x)$ と $ST(x)$ のグラフ

**問題**: $|x| \le \pi$ で $2\pi$ 周期に拡張。ダランベール解 $u_{SW} = \frac{1}{2}SW(x+t) + \frac{1}{2}SW(x-t)$ の $t = 1, t = \pi$ でのグラフを描け。$ST$ も同様。

**回答**:

$t = 0$: 元の $SW(x)$（$0 < x < \pi$ で 1、$-\pi < x < 0$ で $-1$）。

$t = 1$: 右行き波 $\frac{1}{2}SW(x-1)$ と左行き波 $\frac{1}{2}SW(x+1)$ の重ね合わせ。ジャンプが $x = \pm 1$ に分裂。

$t = \pi$: $SW(x+\pi) = -SW(x)$（半周期シフトで符号反転）なので $u = 0$。

$$\boxed{t = \pi \text{ で } u_{SW}(x,\pi) = \frac{1}{2}[SW(x+\pi) + SW(x-\pi)] = 0}$$

$ST$ の場合も同様に、$t = \pi$ で $ST(x \pm \pi)$ は $-ST(x)$ ではないので一般に $u \neq 0$。

---

## 問題 5 — リープフロッグ法による数値解

**問題**: リープフロッグ法 (14) で $u(x,0) = SW(x)$、静止開始、周期境界条件で $u_{xx}$ をサーキュラント $-CU/(\Delta x)^2$ で置換。$t = \pi$ で Problem 4 の厳密解と比較。CFL数 $\Delta t/\Delta x = 0.8, 0.9, 1.0, 1.1$ で実験。

**回答**:

リープフロッグ法:

$$U_{j,n+1} - 2U_{j,n} + U_{j,n-1} = r^2(U_{j+1,n} - 2U_{j,n} + U_{j-1,n}), \quad r = c\Delta t/\Delta x$$

- $r = 1.0$: 特性線に沿った正確な伝播。$t = \pi$ で厳密解と一致
- $r = 0.8, 0.9$: 安定だが数値分散が生じ、不連続点付近で振動
- $r = 1.1$: CFL条件 $r \le 1$ を破り**不安定**（解が発散）

$$\boxed{r = 1 \text{ が黄金比率: 厳密解を再現。} r > 1 \text{ で不安定}}$$

---

## 問題 6 — 3D波動方程式の球対称解

**問題**: (25) で回転対称 $ru = F(r+t) + G(r-t)$。初期条件 $u(r,0) = 1$（$0 \le r \le 1$）で信号が $(x,y,z) = (1,1,1)$ に到達する時刻。

**回答**:

$r = \sqrt{3}$ の点への到達。外向き波は $r - t = \text{const}$ の特性線に沿う。初期値が $r = 1$ まであるので:

$$r - ct = 1 \implies t = r - 1 = \sqrt{3} - 1$$

$$\boxed{t = \sqrt{3} - 1 \approx 0.732}$$

---

## 問題 7 — 3D波動方程式の平面波

**問題**: $u_{tt} = \Delta u$ の平面波 $u = e^{i(k \cdot x - \omega t)}$ で $k = (k_1, k_2, k_3)$ のとき $\omega$ と $k$ の関係。半離散方程式 $U_{tt} = (\Delta_x^2 + \Delta_y^2 + \Delta_z^2)U/h^2$ の対応解。

**回答**:

連続: $-\omega^2 = -(k_1^2 + k_2^2 + k_3^2)$ より

$$\omega^2 = |k|^2 = k_1^2 + k_2^2 + k_3^2$$

半離散: 各方向の第二差分で $k_i^2$ が $(2 - 2\cos k_i h)/h^2 = 4\sin^2(k_i h/2)/h^2$ に置換。

$$\boxed{\omega^2 = \frac{4}{h^2}\left[\sin^2\frac{k_1 h}{2} + \sin^2\frac{k_2 h}{2} + \sin^2\frac{k_3 h}{2}\right]}$$

---

## 問題 8 — 物理的波動方程式と振動弦

**問題**: $(\rho u_t)_t = (k u_x)_x$ で密度 $\rho$、剛性 $k$ が定数なら $c^2 = k/\rho$。振動弦 $u = \sin(\pi x/L)\cos\omega t$ の $\omega$。

**回答**:

$u_{tt} = c^2 u_{xx}$ に代入: $-\omega^2 \sin(\pi x/L) = -c^2(\pi/L)^2 \sin(\pi x/L)$。

$$\boxed{\omega = \frac{c\pi}{L} = \frac{\pi}{L}\sqrt{\frac{k}{\rho}}}$$

---

## 問題 9 — 端が動く弦（スキップロープ）

**問題**: $u(L,t) = \sin\omega t$、$u(0,t) = 0$、$u_{tt} = c^2 u_{xx}$。$u = U(x,t) + x(\sin\omega t)/L$ とおいて $U$ の方程式と境界条件を求めよ。

**回答**:

$u = U + x\sin(\omega t)/L$ を代入:

$$U_{tt} + \frac{x}{L}(-\omega^2 \sin\omega t) = c^2 U_{xx}$$

（$x\sin\omega t/L$ の $x$ 二階微分は0）

$$U_{tt} = c^2 U_{xx} + \frac{x\omega^2}{L}\sin\omega t$$

境界条件: $U(0,t) = 0$, $U(L,t) = 0$。

$$\boxed{U_{tt} = c^2 U_{xx} + \frac{x\omega^2}{L}\sin\omega t, \quad U(0,t) = U(L,t) = 0}$$

---

## 問題 10 — 梁の振動 $u_{tt} = -c^2 u_{xxxx}$

**問題**: $u = A(x)B(t)$ で変数分離し、$A(x)$ と $B(t)$ の方程式を求め、$B(t) = a\cos\omega t + b\sin\omega t$ に合う $A(x)$ の4つの解を見つけよ。

**回答**:

$A''(x)B(t) \cdot \frac{1}{A} = -c^2 \frac{A''''}{A} \cdot B$ の形ではなく、正しくは:

$$\frac{B''}{B} = -c^2 \frac{A''''}{A} = -\omega^2$$

よって $B'' + \omega^2 B = 0$（$B = a\cos\omega t + b\sin\omega t$）と $c^2 A'''' = \omega^2 A$。

$A'''' = \lambda^4 A$（$\lambda^4 = \omega^2/c^2$）の特性方程式 $m^4 = \lambda^4$ の根は $m = \pm\lambda, \pm i\lambda$。

$$\boxed{A(x) = C_1 \cosh\lambda x + C_2 \sinh\lambda x + C_3 \cos\lambda x + C_4 \sin\lambda x}$$

---

## 問題 11 — クランプされた梁の周波数条件

**問題**: $u = 0, u' = 0$ at $x = 0, L$。$(\cos\omega L)(\cosh\omega L) = 1$ を示せ。

**回答**:

$A(0) = 0, A'(0) = 0$ から $C_1 + C_3 = 0$, $C_2 + C_4 = 0$（つまり $C_3 = -C_1$, $C_4 = -C_2$）。

$A(x) = C_1(\cosh\lambda x - \cos\lambda x) + C_2(\sinh\lambda x - \sin\lambda x)$。

$A(L) = 0, A'(L) = 0$ の条件で非自明解が存在するには行列式 = 0:

$$\begin{vmatrix} \cosh\lambda L - \cos\lambda L & \sinh\lambda L - \sin\lambda L \\ \sinh\lambda L + \sin\lambda L & \cosh\lambda L - \cos\lambda L \end{vmatrix} = 0$$

展開:

$$(\cosh\lambda L - \cos\lambda L)^2 - (\sinh\lambda L - \sin\lambda L)(\sinh\lambda L + \sin\lambda L) = 0$$

$$\cosh^2 - 2\cosh\cos + \cos^2 - \sinh^2 + \sin^2 = 0$$

$\cosh^2 - \sinh^2 = 1$、$\cos^2 + \sin^2 = 1$ を使うと:

$$2 - 2\cosh(\lambda L)\cos(\lambda L) = 0$$

$$\boxed{\cos(\lambda L)\cosh(\lambda L) = 1}$$

---

## 問題 12 — 時間中心リープフロッグの二次方程式

**問題**: $\Delta_t^2 U/(\Delta t)^2 = -KU/(\Delta x)^2$ で成長因子の二次方程式 $G^2 - 2aG + 1 = 0$ を見つけ、$Kv = \lambda v$ で実固有値 $\lambda$、$r = \Delta t/\Delta x$ のとき $|a| \le 1$ なら $|G| = 1$ を示せ。

**回答**:

$U = G^n v$ を代入: $(G^2 - 2G + 1)/(\Delta t)^2 = -\lambda G/(\Delta x)^2 \cdot (-1)$。

すなわち $G^2 - 2G + 1 = -r^2\lambda(\Delta x)^2 G$... ではなく、$K$ の固有値 $\lambda$ に対して:

$$\frac{G^2 - 2G + 1}{(\Delta t)^2} = -\frac{\lambda}{(\Delta x)^2} G$$

$$G^2 - 2G + 1 = -r^2\lambda G$$

$$G^2 - (2 - r^2\lambda)G + 1 = 0$$

$a = 1 - r^2\lambda/2$ とおくと $G^2 - 2aG + 1 = 0$。

$|a| \le 1$ なら $G = a \pm i\sqrt{1-a^2}$ で $|G|^2 = a^2 + (1-a^2) = 1$。

$$\boxed{|a| \le 1 \iff |G| = 1 \text{ (安定)。条件: } r^2\lambda \le 4}$$

$K$ の最大固有値が $\lambda_{\max} = 4/(\Delta x)^2 \cdot \sin^2(k\Delta x/2)$ の最大値 $4/(\Delta x)^2$ なので、CFL条件 $r \le 1$。

---

## 問題 13 — $u_{tt} = u_{xx} + u_{yy}$ の一次系

**問題**: ベクトル未知数 $v = (u_t, u_x, u_y)$ として一次系 $v_t = Av_x + Bv_y$ を書け。$A, B$ は対称であることを示し、エネルギー $\frac{1}{2}\int(u_t^2 + u_x^2 + u_y^2)dx$ が一定。

**回答**:

$u_{tt} = u_{xx} + u_{yy}$ より:

- $(u_t)_t = (u_x)_x + (u_y)_y$
- $(u_x)_t = (u_t)_x$
- $(u_y)_t = (u_t)_y$

$$\frac{\partial}{\partial t}\begin{pmatrix}u_t\\u_x\\u_y\end{pmatrix} = \begin{pmatrix}0&1&0\\1&0&0\\0&0&0\end{pmatrix}\frac{\partial}{\partial x}\begin{pmatrix}u_t\\u_x\\u_y\end{pmatrix} + \begin{pmatrix}0&0&1\\0&0&0\\1&0&0\end{pmatrix}\frac{\partial}{\partial y}\begin{pmatrix}u_t\\u_x\\u_y\end{pmatrix}$$

$$\boxed{A = \begin{pmatrix}0&1&0\\1&0&0\\0&0&0\end{pmatrix}, \quad B = \begin{pmatrix}0&0&1\\0&0&0\\1&0&0\end{pmatrix} \quad \text{（共に対称）}}$$

エネルギー: $E = \frac{1}{2}\int(u_t^2 + u_x^2 + u_y^2)dx$ で、$A, B$ が対称なので $v^T A v_x$ は $\frac{\partial}{\partial x}(\frac{1}{2}v^T A v)$ の形になり、無限区間で境界項が消えて $dE/dt = 0$。

---

## 問題 14 — $A$ の対称性とエネルギー保存

**問題**: $v^T A v_x = (\frac{1}{2}v^T A v)_x$ であることをどう使うか？

**回答**:

$A$ が対称なら $v^T A v_x = \frac{1}{2}\frac{\partial}{\partial x}(v^T A v)$（積の微分と $A = A^T$ から）。

エネルギーの時間微分:

$$\frac{dE}{dt} = \int v^T v_t \, dx = \int v^T(Av_x + Bv_y) \, dx = \int \frac{\partial}{\partial x}\left(\frac{1}{2}v^TAv\right) + \frac{\partial}{\partial y}\left(\frac{1}{2}v^TBv\right) dx$$

全微分の積分は（適切な境界条件の下で）0。

$$\boxed{\frac{dE}{dt} = 0 \quad \text{（$A, B$ の対称性からエネルギー保存）}}$$

---

## 問題 15 — Maxwell方程式とエネルギー

**問題**: $\partial E/\partial t = (\text{curl}\,H)/\epsilon$ と $\partial H/\partial t = -(\text{curl}\,E)/\mu$ を合わせて3D波動方程式にし、光速 $c$ を $\epsilon, \mu$ から求めよ。

**回答**:

$H$ を消去: $E_{tt} = \frac{1}{\epsilon}\text{curl}(H_t) = \frac{1}{\epsilon}\text{curl}\left(-\frac{1}{\mu}\text{curl}\,E\right) = -\frac{1}{\epsilon\mu}\text{curl}\,\text{curl}\,E$。

$\text{curl}\,\text{curl}\,E = \text{grad}(\text{div}\,E) - \Delta E$。自由空間で $\text{div}\,E = 0$ なので:

$$E_{tt} = \frac{1}{\epsilon\mu}\Delta E$$

$$\boxed{c = \frac{1}{\sqrt{\epsilon\mu}}}$$

---

## 問題 16 — Yee法のコーディング

**問題**: $u_{tt} = c^2 u_{xx}$ のYee法で $x - t$ メッシュ上でのタイムステップをコード化せよ。

**回答**:

Yeeのスタッガードグリッド法 (34):

$$\frac{E_j^{n+1} - E_j^n}{\Delta t} = c\frac{H_{j+1/2}^{n+1/2} - H_{j-1/2}^{n+1/2}}{\Delta x}$$

$$\frac{H_{j+1/2}^{n+3/2} - H_{j+1/2}^{n+1/2}}{\Delta t} = c\frac{E_{j+1}^{n+1} - E_j^{n+1}}{\Delta x}$$

$E$ と $H$ を交互に半タイムステップずつ更新する「リープフロッグ」型。

$$\boxed{E_j^{n+1} = E_j^n + r(H_{j+1/2}^{n+1/2} - H_{j-1/2}^{n+1/2}), \quad H_{j+1/2}^{n+3/2} = H_{j+1/2}^{n+1/2} + r(E_{j+1}^{n+1} - E_j^{n+1})}$$

ここで $r = c\Delta t/\Delta x$。CFL安定性条件: $r \le 1$。

---

## 問題 17 — 非斉次波動方程式のブロック形式

**問題**: $(bu_t)_t = \text{div}(d\,\text{grad}\,u)$ をブロック形式 (47) で書け。エネルギー $(u,u)$ を $bu_t^2 + d|\text{grad}\,u|^2$ の積分とし、$(\partial/\partial t)(u,u) = 0$ を示せ。

**回答**:

$v = (bu_t, \text{grad}\,u)$ とおく。ブロック形式:

$$\frac{\partial}{\partial t}\begin{pmatrix}bu_t\\ \text{grad}\,u\end{pmatrix} = \begin{pmatrix}0 & \text{div}\cdot d\\ \text{grad} & 0\end{pmatrix}\begin{pmatrix}u_t\\ \text{grad}\,u\end{pmatrix}$$

エネルギー: $E = \frac{1}{2}\int(bu_t^2 + d|\text{grad}\,u|^2)\,dx$。

$$\frac{dE}{dt} = \int bu_t u_{tt} + d(\text{grad}\,u)\cdot(\text{grad}\,u_t)\,dx$$

$bu_{tt} = \text{div}(d\,\text{grad}\,u)$ を代入し、部分積分:

$$= \int u_t\,\text{div}(d\,\text{grad}\,u)\,dx + \int d(\text{grad}\,u)\cdot(\text{grad}\,u_t)\,dx = 0$$

（div定理で2つの項が打ち消し合う）

$$\boxed{\frac{dE}{dt} = 0}$$

---

## 問題 18 — Maxwell方程式の調和ソース

**問題**: $[E, H]$ に調和ソース $s = [Se^{-i\omega t}, 0]$ があるとき、$(L + i\omega)U = -S$ に帰着。これは周波数領域のMaxwell方程式で電場の "curl curl 方程式"。

**回答**:

$u(x,y,z,t) = U(x,y,z)e^{-i\omega t}$ を $\partial u/\partial t = Lu + s$ に代入:

$$-i\omega U e^{-i\omega t} = LUe^{-i\omega t} + Se^{-i\omega t}$$

$$\boxed{(L + i\omega)U = -S}$$

$E = E(x,y,z)e^{-i\omega t}$ として $H$ を消去すると:

$$\text{curl}\left(\frac{1}{\mu}\text{curl}\,E\right) - \omega^2\epsilon E = i\omega S$$

これが周波数領域のMaxwell方程式（ヘルムホルツ型）。

---

# Problem Set 6.6（pp. 531--532）— 非線形フローと保存則

---

## 問題 1 — 交通流の保存則の積分形式

**問題**: 車の密度 $u$ に対する保存の積分形式と、$v = 80(1-u)$（速度）のとき微分形式を書け。ショック条件も。

**回答**:

フラックス $f(u) = u \cdot v(u) = 80u(1-u)$。

積分形式: $\frac{d}{dt}\int_a^b u(x,t)\,dx = f(u(a,t)) - f(u(b,t))$

微分形式: $u_t + f(u)_x = 0$ すなわち

$$u_t + [80u(1-u)]_x = 0 \implies u_t + 80(1-2u)u_x = 0$$

ショック速度（ジャンプ条件）:

$$\boxed{s = \frac{[f]}{[u]} = \frac{f(u_R) - f(u_L)}{u_R - u_L} = \frac{80u_R(1-u_R) - 80u_L(1-u_L)}{u_R - u_L} = 80(1 - u_R - u_L)}$$

---

## 問題 2 — 赤信号とファン

**問題**: $x = 0$ に赤信号。$u_0 = 1$（左）、$u_0 = 0$（右）。青になるとファンが前方に広がる。

**回答**:

$f'(u) = 80(1-2u)$。左 $u_L = 1$ で $f'(1) = -80$、右 $u_R = 0$ で $f'(0) = 80$。

$u_L > u_R$ だがこの場合 $f'(u_L) = -80 < f'(u_R) = 80$ なのでエントロピー条件でファン（扇形波）。

青になると（$t > 0$）:

$$u(x,t) = \begin{cases}1 & x < -80t \\ \frac{1}{2}\left(1 - \frac{x}{80t}\right) & -80t < x < 80t \\ 0 & x > 80t\end{cases}$$

$$\boxed{\text{車は } x = -80t \text{ から } x = 80t \text{ の範囲にファンとして広がる}}$$

---

## 問題 3 — 赤信号でのショック速度

**問題**: 赤から青に変わるとき（$x = 0, t = 0$ で赤）、交通流でのエントロピー条件。青に変わったら密度0（$x > 0, t > 0$）、赤のまま（$x < 0$）のショックか？

**回答**:

赤信号: $x > 0$ で $u = 0$, $x < 0$ で $u = 1$。

ジャンプ条件でのショック速度: $s = 80(1 - 1 - 0) = 0$。

エントロピー条件: $f'(u_L) > s > f'(u_R)$ つまり $f'(1) = -80 > 0 > f'(0) = 80$？ いいえ、$-80 < 80$。

**エントロピー条件を満たさない**（$f'(u_L) = -80 < s = 0 < f'(u_R) = 80$）。ショックではなくファン。

$$\boxed{\text{エントロピー条件 } f'(u_L) > s > f'(u_R) \text{ が不成立。ファンが正しい解}}$$

---

## 問題 4 — Burgers方程式の特性線

**問題**: Example 3 で $u = u_0(x - ut)$ は $u_t + uu_x = 0$ の陰的解。$u_0(x) = Cx$ から出発し、$u(x,t)$ を解け。4本の特性線のうちどれがショックを生むか。

**回答**:

$u_0(x) = Cx$ なら特性線: $x - u_0 t = x_0$ 上で $u = Cx_0$。

$x = x_0 + Cx_0 t = x_0(1 + Ct)$ より $x_0 = x/(1+Ct)$。

$$\boxed{u(x,t) = \frac{Cx}{1 + Ct}}$$

$C > 0$: 特性線は広がる（ファン）→ショックなし。

$C < 0$: 特性線は $t = -1/C$ で交差→ショック発生。

$$\boxed{C < 0 \text{ のときショックが } t = -1/C \text{ で発生}}$$

---

## 問題 5 — 点ソースからの解

**問題**: (14) の $u(x,1)$ を $u(x,0) = \delta(x)$ から描け。粘性 Burgers 方程式 $u_t + uu_x = \nu u_{xx}$ で小さい $\nu$ のときの概形をスケッチ。

**回答**:

$u(x,0) = \delta(x)$ の場合（テキスト式(14)）:

$$u(x,t) = \frac{x}{t} \quad \text{for } 0 \le x \le X(t) = \sqrt{2t}$$

$t = 1$ で:

$$u(x,1) = \begin{cases} x & 0 \le x \le \sqrt{2} \\ 0 & \text{otherwise}\end{cases}$$

ファンが $x = 0$ から立ち上がり、$x = \sqrt{2}$ でショックで0に落ちる。

粘性ありの場合、ショックが滑らかになり（$\nu$ に比例した幅で）急激だが連続的な遷移。

$$\boxed{u(x,1) = x/1 \text{ for } 0 < x < \sqrt{2}, \text{ ショック位置 } X(1) = \sqrt{2}}$$

---

## 問題 6 — Burgers方程式の Cole-Hopf 解

**問題**: 式 (17) で $u(x,0) = -\delta(x)$ から出発して Burgers 方程式を解け。

**回答**:

$u(x,0) = -\delta(x)$ なので $U_0(x) = \int_0^x u(x',0)\,dx' = -H(x)$（$x > 0$ で $-1$、$x < 0$ で 0）。ここで $H$ はヘヴィサイド関数。

式 (17): $U(x,t) = \partial B_{\min}/\partial x$ ここで

$$B_{\min} = \min_y \left[U_0(y) + \frac{(x-y)^2}{2t}\right]$$

$y < 0$: $U_0 = 0$ なので $B = (x-y)^2/(2t)$、最小は $y = x$ で $B = 0$（$x < 0$ のとき）。

$y > 0$: $U_0 = -1$ なので $B = -1 + (x-y)^2/(2t)$、最小は $y = x$ で $B = -1$（$x > 0$ のとき）。

比較: $y < 0$ で $B = 0$ vs $y > 0$ で $B = -1$。$B = -1$ の方が小さいので常に $y > 0$ 側が勝つ... ただし $x < 0$ で $y = x < 0$ なら $B = (x-x)^2/(2t) = 0$ vs $y > 0$ での最小値。

実際、$u = \partial U/\partial x$。$u_L = 0$, $u_R = 0$ でショック速度 $s = (f(0) - f(-1))/(0-(-1))$... ここで $f(u) = u^2/2$ なので $s = (0 - 1/2)/1 = -1/2$。

$$\boxed{u(x,t) = 0 \text{ (ほぼ至る所)、ショックが } x = -t/2 \text{ に沿って左に移動}}$$

---

## 問題 7 — Cole-Hopf変換の確認

**問題**: $U = -2\nu\log h$ が $U_t + \frac{1}{2}U_x^2 = \nu U_{xx}$ を $h_t = \nu h_{xx}$ に変換することを示せ。

**回答**:

$U = -2\nu\log h$ より $U_x = -2\nu h_x/h$, $U_{xx} = -2\nu(h_{xx}/h - h_x^2/h^2)$, $U_t = -2\nu h_t/h$。

$U_t + \frac{1}{2}U_x^2 = \nu U_{xx}$ に代入:

$$-\frac{2\nu h_t}{h} + \frac{1}{2}\cdot\frac{4\nu^2 h_x^2}{h^2} = \nu\left(-\frac{2\nu h_{xx}}{h} + \frac{2\nu h_x^2}{h^2}\right)$$

$$-\frac{2\nu h_t}{h} + \frac{2\nu^2 h_x^2}{h^2} = -\frac{2\nu^2 h_{xx}}{h} + \frac{2\nu^2 h_x^2}{h^2}$$

$h_x^2$ の項が消えて:

$$-\frac{2\nu h_t}{h} = -\frac{2\nu^2 h_{xx}}{h}$$

$$\boxed{h_t = \nu h_{xx}}$$

---

## 問題 8 — Riemann問題 $A$ から $B$ へのジャンプ

**問題**: $u_t + uu_x = 0$ を (17) で $u_0$ が $A$ から $B$ にジャンプする場合に解け。

$$u(x,t) = \frac{\partial}{\partial x}\min_y\left[\begin{cases}-Ay & (y < 0)\\ By & (y > 0)\end{cases} + \frac{(x-y)^2}{2t}\right]$$

**回答**:

$A > B$: ショック。速度 $s = (A+B)/2$。直線 $x = \frac{1}{2}(A+B)t$ に沿ってジャンプ。

$u(x,t) = A$（$x < st$）、$u(x,t) = B$（$x > st$）。

$A < B$: ファン。$u(x,t) = x/t$（$At < x < Bt$）。

最小化で確認: $y < 0$ では $-Ay + (x-y)^2/(2t)$ を最小化 → $y = x - At$（$\partial/\partial y = 0$）。$y > 0$ では $By + (x-y)^2/(2t)$ → $y = x - Bt$。

$$\boxed{A > B: \text{ ショック } x = \frac{1}{2}(A+B)t, \quad A < B: \text{ ファン } u = x/t}$$

---

## 問題 9 — Euler方程式と理想気体

**問題**: 質量・運動量・エネルギーのEuler方程式 (19)--(21) が理想気体で以下と等価であることを示せ:

$$\frac{Dp}{Dt} + \gamma p\,\text{div}\,v = 0, \quad \rho\frac{Dv}{Dt} + \text{grad}\,p = 0, \quad \frac{DS}{Dt} = 0$$

**回答**:

輸送微分 $D/Dt = \partial/\partial t + v_j \partial/\partial x_j$。

質量保存 (19): $\partial\rho/\partial t + \text{div}(\rho v) = 0$ は $D\rho/Dt + \rho\,\text{div}\,v = 0$。

運動量 (20): 質量保存を使って $\rho Dv/Dt + \text{grad}\,p = 0$。

エネルギー (21) と状態方程式 $p = (\gamma-1)\rho e$, エントロピー $e^S = p\rho^{-\gamma}$:

$DS/Dt = 0$ は断熱条件。これと質量保存から:

$$\frac{Dp}{Dt} = \frac{\partial p}{\partial \rho}\bigg|_S \frac{D\rho}{Dt} = -\gamma p\,\text{div}\,v$$

$$\boxed{\text{3つの形式は等価。音速 } c^2 = \gamma p/\rho = dp/d\rho}$$

---

## 問題 10 — 波動方程式と2つの保存則

**問題**: $u_{tt} = u_{xx}$ は系 (22) $\partial/\partial t[u_x, u_t]^T = \partial/\partial x[u_t, u_x]^T$。非線形波動方程式 $u_{tt} = (C(u_x))_x$ を同様の形に書け。

**回答**:

$v = u_x$, $w = u_t$ とおく。

線形: $v_t = w_x$, $w_t = v_x$。

非線形: $w_t = (C(v))_x$, $v_t = w_x$。

$$\boxed{\frac{\partial}{\partial t}\begin{pmatrix}v\\w\end{pmatrix} = \frac{\partial}{\partial x}\begin{pmatrix}w\\C(v)\end{pmatrix}}$$

---

## 問題 11 — Godunovフラックス

**問題**: (34) の $F^{\text{GOD}}$ が $f(U_{j,n})$ と $f(U_{j+1,n})$ のうち大きい方または小さい方であることを示せ（$U_{j,n}$ と $U_{j+1,n}$ の大小関係に依存）。

**回答**:

Godunovの方法: 各セル境界でRiemann問題を解く。$u_t + f(u)_x = 0$ で凸フラックス $f$ の場合:

- $U_j > U_{j+1}$（ショック）: $\bar{u}(x_{j+1/2}) = $ ジャンプ条件で決まる値。フラックスはショック速度の符号による。
- $U_j < U_{j+1}$（ファン）: $f'$ の符号による。

$f(u) = u^2/2$（Burgers）で $f' = u > 0$ が左、$f' < 0$ が右なら:

$U_j > U_{j+1} > 0$: ショック速度正。$F = f(U_j)$。

$0 > U_j > U_{j+1}$: ショック速度負。$F = f(U_{j+1})$。

$$\boxed{F^{\text{GOD}}_{j+1/2} = \begin{cases}f(U_j) & U_j > U_{j+1} \text{ かつ } s > 0\\ f(U_{j+1}) & U_j > U_{j+1} \text{ かつ } s < 0\\ \min(f(U_j), f(U_{j+1})) & U_j < U_{j+1}\end{cases}}$$

一般に: $U_j \ge U_{j+1}$ なら $F = \max_{U_{j+1} \le u \le U_j} f(u)$、$U_j < U_{j+1}$ なら $F = \min_{U_j \le u \le U_{j+1}} f(u)$。

---

## 問題 12 — ファンの境界線の方程式

**問題**: Figure 6.15 のファンを囲む直線の方程式を求めよ。

**回答**:

Riemann問題 $u_L = A$, $u_R = B$（$A < B$）のファン。$f(u) = u^2/2$ なら特性速度 $f'(u) = u$。

ファンの左端: $x/t = A$（$u = A$ の特性線）
ファンの右端: $x/t = B$（$u = B$ の特性線）

$$\boxed{x = At \text{ （左境界）}, \quad x = Bt \text{ （右境界）}}$$

ファン内部: $u(x,t) = x/t$（$At < x < Bt$）。

---

## 問題 13 — Burgers方程式 $u(x,0) = \delta(x) - \delta(x-1)$

**問題**: (17) で $u(x,0) = \delta(x) - \delta(x-1)$ から出発して解け（チャレンジ問題）。

**回答**:

$U_0(x) = \int_0^x u(s,0)\,ds$。$\delta(x)$ からの寄与は $H(x)$、$-\delta(x-1)$ からは $-H(x-1)$。

$U_0(x) = H(x) - H(x-1) = \begin{cases}0 & x < 0\\ 1 & 0 < x < 1\\ 0 & x > 1\end{cases}$

式 (17): $U(x,t) = B_{\min}$ で $B = \min_y[U_0(y) + (x-y)^2/(2t)]$。

3つの領域で最小化:
- $y < 0$: $B = (x-y)^2/(2t)$、最小 $y = x$（$x < 0$ で $B = 0$）
- $0 < y < 1$: $B = 1 + (x-y)^2/(2t)$、最小 $y = x$（$0 < x < 1$ で $B = 1$）
- $y > 1$: $B = (x-y)^2/(2t)$、最小 $y = x$（$x > 1$ で $B = 0$）

$0 < x < 1$ では $B = 1$ vs 端点 $y = 0$ で $B = x^2/(2t)$、$y = 1$ で $B = (x-1)^2/(2t)$。

$x^2/(2t) < 1$ つまり $x < \sqrt{2t}$ なら左からのファンが勝つ。$(x-1)^2/(2t) < 1$ つまり $x > 1 - \sqrt{2t}$ なら右からのショックが勝つ。

$$\boxed{\text{2つのファン/ショックが相互作用し、最終的に } t \to \infty \text{ で消滅する複合波}}$$

---

## 問題 14 — 保存則の線形化

**問題**: $u_t + f(u)_x = 0$ に $u + \epsilon v$ を代入して摂動 $v(x,t)$ の線形方程式を求めよ。

**回答**:

$u + \epsilon v$ を代入:

$$(u + \epsilon v)_t + f(u + \epsilon v)_x = 0$$

$$u_t + \epsilon v_t + f(u)_x + \epsilon f'(u)v_x + O(\epsilon^2) = 0$$

$u_t + f(u)_x = 0$ を引いて $\epsilon$ で割る:

$$\boxed{v_t + f'(u)v_x = 0 \quad \text{（$u$ に依存する可変速度の輸送方程式）}}$$

これは $v$ が速度 $c(x,t) = f'(u(x,t))$ で移流される線形方程式。

---

# Problem Set 6.7（pp. 546）— 流体力学とNavier-Stokes

---

## 問題 1 — 発散定理と連続の式

**問題**: 発散定理を式 (30) の $V_E$ に適用し、$\partial\rho/\partial t + \text{div}(\rho u) = 0$ を導出。div$^T$ = $-$grad から。

**回答**:

式 (30): $\frac{\partial}{\partial t}\int_{V_E}\rho\,dV = -\int_{S_E}\rho\,u\cdot n\,dS$

発散定理で右辺を体積積分に変換:

$$\int_{V_E}\frac{\partial\rho}{\partial t}\,dV = -\int_{V_E}\text{div}(\rho u)\,dV$$

任意の体積 $V_E$ に対して成立するので:

$$\boxed{\frac{\partial\rho}{\partial t} + \text{div}(\rho u) = 0}$$

div$^T = -$grad は、部分積分（Green の公式）で $\int(\text{div}\,u)\phi\,dV = -\int u\cdot\text{grad}\,\phi\,dV$（境界項を除く）に対応。

---

## 問題 2 — $D\rho/Dt$ と $Du/Dt$

**問題**: 2つの流れ $\rho = x^2 + y^2, u = (y,x,0)$ と $\rho = ze^t, u = (x,0,-z)$ について $D\rho/Dt$ と $Du/Dt$ を求め、非圧縮性を確認。

**回答**:

**流れ1**: $\rho = x^2+y^2$, $u = (y,x,0)$。

$\text{div}\,u = 0 + 0 + 0 = 0$ → **非圧縮**。

$D\rho/Dt = \rho_t + u\cdot\text{grad}\,\rho = 0 + y(2x) + x(2y) = 4xy$。

$Du/Dt = u_t + (u\cdot\nabla)u = 0 + (y\partial_x + x\partial_y)(y,x,0) = (y\cdot 0 + x\cdot 1, y\cdot 1 + x\cdot 0, 0) = (x,y,0)$。

**流れ2**: $\rho = ze^t$, $u = (x,0,-z)$。

$\text{div}\,u = 1 + 0 + (-1) = 0$ → **非圧縮**。

$D\rho/Dt = ze^t + x\cdot 0 + 0 + (-z)(e^t) = ze^t - ze^t = 0$。

$Du/Dt = (0,0,0) + (x\partial_x + 0 - z\partial_z)(x,0,-z) = (x,0,z)$。

$$\boxed{\text{流れ1: } D\rho/Dt = 4xy,\; Du/Dt = (x,y,0)。\quad \text{流れ2: } D\rho/Dt = 0,\; Du/Dt = (x,0,z)}$$

---

## 問題 3 — 応力テンソルと粘性項

**問題**: 非圧縮粘性流体で div $u = 0$、$\sigma_{ij} = \mu(\partial u_i/\partial x_j + \partial u_j/\partial x_i)$ から力の div $\sigma$ が $\mu\Delta u$ であることを示し、Navier-Stokes方程式を導出。

**回答**:

$(\text{div}\,\sigma)_i = \sum_j \frac{\partial\sigma_{ij}}{\partial x_j} = \mu\sum_j\left(\frac{\partial^2 u_i}{\partial x_j^2} + \frac{\partial^2 u_j}{\partial x_i\partial x_j}\right)$

第2項: $\sum_j \frac{\partial^2 u_j}{\partial x_i\partial x_j} = \frac{\partial}{\partial x_i}(\text{div}\,u) = 0$（非圧縮）。

$$(\text{div}\,\sigma)_i = \mu\Delta u_i$$

Newtonの法則 $\rho Du/Dt = -\text{grad}\,p + \text{div}\,\sigma + f$:

$$\boxed{\rho\frac{Du}{Dt} = -\text{grad}\,p + \mu\Delta u + f, \quad \text{div}\,u = 0}$$

無次元化（$\nu = \mu/\rho$）で $\frac{1}{\text{Re}}\Delta u$。

---

## 問題 4 — Froude数

**問題**: Navier-Stokes に重力加速度 $g$ を加え（cm/sec$^2$）、Froude数 $\text{Fr} = V^2/(Lg)$ が無次元であることを示し、Re と Fr を共有する類似流れ。

**回答**:

$\rho Du/Dt = -\text{grad}\,p + \mu\Delta u + \rho g$。無次元化で $x = Lx^*$, $u = Uu^*$, $t = (L/U)t^*$:

$$\frac{Du^*}{Dt^*} = -\text{grad}^*\,p^* + \frac{1}{\text{Re}}\Delta^* u^* + \frac{1}{\text{Fr}}\hat{g}$$

ここで $\text{Fr} = U^2/(gL)$。

$$\boxed{\text{Fr} = \frac{V^2}{Lg} \text{ は無次元。Re と Fr が同じ流れは力学的に相似}}$$

---

## 問題 5 — 圧縮性ガスの保存則

**問題**: $\rho(u\cdot\text{grad})u = -\text{grad}\,p = -c^2\,\text{grad}\,\rho$（$c^2 = dp/d\rho$ = 音速）であることを、Example 5 の保存則から導出。

**回答**:

運動量保存 (20): $\frac{\partial}{\partial t}(\rho v_i) + \sum_j\frac{\partial}{\partial x_j}(\rho v_i v_j + \delta_{ij}p) = 0$。

質量保存を使って展開:

$$\rho\frac{\partial v_i}{\partial t} + v_i\frac{\partial\rho}{\partial t} + \sum_j\left(\rho v_j\frac{\partial v_i}{\partial x_j} + v_i\frac{\partial(\rho v_j)}{\partial x_j}\right) + \frac{\partial p}{\partial x_i} = 0$$

質量保存 $\partial\rho/\partial t + \text{div}(\rho v) = 0$ により $v_i$ のかかる項が消えて:

$$\rho\left(\frac{\partial v}{\partial t} + (v\cdot\nabla)v\right) = -\text{grad}\,p$$

状態方程式 $p = p(\rho)$ から $\text{grad}\,p = (dp/d\rho)\text{grad}\,\rho = c^2\,\text{grad}\,\rho$。

$$\boxed{\rho\frac{Dv}{Dt} = -\text{grad}\,p = -c^2\,\text{grad}\,\rho}$$

---

## 問題 6 — パイプ内の理想流体とBernoulli

**問題**: 面積 $A$ のパイプを圧力 $p$ で速度 $v$ で流れる理想流体。面積が $\frac{1}{2}A$ に縮小。Bernoulliで新しい圧力は？

**回答**:

質量保存（非圧縮）: $Av_1 = \frac{1}{2}Av_2$ より $v_2 = 2v_1$。

Bernoulliの定理（定常・非圧縮・粘性なし）:

$$\frac{1}{2}v_1^2 + \frac{p_1}{\rho} = \frac{1}{2}v_2^2 + \frac{p_2}{\rho}$$

$$\frac{p_2}{\rho} = \frac{p_1}{\rho} + \frac{1}{2}v_1^2 - \frac{1}{2}(2v_1)^2 = \frac{p_1}{\rho} - \frac{3}{2}v_1^2$$

$$\boxed{p_2 = p_1 - \frac{3}{2}\rho v_1^2}$$

速度が2倍になると圧力は低下する（ベンチュリ効果）。

---

## 問題 7 — Poiseuille流にBernoulliが成立しない理由

**問題**: Example 2 の Poiseuille 流に Bernoulli の定理が使えないのはなぜ？

**回答**:

Bernoulliの定理は**非粘性**（Euler方程式）の定常流に適用。Poiseuille流は**粘性力が本質的**（$\mu\Delta u$ の項が圧力勾配と釣り合う）。

$$\text{Poiseuille: } \frac{\partial p}{\partial x} = \mu\Delta u \neq 0$$

$$\boxed{\text{Bernoulliは非粘性流に限定。Poiseuille流は粘性による摩擦が駆動力と釣り合う流れ}}$$

粘性損失があるため、$\frac{1}{2}\rho|u|^2 + p$ は流線に沿って一定でない。

---

## 問題 8 — 円管内の粘性流

**問題**: 水平円管で $u = c(y^2 + z^2 - R^2)/(4\mu)$, $p = cx + p_0$。(a) Navier-Stokes が満たされることを確認。(b) 流量 $-\pi c R^4/(8\mu)$ を積分で求めよ。

**回答**:

**(a)** $u = (u,0,0)$, $u = c(y^2+z^2-R^2)/(4\mu)$。

$\Delta u = c(2+2)/(4\mu) = c/\mu$。

$\text{grad}\,p = (c,0,0)$。

N-S: $\rho(u\cdot\nabla)u = 0$（$u$ は $x$ に依存しない）。

$-\text{grad}\,p + \mu\Delta u = (-c,0,0) + \mu\cdot c/\mu\cdot(1,0,0) = (0,0,0)$。✓

div $u = \partial u/\partial x = 0$。✓

**(b)** 極座標 $r^2 = y^2 + z^2$:

$$Q = \int_0^R \int_0^{2\pi} \frac{c(r^2 - R^2)}{4\mu} r\,d\theta\,dr = \frac{2\pi c}{4\mu}\int_0^R (r^3 - R^2 r)\,dr$$

$$= \frac{\pi c}{2\mu}\left[\frac{r^4}{4} - \frac{R^2 r^2}{2}\right]_0^R = \frac{\pi c}{2\mu}\left(\frac{R^4}{4} - \frac{R^4}{2}\right) = -\frac{\pi c R^4}{8\mu}$$

$$\boxed{Q = -\frac{\pi c R^4}{8\mu} \quad \text{（Hagen-Poiseuille の法則）}}$$

これが粘性 $\mu$ を測定する古典的実験。

---

## 問題 9 — ベクトル恒等式

**問題**: (a) $(u\cdot\text{grad})\,u = \frac{1}{2}\text{grad}(|u|^2) - u\times\text{curl}\,u$ を確認。(b) div $u = 0$ のとき $-(\text{curl}\,u\cdot\text{grad})u$ の curl が 0 に帰着することを示せ。

**回答**:

**(a)** 成分で確認。$[(u\cdot\nabla)u]_i = \sum_j u_j\partial_j u_i$。

$[\frac{1}{2}\text{grad}|u|^2]_i = \sum_j u_j\partial_i u_j$。

$[u\times(\text{curl}\,u)]_i = \sum_{j,k}\epsilon_{ijk}u_j(\text{curl}\,u)_k = \sum_{j,k}\epsilon_{ijk}u_j\epsilon_{k\ell m}\partial_\ell u_m$

$= \sum_j(u_j\partial_i u_j - u_j\partial_j u_i)$

よって $\frac{1}{2}\text{grad}|u|^2 - u\times\text{curl}\,u = (u\cdot\nabla)u$。✓

**(b)** $\omega = \text{curl}\,u$ として、div $u = 0$ のもとで渦度方程式 $D\omega/Dt = (\omega\cdot\nabla)u$ の両辺の curl をとると（省略するが）恒等的に成立。

$$\boxed{(u\cdot\nabla)u = \frac{1}{2}\text{grad}|u|^2 - u\times\text{curl}\,u}$$

---

## 問題 10 — 回転バレル内の流体

**問題**: 重力 $G = -gz$ と遠心力で回転バレル。Bernoulliから表面形状が放物線 $z = -\omega^2(x^2+y^2)/(2g)$。

**回答**:

回転座標系で静止した流体。有効ポテンシャル:

$$G_{\text{eff}} = -gz - \frac{1}{2}\omega^2(x^2+y^2)$$

（遠心力は外向きなので $-$ は重力のみ、遠心ポテンシャルは $+\frac{1}{2}\omega^2 r^2$）

Bernoulliの回転系版: 自由表面で $p = p_0$（大気圧）かつ速度0（剛体回転系）:

$$\frac{p}{\rho} + gz - \frac{1}{2}\omega^2 r^2 = \text{const}$$

自由表面 $p = p_0$:

$$gz - \frac{1}{2}\omega^2(x^2+y^2) = \text{const}$$

$$\boxed{z = \frac{\omega^2}{2g}(x^2 + y^2) + \text{const} \quad \text{（放物面）}}$$

---

## 問題 11 — 粘性の境界条件

**問題**: 粘性あり: no-slip $u = 0, v = 0$。粘性なし: 壁に沿う流れだが壁を通過しない $u\cdot n = 0$。Navier-Stokes とEuler方程式で微分の階数の違いから境界条件の数が異なることを説明せよ。

**回答**:

**Navier-Stokes**（$\mu > 0$）: 粘性項 $\mu\Delta u$ は**二階**の空間微分。二階PDEなので各成分に2つの境界条件が必要。壁で $u = 0$ と $v = 0$（no-slip）。

**Euler方程式**（$\mu = 0$）: 粘性項がなく、圧力勾配は一階微分のみ。一階PDEなので境界条件は1つ。$u\cdot n = 0$（壁を通過しない）だけで十分。

微分の数え方:
- N-S: 速度の二階微分 → 各壁で2条件（接線・法線方向の速度）
- Euler: 一階 → 各壁で1条件（法線速度のみ）

$$\boxed{\text{N-S: 2階PDE → no-slip (2条件)。Euler: 1階PDE → slip (1条件)}}$$

粘性が0に近づくとき、no-slip条件は境界層を生み、その厚さは $O(1/\sqrt{\text{Re}})$。
