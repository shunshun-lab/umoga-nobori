# Chapter 2: A Framework for Applied Mathematics — 全問解答集

> Strang "Computational Science and Engineering" Chapter 2 — 離散フレーム \(A^TCA\) の全貌: ばね系・振動・最小二乗・グラフモデル。Problem Set 2.1–2.4 の主要問題を網羅的に解説する。

---

# Problem Set 2.1（pp. 109–110）— 平衡と剛性行列

---

## 問題 1 — det K の公式

**問題**: 3つのばね（ばね定数 \(c_1, c_2, c_3\)）と壁接続ばね \(c_4\) をもつ系で、fixed-free（\(c_4 = 0\)）と free-free の剛性行列 \(K = A^TCA\) の行列式を求めよ。

**回答**:

**Fixed-free 系**（上端固定、下端自由）: \(A\) は 3×3 下二角行列。

$$A = \begin{bmatrix} 1 & 0 & 0 \\ -1 & 1 & 0 \\ 0 & -1 & 1 \end{bmatrix}, \quad C = \mathrm{diag}(c_1, c_2, c_3)$$

$$K = A^TCA = \begin{bmatrix} c_1+c_2 & -c_2 & 0 \\ -c_2 & c_2+c_3 & -c_3 \\ 0 & -c_3 & c_3 \end{bmatrix}$$

行列式を余因子展開（第3行で展開）:

$$\det K = c_3\bigl[(c_1+c_2)(c_2+c_3) - c_2^2\bigr] - c_3\cdot(-c_3)\cdot(-c_2)$$

整理すると:

$$\det K = c_3\bigl[c_1 c_2 + c_1 c_3 + c_2 c_3\bigr] - c_2 c_3^2 = c_1 c_2 c_3 + c_1 c_3^2$$

より正確には:

$$\boxed{\det K = c_1 c_2 c_3 + c_1 c_3^2 + c_2 c_3^2 \;?\;}$$

再計算: ピボットで考える方が明快。\(T_3\) 型行列のピボットは:

- \(d_1 = c_1 + c_2\)
- \(d_2 = c_2 + c_3 - c_2^2/(c_1+c_2) = (c_1 c_2 + c_1 c_3 + c_2 c_3)/(c_1+c_2)\)
- \(d_3 = c_3 - c_3^2/d_2\)

\(c_1 = c_2 = c_3 = 1\) のとき:

$$K = T_3 = \begin{bmatrix} 2 & -1 & 0 \\ -1 & 2 & -1 \\ 0 & -1 & 1 \end{bmatrix}$$

ピボット: \(2, 3/2, 2/3\)。\(\det T_3 = 2 \cdot 3/2 \cdot 2/3 = 2\)。

一般公式: \(\det T_n = n+1\)（fixed-fixed の場合）。Fixed-free では \(\det T_n\)（片端自由）は再帰的に計算:

$$\boxed{\det K_{\text{fixed-free}} = c_1 c_2 + c_2 c_3 + c_1 c_3}$$

（全 \(c_i = 1\) で \(\det = 3\)。ピボット \(2 \cdot 3/2 \cdot 1 = 3\)... ）

再確認。\(c_1 = c_2 = c_3 = 1\) のとき fixed-free の \(K\):

$$K = \begin{bmatrix} 2 & -1 & 0 \\ -1 & 2 & -1 \\ 0 & -1 & 1 \end{bmatrix}$$

\(\det K = 2(2\cdot1 - 1) - (-1)((-1)\cdot1 - 0) = 2(1) + 1(-1) = 1\)。

いや、\(\det = 2(2-1)+1(-1-0) = 2-1 = 1\)。

一般:

$$\boxed{\det K_{\text{fixed-free}} = c_1 c_3 + c_2 c_3 + c_1 c_2}$$

\(c_i = 1\) で \(\det = 3\)? 数値確認: 第1行展開:

$$\det = 2(2 \cdot 1 - (-1)(-1)) - (-1)((-1)(1) - 0) + 0 = 2(2-1)+1(-1) = 2-1 = 1$$

よって \(c_i = 1\) で \(\det T_3(\text{fixed-free}) = 1\)。

一般の fixed-free（\(c_4=0\)、3ばね3質点）:

$$\boxed{\det K = c_1 c_2 c_3 \left(\frac{1}{c_1} + \frac{1}{c_2} + \frac{1}{c_3}\right)^{-1} \cdot (\text{和の形})}$$

正確な展開:

$$\det K = c_3(c_1 c_2 + c_1 c_3 + c_2 c_3) - c_2 c_3^2$$

これを整理:

$$= c_1 c_2 c_3 + c_1 c_3^2 + c_2 c_3^2 - c_2 c_3^2 = c_1 c_2 c_3 + c_1 c_3^2 = c_1 c_3(c_2 + c_3)$$

\(c_i=1\): \(\det = 1\cdot1\cdot(1+1) = 2\)。上の計算 \(\det=1\) と矛盾。

**正しい直接計算**（\(c_i = 1\)）:

$$K = \begin{bmatrix} 2 & -1 & 0 \\ -1 & 2 & -1 \\ 0 & -1 & 1 \end{bmatrix}$$

$$\det K = 2 \det\begin{bmatrix}2&-1\\-1&1\end{bmatrix} - (-1)\det\begin{bmatrix}-1&-1\\0&1\end{bmatrix}$$
$$= 2(2-1) + 1(-1) = 2 - 1 = 1$$

OK、\(\det = 1\)。一般の場合は:

$$\det K = (c_1+c_2)\bigl[(c_2+c_3)c_3 - c_3^2\bigr] + c_2\bigl[-c_2 c_3\bigr]$$
$$= (c_1+c_2)(c_2 c_3) - c_2^2 c_3 = c_1 c_2 c_3 + c_2^2 c_3 - c_2^2 c_3 = c_1 c_2 c_3$$

$$\boxed{\det K_{\text{fixed-free}} = c_1 c_2 c_3}$$

\(c_i = 1\) で \(\det = 1\)。✓

**Free-free 系**: \(K\) は特異（剛体運動 \(u = (1,1,1)^T\) が零空間）。

$$\boxed{\det K_{\text{free-free}} = 0}$$

**核心**: Fixed-free の \(K\) は正定値で \(\det = c_1 c_2 c_3 > 0\)（直列ばねの組合せ）。Free-free は剛体モードにより特異。行列式の公式は境界条件を直接反映する。

---

## 問題 2 — K⁻¹ の余因子

**問題**: Fixed-free の \(K\)（3×3）の逆行列を余因子法で求めよ。\(2 \times 2\) 小行列式を列挙せよ。

**回答**:

\(K\) の余因子行列 \(C_{ij} = (-1)^{i+j} M_{ij}\)（\(M_{ij}\) は \((i,j)\) 小行列式）:

$$K = \begin{bmatrix} c_1+c_2 & -c_2 & 0 \\ -c_2 & c_2+c_3 & -c_3 \\ 0 & -c_3 & c_3 \end{bmatrix}$$

\(c_i = 1\) の場合:

$$K = \begin{bmatrix} 2 & -1 & 0 \\ -1 & 2 & -1 \\ 0 & -1 & 1 \end{bmatrix}, \quad \det K = 1$$

余因子:
- \(C_{11} = +(2\cdot1 - (-1)(-1)) = 1\)
- \(C_{12} = -((-1)\cdot1 - (-1)\cdot0) = 1\)
- \(C_{13} = +((-1)(-1) - 2\cdot0) = 1\)
- \(C_{21} = -((-1)\cdot1 - 0\cdot(-1)) = 1\)
- \(C_{22} = +(2\cdot1 - 0) = 2\)
- \(C_{23} = -(2\cdot(-1) - (-1)\cdot0) = 2\)
- \(C_{31} = +((-1)(-1) - 2\cdot0) = 1\)
- \(C_{32} = -(2\cdot(-1) - (-1)\cdot0) = 2\)
- \(C_{33} = +(2\cdot2 - (-1)(-1)) = 3\)

$$K^{-1} = \frac{1}{\det K}\begin{bmatrix}C_{11}&C_{21}&C_{31}\\C_{12}&C_{22}&C_{32}\\C_{13}&C_{23}&C_{33}\end{bmatrix} = \begin{bmatrix} 1 & 1 & 1 \\ 1 & 2 & 2 \\ 1 & 2 & 3 \end{bmatrix}$$

**検証**: \(K K^{-1}\) を計算して \(I\) を確認。

$$\begin{bmatrix} 2&-1&0\\-1&2&-1\\0&-1&1\end{bmatrix}\begin{bmatrix}1&1&1\\1&2&2\\1&2&3\end{bmatrix} = \begin{bmatrix}1&0&0\\0&1&0\\0&0&1\end{bmatrix} \quad \checkmark$$

**注目点**: \(K^{-1}\) の全成分が**正**。これは \(K\) が「M行列」（対角正、非対角非正）で対称正定値であることの帰結。物理的には「力を加えるとすべての質点が同じ方向に変位する」。

$$\boxed{K^{-1} = \begin{bmatrix}1&1&1\\1&2&2\\1&2&3\end{bmatrix}}$$

**核心**: \(K^{-1}\) の \((i,j)\) 成分は「ノード \(j\) に力をかけたときのノード \(i\) の変位」= Green 関数の離散版。正値性は物理的に自然。

---

## 問題 3 — (A^TCA)⁻¹ の分解

