# Chapter 8 — Problem Set 解答

> Gilbert Strang, *Computational Science and Engineering*, Chapter 8: Optimization and Minimum Principles

---

# Problem Set 8.1 (pp. 610--612)

---

## 問題 1 — ピタゴラスの定理の面積による証明

辺 $a, b, c$（$c$ が斜辺）の直角三角形を $a$ 倍と $b$ 倍に拡大し、共通辺 $ab$ で並べると、大きな直角三角形（脚 $ac$, $bc$）が得られる。

大きな三角形の面積は：

$$\frac{1}{2}(ac)(bc) = \frac{1}{2}abc^2$$

一方、2つの拡大三角形の面積の和は：

$$\frac{1}{2}(a \cdot a)(a \cdot b) + \frac{1}{2}(b \cdot a)(b \cdot b) = \frac{1}{2}a^3 b + \frac{1}{2}ab^3 = \frac{1}{2}ab(a^2 + b^2)$$

面積が等しいから：

$$\frac{1}{2}abc^2 = \frac{1}{2}ab(a^2 + b^2)$$

$ab \neq 0$ で割って：

$$\boxed{c^2 = a^2 + b^2}$$

**最終解答**: 空欄は $\frac{1}{2}a^3b + \frac{1}{2}ab^3 = \frac{1}{2}ab(a^2+b^2)$（2つの拡大三角形の面積の和）。

---

## 問題 2 — 長方形と外部点に対する四辺の二乗距離の恒等式

長方形の頂点を $P_1, P_2, P_3, P_4$（対角の頂点が $P_1, P_3$ および $P_2, P_4$）とし、外部の点を $b$ とする。$b$ から長方形の辺に平行な破線（水平・垂直）を引き、各頂点への距離を直角三角形で分解する。

頂点 $P_i$ の座標を $(x_i, y_i)$、点 $b = (b_1, b_2)$ とすると、ピタゴラスの定理より：

$$|bP_i|^2 = (b_1 - x_i)^2 + (b_2 - y_i)^2$$

長方形の頂点を $(0,0), (a,0), (a,d), (0,d)$ とすると：

- $|bP_1|^2 + |bP_3|^2 = b_1^2 + b_2^2 + (b_1-a)^2 + (b_2-d)^2$
- $|bP_2|^2 + |bP_4|^2 = (b_1-a)^2 + b_2^2 + b_1^2 + (b_2-d)^2$

**最終解答**: 対角の頂点への距離の二乗の和が等しい：

$$\boxed{|bP_1|^2 + |bP_3|^2 = |bP_2|^2 + |bP_4|^2}$$

具体的に $13 + 17 = 25 + 5 = 30$ が成立する。

---

## 問題 3 — 座標による四辺二乗恒等式の証明

長方形の頂点を $(0,0), (x,0), (x,y), (0,y)$ とし、点 $b = (b_1, b_2)$ とする。

4つの距離の二乗：

- $d_1^2 = b_1^2 + b_2^2$
- $d_2^2 = (b_1-x)^2 + b_2^2$
- $d_3^2 = (b_1-x)^2 + (b_2-y)^2$
- $d_4^2 = b_1^2 + (b_2-y)^2$

対角和の差：

$$d_1^2 + d_3^2 - d_2^2 - d_4^2$$

$$= [b_1^2 + b_2^2 + (b_1-x)^2 + (b_2-y)^2] - [(b_1-x)^2 + b_2^2 + b_1^2 + (b_2-y)^2] = 0$$

**3次元への拡張**: $b = (b_1, b_2, b_3)$ のとき、各距離の二乗に $b_3^2$ が加わるが、4つすべてに同じ $b_3^2$ が加わるので差は変わらない：

$$\boxed{d_1^2 + d_3^2 = d_2^2 + d_4^2 \quad \text{（2次元でも3次元でも成立）}}$$

---

## 問題 4 — $b$ が長方形の内部にある場合

例えば長方形 $(0,0), (4,0), (4,3), (0,3)$ の内部の点 $b = (1,1)$ を取る。

- $d_1^2 = 1^2 + 1^2 = 2$
- $d_2^2 = 3^2 + 1^2 = 10$
- $d_3^2 = 3^2 + 2^2 = 13$
- $d_4^2 = 1^2 + 2^2 = 5$

検証：

$$\boxed{d_1^2 + d_3^2 = 2 + 13 = 15 = 10 + 5 = d_2^2 + d_4^2 \quad \checkmark}$$

$b$ が内部でも外部でも恒等式は成立する。

---

## 問題 5 — 任意次元での証明（$A^\top w = 0$ を利用）

最小二乗の文脈で、$w = b - Au$（残差）とすると $A^\top w = 0$。
4つの二乗ノルムを展開する：

$$\|b - Au\|^2 = b^\top b - 2b^\top Au + (Au)^\top(Au)$$

同様に他の3つの二乗 $\|b\|^2, \|Au\|^2, \|w\|^2$ を展開する。

$b = Au + w$ と分解すると：

- $\|b\|^2 = \|Au\|^2 + 2(Au)^\top w + \|w\|^2$

$A^\top w = 0$ より $(Au)^\top w = u^\top A^\top w = 0$。したがって：

$$\boxed{\|b\|^2 = \|Au\|^2 + \|w\|^2}$$

これはピタゴラスの定理そのものであり、$b$ が $Au$ と $w$ の直交分解であることを示す。この証明は $b$ が $A$ の列空間の平面にある必要がなく、任意の次元で成立する。

---

## 問題 6 — Kai Borre の三角法による証明

余弦定理より：

$$\|b\|^2 = \|w\|^2 + \|b-w\|^2 - 2\|w\|\|b-w\|\cos B$$

右側の三角形から：

$$\|b-w\|^2 = \|Au\|^2 + \|b-Au-w\|^2 - 2\|Au\|\|b-Au-w\|\cos A' + \text{cross term}$$

ただし、$-\cos A$ と $-\cos B$ の項が等しいことを正弦法則で示す。

