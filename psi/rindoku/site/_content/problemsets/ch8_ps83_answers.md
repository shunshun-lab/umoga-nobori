# Chapter 8 — Problem Set 8.3+ 解答

> Gilbert Strang, *Computational Science and Engineering*, Chapter 8: Optimization and Minimum Principles
> Problem Set 8.3 (変分法), 8.4 (射影と固有値の誤差), 8.5 (Stokes問題), 8.6 (線形計画法), 8.7 (随伴法)

---

# Problem Set 8.3 — Calculus of Variations (pp. 643--645)

---

## 問題 1 — 梁の方程式の弱形式・強形式・Euler-Lagrange方程式

$$P = \int \Bigl[\tfrac{1}{2}c(u'')^2 - fu\Bigr]\,dx$$

**第一変分：** $\delta P/\delta u = 0$ を求める。被積分関数は $F(u, u'') = \tfrac{1}{2}c(u'')^2 - fu$ であり、$u''$ に依存する。

**弱形式：** 試験関数 $v$（$v(0)=v(1)=0$, $v'(0)=v'(1)=0$）に対して部分積分を行うと：

$$\int_0^1 \bigl[c\,u''\,v'' - f\,v\bigr]\,dx = 0 \quad \text{for all } v$$

**強形式（Euler-Lagrange方程式）：** 弱形式から二度部分積分すると：

$$\boxed{(c\,u'')'' = f}$$

これは4次の梁の方程式（beam equation）。$F$ が $u''$ に依存するため、Euler-Lagrange方程式は：