**問題**: Fixed-free（\(A\) が正方可逆）のとき \((A^TCA)^{-1} = A^{-1}C^{-1}(A^T)^{-1}\) を確認せよ。\(C = I\) で具体的に計算。

**回答**:

\(A^TCA\) が可逆のとき、行列積の逆行列の公式から:

$$(A^TCA)^{-1} = A^{-1} C^{-1} (A^T)^{-1} = A^{-1} C^{-1} (A^{-1})^T$$

\(C = I\) のとき \((A^TA)^{-1} = A^{-1}(A^T)^{-1} = A^{-1}(A^{-1})^T\)。

$$A = \begin{bmatrix}1&0&0\\-1&1&0\\0&-1&1\end{bmatrix} \implies A^{-1} = \begin{bmatrix}1&0&0\\1&1&0\\1&1&1\end{bmatrix}$$

確認: \(A \cdot A^{-1} = I\)。

$$(A^{-1})^T = \begin{bmatrix}1&1&1\\0&1&1\\0&0&1\end{bmatrix}$$

$$A^{-1}(A^{-1})^T = \begin{bmatrix}1&0&0\\1&1&0\\1&1&1\end{bmatrix}\begin{bmatrix}1&1&1\\0&1&1\\0&0&1\end{bmatrix} = \begin{bmatrix}1&1&1\\1&2&2\\1&2&3\end{bmatrix}$$

これは問題2で求めた \(K^{-1}\) と一致。✓

**核心**: \(K = A^TCA\) の分解は逆行列の計算にも使える。\(A^{-1}\) は「総和行列」（\(S\) 行列）であり、\(K^{-1} = S C^{-1} S^T\) は Green 関数を積分として表現する離散版。

---

## 問題 4 — Free-free の可解条件

**問題**: Free-free 系（3ばね、3質点、壁接続なし）で \(A^TCAu = f\) が解をもつための条件を示せ。\(f = (-1, 0, 1)^T\) のとき全解を求めよ。

**回答**:

Free-free の差分行列（3×3）:

$$A = \begin{bmatrix} -1 & 1 & 0 \\ 0 & -1 & 1 \\ 0 & 0 & 0 \end{bmatrix}$$

これは正しくない。Free-free（壁接続なし）では3質点に対して内部ばね2本:

$$A = \begin{bmatrix} -1 & 1 & 0 \\ 0 & -1 & 1 \end{bmatrix}$$

\(A\) は 2×3。\(K = A^TCA\) は 3×3 特異行列。

\(C = \mathrm{diag}(c_1, c_2)\)、\(c_i = 1\) のとき:

$$K = A^TA = \begin{bmatrix} 1 & -1 & 0 \\ -1 & 2 & -1 \\ 0 & -1 & 1 \end{bmatrix}$$

零空間: \(Ku = 0 \iff u = c(1,1,1)^T\)（剛体並進）。

**可解条件**: \(f \in C(K) = N(K^T)^\perp = N(K)^\perp\)（\(K\) は対称）。

$$f \perp (1,1,1)^T \iff f_1 + f_2 + f_3 = 0$$

$$\boxed{\text{解が存在する条件: } f_1 + f_2 + f_3 = 0}$$

物理的意味: 外力の合計がゼロ（正味の力がなければ、固定されていない系は釣り合える）。

**\(f = (-1, 0, 1)^T\)** の場合: \(-1+0+1=0\) ✓。

$$\begin{bmatrix}1&-1&0\\-1&2&-1\\0&-1&1\end{bmatrix}\begin{bmatrix}u_1\\u_2\\u_3\end{bmatrix} = \begin{bmatrix}-1\\0\\1\end{bmatrix}$$

第1式: \(u_1 - u_2 = -1\)、第2式: \(-u_1 + 2u_2 - u_3 = 0\)、第3式: \(-u_2 + u_3 = 1\)。

第1式と第3式から \(u_2 - u_1 = 1\), \(u_3 - u_2 = 1\)。第2式は自動的に満たされる。

特殊解: \(u_1 = 0, u_2 = 1, u_3 = 2\)。

$$\boxed{u = \begin{pmatrix}0\\1\\2\end{pmatrix} + c\begin{pmatrix}1\\1\\1\end{pmatrix}, \quad c \in \mathbb{R}}$$

**核心**: Free-free 系の \(K\) は半正定値（特異）。力の平衡条件 \(\sum f_i = 0\) が可解条件であり、解には剛体モード分の任意性が残る。\(u\) を一意にするには追加条件（例: \(\sum u_i = 0\) や1点固定）が必要。

---

## 問題 5 — Fixed-fixed 系の反力

**問題**: Fixed-fixed 系（両端固定）で3つの質量 \(m\) が重力を受ける。反力の合計が \(3mg\) になることを確認せよ。

**回答**:

3質点、4ばね（上端壁ばね + 3内部ばね + 下端壁ばね）。

$$A = \begin{bmatrix} 1 & 0 & 0 \\ -1 & 1 & 0 \\ 0 & -1 & 1 \\ 0 & 0 & -1 \end{bmatrix} \quad (4 \times 3)$$

\(f = mg(1,1,1)^T\)。\(Ku = f\) を解いて \(u\) を得る。

伸び: \(e = Au\)。内力: \(w = Ce\)。

反力は壁ばねの力:
- 上端反力: \(w_1 = c_1 e_1 = c_1 u_1\)（上向き）
- 下端反力: \(w_4 = c_4(-u_3)\)（下向き）

力の釣り合い: \(A^T w = f\) は全体系の力の釣り合い。しかし壁の反力を含めた**全系統**の釣り合いを見る:

外力 \(f = mg(1,1,1)^T\) の合計 = \(3mg\)。

壁の反力の合計もこれと釣り合う:

$$\boxed{R_{\text{top}} + R_{\text{bottom}} = 3mg}$$

\(c_i = 1\) で対称系の場合:

$$K = K_3 = \begin{bmatrix}2&-1&0\\-1&2&-1\\0&-1&2\end{bmatrix}$$

$$u = K_3^{-1} mg\begin{pmatrix}1\\1\\1\end{pmatrix} = mg \cdot \frac{1}{4}\begin{bmatrix}3&2&1\\2&4&2\\1&2&3\end{bmatrix}\begin{pmatrix}1\\1\\1\end{pmatrix} = mg\cdot\frac{1}{4}\begin{pmatrix}6\\8\\6\end{pmatrix} = mg\begin{pmatrix}3/2\\2\\3/2\end{pmatrix}$$

上端反力: \(R_1 = c_1 u_1 = mg \cdot 3/2\)
下端反力: \(R_4 = c_4 u_3 = mg \cdot 3/2\)
合計: \(3mg\) ✓（対称性から等分）。

**核心**: ニュートンの第3法則。外力の合計は壁の反力の合計に等しい。これはフレームワーク \(A^Tw = f\) の「列空間側の制約」。

---

## 問題 6 — 硬いばね c₂ → 大

**問題**: \(c_1 = c_3 = 1\), \(c_2 = 10\) および \(c_2 = 100\) のとき、fixed-free 系の \(K = A^TCA\) を書き、\(u = K^{-1}f\) を計算せよ。

**回答**:

$$K = A^TCA = \begin{bmatrix} 1+c_2 & -c_2 & 0 \\ -c_2 & c_2+1 & -1 \\ 0 & -1 & 1 \end{bmatrix}$$

**\(c_2 = 10\)** のとき:

$$K = \begin{bmatrix}11&-10&0\\-10&11&-1\\0&-1&1\end{bmatrix}$$

\(\det K = c_1 c_2 c_3 = 1\cdot10\cdot1 = 10\)。

\(f = (1,1,1)^T\) として \(u = K^{-1}f\):

$$K^{-1} = \frac{1}{10}\begin{bmatrix}10&10&10\\10&11&11\\10&11&12\end{bmatrix}$$

$$u = \frac{1}{10}\begin{bmatrix}30\\32\\33\end{bmatrix} = \begin{pmatrix}3\\3.2\\3.3\end{pmatrix}$$

**\(c_2 = 100\)** のとき:

$$K = \begin{bmatrix}101&-100&0\\-100&101&-1\\0&-1&1\end{bmatrix}$$

\(\det K = 100\)。

$$u = \frac{1}{100}\begin{bmatrix}300\\302\\303\end{bmatrix} = \begin{pmatrix}3\\3.02\\3.03\end{pmatrix}$$

**パターン**: \(c_2 \to \infty\) で \(u_1 \approx u_2\)（硬いばねで結ばれた2質点はほぼ一体に動く）。

$$\boxed{c_2 \to \infty: \quad u_1 \to u_2 \quad (\text{剛体制約})}$$

**核心**: 硬いばねは「ほぼ拘束」。\(c_2 \to \infty\) の極限は **ペナルティ法** の発想に通じる。数値的には \(K\) の条件数が悪化する。

---

## 問題 7 — 柔らかいばね c₂ → 0

**問題**: \(c_2 \to 0\) の極限で何が起こるか。\(K\) は可逆か。物理的意味は。

**回答**:

\(c_2 = 0\) のとき:

$$K = \begin{bmatrix}1&0&0\\0&1&-1\\0&-1&1\end{bmatrix}$$

$$\det K = 1 \cdot (1 \cdot 1 - (-1)(-1)) = 0$$

**\(K\) は特異**。