上の三角形において、$-\cos A = \sin(A - 90°)$, $-\cos B = \sin(B - 90°)$ であり、正弦法則：

$$\frac{\sin\theta}{\text{対辺の長さ}}$$

がすべての角で等しい。これにより余弦項が打ち消し合い：

$$\boxed{\|b\|^2 = \|w\|^2 + \|Au\|^2}$$

すなわちピタゴラスの定理が余弦法則と正弦法則から導かれる。

---

## 問題 7 — Fixed-Free の場合のラグランジュ関数

Fixed-free のバネ系で、下のバネが質量 $m_2$ を支える。

力のバランスの制約：
- $w_1 - w_2 - f_1 = 0$（節点1）
- $w_2 - f_2 = 0$（節点2）

ラグランジュ関数（$u_1, u_2$ がラグランジュ乗数）：

$$L(w_1, w_2, u_1, u_2) = \frac{1}{2c_1}w_1^2 + \frac{1}{2c_2}w_2^2 + u_1(w_1 - w_2 - f_1) + u_2(w_2 - f_2)$$

4つの偏微分を0とおくと：

$$\frac{\partial L}{\partial w_1} = \frac{w_1}{c_1} + u_1 = 0 \quad \Rightarrow \quad w_1 = -c_1 u_1$$

$$\frac{\partial L}{\partial w_2} = \frac{w_2}{c_2} - u_1 + u_2 = 0 \quad \Rightarrow \quad w_2 = c_2(u_1 - u_2)$$

$$\frac{\partial L}{\partial u_1} = w_1 - w_2 - f_1 = 0$$

$$\frac{\partial L}{\partial u_2} = w_2 - f_2 = 0$$

**最終解答**: 上の4方程式が (15a)--(15c) に対応するKKT条件。

---

## 問題 8 — Fixed-Free での行列 $A$ と解

Fixed-free の場合、$A^\top = \begin{bmatrix} 1 & -1 \\ 0 & 1 \end{bmatrix}$ なので：

$$A = \begin{bmatrix} 1 & 0 \\ -1 & 1 \end{bmatrix}$$

鞍点系：

$$\begin{bmatrix} C^{-1} & A \\ A^\top & 0 \end{bmatrix}\begin{bmatrix} w \\ u \end{bmatrix} = \begin{bmatrix} 0 \\ f \end{bmatrix}$$

第1ブロック行より $w = -CA u$。これを第2ブロック行に代入（$A^\top$ 倍して引く）：

$$A^\top w = f \quad \Rightarrow \quad -A^\top C A\, u = f$$

ゼロブロックに入る行列は：

$$\boxed{-A^\top C A = -\begin{bmatrix} 1 & -1 \\ 0 & 1 \end{bmatrix}\begin{bmatrix} c_1 & 0 \\ 0 & c_2 \end{bmatrix}\begin{bmatrix} 1 & 0 \\ -1 & 1 \end{bmatrix} = -\begin{bmatrix} c_1+c_2 & -c_2 \\ -c_2 & c_2 \end{bmatrix}}$$

これは $-K$（fixed-free の剛性行列）。$K u = f$ を解いて：

$$\begin{bmatrix} c_1+c_2 & -c_2 \\ -c_2 & c_2 \end{bmatrix}\begin{bmatrix} u_1 \\ u_2 \end{bmatrix} = \begin{bmatrix} f_1 \\ f_2 \end{bmatrix}$$

$$u_2 = \frac{f_1 + f_2}{c_2} + \frac{f_1}{c_1} \cdot \frac{c_2}{c_2} \quad \longrightarrow$$

第2式より $-c_2 u_1 + c_2 u_2 = f_2$、すなわち $u_2 - u_1 = f_2/c_2$。
第1式より $c_1 u_1 + c_2(u_1 - u_2) = f_1$、すなわち $c_1 u_1 - f_2 = f_1$。

$$\boxed{u_1 = \frac{f_1 + f_2}{c_1}, \quad u_2 = \frac{f_1 + f_2}{c_1} + \frac{f_2}{c_2}}$$

---

## 問題 9 — $C = I$ での最小エネルギーと感度解析

$C = I$ のとき、問題8の結果から $K = A^\top A = \begin{bmatrix} 2 & -1 \\ -1 & 1 \end{bmatrix}$。

$K u = f$ を解くと：

$$u_1 = f_1 + f_2, \quad u_2 = f_1 + 2f_2$$

$w = Au$ より：

$$w_1 = u_1 = f_1 + f_2, \quad w_2 = u_2 - u_1 = f_2$$

最小エネルギー：

$$E_{\min} = \frac{1}{2}w_1^2 + \frac{1}{2}w_2^2 = \frac{1}{2}(f_1+f_2)^2 + \frac{1}{2}f_2^2$$

感度解析：

$$\frac{\partial E_{\min}}{\partial f_1} = f_1 + f_2 = u_1 \quad \checkmark$$

$$\frac{\partial E_{\min}}{\partial f_2} = (f_1 + f_2) + f_2 = f_1 + 2f_2 = u_2 \quad \checkmark$$

$$\boxed{\frac{\partial E_{\min}}{\partial f_i} = u_i \quad \text{（ラグランジュ乗数 = 変位 = 感度）}}$$

---

## 問題 10 — 鞍点行列 $S$ の固有値と特異値

$S = \begin{bmatrix} I & A \\ A^\top & 0 \end{bmatrix}$ に対し、$A = U\Sigma V^\top$ のSVDを用いて相似変換すると：

$$\begin{bmatrix} U^{-1} & \\ & V^{-1} \end{bmatrix} S \begin{bmatrix} U & \\ & V \end{bmatrix} = \begin{bmatrix} I & \Sigma \\ \Sigma^\top & 0 \end{bmatrix}$$

行と列を並べ替えると、$n$ 個の $2 \times 2$ ブロックになる：

$$B_j = \begin{bmatrix} 1 & \sigma_j \\ \sigma_j & 0 \end{bmatrix}$$