$$\frac{\partial F}{\partial u} - \frac{d}{dx}\!\left(\frac{\partial F}{\partial u'}\right) + \frac{d^2}{dx^2}\!\left(\frac{\partial F}{\partial u''}\right) = 0$$

ここから $-f + (c\,u'')'' = 0$ を得る。

---

## 問題 2 — 最短経路は直線

$$P = \int_0^1 (u')^2\,dx \quad \text{with } u(0) = a,\; u(1) = b$$

を最小化する。$F(u') = (u')^2$ より $\partial F/\partial u = 0$, $\partial F/\partial u' = 2u'$。

**Euler-Lagrange方程式：**

$$-\frac{d}{dx}(2u') = 0 \implies u'' = 0$$

よって $u(x) = a + (b-a)x$（直線）。

**弱形式：** $\int_0^1 u'\,v'\,dx = 0$ for all $v$ with $v(0) = v(1) = 0$。

$$\boxed{u(x) = a + (b-a)x}$$

---

## 問題 3 — Euler-Lagrange方程式（強形式）

**(a)** $P = \int [(u')^2 + e^u]\,dx$

$F = (u')^2 + e^u$ より $\partial F/\partial u = e^u$, $\partial F/\partial u' = 2u'$。

$$\boxed{e^u - 2u'' = 0 \quad \text{すなわち } u'' = \tfrac{1}{2}e^u}$$

**(b)** $P = \int u\,u'\,dx$

$F = uu'$ より $\partial F/\partial u = u'$, $\partial F/\partial u' = u$。

$$u' - \frac{d}{dx}(u) = u' - u' = 0$$

$$\boxed{\text{Euler-Lagrange方程式は } 0 = 0 \text{ （恒等的に満たされ、すべての } u \text{ が解）}}$$

これは $F = uu' = \frac{d}{dx}(\tfrac{1}{2}u^2)$ が完全微分なので、$P$ は端点値のみに依存するため。

**(c)** $P = \int x^2(u')^2\,dx$

$F = x^2(u')^2$ より $\partial F/\partial u = 0$, $\partial F/\partial u' = 2x^2 u'$。

$$\boxed{-\frac{d}{dx}(2x^2 u') = 0 \implies (x^2 u')' = 0 \implies x^2 u' = C}$$

---

## 問題 4 — $F$ が $x$ に独立なら $H = u'(\partial F/\partial u') - F$ は定数

$F(u, u')$ が $x$ に明示的に依存しない場合、連鎖律より：

$$\frac{dF}{dx} = \frac{\partial F}{\partial u}u' + \frac{\partial F}{\partial u'}u''$$

Euler-Lagrange方程式 $\partial F/\partial u = \frac{d}{dx}(\partial F/\partial u')$ を代入すると：

$$\frac{dF}{dx} = \frac{d}{dx}\!\left(\frac{\partial F}{\partial u'}\right)u' + \frac{\partial F}{\partial u'}u'' = \frac{d}{dx}\!\left(u'\frac{\partial F}{\partial u'}\right)$$

よって：

$$\frac{d}{dx}\!\left(u'\frac{\partial F}{\partial u'} - F\right) = 0$$

$$\boxed{H = u'\frac{\partial F}{\partial u'} - F = \text{定数}}$$

---

## 問題 5 — 光の最短時間経路とSnellの法則

移動時間 $T = \int_0^1 \frac{1}{x}\sqrt{1 + (u')^2}\,dx$, $u(0) = 0$, $u(1) = 1$。

$F = \frac{1}{x}\sqrt{1+(u')^2}$ は $u$ に依存しないので、$\partial F/\partial u = 0$。

**(a)** $\delta T/\delta u = 0$ から得られる定数量：

$$\frac{\partial F}{\partial u'} = \frac{u'}{x\sqrt{1+(u')^2}} = c \quad (\text{定数})$$

これは **Snellの法則**：速度 $x$ の媒質中で $\sin\theta / x = c$（$\sin\theta = u'/\sqrt{1+(u')^2}$）。

$$\boxed{\frac{\sin\theta}{x} = \text{定数}（Snellの法則）}$$

**(b)** $u' = cx/\sqrt{1 - c^2 x^2}$ なので $u = -\frac{1}{c}\sqrt{1-c^2x^2} + C$ 。これは円弧の方程式。境界条件から経路を決定できる。

---

## 問題 6 — 拘束条件付き最短経路と感度

$u(0) = 0$, $u(1) = A$, $P = \int_0^1 (u')^2\,dx$, 拘束条件 $\int_0^1 u\,dx = A$。

Euler方程式に乗数 $m$ を導入：$-2u'' + m = 0$ より $u'' = m/2$。

$$u(x) = \frac{m}{4}x^2 + Bx + C$$

$u(0) = 0 \Rightarrow C = 0$。$u(1) = A \Rightarrow m/4 + B = A$。$\int_0^1 u\,dx = A \Rightarrow m/12 + B/2 = A$。

第2式から $B = A - m/4$。第3式に代入：$m/12 + (A - m/4)/2 = A$ より $m/12 - m/8 = A/2$ より $-m/24 = A/2$ より $m = -12A$。ただし $P_{\min}$ を $u(x) = Ax(3-2x)$ （$m = -12A$ に対応）として検証。

実際に $A = -m/24$ を使い、$P_{\min}$ の $A$ に対する微分は：

$$\boxed{\frac{dP_{\min}}{dA} = -m \text{ （乗数は感度を与える）}}$$

---

## 問題 7 — 面積拘束付き最短経路

$\int u\,dx = A$ の拘束付きで $P(u) = \int_0^1 \sqrt{1+(u')^2}\,dx$ を最小化。

Lagrangian に乗数 $m$ を加える：$L = \int (F + mu)\,dx$。Euler-Lagrange方程式：

$$m - \frac{d}{dx}\!\left(\frac{u'}{\sqrt{1+(u')^2}}\right) = 0$$

これは曲率 $\kappa = m$ を意味し、解は **円弧**。$A$ が大きくなると円弧の曲率が大きくなる。

$$\boxed{\text{解は半径 } 1/m \text{ の円弧}}$$

---

## 問題 8 — 不等式拘束と乗数

$\int u\,dx \geq A$ の場合。解は直線のままであれば $A$ が小さい時は拘束が非活性で $m = 0$。$A$ が大きくなると拘束が活性になり、問題7と同じ円弧解になる。

$$\boxed{\text{Euler方程式が成立するか、乗数 } m = 0 \text{ のいずれか}}$$

---

## 問題 9 — 逆問題：面積最大化、経路長固定

面積 $\int u\,dx$ を最大化、経路長 $I = \int \sqrt{1+(u')^2}\,dx$ を固定。

**(a)** 乗数 $M$ を導入：$\delta/\delta u[\int u\,dx - M\int\sqrt{1+(u')^2}\,dx] = 0$。

$$1 + M\frac{d}{dx}\!\left(\frac{u'}{\sqrt{1+(u')^2}}\right) = 0$$

これは曲率 $= 1/M$ を意味する。

$$\boxed{\text{解は半径 } M \text{ の円弧（問題7の } M = 1/m \text{）}}$$

**(b)** $M$ と $m$ の関係：$M = 1/m$。

**(c)** 拘束がすべての $u$ を排除するのは、固定長で到達不可能な端点値の場合。

---

## 問題 10 — 折れ線最短経路と反射の法則

$(0,1)$ と $(1,1)$ を結ぶ最短折れ線で、$y = 0$ 軸に一度反射する経路。

$(0,1)$ を $y = 0$ に関して鏡像 $(0,-1)$ に反射すると、$(0,-1)$ から $(1,1)$ への直線距離が最短経路長。

反射点は $x = 1/(1+\sqrt{2}) \cdot ...$ ではなく、鏡像からの直線が $y=0$ と交わる点。直線 $(0,-1)$ to $(1,1)$ は $y = 2x - 1$ なので反射点は $x = 1/2$。

反射点 $(1/2, 0)$ での入射角と反射角が等しい：

$$\boxed{\text{入射角} = \text{反射角（反射の法則）}}$$

---

## 問題 11 — 最大エントロピー分布

$H = -\int u \log u\,dx$ を最大化。拘束：$\int u\,dx = 1$, $\int xu\,dx = 1/a$。

Lagrange乗数 $\lambda_1, \lambda_2$ を導入。$\delta/\delta u[-u\log u + \lambda_1 u + \lambda_2 xu] = 0$：

$$-\log u - 1 + \lambda_1 + \lambda_2 x = 0 \implies u = e^{\lambda_1 - 1 + \lambda_2 x}$$

$$\boxed{u = ae^{-ax} \quad (0 \leq x < \infty) \text{ — 指数分布}}$$

---

## 問題 12 — 第2モーメント拘束ではガウス分布

$\int x^2 u\,dx$ が定数の場合、同様に最大エントロピーを求めると：

$$u = Ce^{-\alpha x^2}$$

$$\boxed{u(x) = \text{ガウス分布（正規分布）}}$$

---

## 問題 13 — 円筒上の螺旋は測地線

$x = \cos\theta$, $y = \sin\theta$, $z = u(\theta)$ で経路長は：

$$P = \int \sqrt{1 + (u')^2}\,d\theta$$

Euler方程式は $u' = c$（定数）より $u = c\theta + d$。

$$\boxed{u' = c \text{ より最短螺旋は正則螺旋（regular helix）}}$$

---

## 問題 14 — 非線形方程式の弱形式

$-u'' + \sin u = 0$ に $v$ を掛けて部分積分：

$$\int u'v'\,dx + \int (\sin u)\,v\,dx = 0$$

最初の項を戻すと、最小化される汎関数は：

$$\boxed{P = \int \bigl[\tfrac{1}{2}(u')^2 - \cos u\bigr]\,dx}$$

---

## 問題 15 — 2次元Euler-Lagrange方程式

**(a)** $P(u) = \frac{1}{2}\iint\left[(u_{xx})^2 + 2(u_{xy})^2 + (u_{yy})^2\right]dx\,dy$

各項について変分を取り二度部分積分すると：

$$\boxed{u_{xxxx} + 2u_{xxyy} + u_{yyyy} = \nabla^4 u = 0 \text{ （重調和方程式）}}$$

**(b)** $P(u) = \frac{1}{2}\iint (yu_x^2 + u_y^2)\,dx\,dy$

$$\boxed{-\frac{\partial}{\partial x}(yu_x) - u_{yy} = 0 \implies yu_{xx} + u_{yy} = 0 \text{ （Tricomi型方程式）}}$$

**(c)** $E(u) = \int u\sqrt{1+(u')^2}\,dx$

$F = u\sqrt{1+(u')^2}$ で、$\partial F/\partial u = \sqrt{1+(u')^2}$, $\partial F/\partial u' = uu'/\sqrt{1+(u')^2}$。

$$\boxed{\sqrt{1+(u')^2} - \frac{d}{dx}\!\left(\frac{uu'}{\sqrt{1+(u')^2}}\right) = 0}$$

**(d)** $P(u) = \frac{1}{2}\iint (u_x^2 + u_y^2)\,dx\,dy$ with $\iint u^2\,dx\,dy = 1$

$$\boxed{-u_{xx} - u_{yy} = \lambda u \text{ （固有値問題、} \lambda \text{ はLagrange乗数）}}$$

---

## 問題 16 — 2つの積分のEuler-Lagrange方程式が同じ

$$\iint \frac{\partial^2 u}{\partial x^2}\frac{\partial^2 u}{\partial y^2}\,dx\,dy \quad \text{と} \quad \iint \left(\frac{\partial^2 u}{\partial x \partial y}\right)^2 dx\,dy$$

どちらも変分を取ると $u_{xxyy}$ の項を生む。境界条件が零のとき、部分積分により：

$$\boxed{\text{どちらも Euler-Lagrange 方程式は } u_{xxyy} = 0 \text{ を含む同じ形}}$$

境界条件が零なら両積分は等しい（部分積分で一方から他方へ変換可能）。

---

## 問題 17 — 位相面

$p^2/2m + mgu = \text{const}$ のグラフは $u$-$p$ 平面で：

$$\boxed{\text{放物線（parabola）}: p^2 = 2m^2g(h - u)}$$

ボールは最高点で $p = 0$（すべてPE）、最下点で $|p|$ 最大（すべてKE）。落下して戻る。

---

## 問題 18 — 2質量・2バネのHamilton方程式

$H = \frac{p_1^2}{2m_1} + \frac{p_2^2}{2m_2} + \frac{1}{2}c_1 u_1^2 + \frac{1}{2}c_2(u_2 - u_1)^2$

Hamilton方程式 $\partial H/\partial p_i = du_i/dt$, $\partial H/\partial u_i = -dp_i/dt$：

$$\frac{du_1}{dt} = \frac{p_1}{m_1}, \quad \frac{du_2}{dt} = \frac{p_2}{m_2}$$

$$\frac{dp_1}{dt} = -c_1 u_1 + c_2(u_2 - u_1), \quad \frac{dp_2}{dt} = -c_2(u_2 - u_1)$$

$p_i = m_i u_i'$ を代入して整理すると：

$$\boxed{M u'' + K u = 0, \quad M = \begin{bmatrix} m_1 & 0 \\ 0 & m_2 \end{bmatrix}, \quad K = \begin{bmatrix} c_1+c_2 & -c_2 \\ -c_2 & c_2 \end{bmatrix}}$$

---

## 問題 19 — 相補エネルギーとLegendre変換

$\frac{1}{2}w^T C^{-1} w$ が $\frac{1}{2}e^T C e$ のLegendre変換であることを確認。

$w = Ce$ より $e = C^{-1}w$。Legendre変換：$\max_{e}[e^T w - \frac{1}{2}e^T C e]$。

$e$ で微分して $w - Ce = 0$、$e = C^{-1}w$ を代入：

$$e^T w - \frac{1}{2}e^T Ce = w^T C^{-1}w - \frac{1}{2}w^T C^{-1}w = \frac{1}{2}w^T C^{-1}w$$

$$\boxed{\frac{1}{2}w^T C^{-1}w = \max_e[e^T w - \frac{1}{2}e^T Ce]}$$

---

## 問題 20 — 弾性振り子

$PE = mg(\ell - \ell\cos\theta)$, バネエネルギー $\frac{1}{2}c(r-\ell)^2$, $KE = \frac{1}{2}m(\ell\theta')^2$。弾性バネ付きでは $KE = \frac{1}{2}m(r')^2 + \frac{1}{2}m(r\theta')^2$。

**(a)** Example 8に従い $\theta, r$ の2つの結合方程式：

$$m r'' - mr(\theta')^2 + c(r-\ell) + mg\cos\theta = 0$$

$$mr^2\theta'' + 2mrr'\theta' + mgr\sin\theta = 0$$

**(b)** Hamiltonの4本の一階方程式は $p_\theta = mr^2\theta'$, $p_r = mr'$ として：

$$\boxed{\dot{\theta} = \frac{p_\theta}{mr^2}, \quad \dot{r} = \frac{p_r}{m}, \quad \dot{p_\theta} = -mgr\sin\theta, \quad \dot{p_r} = \frac{p_\theta^2}{mr^3} - c(r-\ell) - mg\cos\theta}$$

---

## 問題 21 — 二次ポテンシャルの弱形式

$P(u) = \frac{1}{2}a(u,u) - \ell(u)$。$P(u+v) = P(u) + [a(u,v) - \ell(v)] + \frac{1}{2}a(v,v)$。

$v^2$ 項を無視すると $\delta P/\delta u = 0$ の条件は：

$$\boxed{a(u, v) = \ell(v) \quad \text{for all } v}$$

---

## 問題 22 — 相対論的Hamiltonian

$L(v) = -mc^2\sqrt{1-(v/c)^2}$ より $p = mv/\sqrt{1-(v/c)^2}$。

$H = pv - L = \frac{mv^2}{\sqrt{1-(v/c)^2}} + mc^2\sqrt{1-(v/c)^2} = \frac{mc^2}{\sqrt{1-(v/c)^2}}$。

$v$ を $p$ で表す：$v = p/\sqrt{m^2 + (p/c)^2}$ を代入すると：

$$\boxed{H = mc^2\sqrt{1 + (p/mc)^2} = \sqrt{m^2c^4 + p^2c^2}}$$

---

## 問題 23--28 — 離散Lagrangian（概要）

**問題 23：** $u_x$ を $(u_{i+1}-u_i)/\Delta x$ に置換。$P(u) = \sum \frac{1}{2}u_x^2 \Delta x - 4u\Delta x$ の離散和を最小化。$\partial P/\partial u_i = 0$ より差分方程式 $-(u_{i+1}-2u_i+u_{i-1})/(\Delta x)^2 = 4$。最小化する $u(x)$ は $u = 2x(1-x)$。

**問題 24：** $P(u) = \int\sqrt{1+u_x^2}\,dx$ を $u_x \to \Delta u/\Delta x$ で離散化。Lagrange乗数 $m$ 付きの方程式から、円弧が区分線形になる。

**問題 25：** $\iint (u_x^2 + u_y^2)\,dx\,dy$ を $\Delta u/\Delta x$, $\Delta u/\Delta y$ で離散化すると、最小化から $-u_{xx} - u_{yy} = 0$ の5点差分 $-u_{i+1,j}-u_{i-1,j}-u_{i,j+1}-u_{i,j-1}+4u_{ij} = 0$ を得る。

**問題 26：** $P(u) = \int (u_{xx})^2\,dx$ を $(\Delta^2 u/(\Delta x)^2)^2$ で離散化すると4次差分 $\Delta^4 u$ が現れる。

**問題 27：** $KE = \frac{1}{2}m(u')^2$, $PE = mgu$ の離散作用は $\sum \frac{1}{2}m(\Delta u/\Delta t)^2 + mg\,u$ を最小化。

**問題 28：** Marsdenの離散化は構造保存（symplectic）積分器の考え方に基づく。

---

# Problem Set 8.4 — Errors in Projections and Eigenvalues (pp. 651--652)

---

## 問題 1 — Rayleigh商とハット関数

$-u'' = 2$, $u(0) = u(1) = 0$ の解は $u^*(x) = x - x^2$。

$P(u) = \frac{1}{2}\int (u')^2\,dx - \int 2u\,dx$ を $u^*$ に対して計算：

$(u^*)' = 1 - 2x$ より $\int_0^1 (1-2x)^2\,dx = 1/3$。$\int_0^1 2(x-x^2)\,dx = 1/3$。

$$P(u^*) = 1/6 - 1/3 = -1/6$$

ハット関数 $u_H = \min(x, 1-x)$ に対して：$(u_H')^2 = 1$ で $\int_0^1 1\,dx = 1$。$\int_0^1 2u_H\,dx = 1/2$。

$$P(u_H) = 1/2 - 1/2 = 0$$

$$\boxed{P(u^*) = -1/6 < P(u_H) = 0}$$

---

## 問題 2 — 定数関数 $u(x) = 1$ はなぜ不適

$u(0) = u(1) = 0$ の境界条件を満たさないので許容関数でない。仮に計算すると $(u')^2 = 0$ で $P(u) = \frac{1}{2}\cdot 0 - \int 2\,dx = -2$ となるが、これは不正（境界条件違反のため下界を突き抜ける）。

$$\boxed{\text{境界条件 } u(0) = u(1) = 0 \text{ を満たさないため不適格}}$$

---

## 問題 3 — 有限要素の直交性

$a(u, v) = \int u'v'\,dx$ とする。$U_I$ は $u^*$ の線形補間。

$a(U_I - u^*, U) = \int (U_I - u^*)'U'\,dx = 0$ for all $U$ in trial space $T$。

これは有限要素解 $U^*$ の定義 $a(U^*, V) = \ell(V)$ と $a(u^*, v) = \ell(v)$ の差から：

$$a(U_I - u^*, U) = \int_0^1 (U_I' - (u^*)')U'\,dx$$

$U'$ は各要素で定数、$(u^*)' = 1-2x$ の補間 $U_I' = 1-2x$ は各要素端点で一致。直接計算で $U_I = u^*$（線形補間が厳密解に一致）なので、$U_I - u^* = 0$ at meshpoints であり、各要素上で誤差は二次。

$$\boxed{a(U_I - u^*, U) = 0 \text{ — 有限差分では奇跡的に補間が厳密解}}$$

---

## 問題 4 — Laplace方程式とPoisson方程式

$a(u, u) = \iint (u_x^2 + u_y^2)\,dx\,dy$（Laplace方程式に対応）。

Poisson方程式 $-\nabla^2 u = f$ に対しては：$P(u) = \frac{1}{2}a(u,u) - \ell(u)$ で $\ell(u) = \iint fu\,dx\,dy$。

$[0,1]^2$ 上で $u = 0$ のとき $u^* = ?$。$u = (\sin\pi x)(\sin\pi y)$ で $P(u) = \pi^2/2 - ...$。

$$\boxed{a(u,u) \text{ はDirichletエネルギー、Poisson方程式の弱形式を与える}}$$

---

## 問題 5 — Rayleigh商

$u = (\sin\pi x)(\sin\pi y)$ は $-\nabla^2 u = 2\pi^2 u$ を満たすので固有値は $\lambda = 2\pi^2$。

Rayleigh商 $a(u,u)/(u,u) = 2\pi^2$。試行関数 $u = x^2 - x + y^2 - y$ では：

$u_x = 2x-1$, $u_y = 2y-1$。$\int\int (u_x^2 + u_y^2) = 2\int_0^1(2x-1)^2\,dx = 2/3$。$\int\int u^2$ を計算して比をとる。

$$\boxed{\text{Rayleigh商} \geq 2\pi^2 \approx 19.74}$$

---

## 問題 6 — Rayleigh商の第一変分

$R = u^T K u / u^T M u$ の変分 $\delta R/\delta u = 0$：

$$\frac{2K(u+v)}{(u+v)^T M(u+v)} - \frac{u^T K u \cdot 2M(u+v)}{[(u+v)^T M(u+v)]^2}$$

$v$ の一次の項より：$Ku/u^T Mu - (u^T Ku)Mu/(u^T Mu)^2 = 0$、すなわち $Ku = \lambda Mu$。

$$\boxed{Ku = \lambda Mu \text{ （一般化固有値問題）}}$$

---

## 問題 7 — 最小二乗と射影

$A^T A \tilde{u} = A^T b$ の誤差 $b - A\tilde{u}$ は $A$ の列空間に直交。重み付き最小二乗では $(AU)^T C(b - A\tilde{u}) = 0$ for all $U$。

強形式：$A^T C A \tilde{u} = A^T C b$。加重内積 $a(U, V) = V^T(A^T CA)U$。

$$\boxed{K = A^T CA \text{ のとき } a(U,V) = U^T K V}$$

---

## 問題 8 — 第2固有ベクトル

$(15)$ で $U_2^* = (1, -1)$ のとき $\Lambda_2 = U_2^{*T}KU_2^* / U_2^{*T}MU_2^*$。

$K = \begin{bmatrix} 6 & -3 \\ -3 & 6 \end{bmatrix}$ の2番目の固有値に対応。$KU_2 = 9\begin{bmatrix}1\\-1\end{bmatrix}$, $MU_2 = \frac{A}{18}\begin{bmatrix}...\end{bmatrix}$。

$$\boxed{\Lambda_2 > \lambda_2 = 2^2\pi^2 = 4\pi^2}$$

---

# Problem Set 8.5 — The Saddle Point Stokes Problem (pp. 660--661)

---

## 問題 1 — 3D四面体の $P_1$ 要素

標準3D四面体の頂点 $(0,0,0)$, $(1,0,0)$, $(0,1,0)$, $(0,0,1)$。

$P_1$ 要素は $\phi = a + bX + cY + dZ$。4頂点のうち3頂点で $\phi = 0$、1頂点で $\phi = 1$ となる4つの基底関数：

$$\phi_1 = 1-X-Y-Z, \quad \phi_2 = X, \quad \phi_3 = Y, \quad \phi_4 = Z$$

$$\boxed{\text{4つの } \phi \text{ のうち第4頂点 } (0,0,1) \text{ で零になるのは } \phi_2, \phi_3, \phi_1 \text{ の3つ}}$$

---

## 問題 2 — 3Dの $P_2$ 要素

$P_2$ は10ノード（4頂点 + 6辺中点）。$\phi$ は $1, X, Y, Z, X^2, Y^2, Z^2, XY, XZ, YZ$ の10項の組合せ。$\phi(0.5, 0, 0) = 1$ の条件を含めて：

$$\boxed{\text{10ノード、10個の基底関数}}$$

---

## 問題 3 — $Q_2$ 要素の9ノード

単位正方形上の $Q_2$ 要素は9ノード（4頂点、4辺中点、1中心）。試行関数 $\phi_i$ は $1, X, Y, X^2, XY, Y^2, X^2Y, XY^2, X^2Y^2$ の9項。

$\phi_5(X,Y)$（底辺中点 $(\frac{1}{2}, 0)$）と $\phi_9(X,Y)$（中心 $(\frac{1}{2}, \frac{1}{2})$）：

$$\phi_5 = 4X(1-X)(1-Y), \quad \phi_9 = 16X(1-X)Y(1-Y)$$

$$\boxed{\phi_5(\tfrac{1}{2}, 0) = 1, \quad \phi_9(\tfrac{1}{2}, \tfrac{1}{2}) = 1}$$

---

## 問題 4 — $Q_2$ brick要素

3Dの $Q_2$ brick要素のノード数は：8頂点 + 12辺中点 + 6面中心 + 1体心 = **27ノード**。

バブル関数は中心 $(\frac{1}{2}, \frac{1}{2}, \frac{1}{2})$ でのみ非零で、すべての面・辺・頂点で零。

$$\boxed{27\text{ノード、バブル関数 } \phi = 64XYZ(1-X)(1-Y)(1-Z)}$$

---

## 問題 5 — 前処理行列の固有値

$P^{-1}S$ の3つの固有値。$S = \begin{bmatrix} C^{-1} & A \\ A^T & 0 \end{bmatrix}$, $P = \text{diag}(\hat{C}^{-1}, \hat{K})$ の場合。

$\hat{C} = C$, $\hat{K} = K = A^T CA$ のとき $P_2^{-1}S$ は3つの異なる固有値 $1, (1\pm\sqrt{5})/2$ のみを持つ。

**(a)** $\lambda = 1$ with $m-n$ eigenvectors when $A^T u = 0$ and $p = 0$。

**(b)** $(\lambda^2 - \lambda - 1)A^T CA p = 0$ for other $2n$ eigenvectors。

$$\boxed{\text{固有値は } 1, \frac{1+\sqrt{5}}{2}, \frac{1-\sqrt{5}}{2} \text{ の3種のみ}}$$

---

## 問題 6 — $P_3$ は $A$ を正確に保持

$P_3 x = \lambda \begin{bmatrix} C^{-1} & A \\ 0 & A^T C A \end{bmatrix} \begin{bmatrix} u \\ p \end{bmatrix}$

第1ブロック方程式：$(1-\lambda)(C^{-1}u + Ap) = 0$。$\lambda = 1$ なら $C^{-1}u = -Ap$。

第2ブロック方程式は $\lambda = -1$ を与える。収束は **2反復**。

$$\boxed{\text{理想的だが } P_3 \text{ の逆を計算する必要があり実用的でない}}$$

---

## 問題 7 — $Q_1$-$Q_1$ の離散発散行列

$A^T$ は $Q_1$ から $Q_1$ への離散発散。16マス格子で外側零境界条件。$B = A^T$, $\text{svd}(B)$ の零空間は8次元。

$$\boxed{\text{svd}(B) \text{ の零特異値が8つ：} A \text{ の零空間は8次元}}$$

---

## 問題 8--10 — 非対称行列 $U$ と符号変化

**問題 8：** $(15)$ で $C^{-1} = 3$, $D = 1$。$b = 2$ のとき $P^{-1} = \begin{bmatrix} C^{-1}-bI & A \\ A^T & bI-D \end{bmatrix}$。

$bI > D$ かつ $C^{-1} > bI$ には $b < 1$ かつ $b > 3$（矛盾）なので、$P^{-1}$ が正定値になるのは $a^2 < 1$。

$$\boxed{P^{-1} \text{ は } a^2 < 1 \text{ のとき正定値}}$$

**問題 9：** $P^{-1}U$ がすべての $b$ で対称であることの確認。$U = \begin{bmatrix} C^{-1} & A \\ -A^T & D \end{bmatrix}$。$P^{-1}U$ の $(i,j)$ と $(j,i)$ を比較して対称性を検証。

**問題 10：** $U = V\Lambda V^{-1}$ が実固有値を持つとき、$U = (V\Lambda V^{\mathrm{T}})(V^{-\mathrm{T}}V^{-1})$ として $R = V^{-\mathrm{T}}V^{-1}$ は正定値対称。

$$\boxed{U = PR \text{ で } P \text{ は対称、} R \text{ は正定値対称}}$$

---

# Problem Set 8.6 — Linear Programming and Duality (pp. 676--677)

---

## 問題 1 — シンプレックス法の第2ステップ

$x = (4,0,0)$, $c = (5,3,7)$ から出発。被約コスト $r = c - A^T y$ の最も負の成分が $x_{\text{in}}$ を決める。

学生コーナー $x^* = (0,4,0)$ が第2シンプレックスステップで得られることを示す。$c_B = 3$, $y = 3$ なので $r = c - A^T y = (5-3, 3-3, 7-3) = (2, 0, 4)$。すべて $\geq 0$ なので最適。

$$\boxed{x^* = (0,4,0) \text{ が最適（コスト \$12）}}$$

---

## 問題 2 — シンプレックスコードのテスト

basis $= [1]$（第1変数のみ）でスタート。本文のコードに従い実行確認。

$$\boxed{\text{コードは } x^* = (0,4,0) \text{ を出力する}}$$

---

## 問題 3 — コストベクトル変更

$c$ を変更しPh.D.が仕事を得る場合。双対の $y^*$ は $c$ の変更に応じて変わる。Ph.D.のコスト $c_1 = 5$ を下げると、Ph.D.が最適コーナーに入る。

$$\boxed{y^* = \max\{y : A^T y \leq c\} \text{ で新しい } c \text{ に対応}}$$

---

## 問題 4 — 第2拘束付き

$2x_1 + x_2 + x_3 = 6$。$x = (2,2,0)$ はPh.D.が2時間、学生が2時間。コスト $= 5\cdot 2 + 3\cdot 2 + 8\cdot 0 = 16$。

$c^T x = 5x_1 + 3x_2 + 8x_3$ で $c = (5,3,8)$ のとき、この $x$ がコスト最小化するかを確認。

$$\boxed{\text{はい、} x = (2,2,0) \text{ でコスト \$16 が最小}}$$

---

## 問題 5 — 実行可能領域の描画

$x + 2y = 6$, $x \geq 0$, $y \geq 0$ は線分。$c = x + 3y$ を最小化するコーナーは $(6, 0)$ で $c = 6$。最大化コーナーは $(0, 3)$ で $c = 9$。

$$\boxed{\text{最小コスト点 } (6,0), \text{ 最大コスト点 } (0,3)}$$

---

## 問題 6 — 4コーナーの実行可能領域

$x + 2y \leq 6$, $2x + y \leq 6$, $x \geq 0$, $y \geq 0$ の4コーナー：$(0,0)$, $(3,0)$, $(0,3)$, $(2,2)$。

$c = 2x - y$ を最小化するコーナー：$(0,3)$ で $c = -3$。

$$\boxed{\text{最小化コーナー } (0,3), \; c = -3}$$

---

## 問題 7 — 弱双対性の証明

主問題：Minimize $c^T x$ with $Ax = b$, $x \geq 0$。
双対：Maximize $y^T b$ with $A^T y \leq c$, $y \geq 0$。

任意の実行可能 $x, y$ に対して：

$$y^T b = y^T(Ax) = (A^T y)^T x \leq c^T x$$

最後の不等式は $A^T y \leq c$ かつ $x \geq 0$ による。

$$\boxed{y^T b \leq c^T x \quad \text{（弱双対性）}}$$

---

## 問題 8 — Figure 8.15のボトルネック辺

容量を1増やしてmax flowが10から11に増える辺は、最小カット上の辺。最小カットの容量は $1+2+4+2+1 = 10$。

$$\boxed{\text{最小カット上の辺（容量 } 1,2,4,2,1 \text{）のいずれかを増やす}}$$

---

## 問題 9 — 5ノードグラフの最大流・最小カット

source $s$、sink $t$、その他4ノード。全15ペア間に容量1の辺。最大流 = 最小カット。

$s$ から出る辺は4本（各容量1）なので max flow $\leq 4$。実際に4本の辺素パスが存在するので max flow $= 4$。最小カットは $s$ を切り離す4辺。

$$\boxed{\text{max flow} = \text{min cut} = 4}$$

---

## 問題 10 — 容量 $|i-j|$ のグラフ

ノード $0,1,2,3,4$。辺 $(i,j)$ の容量 $= |i-j|$。ノード0からノード4への最大流。

最小カットを探す。$\{0\}$ vs $\{1,2,3,4\}$：カット容量 $= 1+2+3+4 = 10$。$\{0,1\}$ vs $\{2,3,4\}$：カット容量 $= 2+3+4+1+2+3 = ...$（$0\to 2,3,4$ と $1\to 2,3,4$ の合計）。

最小カットは $\{0,1,2,3\}$ vs $\{4\}$：容量 $= 4+3+2+1 = 10$ で同じ。

$$\boxed{\text{min cut} = \text{max flow} = 4 + 3 + 2 + 1 = 10}$$

実際には対称性により両端のカットが最小で容量10。

---

## 問題 11 — ノード容量の標準問題への還元

ノード $j$ に容量 $C_j$ がある場合、ノード $j$ を $j'$ と $j''$ に分割し、$j'$ から $j''$ への辺（容量 $C_j$）を追加。元の辺 $i \to j$ は $i'' \to j'$ に、$j \to k$ は $j'' \to k'$ に接続。

$$\boxed{\text{各ノード } j \text{ を } j', j'' \text{ に分割し容量 } C_j \text{ の辺で接続}}$$

---

## 問題 12 — 4x4行列の完全マッチング

$A$ は対角のすぐ上と下に1を持つ4x4行列：$a_{12}=a_{21}=a_{23}=a_{32}=a_{34}=a_{43}=1$。

完全マッチング（4つの結婚）：$(1,2)$ と $(3,4)$ は可能。もう一つは $(2,3)$ を含むが、残り $(1,?)$ と $(4,?)$ は辺がない。よって完全マッチングは $(1,2),(3,4)$ のみ。

対応する二部グラフ：左 $\{1,2,3,4\}$、右 $\{1,2,3,4\}$、辺は $a_{ij}=1$ の位置。

$$\boxed{\text{完全マッチングは可能：} (1\text{-}2), (3\text{-}4) \text{（ユニークではない）}}$$

---

## 問題 13 — 5x5対角+副対角行列のマッチング不可能

$A$ は5x5で対角の上下に1。5ノード（奇数）の二部グラフでは完全マッチング不可能（一方が多い）。

Hall の定理による：例えば行 $\{1, 3, 5\}$ は列 $\{2, 4\}$ のみに接続（3 > 2）。

$$\boxed{\text{行 } \{1,3,5\} \text{ は列 } \{2,4\} \text{ のみに接続：Hall条件違反}}$$

---

## 問題 14 — max flow = min cut の検証

$s$ から $t$ へエッジを共有しない（辺素な）パスの最大数 = $s$ と $t$ を切断する辺の最小数。これは max flow-min cut 定理の特殊ケース（全容量1）。

$$\boxed{\text{辺素パスの最大数} = \text{除去すべき辺の最小数（Menger の定理）}}$$

---

## 問題 15 — 7x7行列で15個の1、2つ以上のマッチング

15個の1は各行・各列に少なくとも2つの1があれば、完全マッチングが2つ以上見つかる。

カバーに必要な直線数：$15/7 > 2$ なので少なくとも3本の直線が必要。Konig の定理により最大マッチングサイズ $\geq 3$。7x7ではさらに分析が必要だが、15個の1で7本が必要（完全マッチング可能）。

$$\boxed{\text{7本の直線ですべての1をカバー可能（完全マッチングが存在）}}$$

---

## 問題 16 — 空の実行可能集合

$A = [-3]$, $b = [2]$, $x \geq 0$。$Ax = b$ は $-3x = 2$ で $x = -2/3 < 0$。実行可能集合は空。

双対：$-3y \leq c$ で $y$ を最大化：$\max 2y$。$y \leq -c/3$ で $c$ の値によらず上に非有界。

$$\boxed{\text{主問題の実行可能集合が空、双対問題は非有界}}$$

---

## 問題 17 — 六角形グラフの最大流

6外側ノード（六角形）＋1中心ノード、6辺が中心から外側へ。全容量1。$s$ を外側ノードの1つ、$t$ を中心とすると：

$s$ から $t$ へは直接辺1本（容量1）＋隣接ノード経由で2本（各容量1だが中心への辺がボトルネック）。中心への辺は6本あるが $s$ は1本のみ直接。

max flow は $s$ から出る辺の数に制限される。$s$ は3辺（六角形の2辺＋中心への1辺）を持つ。

$$\boxed{\text{max flow} = 3 \text{ （中心ノードへの3本の独立パス）}}$$

---

# Problem Set 8.7 — Adjoint Methods in Design (p. 684)

---

## 問題 1 — 行列積の演算量

$X$ は $q \times r$、$Y$ は $r \times s$、$Z$ は $s \times t$。

$(XY)Z$：$XY$ に $qrs$ 回、次に $(XY)Z$ に $qst$ 回。合計 $qrs + qst$。

$X(YZ)$：$YZ$ に $rst$ 回、次に $X(YZ)$ に $qrt$ 回。合計 $rst + qrt$。

$(XY)Z$ が速いのは $t^{-1} + r^{-1} < q^{-1} + s^{-1}$ のとき。

随伴法（式(3)）では $r = s$, $q = 1$, $t = M$ で成功：$c^T A^{-1}$ を先に計算（$1 \times N$ のベクトル）。

$$\boxed{(XY)Z \text{ の演算量 } qrs + qst, \quad X(YZ) \text{ の演算量 } rst + qrt}$$

---

## 問題 2 — Forward AD（自動微分）

$C = f(A, B)$ で $A, B$ が入力 $S$ に依存。連鎖律：

$$\frac{\partial C}{\partial S} = \frac{\partial f}{\partial A}\frac{\partial A}{\partial S} + \frac{\partial f}{\partial B}\frac{\partial B}{\partial S}$$

$C = S^2$, $T = S - C = S - S^2$ として $dT/dS = 1 - 2S$。

$$\boxed{\frac{dT}{dS} = 1 - 2S}$$

---

## 問題 3 — $u^T(vw^T)$ vs $(u^Tv)w^T$ の演算量

$u, v, w$ は $N$ 成分ベクトル。

$u^T(vw^T)$：まず $vw^T$（$N \times N$ 行列、$N^2$ 回）、次に $u^T$ との積（$N^2$ 回）。合計 $2N^2$。

$(u^T v)w^T$：まず $u^T v$（スカラー、$N$ 回）、次にスカラー$\times w^T$（$N$ 回）。合計 $2N$。

$$\boxed{u^T(vw^T) \text{ は } 2N^2 \text{ 回、} (u^Tv)w^T \text{ は } 2N \text{ 回}}$$