物理的意味: ばね2が切れると、系が2つの独立な部分に分離:
- 質点1は壁ばね（\(c_1\)）のみで接続 → 独立に平衡
- 質点2と3はばね3（\(c_3\)）で接続されるが、壁にも他にもつながらない → free-free 小系 → 剛体モードあり

$$\boxed{c_2 = 0: \quad K \text{ は特異。系が非連結になり剛体モードが出現}}$$

\(c_2 > 0\) がわずかでもあれば \(\det K = c_1 c_2 c_3 > 0\) で可逆。

**核心**: 接続性（connectivity）と可逆性（invertibility）の関係。グラフが非連結 \(\iff\) ラプラシアンに追加の零固有値 \(\iff\) 系に追加の剛体モード。Section 2.4 のグラフ理論と直結。

---

## 問題 8 — 要素行列の組み立て

**問題**: 各ばねの要素剛性行列を書き、free-free → fixed-free → fixed-fixed の \(K\) を組み立てよ。

**回答**:

ばね \(e\)（ノード \(i\) と \(j\) を結ぶ、ばね定数 \(c_e\)）の要素行列:

$$K_e = c_e \begin{bmatrix} 1 & -1 \\ -1 & 1 \end{bmatrix} \quad \text{（ノード } i, j \text{ に対応）}$$

3質点、ばね1（壁-1）、ばね2（1-2）、ばね3（2-3）、ばね4（3-壁）:

**Free-free**（壁ばねなし、\(c_4 = 0\), 壁接続なし）: ばね2とばね3のみ:

$$K_{\text{ff}} = c_2\begin{bmatrix}1&-1&0\\-1&1&0\\0&0&0\end{bmatrix} + c_3\begin{bmatrix}0&0&0\\0&1&-1\\0&-1&1\end{bmatrix} = \begin{bmatrix}c_2&-c_2&0\\-c_2&c_2+c_3&-c_3\\0&-c_3&c_3\end{bmatrix}$$

これは特異（行和=0 → \((1,1,1)^T\) が零空間）。

**Fixed-free**（上端固定: ばね1追加、\(c_1\) が \((1,1)\) に加算）:

$$K_{\text{fr}} = K_{\text{ff}} + c_1\begin{bmatrix}1&0&0\\0&0&0\\0&0&0\end{bmatrix} = \begin{bmatrix}c_1+c_2&-c_2&0\\-c_2&c_2+c_3&-c_3\\0&-c_3&c_3\end{bmatrix}$$

\(\det = c_1 c_2 c_3 > 0\)、正定値。

**Fixed-fixed**（両端固定: さらにばね4追加、\(c_4\) が \((3,3)\) に加算）:

$$K_{\text{ff2}} = K_{\text{fr}} + c_4\begin{bmatrix}0&0&0\\0&0&0\\0&0&1\end{bmatrix} = \begin{bmatrix}c_1+c_2&-c_2&0\\-c_2&c_2+c_3&-c_3\\0&-c_3&c_3+c_4\end{bmatrix}$$

$$\boxed{K_{\text{fixed-fixed}} = \begin{bmatrix}c_1+c_2&-c_2&0\\-c_2&c_2+c_3&-c_3\\0&-c_3&c_3+c_4\end{bmatrix}}$$

**核心**: 有限要素法の組み立て手順の原型。各要素行列を「正しい位置に足し込む」。境界条件は「壁ばねの追加」として自然に取り込まれる。この組み立てプロセスは Ch3 の有限要素でそのまま拡張される。

---

## 問題 9 — 倒立振子の安定性

**問題**: 倒立振子のポテンシャルエネルギー \(P(\theta)\) の安定平衡点を求めよ。安定条件 \(P''(\theta^*) > 0\) を確認。

**回答**:

倒立振子: 長さ \(L\) の棒、質量 \(m\)（先端集中）、根元にばね（剛性 \(k\)）。

ポテンシャルエネルギー:

$$P(\theta) = \frac{1}{2}k\theta^2 - mgL(1 - \cos\theta)$$

第1項: ばねの弾性エネルギー。第2項: 重力ポテンシャル（上が正）。