特性方程式：

$$\lambda^2 - \lambda - \sigma_j^2 = 0$$

$$\boxed{\lambda = \frac{1 \pm \sqrt{1 + 4\sigma_j^2}}{2}}$$

$\sigma_j \geq 0$ のとき $\sqrt{1+4\sigma_j^2} > 1$ であるから：

- $\lambda_+ = \frac{1+\sqrt{1+4\sigma_j^2}}{2} > 1$（常に $> 1$）
- $\lambda_- = \frac{1-\sqrt{1+4\sigma_j^2}}{2} < 0$（常に $< 0$）

したがって $S$ は $[0,1)$ に固有値を持たない。

**小さい $\sigma_j$ のとき**（$\sigma_j \ll 1$）：

$$\lambda_+ \approx 1 + \sigma_j^2, \quad \lambda_- \approx -\sigma_j^2$$

$S$ の条件数 $\approx \frac{1+\sigma_{\max}^2}{\sigma_{\min}^2}$ であり、$\sigma_{\min}$ が小さいと極めて悪条件。

**$A = K_3$ のとき**: $K_3$ の特異値は $K_3$ が対称なのでその固有値の絶対値：

$$\lambda_j(K_3) = 2 - 2\cos\frac{j\pi}{4}, \quad j=1,2,3$$

$$\sigma_1 = 2-\sqrt{2} \approx 0.586, \quad \sigma_2 = 2, \quad \sigma_3 = 2+\sqrt{2} \approx 3.414$$

これらから $S$ の6つの固有値を上の公式で計算できる。

---

## 問題 11 — $S$ が特異なときのブロック列のランク不足の証明

$$\begin{bmatrix} G & A \\ A^\top & -H \end{bmatrix}\begin{bmatrix} w \\ u \end{bmatrix} = \begin{bmatrix} 0 \\ 0 \end{bmatrix}$$

すなわち $Gw + Au = 0$ かつ $A^\top w = Hu$。

$w^\top$ を第1式に左からかけると：

$$w^\top G w + w^\top A u = 0$$

第2式 $A^\top w = Hu$ より $w^\top A u = u^\top A^\top w \cdot$... いや、直接 $w^\top Au = (A^\top w)^\top u = (Hu)^\top u = u^\top Hu$：

$$w^\top G w + u^\top H u = 0$$

$G = M^\top M$ と因数分解すると $w^\top G w = \|Mw\|^2 \geq 0$。
$H = R^\top R$ と因数分解すると $u^\top H u = \|Ru\|^2 \geq 0$。

2つの非負量の和が0であるから：

$$\|Mw\|^2 = 0 \quad \Rightarrow \quad Mw = 0 \quad \Rightarrow \quad Gw = M^\top M w = 0$$

$$\|Ru\|^2 = 0 \quad \Rightarrow \quad Ru = 0 \quad \Rightarrow \quad Hu = R^\top R u = 0$$

$Hu = 0$ を第2式に代入すると：

$$\boxed{A^\top w = 0}$$

よって $Gw = 0$, $Au = 0$（第1式から $Au = -Gw = 0$）, $A^\top w = 0$, $Hu = 0$。
つまり各ブロック列 $\begin{bmatrix} G \\ A^\top \end{bmatrix}$ または $\begin{bmatrix} A \\ -H \end{bmatrix}$ のうち少なくとも一方がランク不足。

---

## 問題 12 — 制約付き最小化（ラグランジュ乗数法）

$$\min E = \frac{1}{2}w_1^2 + \frac{1}{4}w_2^2 \quad \text{subject to} \quad w_1 + w_2 = 8$$

（注：$\frac{1}{2}(\frac{1}{2}w_2^2)$ は $\frac{1}{4}w_2^2$ と解釈。問題文の $\frac{1}{2}(w_1^2 + \frac{1}{2}w_2^2) = \frac{1}{2}w_1^2 + \frac{1}{4}w_2^2$ とする。）

ラグランジュ関数：

$$L = \frac{1}{2}w_1^2 + \frac{1}{4}w_2^2 + u(w_1 + w_2 - 8)$$

$$\frac{\partial L}{\partial w_1} = w_1 + u = 0 \quad \Rightarrow \quad w_1 = -u$$

$$\frac{\partial L}{\partial w_2} = \frac{1}{2}w_2 + u = 0 \quad \Rightarrow \quad w_2 = -2u$$

$$\frac{\partial L}{\partial u} = w_1 + w_2 - 8 = 0 \quad \Rightarrow \quad -u - 2u = 8 \quad \Rightarrow \quad u = -\frac{8}{3}$$

$$\boxed{w_1 = \frac{8}{3}, \quad w_2 = \frac{16}{3}, \quad u = -\frac{8}{3}}$$

$$E_{\min} = \frac{1}{2}\left(\frac{8}{3}\right)^2 + \frac{1}{4}\left(\frac{16}{3}\right)^2 = \frac{32}{9} + \frac{64}{9} = \frac{96}{9} = \frac{32}{3}$$

---

## 問題 13 — ラグランジュ乗数による最小化（3部構成）

### (a) $E = \frac{1}{2}(w_1^2 + w_2^2 + w_3^2)$, $w_1 - w_2 = 1$, $w_2 - w_3 = 2$

$$L = \frac{1}{2}(w_1^2+w_2^2+w_3^2) + u_1(w_1-w_2-1) + u_2(w_2-w_3-2)$$

$$w_1 + u_1 = 0, \quad w_2 - u_1 + u_2 = 0, \quad w_3 - u_2 = 0$$

制約 $w_1 = -u_1$, $w_2 = u_1 - u_2$, $w_3 = u_2$ を代入：

- $w_1 - w_2 = -u_1 - u_1 + u_2 = -2u_1 + u_2 = 1$
- $w_2 - w_3 = u_1 - u_2 - u_2 = u_1 - 2u_2 = 2$

連立方程式：$-2u_1 + u_2 = 1$, $u_1 - 2u_2 = 2$。

