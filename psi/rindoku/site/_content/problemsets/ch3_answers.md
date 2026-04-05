# Chapter 3 — Problem Set 3.1 解答集

> Strang "Computational Science and Engineering" Chapter 3: Boundary Value Problems — 微分方程式・弱形式・有限要素法の全問解答。

---

# Problem Set 3.1（境界値問題と有限要素）

---

## 問題 1 — 定数力の境界値問題

**問題**: \(-u'' = 1\), \(u(0) = 0\), \(u(1) = 0\) を解け。有限差分解（\(n=3\)）と比較せよ。

**回答**:

**連続解**: 2回積分して

$$-u'' = 1 \implies u' = -x + C_1 \implies u = -\frac{x^2}{2} + C_1 x + C_2$$

境界条件: \(u(0) = 0 \Rightarrow C_2 = 0\)、\(u(1) = 0 \Rightarrow C_1 = 1/2\)。

$$\boxed{u(x) = \frac{1}{2}x(1-x)}$$

**差分解**（\(n=3, h=1/4\)）: \(\frac{1}{h^2}K_3 u = f = (1,1,1)^T\)。

$$K_3 = \begin{bmatrix} 2 & -1 & 0 \\ -1 & 2 & -1 \\ 0 & -1 & 2 \end{bmatrix}$$

$$u = h^2 K_3^{-1} f = \frac{1}{16} \cdot \frac{1}{4}\begin{bmatrix} 3 & 2 & 1 \\ 2 & 4 & 2 \\ 1 & 2 & 3 \end{bmatrix}\begin{bmatrix}1\\1\\1\end{bmatrix} = \frac{1}{16}\begin{bmatrix}3/2\\2\\3/2\end{bmatrix}$$

正確には:
- \(u_1 = u(1/4) = \frac{1}{2}\cdot\frac{1}{4}\cdot\frac{3}{4} = \frac{3}{32}\)
- \(u_2 = u(1/2) = \frac{1}{2}\cdot\frac{1}{2}\cdot\frac{1}{2} = \frac{1}{8} = \frac{4}{32}\)
- \(u_3 = u(3/4) = \frac{3}{32}\)

差分解はメッシュ点で**完全一致**する。

**理由**: \(f(x) = 1\) のとき解 \(u(x)\) は2次多項式。2階中心差分は2次以下の多項式に対して正確。

**核心**: 差分法は多項式解に対して「偶然」完全一致する。一般の \(f(x)\) では \(O(h^2)\) の誤差が生じる。

---

## 問題 2 — 変動係数 c(x)

**問題**: \(-\frac{d}{dx}\left(c(x)\frac{du}{dx}\right) = 1\), \(u(0) = 0\), \(u(1) = 0\) で \(c(x) = 2 - x\) のとき、\(w(x)\) と \(u(x)\) を求めよ。

**回答**:

内力（応力）\(w(x) = c(x)\frac{du}{dx}\) から出発。力のつり合い \(-\frac{dw}{dx} = 1\) を積分:

$$w(x) = -\int_0^x 1\,ds + C = -x + C$$

自由端 \(x=1\) で \(w(1) = 0\)（fixed-free の場合）なら \(C = 1\): \(w(x) = 1-x\)。

fixed-fixed の場合は境界から \(C\) を決定:

$$\frac{du}{dx} = \frac{w(x)}{c(x)} = \frac{-x+C}{2-x}$$

部分分数分解: \(\frac{-x+C}{2-x} = 1 + \frac{C-2}{2-x}\)

積分:

$$u(x) = x + (C-2)\ln\frac{2-x}{2} + C_2$$

\(u(0) = 0 \Rightarrow C_2 = 0\)。\(u(1) = 0 \Rightarrow 1 + (C-2)\ln(1/2) = 0\)。

$$C = 2 - \frac{1}{\ln 2}$$

$$\boxed{u(x) = x + \left(-\frac{1}{\ln 2}\right)\ln\frac{2-x}{2}}$$

**核心**: \(c(x)\) が変わっても \(A^TCA\) フレームは同じ。差分法では \(c(x)\) が対角行列 \(C\) に入る。

---

## 問題 3 — デルタ関数荷重と Green 関数

**問題**: \(-u'' = \delta(x-a)\) を各境界条件で解け: (a) fixed-fixed: \(u(0)=0, u(1)=0\), (b) fixed-free: \(u(0)=0, u'(1)=0\), (c) free-fixed: \(u'(0)=0, u(1)=0\)。

**回答**:

\(\delta(x-a)\) の荷重点以外では \(u'' = 0\)（直線）。\(x = a\) で \(u\) は連続、\(u'\) は1だけジャンプ降下。

**(a) Fixed-Fixed**: \(u(0) = 0, u(1) = 0\)

$$u(x) = \begin{cases} (1-a)x & x \leq a \\ a(1-x) & x \geq a \end{cases}$$

検証: \(u'(a^-) = 1-a\), \(u'(a^+) = -a\)。ジャンプ = \(-a - (1-a) = -1\) ✓

これは \(K^{-1}\) の \(a\) に対応する列。\((K^{-1})_{ij} = \min(i,j)(n+1-\max(i,j))/(n+1)\) の連続版。

**(b) Fixed-Free**: \(u(0) = 0, u'(1) = 0\)

$$u(x) = \begin{cases} x & x \leq a \\ a & x \geq a \end{cases}$$

荷重点の下は傾き0（自由端条件）。上は傾き1で \(u(0)=0\)。

**(c) Free-Fixed**: \(u'(0) = 0, u(1) = 0\)

$$u(x) = \begin{cases} 1-a & x \leq a \\ 1-x & x \geq a \end{cases}$$

荷重点の上は傾き0（自由端条件）。下は傾き \(-1\) で \(u(1)=0\)。

**核心**: Green 関数は「点荷重への応答」。逆行列の列に対応し、任意の荷重 \(f(x)\) への解は重ね合わせ \(u(x) = \int G(x,a)f(a)\,da\) で得られる。

---

## 問題 4 — 弱形式の導出

**問題**: \(-\frac{d}{dx}\left(c(x)\frac{du}{dx}\right) = f(x)\) の弱形式を導出せよ。各境界条件（Dirichlet/Neumann/混合）での境界項を議論せよ。

**回答**:

強形式に試験関数 \(v(x)\) を掛けて \([0,1]\) で積分:

$$\int_0^1 -\frac{d}{dx}\left(c\frac{du}{dx}\right) v\,dx = \int_0^1 f v\,dx$$

左辺を部分積分:

$$\int_0^1 c(x)\frac{du}{dx}\frac{dv}{dx}\,dx - \left[c(x)\frac{du}{dx}v(x)\right]_0^1 = \int_0^1 f(x)v(x)\,dx$$

**境界項の処理**:

| 境界条件 | x=0 での処理 | x=1 での処理 |
|---|---|---|
| **Fixed-Fixed**: \(u(0)=0, u(1)=0\) | \(v(0)=0\) で消える | \(v(1)=0\) で消える |
| **Fixed-Free**: \(u(0)=0, w(1)=cu'(1)=0\) | \(v(0)=0\) で消える | \(cu'(1)=0\) で消える |
| **Free-Free**: \(u'(0)=0, u'(1)=0\) | \(cu'(0)=0\) で消える | \(cu'(1)=0\) で消える |

**弱形式**（fixed-free の場合）: すべての許容な \(v\)（\(v(0) = 0\)）に対して

$$\boxed{\int_0^1 c(x)\frac{du}{dx}\frac{dv}{dx}\,dx = \int_0^1 f(x)v(x)\,dx}$$

**核心**: 弱形式は「微分を \(u\) と \(v\) に1つずつ分配」する。\(u\) の滑らかさ要求が2階→1階に下がり、FEM の基礎になる。自然境界条件（Neumann）は弱形式に自動的に含まれる。

---

## 問題 5 — 有限要素の剛性行列構築

**問題**: 区分線形の帽子関数 \(\phi_i(x)\) を基底として、剛性行列 \(K_{ij} = \int c(x)\phi_i'\phi_j'\,dx\) を構築せよ（\(c=1\)、均一メッシュ）。

**回答**:

均一メッシュ: \(h = 1/(n+1)\), ノード \(x_i = ih\)。

帽子関数 \(\phi_i(x)\): ノード \(i\) で1、隣接ノードで0、線形補間。

$$\phi_i(x) = \begin{cases} (x - x_{i-1})/h & x_{i-1} \leq x \leq x_i \\ (x_{i+1} - x)/h & x_i \leq x \leq x_{i+1} \\ 0 & \text{otherwise} \end{cases}$$

導関数:

$$\phi_i'(x) = \begin{cases} 1/h & x_{i-1} < x < x_i \\ -1/h & x_i < x < x_{i+1} \\ 0 & \text{otherwise} \end{cases}$$

**剛性行列の計算**（\(c = 1\)）:

$$K_{ii} = \int_0^1 (\phi_i')^2\,dx = \frac{1}{h^2}\cdot h + \frac{1}{h^2}\cdot h = \frac{2}{h}$$

$$K_{i,i+1} = \int_0^1 \phi_i'\phi_{i+1}'\,dx = \frac{1}{h}\cdot(-\frac{1}{h})\cdot h = -\frac{1}{h}$$

$$K_{i,j} = 0 \quad (|i-j| \geq 2)$$

よって:

$$K = \frac{1}{h}\begin{bmatrix} 2 & -1 & & \\ -1 & 2 & -1 & \\ & \ddots & \ddots & \ddots \\ & & -1 & 2 \end{bmatrix} = \frac{1}{h}K_n$$

**要素行列による組み立て**: 各要素 \([x_{i-1}, x_i]\) が寄与する \(2\times 2\) 要素剛性行列は:

$$K_{\text{elem}} = \frac{1}{h}\begin{bmatrix} 1 & -1 \\ -1 & 1 \end{bmatrix}$$

全体剛性行列はこれらの重ね合わせ（assembly）で得られる。

**核心**: FEM の剛性行列は差分法の \(K_n/h^2\) に \(h\) を掛けたもの。要素行列の assembly が \(A^TCA\) の離散版。

---

## 問題 6 — FEM と差分法の一致

**問題**: \(-u'' = 1\) に対する FEM（区分線形基底）が差分法と同じ結果を与えることを示せ。

**回答**:

FEM 方程式 \(KU = F\) で、荷重ベクトル:

$$F_i = \int_0^1 f(x)\phi_i(x)\,dx$$

\(f(x) = 1\) のとき:

$$F_i = \int_{x_{i-1}}^{x_{i+1}} \phi_i(x)\,dx = \frac{1}{2}\cdot h \cdot 1 + \frac{1}{2}\cdot h \cdot 1 = h$$

（帽子関数の面積 = 底辺 \(2h\) × 高さ 1 × 1/2 = \(h\)）

FEM 方程式: \(\frac{1}{h}K_n U = h\cdot\mathbf{1}\)

$$K_n U = h^2 \cdot \mathbf{1}$$

これは差分法の方程式 \(\frac{1}{h^2}K_n U = \mathbf{1}\) と**完全に同一**。

一般の \(f(x)\) では差異が生じる:
- 差分法: \(f_i = f(x_i)\)（点値）
- FEM: \(F_i = \int f(x)\phi_i(x)\,dx\)（加重平均）

定数 \(f\) のときは両者が一致する。

**核心**: 区分線形 FEM + 定数荷重 = 差分法。基底関数を変えれば（2次、3次要素）高次精度が得られる。

---

## 問題 7 — 2次元ラプラス方程式

**問題**: 2次元ポアソン方程式 \(-\nabla^2 u = f\) を弱形式で書き、5点ステンシルとの関係を示せ。

**回答**:

**弱形式**: 試験関数 \(v\) を掛けて積分、Green の公式を適用:

$$\int_\Omega \nabla u \cdot \nabla v\,dA = \int_\Omega f v\,dA + \int_{\partial\Omega} \frac{\partial u}{\partial n}v\,ds$$

Dirichlet 境界（\(u = 0\) on \(\partial\Omega\)）なら \(v = 0\) on \(\partial\Omega\) で境界項消失:

$$\boxed{\int_\Omega \nabla u \cdot \nabla v\,dA = \int_\Omega f v\,dA}$$

**5点ステンシル**: 正方格子 \((ih, jh)\) で:

$$-\frac{u_{i+1,j} + u_{i-1,j} + u_{i,j+1} + u_{i,j-1} - 4u_{i,j}}{h^2} = f_{i,j}$$

行列形式: クロネッカー積を用いて

$$K_{2D} = K_{1D} \otimes I + I \otimes K_{1D}$$

\(N \times N\) 内部格子で未知数 \(N^2\)、\(K_{2D}\) は \(N^2 \times N^2\) の疎行列。帯幅 \(\approx N\)。

**核心**: 1D の \(\int cu'v'\,dx\) が 2D では \(\int\int \nabla u \cdot \nabla v\,dA\) になる。フレームは次元を超えて同型。

---

## 問題 8 — 高速ポアソンソルバー

**問題**: 2次元ポアソン方程式を FFT で高速に解く方法を説明せよ。

**回答**:

\(K_{2D} = K_x \otimes I + I \otimes K_y\) の固有ベクトルは分離可能:

$$v_{jk} = (\sin j\pi h_x) \otimes (\sin k\pi h_y)$$

固有値:

$$\lambda_{jk} = \lambda_j^{(x)} + \lambda_k^{(y)} = (2 - 2\cos j\pi h_x)/h_x^2 + (2 - 2\cos k\pi h_y)/h_y^2$$

**アルゴリズム**:
1. 右辺 \(f\) を DST（離散正弦変換）で変換: \(\hat{f} = S f S\)
2. 周波数空間で割り算: \(\hat{u}_{jk} = \hat{f}_{jk}/\lambda_{jk}\)
3. 逆 DST で \(u\) を復元: \(u = S^{-1}\hat{u}S^{-1}\)

各 DST は FFT で \(O(N \log N)\) なので、全体で **\(O(N^2 \log N)\)**。

| 解法 | 計算量 | 適用条件 |
|---|---|---|
| 直接法（LU） | \(O(N^4)\) | 任意 |
| 帯行列LU | \(O(N^3)\) | 疎 |
| FFT | \(O(N^2 \log N)\) | 定数係数 + 周期/固定境界 |
| マルチグリッド | \(O(N^2)\) | 最速、変動係数も可 |

**核心**: 分離変数 + FFT は定数係数問題の最強ツール。変動係数では使えないが、前処理として活用できる。

---

## 問題 9 — 弾性棒の有限要素

**問題**: 1次元弾性棒 \(-\frac{d}{dx}\left(EA\frac{du}{dx}\right) = f(x)\) の FEM 方程式が \(KU = F\) の形になることを示せ。

**回答**:

**\(A^TCA\) フレーム**:
- ひずみ: \(e = \frac{du}{dx} = Au\)（\(A = d/dx\)）
- 応力: \(w = EAe = Ce\)（\(C = EA\)）
- つり合い: \(-\frac{dw}{dx} = f\)（\(A^T w = f\)）

**弱形式**: \(\int_0^L EA\frac{du}{dx}\frac{dv}{dx}\,dx = \int_0^L fv\,dx + [wv]_{\text{boundary}}\)

**FEM 離散化**: \(u(x) \approx \sum_j U_j \phi_j(x)\)

$$K_{ij} = \int_0^L EA(x)\phi_i'(x)\phi_j'(x)\,dx$$

均一断面（\(EA\) = 一定）なら:

$$K = \frac{EA}{h}\begin{bmatrix} 2 & -1 & \\ -1 & 2 & -1 \\ & \ddots & \ddots & \ddots \\ & & -1 & 2 \end{bmatrix}$$

**要素剛性行列**（各要素 \([x_{i-1}, x_i]\)）:

$$K_e = \frac{(EA)_e}{h}\begin{bmatrix} 1 & -1 \\ -1 & 1 \end{bmatrix}$$

\((EA)_e\) が要素ごとに変わっても、assembly の手順は同じ。

**核心**: 物理の言葉（ひずみ・応力・つり合い）と数学の言葉（\(A, C, A^T\)）が1対1対応。問題が変わっても型は同じ。

---

## 問題 10 — 収束次数の比較

**問題**: 線形要素と高次要素の収束次数を比較せよ。

**回答**:

**誤差評価**（エネルギーノルム \(\|u - u_h\|_E = \sqrt{a(u-u_h, u-u_h)}\)）:

\(p\) 次要素を使用し、真の解が \(u \in H^{p+1}\) のとき:

$$\|u - u_h\|_E \leq C h^p |u|_{H^{p+1}}$$

\(L^2\) ノルムでは1次上の収束:

$$\|u - u_h\|_{L^2} \leq C h^{p+1} |u|_{H^{p+1}}$$

| 要素次数 \(p\) | エネルギーノルム誤差 | \(L^2\) ノルム誤差 | 要素あたりの自由度 |
|---|---|---|---|
| 1（線形） | \(O(h)\) | \(O(h^2)\) | 1 |
| 2（2次） | \(O(h^2)\) | \(O(h^3)\) | 2 |
| 3（3次） | \(O(h^3)\) | \(O(h^4)\) | 3 |

**具体例**: \(-u'' = \sin \pi x\), \(u(0) = u(1) = 0\)。真の解 \(u = \sin\pi x / \pi^2\)。

- 線形要素 \(h = 1/10\): \(L^2\) 誤差 ≈ \(10^{-3}\)
- 2次要素 \(h = 1/10\): \(L^2\) 誤差 ≈ \(10^{-5}\)

**核心**: 高次要素は解が滑らかなとき圧倒的に有利。しかし特異点がある場合（角、不連続な \(c(x)\)）、h-refinement（メッシュ細分化）やadaptive mesh が必要。

---

# 補足: 横断的テーマ

## A^TCA フレームの対応表

| | 離散（ばね系） | 連続（弾性棒） | 弱形式 |
|---|---|---|---|
| **A** | 差分行列 | \(d/dx\) | \(\phi_j'\) |
| **C** | ばね定数 \(\text{diag}(c_i)\) | \(c(x)\) | 被積分関数の係数 |
| **A^T** | \(-\)差分転置 | \(-d/dx\) | \(\phi_i'\) との内積 |
| **K = A^TCA** | 剛性行列 | \(-d/dx(c\,du/dx)\) | \(\int c\phi_i'\phi_j'\,dx\) |

## FEM vs 差分法の比較

| 特徴 | 差分法 | FEM |
|---|---|---|
| 基礎 | 強形式の点近似 | 弱形式の Galerkin 近似 |
| 境界条件 | 行列の修正 | 試験関数空間の選択 |
| 精度 | \(O(h^2)\) 固定 | 要素次数で制御可能 |
| 複雑形状 | 困難 | 非構造メッシュ対応 |
| 実装 | 単純 | assembly が必要 |