平衡条件 \(P'(\theta) = 0\):

$$P'(\theta) = k\theta - mgL\sin\theta = 0$$

\(\theta = 0\) は常に解（直立位置）。

安定性判定:

$$P''(\theta) = k - mgL\cos\theta$$

\(\theta = 0\) で:

$$P''(0) = k - mgL$$

$$\boxed{\text{安定条件: } k > mgL}$$

- \(k > mgL\): ばねの復元力が重力の不安定化を上回る → 安定
- \(k < mgL\): 重力が勝つ → 不安定（倒れる）
- \(k = mgL\): 臨界（座屈荷重）

\(k < mgL\) のとき、\(\theta = 0\) 以外の安定平衡が \(k\theta^* = mgL\sin\theta^*\) を満たす \(\theta^* \neq 0\) に現れる（分岐）。

**核心**: 剛性行列の正定値性 \(\iff\) 安定性。\(K_{\text{eff}} = k - mgL\) が「正定値」（正）なら安定。座屈（buckling）は \(K\) の最小固有値がゼロを横切る現象。

---

## 問題 10 — K⁻¹ の正値性とノイマン級数

**問題**: \(K^{-1}\) の全成分が正であることを示せ。ノイマン級数 \((D-W)^{-1} = D^{-1} + D^{-1}WD^{-1} + D^{-1}WD^{-1}WD^{-1} + \cdots\) を使え。

**回答**:

\(K = D - W\) と分解。\(D\) = 対角部分（正）、\(W\) = 非対角部分の符号反転（非負）。

$$K = D(I - D^{-1}W)$$

$$K^{-1} = (I - D^{-1}W)^{-1} D^{-1}$$

ノイマン級数（\(\rho(D^{-1}W) < 1\) のとき収束）:

$$(I - D^{-1}W)^{-1} = I + D^{-1}W + (D^{-1}W)^2 + (D^{-1}W)^3 + \cdots$$

各項:
- \(D^{-1}\): 正の対角行列（正）
- \(D^{-1}W\): \(W\) は非負（\(K\) の非対角の符号反転 = 正）、\(D^{-1}\) は正 → 積は非負
- \((D^{-1}W)^n\): 非負行列のべき乗は非負

したがって:

$$K^{-1} = D^{-1} + D^{-1}WD^{-1} + D^{-1}(WD^{-1})^2 + \cdots$$

各項が非負行列であり、少なくとも第1項 \(D^{-1}\) が正の対角成分を持つ。三重対角の場合、\((D^{-1}W)^k\) の適切なべきで全成分が正になる（既約性）。

$$\boxed{K^{-1} > 0 \quad (\text{全成分が正})}$$

**収束条件**: \(K\) が正定値なら \(\rho(D^{-1}W) < 1\) が保証される（対角優位性から）。

**核心**: M行列（対角正、非対角非正）で正定値なら逆行列は正。ノイマン級数は反復法（ヤコビ法）の母体であり、Ch1 の反復解法と直結。物理的には「すべてのノード間の影響が正」＝ 力の方向に全点が動く。

---

# Problem Set 2.2（pp. 125–127）— ニュートン法則による振動

---

## 問題 1 — Leapfrog 法の固有値

**問題**: Leapfrog 成長行列 \(G_L\) の固有値を求めよ。\(\cos\theta = 1 - \frac{1}{2}h^2\lambda\) を示し、\(h = 2, 3\) での固有値を調べよ。

**回答**:

Leapfrog 法: \(u_{n+1} - 2u_n + u_{n-1} = -h^2\lambda u_n\)

1階システムに書き直す: \(v_n = u_{n-1}\) として

$$\begin{pmatrix}u_{n+1}\\u_n\end{pmatrix} = \underbrace{\begin{bmatrix}2-h^2\lambda & -1 \\ 1 & 0\end{bmatrix}}_{G_L}\begin{pmatrix}u_n\\u_{n-1}\end{pmatrix}$$

\(G_L\) の固有方程式:

$$\mu^2 - (2-h^2\lambda)\mu + 1 = 0$$

$$\mu = \frac{(2-h^2\lambda) \pm \sqrt{(2-h^2\lambda)^2 - 4}}{2}$$

\(\alpha = 2 - h^2\lambda\) とおくと:

$$\mu = \frac{\alpha \pm \sqrt{\alpha^2 - 4}}{2}$$

\(|\alpha| \leq 2\) のとき（安定条件）、\(\alpha^2 - 4 < 0\) で固有値は複素:

$$\mu = \frac{\alpha}{2} \pm i\frac{\sqrt{4-\alpha^2}}{2}$$

$$|\mu|^2 = \frac{\alpha^2}{4} + \frac{4-\alpha^2}{4} = 1$$

よって \(\mu = e^{\pm i\theta}\)、ただし:

$$\boxed{\cos\theta = \frac{\alpha}{2} = 1 - \frac{h^2\lambda}{2}}$$

**安定条件**: \(|\cos\theta| \leq 1 \iff 0 \leq h^2\lambda \leq 4 \iff h \leq 2/\sqrt{\lambda}\)。

**\(h = 2\), \(\lambda = 1\)** のとき:

$$\cos\theta = 1 - 2 = -1 \implies \theta = \pi \implies \mu = e^{\pm i\pi} = -1$$

固有値 \(\mu = -1\)（重根）。解は \(u_n = (-1)^n\)（振動するが安定の境界）。

**\(h = 3\), \(\lambda = 1\)** のとき:

$$\cos\theta = 1 - 9/2 = -7/2$$

\(|\cos\theta| > 1\) → **不安定**。固有値は実数で \(|\mu| > 1\) のものが存在。

$$\mu = \frac{-7/2 \pm \sqrt{49/4-4}}{2} = \frac{-7/2 \pm \sqrt{33/4}}{2}$$

$$|\mu_1| = \frac{7/2 + \sqrt{33}/2}{2} > 1 \quad \text{（発散）}$$

$$\boxed{h \leq 2/\sqrt{\lambda} \quad \text{が安定条件。} h=2 \text{ は境界、} h=3 \text{ は不安定。}}$$

**核心**: Leapfrog はシンプレクティック（\(\det G_L = 1\)）。安定領域 \(h^2\lambda \leq 4\) は CFL 条件の原型。安定境界では固有値が単位円上に衝突（重根）。

---

## 問題 2 — G^N = I の条件

**問題**: \(G^N = I\) となる場合を \(N=3,4\) で求めよ。幾何学的解釈。

**回答**:

\(G\) の固有値が \(\mu = e^{i\theta}\) のとき、\(G^N = I \iff \mu^N = 1 \iff \theta = 2\pi k/N\)。

**\(N = 3\)**: \(\theta = 2\pi/3\)（120°回転）。

$$\cos\theta = \cos(2\pi/3) = -1/2 = 1 - h^2\lambda/2$$

$$\implies h^2\lambda = 3$$

Leapfrog の成長行列で \(G^3 = I\) となる。幾何学的には、状態ベクトルが位相空間で**正三角形**の頂点を巡回する。

**\(N = 4\)**: \(\theta = \pi/2\)（90°回転）。

$$\cos\theta = 0 = 1 - h^2\lambda/2 \implies h^2\lambda = 2$$

状態が**正方形**の頂点を巡回。

$$\boxed{N=3: h^2\lambda = 3 \;(\text{三角形}), \quad N=4: h^2\lambda = 2 \;(\text{正方形})}$$

**核心**: 周期軌道は固有値が単位円上の有理点 \(e^{2\pi i k/N}\) にあるとき実現。Leapfrog は面積保存なので軌道は閉曲線上にあるが、一般には周期的ではなく準周期的。

---

## 問題 5 — 歪対称行列とエネルギー保存

**問題**: \(A^T = -A\)（歪対称）のとき \(\|u(t)\|^2\) が保存されることを示せ。\(Q = e^{At}\) が直交行列であることを示せ。

**回答**:

\(du/dt = Au\) のとき:

$$\frac{d}{dt}\|u\|^2 = \frac{d}{dt}(u^T u) = \dot{u}^T u + u^T \dot{u} = (Au)^T u + u^T(Au) = u^T A^T u + u^T A u$$

\(A^T = -A\) より:

$$= u^T(-A)u + u^T A u = -u^T A u + u^T A u = 0$$

$$\boxed{\frac{d}{dt}\|u\|^2 = 0 \implies \|u(t)\| = \|u(0)\| \quad \text{（保存）}}$$

\(Q(t) = e^{At}\) について:

$$Q^T Q = (e^{At})^T e^{At} = e^{A^T t} e^{At} = e^{-At} e^{At} = e^{(-A+A)t} = e^{0} = I$$

（最後の等式は \(A\) と \(-A\) が可換なので \(e^{-At}e^{At} = e^{0}\)）

$$\boxed{Q = e^{At} \text{ は直交行列} \quad (Q^TQ = I)}$$

**核心**: 歪対称行列は「回転」を生成する。固有値は純虚数 \(\pm i\omega\)。これはハミルトン系のエネルギー保存の離散化の基礎。

---

## 問題 6 — 台形則のエネルギー保存

**問題**: 台形則（Crank-Nicolson）の成長行列 \(G_T\) がエネルギーを保存すること（直交行列であること）を示せ。

**回答**:

台形則: \(\frac{u_{n+1}-u_n}{\Delta t} = \frac{1}{2}A(u_{n+1}+u_n)\)

$$u_{n+1} - u_n = \frac{\Delta t}{2}A(u_{n+1}+u_n)$$

$$(I - \frac{\Delta t}{2}A)u_{n+1} = (I + \frac{\Delta t}{2}A)u_n$$

$$G_T = (I - \frac{\Delta t}{2}A)^{-1}(I + \frac{\Delta t}{2}A)$$

\(A^T = -A\) のとき \(G_T\) が直交行列であることを示す:

$$G_T^T = (I + \frac{\Delta t}{2}A)^T \bigl[(I - \frac{\Delta t}{2}A)^{-1}\bigr]^T = (I - \frac{\Delta t}{2}A)(I + \frac{\Delta t}{2}A)^{-1}$$

（\(A^T = -A\) を使用。）

$$G_T^T G_T = (I - \frac{\Delta t}{2}A)(I + \frac{\Delta t}{2}A)^{-1}(I - \frac{\Delta t}{2}A)^{-1}(I + \frac{\Delta t}{2}A)$$

\(I - \frac{\Delta t}{2}A\) と \(I + \frac{\Delta t}{2}A\) は可換（両方とも \(A\) の多項式）:

$$= (I - \frac{\Delta t}{2}A)(I - \frac{\Delta t}{2}A)^{-1}(I + \frac{\Delta t}{2}A)^{-1}(I + \frac{\Delta t}{2}A) = I \cdot I = I$$

$$\boxed{G_T^T G_T = I \quad (\text{台形則はエネルギー保存})}$$

**核心**: 台形則（ケイリー変換）は歪対称行列に対して**正確にエネルギーを保存**する。前進・後退オイラーは保存しない（問題8参照）。振動系の長時間計算では台形則が望ましい。

---

## 問題 7 — Leapfrog の位相誤差

**問題**: \(h = 2\pi/32\) での leapfrog の位相誤差を計算せよ。32ステップ後の \(\lambda^{32}\) の角度は。

**回答**:

正確な解: \(e^{i\omega t}\)、\(\omega = \sqrt{\lambda}\)。\(\lambda = 1\) のとき \(\omega = 1\)。

32ステップ後の正確な角度: \(\omega \cdot 32h = 1 \cdot 32 \cdot 2\pi/32 = 2\pi\)（1周期）。

Leapfrog: \(\mu = e^{i\theta_h}\)、\(\cos\theta_h = 1 - h^2/2\)。

$$h = 2\pi/32 = \pi/16 \approx 0.19635$$

$$h^2 = \pi^2/256 \approx 0.03854$$

$$\cos\theta_h = 1 - 0.01927 = 0.98073$$

$$\theta_h = \arccos(0.98073) \approx 0.19648 \; \text{rad}$$

正確な \(\omega h = h = 0.19635\)。

数値的な1ステップの角度: \(\theta_h = 0.19648\)。

32ステップ後: \(32\theta_h = 32 \times 0.19648 = 6.2874\)。

正確値: \(2\pi = 6.2832\)。

**位相誤差**: \(32\theta_h - 2\pi = 6.2874 - 6.2832 = 0.0042 \; \text{rad} \approx 0.24°\)

$$\boxed{\text{位相誤差} \approx 0.004 \; \text{rad} \;(\approx 0.24°) \quad \text{（数値解がわずかに進む）}}$$

テイラー展開: \(\theta_h = h\sqrt{\lambda}(1 + \frac{h^2\lambda}{24} + \cdots)\) なので位相誤差は \(O(h^2)\)。

**核心**: Leapfrog は振幅誤差なし（\(|\mu|=1\)）だが位相誤差 \(O(h^2)\) がある。長時間計算では位相誤差が蓄積する。

---

## 問題 8 — 前進・後退オイラーのエネルギー変化

**問題**: 前進オイラーと後退オイラーのエネルギー変化を求めよ。\(h = 2\pi/32\) で32ステップ後の \((1+h^2)^{32}\) を計算。

**回答**:

\(u' = i\omega u\)（\(\omega = 1\)）に対して:

**前進オイラー**: \(u_{n+1} = (1 + ih)u_n\)。

成長因子: \(\mu_F = 1 + ih\)。\(|\mu_F|^2 = 1 + h^2 > 1\)（**エネルギー増大**）。

32ステップ後の振幅比:

$$|\mu_F|^{32} = (1+h^2)^{16} = (1+\pi^2/256)^{16}$$

$$\approx (1.03854)^{16} \approx e^{16 \times 0.03781} = e^{0.605} \approx 1.831$$

**後退オイラー**: \(u_{n+1} = (1 - ih)^{-1}u_n\)。

$$|\mu_B| = \frac{1}{\sqrt{1+h^2}} < 1 \quad (\text{エネルギー減少})$$

32ステップ後:

$$|\mu_B|^{32} = (1+h^2)^{-16} \approx 1/1.831 \approx 0.546$$

$$\boxed{\text{前進: } (1+h^2)^{16} \approx 1.83 \;(\text{発散}), \quad \text{後退: } (1+h^2)^{-16} \approx 0.55 \;(\text{減衰})}$$

| 手法 | 振幅（32ステップ） | エネルギー |
|---|---|---|
| 正確 | 1 | 保存 |
| Leapfrog | 1 | 保存 |
| 前進オイラー | ≈ 1.83 | 増大 |
| 後退オイラー | ≈ 0.55 | 減少 |
| 台形則 | 1 | 保存 |

**核心**: 振動問題には前進・後退オイラーは不適。Leapfrog か台形則（エネルギー保存スキーム）を使うべき。これは Ch6 の安定性解析の実例。

---

## 問題 10 — 共鳴とロピタルの定理

**問題**: 強制振動 \(u'' + \lambda u = \cos\omega_0 t\) の解で \(\omega_0 \to \sqrt{\lambda}\)（共鳴）の極限をロピタルの定理で求めよ。

**回答**:

\(\omega_0 \neq \sqrt{\lambda}\) のとき、特殊解:

$$u_p(t) = \frac{\cos\omega_0 t}{\lambda - \omega_0^2}$$

初期条件 \(u(0) = 0, u'(0) = 0\) の完全解:

$$u(t) = \frac{\cos\omega_0 t - \cos\sqrt{\lambda}\,t}{\lambda - \omega_0^2}$$

\(\omega_0 \to \sqrt{\lambda}\) の極限で分母→0。ロピタルの定理（\(\omega_0\) で微分）:

$$\lim_{\omega_0 \to \sqrt{\lambda}} \frac{\cos\omega_0 t - \cos\sqrt{\lambda}\,t}{\lambda - \omega_0^2} = \lim_{\omega_0 \to \sqrt{\lambda}} \frac{-t\sin\omega_0 t}{-2\omega_0} = \frac{t\sin\sqrt{\lambda}\,t}{2\sqrt{\lambda}}$$

$$\boxed{u_{\text{共鳴}}(t) = \frac{t\sin\sqrt{\lambda}\,t}{2\sqrt{\lambda}}}$$

振幅が \(t\) に比例して**線形成長**する。これが共鳴（resonance）。

**核心**: 強制振動数が固有振動数に一致すると振幅が無限に成長。これは \(K - \omega^2 M\) が特異になることの時間領域表現。固有値回避（\(\omega_0 \neq \sqrt{\lambda_i}\)）がすべての振動系設計の基本。

---

## 問題 11 — ハミルトン方程式からニュートン法則

**問題**: ハミルトン方程式からニュートンの運動法則を導出せよ。

**回答**:

ハミルトニアン:

$$H(q, p) = \frac{p^2}{2m} + V(q)$$

ハミルトンの正準方程式:

$$\dot{q} = \frac{\partial H}{\partial p} = \frac{p}{m}$$

$$\dot{p} = -\frac{\partial H}{\partial q} = -V'(q)$$

第1式から \(p = m\dot{q}\)。両辺を時間微分:

$$\dot{p} = m\ddot{q}$$

第2式と合わせて:

$$m\ddot{q} = -V'(q) = F(q)$$

$$\boxed{m\ddot{q} = F(q) \quad \text{（ニュートンの第2法則）}}$$

ばね系の場合: \(V(q) = \frac{1}{2}q^T K q\) → \(F = -Kq\) → \(M\ddot{q} + Kq = 0\)。

**エネルギー保存**: \(\frac{dH}{dt} = \frac{\partial H}{\partial q}\dot{q} + \frac{\partial H}{\partial p}\dot{p} = (-\dot{p})\dot{q} + \dot{q}\dot{p} = 0\)。

**核心**: ハミルトン形式は位相空間 \((q, p)\) での1階ODEシステム。シンプレクティック構造 \(\begin{pmatrix}\dot{q}\\\dot{p}\end{pmatrix} = J\nabla H\) が保存則の源泉。Leapfrog はシンプレクティック積分法。

---

## 問題 17 — Leapfrog の安定条件

**問題**: \(mu'' + cu = 0\) に leapfrog を適用し、成長行列と安定条件 \((\Delta t)^2 \leq 4m/c\) を導け。

**回答**:

\(u'' = -(c/m)u\)。\(\lambda = c/m\)。

Leapfrog: \(u_{n+1} - 2u_n + u_{n-1} = -(\Delta t)^2 \lambda u_n\)

成長行列（問題1と同じ形式）:

$$G = \begin{bmatrix} 2 - (\Delta t)^2\lambda & -1 \\ 1 & 0 \end{bmatrix}$$

安定条件: \(|2 - (\Delta t)^2\lambda| \leq 2\)

$$-2 \leq 2 - (\Delta t)^2\lambda \leq 2$$

右辺: \((\Delta t)^2\lambda \geq 0\)（自動的に成立）。

左辺: \((\Delta t)^2\lambda \leq 4\)。

$$(\Delta t)^2 \leq \frac{4}{\lambda} = \frac{4}{c/m} = \frac{4m}{c}$$

$$\boxed{(\Delta t)^2 \leq \frac{4m}{c} \iff \Delta t \leq \frac{2}{\omega_0} \quad (\omega_0 = \sqrt{c/m})}$$

物理的意味: 時間刻みは固有周期 \(T = 2\pi/\omega_0\) の \(1/\pi \approx 1/3\) 以下でなければならない。

多自由度系 \(Mu'' + Ku = 0\) の場合:

$$(\Delta t)^2 \leq \frac{4}{\lambda_{\max}(M^{-1}K)}$$

最大固有振動数で制約される（**CFL 条件**）。

**核心**: Leapfrog の安定性は \(\Delta t\) と系の固有振動数の比で決まる。高周波モードが安定性を支配する。これは Ch6 の偏微分方程式の CFL 条件 \(\Delta t \leq \Delta x / c\) の源流。

---

# Problem Set 2.3（pp. 139–141）— 最小二乗

---

## 問題 1 — 1変数 m 方程式の最小二乗

**問題**: \(A\) が \(m \times 1\) の列ベクトル \(a\) のとき、\(\|b - au\|^2\) を最小にする \(\tilde{u}\) を求めよ。

**回答**:

法線方程式 \(A^TAu = A^Tb\):

$$a^T a \cdot \tilde{u} = a^T b$$

$$\boxed{\tilde{u} = \frac{a^T b}{a^T a} = \frac{\sum_{i=1}^m a_i b_i}{\sum_{i=1}^m a_i^2}}$$

これは \(b\) の \(a\) 方向への射影の係数:

$$p = a\tilde{u} = a\frac{a^T b}{a^T a} = \frac{aa^T}{a^T a}b$$

射影行列: \(P = \frac{aa^T}{a^T a}\)（ランク1）。

**例**: \(a = (1,1,1)^T\), \(b = (1,2,3)^T\):

$$\tilde{u} = \frac{1+2+3}{1+1+1} = 2$$

$$p = 2(1,1,1)^T = (2,2,2)^T, \quad e = b - p = (-1,0,1)^T$$

確認: \(a^T e = -1+0+1 = 0\) ✓

**核心**: 1変数の最小二乗は「射影」の最も基本的な形。\(\tilde{u}\) は加重平均。\(a = (1,\ldots,1)^T\) のとき \(\tilde{u} = \bar{b}\)（相加平均）。

---

## 問題 7 — 最良直線のフィット

**問題**: データ \(b = (4, 1, 0, 1)^T\) が \(x = (0, 1, 2, 3)^T\) で得られたとき、最良直線 \(C + Dx\) を求めよ。法線方程式を立てよ。

**回答**:

$$A = \begin{bmatrix}1&0\\1&1\\1&2\\1&3\end{bmatrix}, \quad b = \begin{bmatrix}4\\1\\0\\1\end{bmatrix}$$

法線方程式 \(A^TA\hat{x} = A^Tb\):

$$A^TA = \begin{bmatrix}4&6\\6&14\end{bmatrix}, \quad A^Tb = \begin{bmatrix}6\\5\end{bmatrix}$$

$$\begin{bmatrix}4&6\\6&14\end{bmatrix}\begin{bmatrix}C\\D\end{bmatrix} = \begin{bmatrix}6\\5\end{bmatrix}$$

\(\det(A^TA) = 4\cdot14 - 36 = 20\)

$$\begin{bmatrix}C\\D\end{bmatrix} = \frac{1}{20}\begin{bmatrix}14&-6\\-6&4\end{bmatrix}\begin{bmatrix}6\\5\end{bmatrix} = \frac{1}{20}\begin{bmatrix}84-30\\-36+20\end{bmatrix} = \frac{1}{20}\begin{bmatrix}54\\-16\end{bmatrix} = \begin{pmatrix}2.7\\-0.8\end{pmatrix}$$

$$\boxed{y = 2.7 - 0.8x}$$

検証:
- \(x=0: y=2.7\)（実測4、残差1.3）
- \(x=1: y=1.9\)（実測1、残差-0.9）
- \(x=2: y=1.1\)（実測0、残差-1.1）
- \(x=3: y=0.3\)（実測1、残差0.7）

残差の和: \(1.3 - 0.9 - 1.1 + 0.7 = 0\) ✓（定数列が \(A\) に含まれるため）。

**核心**: 法線方程式 \(A^TA\hat{x} = A^Tb\) は最小二乗の要。残差 \(e = b - A\hat{x}\) は必ず \(C(A)\) に直交する。

---

## 問題 8 — 射影と残差の直交性

**問題**: 問題7の射影 \(p = A\hat{x}\)、残差 \(e = b - p\) を求め、\(A^Te = 0\) を確認せよ。

**回答**:

$$\hat{x} = \begin{pmatrix}2.7\\-0.8\end{pmatrix}$$

$$p = A\hat{x} = \begin{bmatrix}1&0\\1&1\\1&2\\1&3\end{bmatrix}\begin{pmatrix}2.7\\-0.8\end{pmatrix} = \begin{pmatrix}2.7\\1.9\\1.1\\0.3\end{pmatrix}$$

$$e = b - p = \begin{pmatrix}4\\1\\0\\1\end{pmatrix} - \begin{pmatrix}2.7\\1.9\\1.1\\0.3\end{pmatrix} = \begin{pmatrix}1.3\\-0.9\\-1.1\\0.7\end{pmatrix}$$

直交性の確認:

$$A^Te = \begin{bmatrix}1&1&1&1\\0&1&2&3\end{bmatrix}\begin{pmatrix}1.3\\-0.9\\-1.1\\0.7\end{pmatrix} = \begin{pmatrix}1.3-0.9-1.1+0.7\\0-0.9-2.2+2.1\end{pmatrix}$$

第1成分: \(1.3 - 0.9 - 1.1 + 0.7 = 0\) ✓

第2成分: \(-0.9 - 2.2 + 2.1 = -1.0\)

再計算: \(0\cdot1.3 + 1\cdot(-0.9) + 2\cdot(-1.1) + 3\cdot0.7 = -0.9 - 2.2 + 2.1 = -1.0\)

これは \(0\) になるはず。計算を再確認。

\(C = 27/10\), \(D = -4/5\) の正確な値で:

\(p_1 = 27/10 = 2.7\), \(p_2 = 27/10 - 4/5 = 27/10 - 8/10 = 19/10 = 1.9\)

\(p_3 = 27/10 - 8/5 = 27/10 - 16/10 = 11/10 = 1.1\)

\(p_4 = 27/10 - 12/5 = 27/10 - 24/10 = 3/10 = 0.3\)

\(e = (13/10, -9/10, -11/10, 7/10)\)

\(A^Te\) 第2成分: \(0 \cdot 13/10 + 1\cdot(-9/10) + 2\cdot(-11/10) + 3\cdot(7/10) = (-9-22+21)/10 = -10/10 = -1\)

法線方程式の確認を再度:

$$A^Tb = \begin{pmatrix}4+1+0+1\\0+1+0+3\end{pmatrix} = \begin{pmatrix}6\\4\end{pmatrix}$$

（先の計算で \(A^Tb = (6,5)^T\) としたが、第2成分を再計算: \(0\cdot4 + 1\cdot1 + 2\cdot0 + 3\cdot1 = 4\)。）

**修正**: \(A^Tb = (6, 4)^T\)。

$$\begin{bmatrix}4&6\\6&14\end{bmatrix}\begin{bmatrix}C\\D\end{bmatrix} = \begin{bmatrix}6\\4\end{bmatrix}$$

$$\begin{bmatrix}C\\D\end{bmatrix} = \frac{1}{20}\begin{bmatrix}14&-6\\-6&4\end{bmatrix}\begin{bmatrix}6\\4\end{bmatrix} = \frac{1}{20}\begin{bmatrix}84-24\\-36+16\end{bmatrix} = \frac{1}{20}\begin{bmatrix}60\\-20\end{bmatrix} = \begin{pmatrix}3\\-1\end{pmatrix}$$

$$\boxed{y = 3 - x}$$

修正した射影と残差:

$$p = A\hat{x} = \begin{pmatrix}3\\2\\1\\0\end{pmatrix}, \quad e = b - p = \begin{pmatrix}1\\-1\\-1\\1\end{pmatrix}$$

直交性:

$$A^Te = \begin{pmatrix}1-1-1+1\\0-1-2+3\end{pmatrix} = \begin{pmatrix}0\\0\end{pmatrix} \quad \checkmark$$

$$\boxed{A^Te = 0 \quad (\text{残差は列空間に直交})}$$

**核心**: 最小二乗の幾何学的本質。\(p\) は \(b\) の \(C(A)\) への正射影。\(e \perp C(A)\) が最適性条件であり、これが法線方程式 \(A^TA\hat{x} = A^Tb\) と同値。

---

## 問題 9 — 微積分による最小二乗

**問題**: \(E = \|b - Au\|^2\) を直接展開して微分で最小化せよ。

**回答**:

$$E = (b - Au)^T(b - Au) = b^Tb - 2u^TA^Tb + u^TA^TAu$$

（\(b^TAu = u^TA^Tb\) はスカラーなので転置しても同じ。）

各 \(u_j\) で偏微分:

$$\frac{\partial E}{\partial u_j} = -2(A^Tb)_j + 2(A^TAu)_j$$

全微分を0とおく:

$$\nabla_u E = -2A^Tb + 2A^TAu = 0$$

$$\boxed{A^TAu = A^Tb \quad \text{（法線方程式）}}$$

2階微分（ヘッセ行列）:

$$\frac{\partial^2 E}{\partial u_i \partial u_j} = 2(A^TA)_{ij}$$

\(A^TA\) が正定値（\(A\) が列フルランク）なら、これは極小（大域的最小）。

**核心**: 微積分と線形代数が同じ法線方程式に到達する。射影の幾何学的視点と、二次関数最小化の解析的視点は同値。\(A^TA\) の正定値性が一意解を保証。

---

## 問題 10 — 最良水平線

**問題**: データ \(b = (b_1, \ldots, b_m)^T\) に水平線 \(y = C\) をフィットするとき、最良の \(C\) を求めよ。

**回答**:

$$A = \begin{pmatrix}1\\1\\\vdots\\1\end{pmatrix} \quad (m \times 1)$$

法線方程式: \(A^TA \cdot C = A^Tb\)。

$$m \cdot C = \sum_{i=1}^m b_i$$

$$\boxed{C = \bar{b} = \frac{1}{m}\sum_{i=1}^m b_i \quad \text{（平均値）}}$$

残差: \(e_i = b_i - \bar{b}\)。\(\sum e_i = 0\)。

\(\|e\|^2 = \sum(b_i - \bar{b})^2\) = 偏差平方和。

**核心**: 最良水平線の高さは平均値。これは「定数ベクトル \(\mathbf{1}\) への射影」の結果。統計学の基本量（平均、分散）が最小二乗の言葉で理解できる。

---

## 問題 11 — 最良直線は重心を通る

**問題**: 最良直線 \(y = C + Dx\) が重心 \((\bar{x}, \bar{b})\) を通ることを示せ。

**回答**:

法線方程式の第1行:

$$mC + D\sum x_i = \sum b_i$$

両辺を \(m\) で割る:

$$C + D\bar{x} = \bar{b}$$

これはまさに直線 \(y = C + Dx\) に \(x = \bar{x}\) を代入したとき \(y = \bar{b}\) となることを意味する。

$$\boxed{C + D\bar{x} = \bar{b} \implies (\bar{x}, \bar{b}) \text{ は回帰直線上}}$$

**別証**: データを重心中心に平行移動（\(\tilde{x}_i = x_i - \bar{x}\), \(\tilde{b}_i = b_i - \bar{b}\)）すると、法線方程式は:

$$\begin{bmatrix}m&0\\0&\sum\tilde{x}_i^2\end{bmatrix}\begin{bmatrix}\tilde{C}\\\tilde{D}\end{bmatrix} = \begin{bmatrix}0\\\sum\tilde{x}_i\tilde{b}_i\end{bmatrix}$$

\(\tilde{C} = 0\)、\(\tilde{D} = \frac{\sum\tilde{x}_i\tilde{b}_i}{\sum\tilde{x}_i^2}\)。中心化すると切片が消え、傾きの公式が簡潔になる。

**核心**: 重心通過は法線方程式の直接的帰結。中心化によって法線方程式が対角化される。これは統計学で回帰を教えるときの標準手法。

---

## 問題 14 — 射影と分散・標準偏差

**問題**: \(b\) を \(a = (1, \ldots, 1)^T\) に射影せよ。\(\tilde{u}\) は何か。分散と標準偏差を最小二乗の言葉で表せ。

**回答**:

問題1と同じ: \(\tilde{u} = a^Tb / a^Ta = \sum b_i / m = \bar{b}\)（**平均値**）。

射影: \(p = \bar{b} \cdot \mathbf{1}\)。残差: \(e = b - \bar{b}\cdot\mathbf{1}\)（偏差ベクトル）。

**分散**:

$$\sigma^2 = \frac{\|e\|^2}{m} = \frac{\sum_{i=1}^m(b_i - \bar{b})^2}{m}$$

（不偏分散は \(m-1\) で割る: \(s^2 = \|e\|^2/(m-1)\)）

**標準偏差**:

$$\sigma = \frac{\|e\|}{\sqrt{m}}, \quad s = \frac{\|e\|}{\sqrt{m-1}}$$

$$\boxed{\text{平均} = \frac{a^Tb}{a^Ta}, \quad \text{分散} = \frac{\|b - p\|^2}{m}, \quad \text{標準偏差} = \frac{\|b-p\|}{\sqrt{m}}}$$

**幾何学的解釈**:
- \(\|p\|/\sqrt{m} = |\bar{b}|\): 平均の絶対値
- \(\|e\|/\sqrt{m} = \sigma\): 標準偏差
- \(\|b\|^2 = \|p\|^2 + \|e\|^2\)（ピタゴラス）→ \(\overline{b^2} = \bar{b}^2 + \sigma^2\)

**核心**: 統計学の基本量は射影の幾何学。平均は \(\mathbf{1}\) 方向への射影、分散は \(\mathbf{1}^\perp\) 成分のノルム。ピタゴラスの定理が「二乗平均 = 平均の二乗 + 分散」を与える。

---

## 問題 19 — 3点での直線フィット

**問題**: \(b = C + Dt\) を3点 \((t_1, b_1), (t_2, b_2), (t_3, b_3)\) でフィットせよ。

**回答**:

$$A = \begin{bmatrix}1&t_1\\1&t_2\\1&t_3\end{bmatrix}, \quad b = \begin{pmatrix}b_1\\b_2\\b_3\end{pmatrix}$$

法線方程式:

$$A^TA = \begin{bmatrix}3&t_1+t_2+t_3\\t_1+t_2+t_3&t_1^2+t_2^2+t_3^2\end{bmatrix} = \begin{bmatrix}3&\Sigma t\\\Sigma t&\Sigma t^2\end{bmatrix}$$

$$A^Tb = \begin{bmatrix}\Sigma b\\\Sigma tb\end{bmatrix}$$

$$\begin{bmatrix}3&\Sigma t\\\Sigma t&\Sigma t^2\end{bmatrix}\begin{bmatrix}C\\D\end{bmatrix} = \begin{bmatrix}\Sigma b\\\Sigma tb\end{bmatrix}$$

\(\det = 3\Sigma t^2 - (\Sigma t)^2\)。

$$D = \frac{3\Sigma tb - \Sigma t \cdot \Sigma b}{3\Sigma t^2 - (\Sigma t)^2}$$

$$C = \frac{\Sigma b - D\Sigma t}{3}$$

**等間隔の場合** \(t = 0, 1, 2\):

$$\Sigma t = 3, \quad \Sigma t^2 = 5, \quad \det = 15 - 9 = 6$$

$$D = \frac{3(0\cdot b_1 + b_2 + 2b_3) - 3(b_1+b_2+b_3)}{6} = \frac{3b_2+6b_3-3b_1-3b_2-3b_3}{6} = \frac{-3b_1+3b_3}{6} = \frac{b_3-b_1}{2}$$

$$C = \frac{b_1+b_2+b_3}{3} - \frac{b_3-b_1}{2}$$

$$\boxed{D = \frac{b_3-b_1}{2}, \quad C = \bar{b} - D\bar{t}}$$

**核心**: 法線方程式の係数は「統計量」（和、二乗和、積和）で表される。等間隔の場合は公式が簡潔になる。3点で2パラメータ → 自由度1の最小二乗。

---

# Problem Set 2.4（pp. 154–155）— グラフモデルとキルヒホッフ則

---

## 問題 1 — 三角形・正方形グラフの接続行列

**問題**: 三角形（3ノード3エッジ）と正方形（4ノード4エッジ）の接続行列 \(A\) を書き、\(A^TA\)（ラプラシアン）を求めよ。

**回答**:

**三角形** — ノード 1,2,3、エッジ 1→2, 2→3, 1→3:

$$A_{\triangle} = \begin{bmatrix}-1&1&0\\0&-1&1\\-1&0&1\end{bmatrix}$$

$$A_{\triangle}^T A_{\triangle} = \begin{bmatrix}2&-1&-1\\-1&2&-1\\-1&-1&2\end{bmatrix}$$

各対角成分 = そのノードの次数。非対角 \((i,j)\) = \(-\)（エッジ数）。

\(\det = 0\)（各行の和 = 0 → \((1,1,1)^T\) が零空間）。

**正方形** — ノード 1,2,3,4、エッジ 1→2, 2→3, 3→4, 4→1:

$$A_{\square} = \begin{bmatrix}-1&1&0&0\\0&-1&1&0\\0&0&-1&1\\1&0&0&-1\end{bmatrix}$$

$$A_{\square}^T A_{\square} = \begin{bmatrix}2&-1&0&-1\\-1&2&-1&0\\0&-1&2&-1\\-1&0&-1&2\end{bmatrix}$$

これは巡回（circulant）行列。固有値は \(0, 2, 2, 4\)。

$$\boxed{L_{\triangle} = \begin{bmatrix}2&-1&-1\\-1&2&-1\\-1&-1&2\end{bmatrix}, \quad L_{\square} = \begin{bmatrix}2&-1&0&-1\\-1&2&-1&0\\0&-1&2&-1\\-1&0&-1&2\end{bmatrix}}$$

**核心**: グラフラプラシアン \(L = A^TA\) は半正定値で \(L\mathbf{1} = 0\)。零固有値の重複度 = 連結成分の数。三角形は「完全グラフ \(K_3\)」、正方形は「サイクルグラフ \(C_4\)」。

---

## 問題 2 — A と A^T の零空間

**問題**: 接続行列 \(A\)（\(m \times n\)）の零空間と \(A^T\) の零空間を求めよ。

**回答**:

**\(N(A)\)**（Au = 0 の解）:

\(Au = 0 \iff\) 各エッジ \(i \to j\) について \(u_j - u_i = 0\)。

連結グラフでは、すべてのノードのポテンシャルが等しい:

$$\boxed{N(A) = \text{span}\{(1,1,\ldots,1)^T\} \quad (\text{連結グラフの場合})}$$

\(\dim N(A) = \)（連結成分の数）。連結なら \(\dim = 1\)。

**\(N(A^T)\)**（\(A^Tw = 0\) の解）:

\(A^Tw = 0 \iff\) 各ノード \(i\) で \(\sum_{\text{in}} w_e - \sum_{\text{out}} w_e = 0\)（キルヒホッフの電流則）。

これは「ループ電流」の空間。

$$\dim N(A^T) = m - \text{rank}(A) = m - (n - \text{連結成分数})$$

連結グラフ: \(\text{rank}(A) = n-1\)、\(\dim N(A^T) = m - n + 1\)。

**オイラーの公式**: \(m - n + 1\) = 独立ループ数。

三角形: \(m=3, n=3\) → 独立ループ数 = \(3-3+1 = 1\)（三角形自身が唯一のループ）。

$$\boxed{\dim N(A) = 1 \;(\text{定数}), \quad \dim N(A^T) = m-n+1 \;(\text{ループ数})}$$

**核心**: \(A\) の四つの基本部分空間がグラフの構造を完全に記述する。零空間は連結性、左零空間はループ構造を反映。これは電気回路のキルヒホッフ則の行列表現。

---

## 問題 5 — 連結グラフの零空間

**問題**: 連結グラフで \(Au = 0\) の解が定数ベクトルのみであることを示せ。

**回答**:

\(Au = 0\) は全エッジ \(i \to j\) で \(u_j - u_i = 0\) を意味する。

任意の2ノード \(p, q\) を取る。連結なので \(p = v_0, v_1, \ldots, v_k = q\) というパスが存在。

パスの各辺について \(u_{v_{l+1}} = u_{v_l}\)（\(Au = 0\) より）。

帰納的に: \(u_q = u_{v_{k-1}} = \cdots = u_{v_1} = u_p\)。

任意の \(p, q\) について \(u_p = u_q\) なので、\(u\) は定数。

$$\boxed{Au = 0, \;\text{連結} \implies u = c\mathbf{1} \quad (c \in \mathbb{R})}$$

**逆**: 非連結グラフでは、異なる連結成分に別々の定数を割り当てた \(u\) が \(Au = 0\) を満たす。

$$\boxed{\dim N(A) = \text{連結成分の数}}$$

**核心**: 連結性の代数的特徴付け。\(\lambda_2(L) > 0\)（ラプラシアンの第2最小固有値が正）\(\iff\) グラフが連結。\(\lambda_2\) は Fiedler 値と呼ばれ、グラフの「連結度」を測る。

---

## 問題 6 — ラプラシアンの trace

**問題**: \(A^TA\) の trace が次数の和 = \(2m\) に等しいことを示せ。

**回答**:

\((A^TA)_{ii} = \) ノード \(i\) に接続するエッジの数 = ノード \(i\) の次数 \(d_i\)。

$$\text{tr}(A^TA) = \sum_{i=1}^n d_i$$

一方、各エッジは2つのノードに接続するので:

$$\sum_{i=1}^n d_i = 2m$$

（\(m\) = エッジ数。握手定理。）

$$\boxed{\text{tr}(L) = \text{tr}(A^TA) = \sum_{i=1}^n d_i = 2m}$$

\(\text{tr}(L) = \sum \lambda_i\) でもあるので、ラプラシアン固有値の和 = \(2m\)。

**別証**: \(\text{tr}(A^TA) = \text{tr}(AA^T) = \sum_{e} \|a_e\|^2\)。各行 \(a_e\) は \(\pm1\) が2つなので \(\|a_e\|^2 = 2\)。よって \(\text{tr} = 2m\)。

**核心**: trace はグラフの最も基本的な不変量。固有値の和 = 2×エッジ数 = 次数の和。これはスペクトルグラフ理論の出発点。

---

## 問題 7 — 木のラプラシアンと行列式

**問題**: 4ノードの木（tree）の \(K = A^TCA\) を求めよ。1点を接地して \(\det K\) を計算せよ。

**回答**:

4ノード木（エッジ: 1-2, 2-3, 2-4）:

$$A = \begin{bmatrix}-1&1&0&0\\0&-1&1&0\\0&-1&0&1\end{bmatrix}$$

\(C = \mathrm{diag}(c_1, c_2, c_3)\) のとき:

$$L = A^TCA = \begin{bmatrix}c_1&-c_1&0&0\\-c_1&c_1+c_2+c_3&-c_2&-c_3\\0&-c_2&c_2&0\\0&-c_3&0&c_3\end{bmatrix}$$

\(c_i = 1\) のとき:

$$L = \begin{bmatrix}1&-1&0&0\\-1&3&-1&-1\\0&-1&1&0\\0&-1&0&1\end{bmatrix}$$

**接地**（ノード1を固定、第1行・列を削除）:

$$K = \begin{bmatrix}3&-1&-1\\-1&1&0\\-1&0&1\end{bmatrix}$$

$$\det K = 3(1\cdot1-0) - (-1)((-1)\cdot1-0) + (-1)(0-(-1)\cdot1)$$
$$= 3 - 1 - 1 = 1$$

**キルヒホッフの行列木定理**: \(n\) ノードの木の接地ラプラシアンの行列式 = \(\prod c_e\)（全ばね定数の積）/ ... 

正確には: 連結グラフの全域木の数は任意のノードの余因子で与えられる。木の場合、全域木は自分自身1つなので:

$$\det K_{\text{grounded}} = \prod_{e} c_e = c_1 c_2 c_3$$

\(c_i = 1\) で \(\det = 1\) ✓。

$$\boxed{\det K_{\text{grounded}} = c_1 c_2 c_3 = \prod_e c_e \quad (\text{木の場合})}$$

**核心**: キルヒホッフの行列木定理（Matrix-Tree Theorem）。接地ラプラシアンの行列式 = 全域木の（重み付き）数。木では全域木は唯一なので行列式 = ばね定数の積。これは PS 2.1 問題1の \(\det K_{\text{fixed-free}} = c_1 c_2 c_3\) と同じ結果。

---

## 問題 8 — 要素行列の組み立て（グラフ版）

**問題**: グラフの各辺の要素行列を書き、組み立てによって \(K = A^TCA\) を構成せよ。

**回答**:

辺 \(e: i \to j\)、ばね定数 \(c_e\) の要素行列:

$$K_e = c_e \begin{bmatrix} 1 & -1 \\ -1 & 1 \end{bmatrix} \quad \text{（ノード } i, j \text{ の位置に配置）}$$

\(n \times n\) の全体行列で:

$$(K_e)_{\text{global}} = c_e (e_i - e_j)(e_i - e_j)^T$$

ここで \(e_i\) は標準基底ベクトル。

組み立て:

$$K = \sum_{e=1}^{m} (K_e)_{\text{global}} = \sum_{e=1}^{m} c_e (e_i - e_j)(e_i - e_j)^T = A^TCA$$

**4ノード木の例**（問題7の続き）:

$$K_1 = 1 \cdot \begin{bmatrix}1&-1&0&0\\-1&1&0&0\\0&0&0&0\\0&0&0&0\end{bmatrix}, \quad K_2 = 1 \cdot \begin{bmatrix}0&0&0&0\\0&1&-1&0\\0&-1&1&0\\0&0&0&0\end{bmatrix}, \quad K_3 = 1\cdot\begin{bmatrix}0&0&0&0\\0&1&0&-1\\0&0&0&0\\0&-1&0&1\end{bmatrix}$$

$$K = K_1 + K_2 + K_3 = \begin{bmatrix}1&-1&0&0\\-1&3&-1&-1\\0&-1&1&0\\0&-1&0&1\end{bmatrix} \quad \checkmark$$

$$\boxed{K = \sum_{e} K_e = A^TCA \quad (\text{要素行列の直接和})}$$

**核心**: 有限要素法の組み立ては「辺ごとの寄与を足す」。これはグラフ理論でもばね系でも回路でも同じ。各要素行列はランク1（\(= c_e \cdot aa^T\)）で半正定値。

---

## 問題 11 — 12V 電池回路

**問題**: 12V 電池を含む回路で全 \(c_i = 1\)（全抵抗1Ω）のとき、各ノードの電圧 \(u\) と電流 \(w\) を求めよ。

**回答**:

簡単な回路を考える。ノード1（電池+端子、12V）、ノード2、ノード3（接地、0V）。

接地してノード3を除く。電池はノード1に電圧 \(u_1 = 12\) を強制。

抵抗ネットワーク（全 \(c_i = 1/R_i = 1\)）:

$$Ku = f$$

ここで \(K\) はコンダクタンス行列（= ラプラシアン、各 \(c=1\)）。

**具体的な回路**（2ノード自由、1ノード接地、1ノード電圧源）:

例として直列3抵抗回路: 12V → R₁ → ノード1 → R₂ → ノード2 → R₃ → GND。

\(c_1 = c_2 = c_3 = 1\)。接地してノード GND を除くと、電圧源の条件 \(u_0 = 12\) を右辺に移して:

$$\begin{bmatrix}2&-1\\-1&2\end{bmatrix}\begin{bmatrix}u_1\\u_2\end{bmatrix} = \begin{bmatrix}12\\0\end{bmatrix}$$

$$u_1 = \frac{2\cdot12}{4-1} = 8, \quad u_2 = \frac{12}{3} = 4$$

電流: オームの法則 \(w_e = c_e(u_i - u_j)\):
- \(w_1 = 12 - 8 = 4\)
- \(w_2 = 8 - 4 = 4\)
- \(w_3 = 4 - 0 = 4\)

直列なので電流は一定 = \(12/3 = 4\) A。

$$\boxed{u = (8, 4)^T, \quad w = 4 \;\text{A（全辺）}}$$

より複雑なネットワーク（並列要素あり）の場合も、\(Ku = f\) を解くだけ。

**核心**: 電気回路の解析は \(A^TCA u = f\) のフレームワークそのもの。コンダクタンス \(c_i\) が材料行列 \(C\)、キルヒホッフ則が \(A^T\)、オームの法則が \(CA\)。

---

## 問題 12 — KK⁻¹ = I の確認と正定値性

**問題**: 具体的な \(K\) と \(K^{-1}\) で \(KK^{-1} = I\) を確認し、\(K\) の正定値性を示せ。

**回答**:

問題7の接地ラプラシアン:

$$K = \begin{bmatrix}3&-1&-1\\-1&1&0\\-1&0&1\end{bmatrix}$$

\(\det K = 1\)（問題7で計算済み）。

余因子法で \(K^{-1}\):

$$K^{-1} = \begin{bmatrix}1&1&1\\1&2&1\\1&1&2\end{bmatrix}$$

確認:

$$KK^{-1} = \begin{bmatrix}3&-1&-1\\-1&1&0\\-1&0&1\end{bmatrix}\begin{bmatrix}1&1&1\\1&2&1\\1&1&2\end{bmatrix}$$

第1行: \((3-1-1, 3-2-1, 3-1-2) = (1, 0, 0)\) ✓
第2行: \((-1+1, -1+2, -1+1) = (0, 1, 0)\) ✓
第3行: \((-1+1, -1+2, -1+2) = (0, 1, 1)\)...

再計算:
第3行: \((-1)(1)+(0)(1)+(1)(1), (-1)(1)+(0)(2)+(1)(1), (-1)(1)+(0)(1)+(1)(2)) = (0, -1+1, -1+2) = (0, 0, 1)\) ✓

$$KK^{-1} = I \quad \checkmark$$

**正定値性**: \(K = A^T C A\)（接地後の \(A\) は列フルランク、\(C\) は正の対角）。

任意の \(x \neq 0\):

$$x^T K x = x^T A^T C A x = (Ax)^T C (Ax) = \sum_e c_e (Ax)_e^2 \geq 0$$

等号: \(Ax = 0\) のとき。接地後の \(A\) は列フルランク（接地が剛体モードを除去）なので \(Ax = 0 \implies x = 0\)。

$$\boxed{x^TKx > 0 \quad \forall x \neq 0 \quad (\text{正定値})}$$

\(K^{-1}\) も正定値: \(K^{-1}\) の固有値は \(K\) の固有値の逆数（すべて正）。

さらに \(K^{-1}\) は全成分正（M行列の逆 → 正行列。PS 2.1 問題10参照）。

**核心**: \(A^TCA\) のフレームワークは正定値性を自動的に保証する（接地後）。これは最小エネルギー原理の離散版であり、Ch3 以降の有限要素法の基礎。

---

# まとめ: Chapter 2 の統一テーマ

## \(A^TCA\) フレームの全貌

| セクション | \(A\) | \(C\) | \(u\) | \(f\) |
|---|---|---|---|---|
| 2.1 ばね系 | 差分行列 | ばね定数 | 変位 | 外力 |
| 2.2 振動 | 同上 | 同上 | 変位(t) | 慣性力 |
| 2.3 最小二乗 | データ行列 | 重み | パラメータ | — |
| 2.4 グラフ | 接続行列 | コンダクタンス | 電圧 | 電流源 |

## 核心メッセージ

1. **分解**: 複雑な系を \(A\)（幾何/接続）、\(C\)（材料/物性）、\(A^T\)（平衡/保存）に分ける
2. **境界条件**: \(A\) の行の追加/削除で表現。Fixed = 行追加、Free = 行削除
3. **正定値性**: \(A^TCA\) は半正定値。接地（固定点）で正定値に
4. **零空間**: 物理的には剛体モード。\(\dim N(K) =\) 連結成分数
5. **逆行列の正値性**: M行列の逆は正 → Green 関数は正
6. **安定性**: 時間離散化の安定条件は \(K\) の固有値と時間刻みの関係で決まる
7. **最小二乗**: \(A^TA\hat{x} = A^Tb\) は \(A^TCA\) の \(C = I\) の特殊ケース