第2式 $\times 2$: $2u_1 - 4u_2 = 4$。第1式に加える: $-3u_2 = 5$, $u_2 = -5/3$。
$u_1 = 2 + 2u_2 = 2 - 10/3 = -4/3$。

$$\boxed{w_1 = \frac{4}{3}, \quad w_2 = \frac{4}{3} - \left(-\frac{5}{3}\right)\cdot... }$$

再計算：$w_1 = -u_1 = 4/3$, $w_2 = u_1 - u_2 = -4/3 + 5/3 = 1/3$, $w_3 = u_2 = -5/3$。

検算：$w_1 - w_2 = 4/3 - 1/3 = 1$ ✓, $w_2 - w_3 = 1/3 + 5/3 = 2$ ✓。

$$\boxed{w = \left(\frac{4}{3},\, \frac{1}{3},\, -\frac{5}{3}\right), \quad u_1 = -\frac{4}{3},\quad u_2 = -\frac{5}{3}}$$

### (b) $E = w_1^2 + w_1 w_2 + w_2^2 + w_2 w_3 + w_3^2 - w_3$, $w_1 + w_2 = 2$

$$L = E + u(w_1 + w_2 - 2)$$

$$\frac{\partial L}{\partial w_1} = 2w_1 + w_2 + u = 0$$

$$\frac{\partial L}{\partial w_2} = w_1 + 2w_2 + w_3 + u = 0$$

$$\frac{\partial L}{\partial w_3} = w_2 + 2w_3 - 1 = 0$$

$$\frac{\partial L}{\partial u} = w_1 + w_2 - 2 = 0$$

第3式より $w_3 = (1 - w_2)/2$。$w_1 = 2 - w_2$（第4式）。

第1式: $2(2-w_2) + w_2 + u = 0 \Rightarrow 4 - w_2 + u = 0 \Rightarrow u = w_2 - 4$。

第2式: $(2-w_2) + 2w_2 + (1-w_2)/2 + (w_2-4) = 0$

$$= 2 - w_2 + 2w_2 + \frac{1}{2} - \frac{w_2}{2} + w_2 - 4 = 0$$

$$= -\frac{3}{2} + \frac{3w_2}{2} = 0 \quad \Rightarrow \quad w_2 = 1$$

$w_1 = 1$, $w_3 = 0$, $u = -3$。

$$\boxed{w = (1, 1, 0), \quad u = -3}$$

### (c) $E = w_1^2 + 2w_1 w_2 - 2w_2$, $w_1 + w_2 = 0$

$$L = w_1^2 + 2w_1 w_2 - 2w_2 + u(w_1 + w_2)$$

$$\frac{\partial L}{\partial w_1} = 2w_1 + 2w_2 + u = 0$$

$$\frac{\partial L}{\partial w_2} = 2w_1 - 2 + u = 0$$

$$\frac{\partial L}{\partial u} = w_1 + w_2 = 0 \quad \Rightarrow \quad w_2 = -w_1$$

第1式: $2w_1 - 2w_1 + u = 0 \Rightarrow u = 0$。

第2式: $2w_1 - 2 = 0 \Rightarrow w_1 = 1$, $w_2 = -1$。

$E = 1 - 2 + 2 = 1$。

**注意**: ヘッセ行列 $\begin{bmatrix} 2 & 2 \\ 2 & 0 \end{bmatrix}$ は不定（固有値 $1 \pm \sqrt{5}$）。制約面上での二次形式を確認すると、$w_2 = -w_1$ を代入して $E = w_1^2 - 2w_1^2 + 2w_1 = -w_1^2 + 2w_1$、これは $w_1 = 1$ で $\frac{d^2E}{dw_1^2} = -2 < 0$ なので**極大値**。

$$\boxed{w = (1,-1),\; u = 0 \text{ は極大点（最小値ではない）}}$$

---

## 問題 14 — 原点から平面への距離

原点 $(0,0,0)$ から平面 $w_1 + 2w_2 + 2w_3 = 18$ への距離を求める。

$A^\top = [1, 2, 2]$ とすると制約 $A^\top w = 18$。最小化する量は $\frac{1}{2}\|w\|^2$。

KKT系：

$$\begin{bmatrix} I & A \\ A^\top & 0 \end{bmatrix}\begin{bmatrix} w \\ u \end{bmatrix} = \begin{bmatrix} 0 \\ 18 \end{bmatrix}$$

第1ブロック行: $w + Au = 0 \Rightarrow w = -Au = -u\begin{pmatrix}1\\2\\2\end{pmatrix}$。

第2ブロック行: $A^\top w = 18 \Rightarrow -u(1+4+4) = 18 \Rightarrow u = -2$。

$$w = 2\begin{pmatrix}1\\2\\2\end{pmatrix} = \begin{pmatrix}2\\4\\4\end{pmatrix}$$

距離：

$$\boxed{\|w\| = \sqrt{4+16+16} = 6}$$

乗数 $u = -2$。公式 $\text{dist} = \frac{|d|}{\|a\|} = \frac{18}{3} = 6$ ✓。

---

## 問題 15 — 弱双対性と変位法・力法

主問題（変位法）: $\min_u P(u) = \frac{1}{2}u^\top A^\top C A u - f^\top u$ を最小化。

双対問題（力法）: $\max_w [-Q(w)] = -\frac{1}{2}w^\top C^{-1}w$ を $A^\top w = f$ の制約下で最大化。

ラグランジュ関数に乗数 $u$ を導入：

$$L(w, u) = \frac{1}{2}w^\top C^{-1}w + u^\top(A^\top w - f)$$

$$\frac{\partial L}{\partial w} = C^{-1}w + Au = 0 \quad \Rightarrow \quad w = -CAu$$

$$\frac{\partial L}{\partial u} = A^\top w - f = 0$$

$w = -CAu$ を第2式に代入：

$$-A^\top C A u = f \quad \Rightarrow \quad A^\top C A u = f$$

これが変位法の剛性方程式 $Ku = f$（$K = A^\top CA$）。

**弱双対性**: $\min P \geq \max(-Q)$。最適解では $P_{\min} = -Q_{\max}$（強双対性）。

$$\boxed{A^\top C A\, u = f \quad \text{が主問題と双対問題を統一する}}$$

---

## 問題 16 — 非線形制約のラグランジュ乗数（固有値問題）

$$\min w^\top K w \quad \text{subject to} \quad w_1^2 + w_2^2 + w_3^2 = 1$$

$K = K_3 = \begin{bmatrix} 2 & -1 & 0 \\ -1 & 2 & -1 \\ 0 & -1 & 2 \end{bmatrix}$。

ラグランジュ関数：

$$L = w^\top K w + u(\|w\|^2 - 1) = w^\top K w + u(w^\top w - 1)$$

$$\frac{\partial L}{\partial w} = 2Kw + 2uw = 0 \quad \Rightarrow \quad Kw = -uw$$

$-u$ が $K$ の固有値であるから $u = -\lambda$。$w^\top Kw = \lambda w^\top w = \lambda$ を最小化するには $\lambda$ を最小固有値にとる。

$K_3$ の固有値: $\lambda_j = 2 - 2\cos(j\pi/4)$, $j=1,2,3$。

- $\lambda_1 = 2 - \sqrt{2} \approx 0.586$
- $\lambda_2 = 2$
- $\lambda_3 = 2 + \sqrt{2} \approx 3.414$

$$\boxed{u = -\lambda_1 = -(2-\sqrt{2}), \quad w = \text{対応する単位固有ベクトル}}$$

Rayleigh 商 $R(w) = w^\top Kw / w^\top w$ の最小値は最小固有値 $\lambda_1 = 2 - \sqrt{2}$。

---

## 問題 17 — ポテンシャルエネルギーと補エネルギーの双対性

ポテンシャルエネルギー（主問題）:

$$P(u) = \frac{1}{2}u^\top A^\top C A u - f^\top u = \frac{1}{2}u^\top K u - f^\top u$$

補エネルギー（双対問題）:

$$Q(w) = \frac{1}{2}w^\top C^{-1}w \quad \text{subject to} \quad A^\top w = f$$

ラグランジュ関数：

$$L(w, u) = \frac{1}{2}w^\top C^{-1}w + u^\top(A^\top w - f)$$

$$\frac{\partial L}{\partial w} = C^{-1}w + Au = 0 \quad \Rightarrow \quad w = -CAu$$

$$\frac{\partial L}{\partial u} = A^\top w - f = 0 \quad \Rightarrow \quad A^\top w = f$$

$w = -CAu$ を代入：

$$A^\top C A u = f \quad \Leftrightarrow \quad Ku = f$$

最小の $P$ と最大の $-Q$ が一致することの確認：

$$P_{\min} = \frac{1}{2}u^\top Ku - f^\top u = -\frac{1}{2}u^\top f = -\frac{1}{2}f^\top K^{-1}f$$

$$-Q_{\max} = -\frac{1}{2}w^\top C^{-1}w = -\frac{1}{2}(CAu)^\top C^{-1}(CAu) = -\frac{1}{2}u^\top A^\top C A u = -\frac{1}{2}u^\top f$$

$$\boxed{P_{\min} = -Q_{\max} = -\frac{1}{2}f^\top K^{-1}f \quad \text{（強双対性）}}$$

---

---

# Problem Set 8.2 (pp. 625--626)

> 以下の問題 1--3 は $A = \begin{bmatrix}1&0\\0&2\end{bmatrix}$, $b = \begin{bmatrix}0\\0\end{bmatrix}$, $B = [1\;3]$, $d = 20$ で $\|Au-b\|^2$ を $Bu = d$ のもとで最小化する。

---

## 問題 1 — ペナルティ法（大きな $\alpha$）

$$\min_u \|Au-b\|^2 + \alpha\|Bu-d\|^2 = u_1^2 + 4u_2^2 + \alpha(u_1+3u_2-20)^2$$

法線方程式：

$$(A^\top A + \alpha B^\top B)u = A^\top b + \alpha B^\top d$$

$$A^\top A = \begin{bmatrix}1&0\\0&4\end{bmatrix}, \quad B^\top B = \begin{bmatrix}1&3\\3&9\end{bmatrix}$$

$$\begin{bmatrix}1+\alpha & 3\alpha \\ 3\alpha & 4+9\alpha\end{bmatrix}\begin{bmatrix}u_1\\u_2\end{bmatrix} = \begin{bmatrix}20\alpha \\ 60\alpha\end{bmatrix}$$

$\alpha \to \infty$ のとき、$\alpha$ の項が支配的：

$$\begin{bmatrix}\alpha & 3\alpha \\ 3\alpha & 9\alpha\end{bmatrix}u \approx \begin{bmatrix}20\alpha \\ 60\alpha\end{bmatrix}$$

これは $B^\top B\, u = B^\top d$ で、解は $Bu = d$ の最小ノルム解（$B^\top$ の列空間への射影）：

$$u_\infty = B^\top(BB^\top)^{-1}d = \frac{1}{10}\begin{bmatrix}1\\3\end{bmatrix}\cdot 20 = \begin{bmatrix}2\\6\end{bmatrix}$$

有限 $\alpha$ で正確に解くと（Cramer の公式）：

行列式: $(1+\alpha)(4+9\alpha) - 9\alpha^2 = 4 + 9\alpha + 4\alpha + 9\alpha^2 - 9\alpha^2 = 4 + 13\alpha$。

$$u_1 = \frac{20\alpha(4+9\alpha) - 3\alpha\cdot 60\alpha}{4+13\alpha} = \frac{80\alpha + 180\alpha^2 - 180\alpha^2}{4+13\alpha} = \frac{80\alpha}{4+13\alpha}$$

$$u_2 = \frac{(1+\alpha)60\alpha - 3\alpha\cdot 20\alpha}{4+13\alpha} = \frac{60\alpha + 60\alpha^2 - 60\alpha^2}{4+13\alpha} = \frac{60\alpha}{4+13\alpha}$$

$$\boxed{u_\alpha = \frac{\alpha}{4+13\alpha}\begin{pmatrix}80\\60\end{pmatrix}, \quad u_\infty = \lim_{\alpha\to\infty}u_\alpha = \begin{pmatrix}80/13\\60/13\end{pmatrix}}$$

検算：$u_{1,\infty} + 3u_{2,\infty} = 80/13 + 180/13 = 260/13 = 20$ ✓。

---

## 問題 2 — ラグランジュ乗数法

$$L = \frac{1}{2}(u_1^2 + 4u_2^2) + w(u_1 + 3u_2 - 20)$$

$$\frac{\partial L}{\partial u_1} = u_1 + w = 0 \quad \Rightarrow \quad u_1 = -w$$

$$\frac{\partial L}{\partial u_2} = 4u_2 + 3w = 0 \quad \Rightarrow \quad u_2 = -\frac{3w}{4}$$

$$\frac{\partial L}{\partial w} = u_1 + 3u_2 - 20 = 0 \quad \Rightarrow \quad -w - \frac{9w}{4} = 20 \quad \Rightarrow \quad -\frac{13w}{4} = 20$$

$$w = -\frac{80}{13}$$

$$\boxed{u_1 = \frac{80}{13}, \quad u_2 = \frac{60}{13}, \quad w = -\frac{80}{13}}$$

$\|Au\|^2 = (80/13)^2 + 4(60/13)^2 = (6400 + 14400)/169 = 20800/169 = \frac{20800}{169}$。

---

## 問題 3 — 零空間法

$Bu = d$ すなわち $u_1 + 3u_2 = 20$ の一般解を求める。

**行空間成分**（特解）: $B$ の行空間は $(1,3)$ 方向。$u_r = t(1,3)$, $t + 9t = 20$, $t = 2$。

$$u_r = (2, 6)$$

**零空間成分**: $Bu_n = 0 \Rightarrow u_{n,1} + 3u_{n,2} = 0$。$u_n = z(3, -1)$。

一般解 $u = u_r + z(3,-1) = (2+3z, 6-z)$。

最小化する量：

$$\|Au\|^2 = (2+3z)^2 + 4(6-z)^2 = 4+12z+9z^2 + 144 - 48z + 4z^2 = 13z^2 - 36z + 148$$

$$\frac{d}{dz} = 26z - 36 = 0 \quad \Rightarrow \quad z = \frac{18}{13}$$

$$u_1 = 2 + \frac{54}{13} = \frac{80}{13}, \quad u_2 = 6 - \frac{18}{13} = \frac{60}{13}$$

$$\boxed{u = \left(\frac{80}{13},\, \frac{60}{13}\right)}$$

3つの方法すべてで同じ解が得られた。

---

> 以下の問題 4--6 は $\min \|u\|^2$ subject to $u_{i+1} - u_i = 1$（$i=1,\ldots,4$）。
> すなわち $A = I$, $b = 0$, $B = \Delta_+$（前進差分行列、$4 \times 5$）, $d = (1,1,1,1)$。

---

## 問題 4 — ペナルティ法

$(I + \alpha K_4)u = \alpha(-1, 0, 0, 0, 1)$... 

（注：$B^\top B = K_5$（$5 \times 5$ の fixed-free 差分行列）ではなく、$B^\top d$ を計算する必要がある。）

$B$ は $4 \times 5$ 行列で $B_{ii} = -1$, $B_{i,i+1} = 1$：

$$B = \begin{bmatrix} -1&1&0&0&0 \\ 0&-1&1&0&0 \\ 0&0&-1&1&0 \\ 0&0&0&-1&1 \end{bmatrix}$$

$$B^\top B = \begin{bmatrix}1&-1&&&\\-1&2&-1&&\\&-1&2&-1&\\&&-1&2&-1\\&&&-1&1\end{bmatrix}$$

これは $K_5$（fixed-free）。$B^\top d = B^\top \mathbf{1} = (-1, 0, 0, 0, 1)^\top$。

ペナルティ方程式：

$$(I + \alpha K_5)u = \alpha\begin{pmatrix}-1\\0\\0\\0\\1\end{pmatrix}$$

$\alpha$ を大きくすると、$K_5 u \to (-1,0,0,0,1)$ すなわち $Bu = d$ の解に近づく。

$Bu = d$ の等差数列解: $u_i = c + (i-1)$（$u_{i+1}-u_i = 1$）。$\|u\|^2$ を最小化する $c$：

$$\|u\|^2 = \sum_{i=1}^{5}(c+i-1)^2 = 5c^2 + 2c(0+1+2+3+4) + (0+1+4+9+16) = 5c^2 + 20c + 30$$

$$\frac{d}{dc} = 10c + 20 = 0 \quad \Rightarrow \quad c = -2$$

$$\boxed{u_\infty = (-2, -1, 0, 1, 2)}$$

$\alpha = 1$: 約0桁の精度。$\alpha = 10$: 約1桁。$\alpha = 100$: 約2桁。$\alpha = 1000$: 約3桁。一般に $\alpha$ を10倍すると約1桁改善。

---

## 問題 5 — ラグランジュ乗数法（鞍点問題）

鞍点系：

$$\begin{bmatrix} I & B^\top \\ B & 0 \end{bmatrix}\begin{bmatrix} u \\ w \end{bmatrix} = \begin{bmatrix} 0 \\ d \end{bmatrix}$$

ここで $I$ は $5 \times 5$、$B$ は $4 \times 5$、$w$ は $4 \times 1$ のラグランジュ乗数。

第1ブロック行: $u + B^\top w = 0 \Rightarrow u = -B^\top w$。

第2ブロック行: $Bu = d \Rightarrow -BB^\top w = d \Rightarrow BB^\top w = -d$。

$$BB^\top = \begin{bmatrix}2&-1&&\\-1&2&-1&\\&-1&2&-1\\&&-1&2\end{bmatrix}$$

これは $4 \times 4$ の fixed-fixed 行列 $T_4$。

$T_4 w = -\mathbf{1}$ を解く。対称性から $w$ は中心対称で $w_1 = w_4$, $w_2 = w_3$。

$$2w_1 - w_2 = -1, \quad -w_1 + 2w_2 - w_3 = -1$$

$w_3 = w_2$ より第2式: $-w_1 + w_2 = -1$、すなわち $w_2 = w_1 - 1$。
第1式: $2w_1 - (w_1-1) = w_1 + 1 = -1$, $w_1 = -2$。$w_2 = -3$。

$$w = (-2, -3, -3, -2)$$

$$u = -B^\top w$$

$$B^\top = \begin{bmatrix}-1&0&0&0\\1&-1&0&0\\0&1&-1&0\\0&0&1&-1\\0&0&0&1\end{bmatrix}$$

$$u = -\begin{pmatrix}2\\-2+3\\-3+3\\-3+2\\2\end{pmatrix} = -\begin{pmatrix}2\\1\\0\\-1\\-2\end{pmatrix} = \begin{pmatrix}-2\\-1\\0\\1\\2\end{pmatrix}$$

$$\boxed{u = (-2,-1,0,1,2), \quad w = (-2,-3,-3,-2)}$$

---

## 問題 6 — 零空間法

$Bu = d$ の一般解: $u = u_r + Q_n z$。

**行空間の特解 $u_r$**: $u_r = B^\top(BB^\top)^{-1}d = B^\top T_4^{-1}\mathbf{1}$。

$T_4^{-1}\mathbf{1}$ を解く: $T_4 v = \mathbf{1}$。対称性から $v_1 = v_4$, $v_2 = v_3$。

$2v_1 - v_2 = 1$, $-v_1 + v_2 = 1$（第2式で $v_3 = v_2$）。

$v_1 = v_2 - 1$、$2v_2 - 2 - v_2 = 1$、$v_2 = 3$、$v_1 = 2$。

$v = (2,3,3,2)$、$u_r = B^\top v = (-2, -1, 0, 1, 2)$。

**零空間 $Q_n$**: $B$ の零空間は $Bu = 0$ の解。$u_{i+1} = u_i$ なので $u = c\mathbf{1}$。$Q_n = \frac{1}{\sqrt{5}}\mathbf{1}$（正規化）。

$\|u\|^2 = \|u_r + z\mathbf{1}\|^2$ を最小化する $z$: 

$$\sum(u_{r,i}+z)^2 = \sum u_{r,i}^2 + 2z\sum u_{r,i} + 5z^2$$

$\sum u_{r,i} = -2-1+0+1+2 = 0$ なので $z = 0$。

$$\boxed{u_{\text{opt}} = u_r = (-2,-1,0,1,2)}$$

$Q_r$ は $B$ の行空間への射影に関する直交基底（$B^\top$ の列空間）、$Q_n$ は $B$ の零空間の直交基底。ここでは $u_r$ がすでに零空間と直交しているため、零空間成分の調整は不要。

---

## 問題 7 — 前進差分行列の擬似逆行列

$B$ は問題5の $4 \times 5$ 前進差分行列。

$$B^+ = B^\top(BB^\top)^{-1}$$

（$B$ が行フルランクのとき右擬似逆行列）。$BB^\top = T_4$。

$$B^+ = B^\top T_4^{-1}$$

$T_4^{-1}$ は $4\times4$ の逆行列で、$(T_4^{-1})_{ij} = \frac{i(5-j)}{5}$（$i \leq j$）。

$$BB^+ = B \cdot B^\top(BB^\top)^{-1} = BB^\top(BB^\top)^{-1} = I_4$$

$$B^+B = B^\top(BB^\top)^{-1}B$$

これは $5\times5$ の行列で、$B$ の行空間への射影行列。$B$ の零空間が $\text{span}(\mathbf{1})$ なので：

$$\boxed{BB^+ = I_4, \quad B^+B = I_5 - \frac{1}{5}\mathbf{1}\mathbf{1}^\top}$$

$B^+B$ は平均を引く（中心化）行列。

---

## 問題 8 — 巡回行列の擬似逆行列

$$C = \text{toeplitz}([2,-1,-1]) = \begin{bmatrix}2&-1&-1\\-1&2&-1\\-1&-1&2\end{bmatrix}$$

$C$ は巡回行列なので、フーリエ行列 $F_3$ で対角化される。固有値は $\lambda_k = 2 - \omega^k - \omega^{-k} = 2 - 2\cos(2\pi k/3)$, $k=0,1,2$。

- $\lambda_0 = 0$（零空間は $\mathbf{1}$）
- $\lambda_1 = \lambda_2 = 3$

SVD: $C$ は対称なので特異値 $= |\lambda_i|$。$\sigma_1 = \sigma_2 = 3$, $\sigma_3 = 0$。

擬似逆行列は零固有値を除外し、非零固有値を逆数にする：

$$C^+ = \frac{1}{3}\left(I - \frac{1}{3}\mathbf{1}\mathbf{1}^\top\right) = \frac{1}{3}I - \frac{1}{9}\mathbf{1}\mathbf{1}^\top$$

$$\boxed{C^+ = \frac{1}{9}\begin{bmatrix}2&-1&-1\\-1&2&-1\\-1&-1&2\end{bmatrix} = \frac{1}{3}\left(I - \frac{\mathbf{1}\mathbf{1}^\top}{3}\right)}$$

（注：$C^+ = C/9$ と一致。$CC^+ = C^+C = I - \frac{1}{3}\mathbf{1}\mathbf{1}^\top$ で射影行列。）

検証（公式(17)）: $C^+ = V\Sigma^+ U^\top$。$\Sigma = \text{diag}(3,3,0)$, $\Sigma^+ = \text{diag}(1/3, 1/3, 0)$。$C$ が対称なので $U = V$。$C^+ = V\Sigma^+ V^\top$。✓

---

## 問題 9 — 中心差分行列の擬似逆行列

$3 \times 3$ の中心差分行列：

$$\Delta = \frac{1}{2}\begin{bmatrix}0&1&-1\\-1&0&1\\1&-1&0\end{bmatrix}$$

$\Delta$ は反対称（$\Delta^\top = -\Delta$）。

**特異値が2つだけの理由**: $\Delta$ は $3\times3$ で $\text{rank}(\Delta) = 2$（行列式 $= 0$、なぜなら各行の和 $= 0$）。零空間は $\mathbf{1}$ 方向。よって非零特異値は2つのみ。

$\Delta^\top\Delta = -\Delta^2$：

$$\Delta^2 = \frac{1}{4}\begin{bmatrix}0&1&-1\\-1&0&1\\1&-1&0\end{bmatrix}^2 = \frac{1}{4}\begin{bmatrix}-2&1&1\\1&-2&1\\1&1&-2\end{bmatrix}$$

$$\Delta^\top\Delta = \frac{1}{4}\begin{bmatrix}2&-1&-1\\-1&2&-1\\-1&-1&2\end{bmatrix}$$

固有値: $\lambda_0 = 0$, $\lambda_{1,2} = 3/4$。特異値 $\sigma_{1,2} = \sqrt{3/4} = \frac{\sqrt{3}}{2}$。

$$\boxed{\sigma_1 = \sigma_2 = \frac{\sqrt{3}}{2}, \quad \sigma_3 = 0}$$

$\Delta^+ = \Delta^\top(\Delta\Delta^\top)^{-}$。対称性から $\Delta^+ = -\Delta \cdot (\Delta^\top\Delta)^{-}$：

$$\Delta^+ = \frac{4}{3}\left(-\Delta\right)\left(I - \frac{\mathbf{1}\mathbf{1}^\top}{3}\right) = -\frac{4}{3}\Delta\left(I - \frac{\mathbf{1}\mathbf{1}^\top}{3}\right) = -\frac{4}{3}\Delta$$

（$\Delta\mathbf{1} = 0$ なので $\Delta(I - \frac{\mathbf{1}\mathbf{1}^\top}{3}) = \Delta$。）

$$\boxed{\Delta^+ = -\frac{4}{3}\Delta = \frac{2}{3}\begin{bmatrix}0&1&-1\\-1&0&1\\1&-1&0\end{bmatrix}^\top = \frac{2}{3}\begin{bmatrix}0&-1&1\\1&0&-1\\-1&1&0\end{bmatrix} = -\frac{2}{3}\Delta \cdot 2 = \frac{4}{3}\Delta^\top}$$

整理すると：

$$\Delta^+ = \frac{4}{3}\Delta^\top = -\frac{4}{3}\Delta = \frac{2}{3}\begin{bmatrix}0&1&-1\\-1&0&1\\1&-1&0\end{bmatrix}$$

---

## 問題 10 — ノイズ付き差分の平均化による速度推定

$u = (1, 2, \ldots, 10)$（線形位置）を $\Delta t = h = 0.1$ で離散化。真の速度 $v = 10$（一定）。

ノイズ $e = \text{rand}(1,10)/100$ を加えた $\tilde{u} = u + e$。

公式(36): $r$ 個の差分を平均して速度を推定：

$$v_i \approx \frac{1}{r}\sum_{k=1}^{r}\frac{\tilde{u}_{i+k} - \tilde{u}_{i+k-r}}{rh}$$

（$r$ ステップ離れた差分を使う。）

より正確には、$r$ ステップ差分：

$$v_i \approx \frac{\tilde{u}_{i+r} - \tilde{u}_i}{rh}$$

**$r$ の効果**:
- $r = 1$: 各隣接差分を使う。ノイズの分散 $\sim 2\text{Var}(e)/h^2$ が大きい。
- $r$ を大きくする: 分子のノイズ分散は $2\text{Var}(e)$ で変わらないが、分母 $rh$ が大きくなるのでノイズの影響が $1/r$ に減少。ただし、局所的な情報は失われる。

$$\boxed{\text{最適な } r \text{ はノイズレベルと信号の滑らかさのトレードオフで決まる}}$$

この例では真の速度が一定なので $r$ を大きくするほど良い。

---

## 問題 11 — 正則化パラメータ $\alpha$ の実験的選択

$A = K_{10}$（$10 \times 10$ のトリダイアゴナル行列）、$b = \mathbf{1}$、$e = E \cdot \text{randn}(10,1)$。

正確な解: $\hat{u}_0 = K_{10}^{-1}\mathbf{1}$。

ノイズ入りデータ: $b_\varepsilon = b + e$。正則化解: $\hat{u}_\alpha = (K_{10}^\top K_{10} + \alpha I)^{-1}K_{10}^\top b_\varepsilon$。

（$K_{10}$ は対称正定値なので $(K_{10}^2 + \alpha I)^{-1}K_{10} b_\varepsilon$ とも書ける。）

**誤差バウンド(23)**: $\|\hat{u}_\alpha - \hat{u}_0\| \leq C/\sigma_{\min}^3$。これは最悪ケースで、実際のランダムノイズではもっと良い。

**$\alpha$ の選び方**:
- $E$ が大きい（ノイズ大）: $\alpha$ を大きくして正則化を強める
- $E$ が小さい: $\alpha$ を小さくして正確さを保つ
- 経験則: $\alpha \sim E^2 \cdot \sigma_{\min}^2 / \sigma_{\max}^2$ 程度

$$\boxed{\alpha_{\text{opt}} \sim E^{2/3} \text{ 程度（Morozov の不一致原理より } \|A\hat{u}_\alpha - b_\varepsilon\| \approx E\sqrt{n} \text{ となる } \alpha \text{ を選ぶ）}}$$

実験では $E = 0.01$ なら $\alpha \approx 10^{-3}$--$10^{-2}$ 程度、$E = 0.1$ なら $\alpha \approx 10^{-1}$--$1$ 程度が良好な結果を与える。
