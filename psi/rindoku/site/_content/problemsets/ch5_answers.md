# Chapter 5 — Problem Set 5.1 解答

> Strang "Computational Science and Engineering" pp.416–418 の全26問。テイラー級数・収束半径・複素積分・留数の完全解答。

---

## Problem 1: テイラー級数と収束半径

**(a)** \( f(z) = \dfrac{2}{2z+1} = \dfrac{2}{1+2z} = 2\sum_{n=0}^{\infty}(-2z)^n = \sum_{n=0}^{\infty} 2(-2)^n z^n \)

$$a_n = 2(-2)^n, \quad R = \frac{1}{2}$$

（特異点 \( z = -1/2 \) までの距離。比の判定法: \( |a_{n+1}/a_n| = 2 \to R = 1/2 \)）

**(b)** \( f(z) = \dfrac{1+iz}{1-iz} = (1+iz)\sum_{n=0}^{\infty}(iz)^n = \sum_{n=0}^{\infty}(iz)^n + i\sum_{n=0}^{\infty}(iz)^n \cdot z \)

$$= \sum_{n=0}^{\infty}(iz)^n + \sum_{n=0}^{\infty} i^{n+1} z^{n+1} = 1 + \sum_{n=1}^{\infty}\bigl[i^n + i^n\bigr]z^n = 1 + 2\sum_{n=1}^{\infty} i^n z^n$$

$$a_0 = 1, \quad a_n = 2i^n \;(n \geq 1), \quad R = 1$$

（特異点 \( z = 1/i = -i \) で \( |{-i}| = 1 \)）

**(c)** \( f(z) = \dfrac{1}{(1+z)^2} = \sum_{n=0}^{\infty}(-1)^n(n+1)z^n \)

（\( 1/(1-w)^2 = \sum (n+1)w^n \) で \( w = -z \) を代入）

$$a_n = (-1)^n(n+1), \quad R = 1$$

（特異点 \( z = -1 \) までの距離）

**(d)** \( \sin z = \sum_{n=0}^{\infty} \dfrac{(-1)^n z^{2n+1}}{(2n+1)!} \) なので

$$\frac{\sin z}{z} = \sum_{n=0}^{\infty} \frac{(-1)^n z^{2n}}{(2n+1)!} = 1 - \frac{z^2}{3!} + \frac{z^4}{5!} - \cdots$$

$$a_{2n} = \frac{(-1)^n}{(2n+1)!}, \quad a_{2n+1} = 0, \quad R = \infty$$

（\( \sin z / z \) は整関数 --- \( z = 0 \) の除去可能特異点を除けば特異点がない）

---

## Problem 2: z=1 中心のテイラー級数（最初の2項）

\( \sum a_n(z-1)^n \) を求める。\( w = z - 1 \) とおく。

**(a)** \( \dfrac{2}{2z+1} = \dfrac{2}{2(w+1)+1} = \dfrac{2}{3+2w} = \dfrac{2}{3}\cdot\dfrac{1}{1+2w/3} \)

$$= \frac{2}{3}\left(1 - \frac{2w}{3} + \cdots\right) = \frac{2}{3} - \frac{4}{9}(z-1) + \cdots$$

**(b)** \( \dfrac{1+iz}{1-iz} = \dfrac{1+i(w+1)}{1-i(w+1)} = \dfrac{(1+i)+iw}{(1-i)-iw} \)

$$= \frac{1+i}{1-i}\cdot\frac{1 + iw/(1+i)}{1 - iw/(1-i)}$$

\( \dfrac{1+i}{1-i} = \dfrac{(1+i)^2}{2} = i \)。分母の展開: \( 1/(1-iw/(1-i)) \approx 1 + iw/(1-i) + \cdots \)

$$f(1) = i, \quad f'(z) = \frac{2i}{(1-iz)^2} \implies f'(1) = \frac{2i}{(1-i)^2} = \frac{2i}{-2i} = -1$$

$$f(z) \approx i - (z-1) + \cdots$$

**(c)** \( \dfrac{1}{(1+z)^2} \) で \( z = 1+w \):

$$\frac{1}{(2+w)^2} = \frac{1}{4}\cdot\frac{1}{(1+w/2)^2} = \frac{1}{4}\left(1 - w + \cdots\right)$$

$$= \frac{1}{4} - \frac{1}{4}(z-1) + \cdots$$

**(d)** \( \dfrac{\sin z}{z} \) で \( z = 1+w \): \( f(1) = \sin 1 \)。

$$f'(z) = \frac{z\cos z - \sin z}{z^2} \implies f'(1) = \cos 1 - \sin 1$$

$$f(z) \approx \sin 1 + (\cos 1 - \sin 1)(z-1) + \cdots$$

---

## Problem 3: 比の判定法と収束半径

\( a_{n+1}/a_n \to 1/3 \) のとき、\( |z| < 3 \) での収束を示す。

**証明**: 任意の \( |z| < 3 \) に対し、\( |z| < r < 3 \) となる \( r \) を取る。十分大きい \( N \) に対し \( n \geq N \) で \( |a_{n+1}/a_n| < 1/r' \)（ただし \( 1/3 < 1/r' < 1/r \)）。すると

$$|a_n z^n| \leq |a_N z^N| \cdot \left(\frac{|z|}{r'}\right)^{n-N} \quad (n \geq N)$$

\( |z|/r' < |z|/|z| \cdot (r'/r)^{-1} \)... より直接的に:

\( |a_n z^n| = |a_N||z|^N \cdot \prod_{k=N}^{n-1}\left|\frac{a_{k+1}}{a_k}\right| \cdot |z|^{n-N} \)。\( n \geq N \) で \( |a_{k+1}/a_k| < (1+\epsilon)/3 \) なので

$$|a_n z^n| \leq C \left(\frac{(1+\epsilon)|z|}{3}\right)^{n-N}$$

\( |z| < 3 \) なら \( \epsilon \) を十分小さく取って比 \( < 1 \)。幾何級数比較で収束。

**\( R = 3 \) であること**: \( |z| > 3 \) では同様の議論で項が \( \to \infty \)、発散。

**導関数も \( R = 3 \)**: \( f'(z) = \sum n a_n z^{n-1} \) に対し

$$\frac{(n+1)|a_{n+1}|}{n|a_n|} = \frac{n+1}{n}\cdot\frac{|a_{n+1}|}{|a_n|} \to 1 \cdot \frac{1}{3} = \frac{1}{3}$$

よって比の判定法で \( f'(z) \) の収束半径も \( R = 3 \)。

---

## Problem 4: 不定積分の収束半径

$$\int f(z)dz = \sum \frac{a_n}{n+1}z^{n+1}$$

比の判定法: \( \dfrac{a_{n+1}/(n+2)}{a_n/(n+1)} = \dfrac{n+1}{n+2}\cdot\dfrac{a_{n+1}}{a_n} \to 1 \cdot \dfrac{1}{3} = \dfrac{1}{3} \)

よって収束半径は同じく \( R = 3 \)。

**\( R = 3 \) の例**: \( f(z) = \dfrac{1}{1 - z/3} = \sum_{n=0}^{\infty} \dfrac{z^n}{3^n} \)。特異点 \( z = 3 \) で収束半径 \( R = 3 \)。

---

## Problem 5: \( 1/z^{10} \) の \( z_0 \) 中心テイラー級数の収束半径

\( 1/z^{10} \) の唯一の特異点は \( z = 0 \)（10位の極）。

$$R = |z_0 - 0| = |z_0|$$

（\( z_0 \neq 0 \) のとき。\( z_0 = 0 \) ではテイラー展開不可能。）

---

## Problem 6: \( |z| > 1/L \) で項が 0 に収束しない

\( L = \limsup_{n\to\infty} |a_n|^{1/n} \) とする。\( |z| > 1/L \) なら \( L|z| > 1 \)。

\( L \) は \( |a_n|^{1/n} \) の最大集積点なので、無限個の \( n \) に対して \( |a_n|^{1/n} > L - \epsilon \) が成り立つ。\( \epsilon \) を十分小さく取れば \( (L-\epsilon)|z| > 1 \)。すると

$$|a_n z^n| = (|a_n|^{1/n}|z|)^n > ((L-\epsilon)|z|)^n \to \infty$$

が無限個の \( n \) で成り立つ。項が 0 に収束しないので級数は発散する。

---

## Problem 7: \( |z| < 1/L \) で級数が収束する

\( |z| < 1/L \) なら \( L|z| < 1 \)。\( x \) を \( L|z| < x < 1 \) となるように取る。

\( L \) が \( |a_n|^{1/n} \) の最大集積点なので、十分大きい \( N \) に対し \( n \geq N \) で \( |a_n|^{1/n} < x/|z| \)（有限個の例外を除く）。すると

$$|a_n z^n| = (|a_n|^{1/n} |z|)^n < x^n$$

定数 \( C \) を取れば全ての \( n \) に対し \( |a_n z^n| \leq C x^n \)。\( x < 1 \) なので \( \sum C x^n = C/(1-x) < \infty \)。比較判定法で \( \sum a_n z^n \) は絶対収束。

**結論**: 収束半径は正確に \( R = 1/L \)（Hadamard の公式）。

---

## Problem 8: \( \oint dz/z^2 \)

**(a)** \( z = re^{i\theta} \), \( dz = ire^{i\theta}d\theta \):

$$\oint \frac{dz}{z^2} = \int_0^{2\pi} \frac{ire^{i\theta}}{r^2 e^{2i\theta}} d\theta = \frac{i}{r}\int_0^{2\pi} e^{-i\theta} d\theta = 0$$

**(b)** \( 1/z^2 \) のローラン展開は \( z^{-2} \) のみ。留数 = \( z^{-1} \) の係数 = **0**。

**(c)** 原点を囲まない円の内部で \( 1/z^2 \) は解析的 → コーシーの定理より積分 = 0。原点を囲む円でも留数 = 0 なので積分 = 0。

---

## Problem 9: コーシーの積分公式の直接確認

\( f(z) = z^2 \), 経路 \( z = a + re^{i\theta} \)。コーシーの積分公式:

$$f(a) = \frac{1}{2\pi i}\oint \frac{f(z)}{z-a}dz$$

直接代入: \( z - a = re^{i\theta} \), \( dz = ire^{i\theta}d\theta \):

$$\frac{1}{2\pi i}\int_0^{2\pi} \frac{(a+re^{i\theta})^2}{re^{i\theta}} \cdot ire^{i\theta} d\theta = \frac{1}{2\pi}\int_0^{2\pi}(a+re^{i\theta})^2 d\theta$$

展開: \( (a+re^{i\theta})^2 = a^2 + 2are^{i\theta} + r^2 e^{2i\theta} \)。

$$\frac{1}{2\pi}\int_0^{2\pi}\left(a^2 + 2are^{i\theta} + r^2 e^{2i\theta}\right)d\theta = a^2 + 0 + 0 = a^2 \quad \checkmark$$

**\( e^z \) の単位円上平均値**: コーシーの積分公式で \( a = 0 \):

$$\frac{1}{2\pi}\int_0^{2\pi} e^{e^{i\theta}} d\theta = e^0 = 1$$

---

## Problem 10: 積分計算

**(a)** \( \displaystyle\int_1^i \frac{dz}{z} \) を \( z = e^{i\theta} \) 上で。

短い経路 (\( \theta: 0 \to \pi/2 \)):

$$\int_0^{\pi/2} \frac{ie^{i\theta}}{e^{i\theta}} d\theta = \int_0^{\pi/2} i\,d\theta = \frac{\pi i}{2}$$

長い経路 (\( \theta: 0 \to -3\pi/2 \)、逆回りで \( 3/4 \) 周):

$$\int_0^{-3\pi/2} i\,d\theta = -\frac{3\pi i}{2}$$

差は \( \pi i/2 - (-3\pi i/2) = 2\pi i \)。これは \( z = 0 \) を1回囲んだ分。

**(b)** \( z = e^{i\theta} \), \( x = \cos\theta = \frac{1}{2}(z + z^{-1}) \), \( dz = iz\,d\theta \) より \( d\theta = dz/(iz) \):

$$\oint x\,dz = \oint \frac{1}{2}(z+z^{-1})dz$$

\( \oint z\,dz = 0 \)（解析的）、\( \oint z^{-1}dz = 2\pi i \)。

$$\oint x\,dz = \frac{1}{2}(0 + 2\pi i) = \pi i$$

---

## Problem 11: 極の位置と留数

**(a)** \( \dfrac{1}{z^2-4} = \dfrac{1}{(z-2)(z+2)} \)

- \( z = 2 \): Res \( = 1/(2+2) = 1/4 \)
- \( z = -2 \): Res \( = 1/(-2-2) = -1/4 \)

**(b)** \( \dfrac{z^2}{z-3} \): \( z = 3 \) に1位の極。Res \( = 3^2 = 9 \)。

**(c)** \( \dfrac{1}{(z^2-1)^2} = \dfrac{1}{(z-1)^2(z+1)^2} \): \( z = \pm 1 \) に2位の極。

\( z = 1 \): Res \( = \dfrac{d}{dz}\left[\dfrac{1}{(z+1)^2}\right]_{z=1} = \dfrac{-2}{(z+1)^3}\Big|_{z=1} = \dfrac{-2}{8} = -\dfrac{1}{4} \)

\( z = -1 \): 対称性（あるいは同様の計算）で Res \( = \dfrac{1}{4} \)。

**(d)** \( \dfrac{e^z}{z^3} \): \( z = 0 \) に3位の極。\( e^z = 1 + z + z^2/2 + z^3/6 + \cdots \) なので

$$\frac{e^z}{z^3} = \frac{1}{z^3} + \frac{1}{z^2} + \frac{1}{2z} + \frac{1}{6} + \cdots$$

Res \( = 1/2 \)（\( z^{-1} \) の係数）。

**(e)** \( \dfrac{1}{1-e^z} \): 極は \( e^z = 1 \) すなわち \( z = 2\pi i n \)（\( n \) は整数）。各極は1位。

\( z = 0 \): Res \( = \lim_{z\to 0} \dfrac{z}{1-e^z} = \lim_{z\to 0}\dfrac{z}{-(z + z^2/2+\cdots)} = -1 \)

一般に \( z = 2\pi i n \): Res \( = \dfrac{1}{-e^{2\pi in}} = -1 \)。

**(f)** \( \dfrac{1}{\sin z} \): 極は \( z = n\pi \)（\( n \) は整数）。各極は1位。

$$\text{Res}(z=n\pi) = \frac{1}{\cos(n\pi)} = \frac{1}{(-1)^n} = (-1)^n$$

---

## Problem 12: 単位円上の積分

**(a)** \( \displaystyle\oint \frac{dz}{z^2 - 2z} = \oint \frac{dz}{z(z-2)} \)

単位円内の極は \( z = 0 \) のみ（\( z = 2 \) は外側）。Res\((z=0) = \dfrac{1}{0-2} = -\dfrac{1}{2}\)。

$$\oint = 2\pi i \cdot \left(-\frac{1}{2}\right) = -\pi i$$

**(b)** \( \displaystyle\oint \frac{e^z}{z^2}dz \): \( z = 0 \) は2位の極。Res \( = \dfrac{d}{dz}e^z\Big|_{z=0} = 1 \)。

$$\oint = 2\pi i \cdot 1 = 2\pi i$$

**(c)** \( \displaystyle\oint \frac{dz}{\sin z} \): 単位円内の極は \( z = 0 \) のみ（\( z = \pm\pi \) は外側）。Res\((z=0) = 1\)。

$$\oint = 2\pi i \cdot 1 = 2\pi i$$

---

## Problem 13: 複素積分による実積分

**(a)** \( \displaystyle\int_0^{2\pi} \cos^6\theta\,d\theta \)

\( \cos\theta = \frac{1}{2}(z+z^{-1}) \), \( d\theta = dz/(iz) \)。

$$\cos^6\theta = \frac{1}{2^6}(z+z^{-1})^6 = \frac{1}{64}\sum_{k=0}^{6}\binom{6}{k}z^{6-2k}$$

\( z^0 \) の項（\( k = 3 \)）: \( \binom{6}{3} = 20 \)。積分に寄与するのは \( z^{-1} \) の項のみ:

$$\oint \frac{1}{64}\cdot\frac{(z+z^{-1})^6}{iz}dz = \frac{1}{64i}\oint\frac{(z+z^{-1})^6}{z}dz$$

\( (z+z^{-1})^6/z \) の \( z^{-1} \) 係数 = \( z^0 \) 係数 in \( (z+z^{-1})^6 = 20 \)。

$$\int_0^{2\pi}\cos^6\theta\,d\theta = \frac{1}{64}\cdot 20 \cdot 2\pi = \frac{5\pi}{8}$$

**(b)** \( \displaystyle\int_0^{2\pi} \frac{d\theta}{a+\cos\theta} \), \( a > 1 \)

$$= \oint \frac{1}{a + \frac{1}{2}(z+z^{-1})}\cdot\frac{dz}{iz} = \oint \frac{2\,dz}{i(2az + z^2 + 1)} = \frac{2}{i}\oint \frac{dz}{z^2 + 2az + 1}$$

\( z^2 + 2az + 1 = 0 \implies z = -a \pm \sqrt{a^2-1} \)。

単位円内の極: \( z_1 = -a + \sqrt{a^2-1} \)（\( |z_1| < 1 \) since \( a > 1 \)）。

$$\text{Res}(z_1) = \frac{1}{2z_1 + 2a} = \frac{1}{2\sqrt{a^2-1}}$$

$$\int_0^{2\pi}\frac{d\theta}{a+\cos\theta} = \frac{2}{i}\cdot 2\pi i \cdot \frac{1}{2\sqrt{a^2-1}} = \frac{2\pi}{\sqrt{a^2-1}}$$

**(c)** \( \displaystyle\int_0^{2\pi}\cos^3\theta\,d\theta \)

\( \cos^3\theta = \frac{1}{8}(z+z^{-1})^3 = \frac{1}{8}(z^3 + 3z + 3z^{-1} + z^{-3}) \)。

\( z^{-1} \) の係数は 3。しかし全体の積分は:

$$\oint \frac{1}{8}\cdot\frac{(z+z^{-1})^3}{iz}dz = \frac{1}{8i}\oint\frac{z^3+3z+3z^{-1}+z^{-3}}{z}dz$$

\( z^{-1} \) の項を探す: 分子 \( z^2 + 3 + 3z^{-2} + z^{-4} \) の \( z^{-1} \) 係数 = 0。

$$\int_0^{2\pi}\cos^3\theta\,d\theta = 0$$

（\( \cos^3\theta \) は奇数乗なので1周期の積分は 0。）

---

## Problem 14: 実軸上の広義積分（上半面の留数）

**(a)** \( \displaystyle\int_{-\infty}^{\infty}\frac{dx}{(1+x^2)^2} \)

\( f(z) = 1/(1+z^2)^2 = 1/((z-i)(z+i))^2 \)。上半面の極: \( z = i \)（2位）。

$$\text{Res}(z=i) = \frac{d}{dz}\left[\frac{1}{(z+i)^2}\right]_{z=i} = \frac{-2}{(z+i)^3}\bigg|_{z=i} = \frac{-2}{(2i)^3} = \frac{-2}{-8i} = \frac{1}{4i}$$

$$\int_{-\infty}^{\infty}\frac{dx}{(1+x^2)^2} = 2\pi i \cdot \frac{1}{4i} = \frac{\pi}{2}$$

**(b)** \( \displaystyle\int_{-\infty}^{\infty}\frac{dx}{4+x^2} = \int_{-\infty}^{\infty}\frac{dx}{(x-2i)(x+2i)} \)

上半面の極: \( z = 2i \)。Res \( = 1/(2\cdot 2i) = 1/(4i) \)。

$$\int_{-\infty}^{\infty}\frac{dx}{4+x^2} = 2\pi i \cdot \frac{1}{4i} = \frac{\pi}{2}$$

**(c)** \( \displaystyle\int_{-\infty}^{\infty}\frac{dx}{x^2-2x+3} = \int_{-\infty}^{\infty}\frac{dx}{(x-1)^2+2} \)

\( z^2 - 2z + 3 = 0 \implies z = 1 \pm i\sqrt{2} \)。上半面の極: \( z = 1 + i\sqrt{2} \)。

$$\text{Res} = \frac{1}{2z-2}\bigg|_{z=1+i\sqrt{2}} = \frac{1}{2i\sqrt{2}}$$

$$\int_{-\infty}^{\infty}\frac{dx}{x^2-2x+3} = 2\pi i \cdot \frac{1}{2i\sqrt{2}} = \frac{\pi}{\sqrt{2}}$$

---

## Problem 15: 極・分岐点・真性特異点

**(a)** \( 1/(z^4-1) \): 極は \( z = 1, -1, i, -i \)（すべて1位の極）。\( w = 1/z \) で \( z = \infty \) は正則。

**(b)** \( 1/\sin^2 z \): 極は \( z = n\pi \)（全整数 \( n \)）で各2位の極。\( z = \infty \) は（集積点なので）孤立特異点でない。

**(c)** \( 1/(e^z-1) \): 極は \( z = 2\pi in \)（全整数 \( n \)）で各1位の極。\( z = \infty \) は孤立特異点でない。

**(d)** \( \log(1-z) \): 分岐点は \( z = 1 \)（対数の分岐点）。\( w = 1/z \): \( \log(1-1/w) \) は \( w = 0 \) で分岐点 → \( z = \infty \) も分岐点。

**(e)** \( \sqrt{4-z^2} = \sqrt{(2-z)(2+z)} \): 分岐点は \( z = 2 \) と \( z = -2 \)。\( w = 1/z \): \( \sqrt{4 - 1/w^2} \) は \( w = 0 \) で分岐点 → \( z = \infty \) も分岐点。

**(f)** \( z\log z \): 分岐点は \( z = 0 \)。\( w = 1/z \): \( \frac{1}{w}\log(1/w) = -\frac{\log w}{w} \) で \( w = 0 \) は分岐点 → \( z = \infty \) も分岐点。

**(g)** \( e^{2/z} \): \( z = 0 \) に真性特異点（ローラン級数が \( z^{-n} \) の無限個の項を持つ）。\( w = 1/z \): \( e^{2w} \) は \( w = 0 \) で正則 → \( z = \infty \) は正則。

**(h)** \( e^{z^e} \) (\( e = \) 自然対数の底): \( z^e = e^{e\log z} \) なので \( z = 0 \) は分岐点。\( z = \infty \): \( w = 1/z \) で \( e^{w^{-e}} \)、\( w = 0 \) で真性特異点。

---

## Problem 16: 留数の和が 0 の意味

\( f(z) = 1/(1+z^2) = 1/((z-i)(z+i)) \)。留数: Res\((i) = 1/(2i)\), Res\((-i) = -1/(2i)\)。和 = 0。

\( |z| = R \) が両方の極を囲むとき（\( R > 1 \)）:

$$\oint_{|z|=R} f(z)\,dz = 2\pi i \cdot (\text{留数の和}) = 2\pi i \cdot 0 = 0$$

\( R < 1 \) では極を囲まないのでやはり 0。よってどの \( R \) でも積分は 0。

---

## Problem 17: ロピタルの規則の誤用

$$\lim_{x\to\infty}\frac{x - \sin x^2}{x + \sin x^2}$$

真の値: 分子分母を \( x \) で割ると \( \dfrac{1 - (\sin x^2)/x}{1 + (\sin x^2)/x} \to \dfrac{1-0}{1+0} = 1 \)。

ロピタルの規則を適用すると \( \dfrac{1 - 2x\cos x^2}{1 + 2x\cos x^2} \) だが、この極限は存在しない（\( 2x\cos x^2 \) は振動して発散する）。

**誤りの理由**: ロピタルの規則は「\( \lim f'(x)/g'(x) \) が存在するなら」という条件が必要。\( f'/g' \) の極限が存在しない場合、規則は適用できない。最後の「\( = -1 \)」に至るステップでも同様に極限の存在が保証されていない。

---

## Problem 18: \( \int_0^{2\pi} \sin^2\theta/(5+4\cos\theta)\,d\theta \)

\( z = e^{i\theta} \), \( \sin\theta = (z - z^{-1})/(2i) \), \( \sin^2\theta = -(z-z^{-1})^2/4 = -(z^2 - 2 + z^{-2})/4 \)。

\( 5 + 4\cos\theta = 5 + 2(z+z^{-1}) \), \( d\theta = dz/(iz) \)。

$$I = \oint \frac{-(z^2-2+z^{-2})/4}{5+2(z+z^{-1})}\cdot\frac{dz}{iz}$$

分子分母に \( z \) を掛けて整理:

$$= \oint \frac{-(z^4 - 2z^2 + 1)}{4iz \cdot(2z^2 + 5z + 2)}dz = \oint\frac{-(z^2-1)^2}{4iz(2z+1)(z+2)}dz$$

単位円内の極: \( z = 0 \) と \( z = -1/2 \)（\( z = -2 \) は外側）。

**Res\((z=0)\)**: \( \dfrac{-(0-1)^2}{4i \cdot(2\cdot 0+1)(0+2)} = \dfrac{-1}{8i} \)

**Res\((z=-1/2)\)**: 分母で \( z = -1/2 \) のとき \( 2z+1 = 0 \) なので:

$$\text{Res} = \frac{-((-1/2)^2-1)^2}{4i(-1/2)\cdot 2 \cdot(-1/2+2)} = \frac{-(1/4-1)^2}{4i(-1/2)(2)(3/2)} = \frac{-9/16}{-6i} = \frac{9}{96i} = \frac{3}{32i}$$

留数の和: \( -1/(8i) + 3/(32i) = (-4 + 3)/(32i) = -1/(32i) \)

$$I = 2\pi i \cdot \frac{-1}{32i} = -\frac{\pi}{16}$$

これは正しくない。再計算する。

\( \sin^2\theta = (1 - \cos 2\theta)/2 \) ではなく直接。\( \sin^2\theta = -\frac{(z - z^{-1})^2}{4} = \frac{2 - z^2 - z^{-2}}{4} \)。

$$I = \oint \frac{(2 - z^2 - z^{-2})/4}{5 + 2z + 2z^{-1}} \cdot \frac{dz}{iz}$$

分子分母に \( z^2 \) を掛けて:

分子: \( (2z^2 - z^4 - 1)/4 = -(z^4 - 2z^2 + 1)/4 = -(z^2-1)^2/4 \)

分母の \( 5 + 2z + 2z^{-1} \) に \( z \) を掛けると \( 5z + 2z^2 + 2 = 2z^2 + 5z + 2 = (2z+1)(z+2) \)。

全体:

$$I = \oint \frac{-(z^2-1)^2}{4} \cdot \frac{dz}{iz \cdot (2z^2+5z+2)/z} \cdot \frac{1}{z}$$

整理し直す。元に戻って丁寧に:

$$I = \int_0^{2\pi}\frac{\sin^2\theta}{5+4\cos\theta}d\theta$$

\( z = e^{i\theta} \), \( d\theta = dz/(iz) \), \( \sin^2\theta = \frac{2-z^2-z^{-2}}{4} \), \( 5+4\cos\theta = 5+2(z+z^{-1}) \)。

$$I = \oint \frac{2-z^2-z^{-2}}{4(5+2z+2z^{-1})} \cdot \frac{dz}{iz}$$

\( z \) を掛けて分母を整理: \( z(5 + 2z + 2z^{-1}) = 5z + 2z^2 + 2 \)。

$$I = \oint \frac{2-z^2-z^{-2}}{4i(2z^2+5z+2)} dz = \oint \frac{2z^2-z^4-1}{4iz(2z^2+5z+2)\cdot z^{-1}\cdot...}$$

分子の \( 2 - z^2 - z^{-2} \) に \( z^2 \) を掛けると \( 2z^2 - z^4 - 1 = -(z^4 - 2z^2 + 1) = -(z^2-1)^2 \)。分母の \( z \cdot(5+2z+2/z) = 2z^2+5z+2 \) にさらに \( z \) が \( z^{-2} \) の分だけ必要。

もっと系統的に: \( d\theta = dz/(iz) \) なので

$$I = \frac{1}{4i}\oint \frac{(2-z^2-z^{-2})}{z(5+2z+2z^{-1})}dz$$

\( z(5+2z+2z^{-1}) = 2z^2+5z+2 \)、\( (2-z^2-z^{-2}) = (2z^2-z^4-1)/z^2 \)。

$$I = \frac{1}{4i}\oint \frac{(2z^2-z^4-1)/z^2}{2z^2+5z+2}dz = \frac{1}{4i}\oint \frac{-(z^4-2z^2+1)}{z^2(2z^2+5z+2)}dz$$

$$= \frac{-1}{4i}\oint \frac{(z^2-1)^2}{z^2(2z+1)(z+2)}dz$$

単位円内の極: \( z = 0 \)（2位）, \( z = -1/2 \)（1位）。

**Res\((z=-1/2)\)**:

$$\frac{((-1/2)^2-1)^2}{(-1/2)^2(2\cdot(-1/2+2))} \cdot \frac{1}{2}$$

分母の \( (2z+1) \) を取り除いた残り: \( \dfrac{(z^2-1)^2}{z^2(z+2)} \) に \( 1/2 \)（\( 2z+1 \) の微分 = 2 の逆数... いや、1位の極の留数は直接）

$$\text{Res}(z=-1/2) = \frac{(1/4-1)^2}{(1/4) \cdot 2 \cdot (-1/2+2)} = \frac{(9/16)}{(1/4)(2)(3/2)} = \frac{9/16}{3/4} = \frac{3}{4}$$

**Res\((z=0)\)**: 2位の極なので \( \dfrac{d}{dz}\left[\dfrac{(z^2-1)^2}{(2z+1)(z+2)}\right]_{z=0} \) を計算。

\( g(z) = \dfrac{(z^2-1)^2}{(2z+1)(z+2)} \)。\( g(0) = \dfrac{1}{2} \)。

$$g'(z) = \frac{4z(z^2-1)(2z+1)(z+2) - (z^2-1)^2[(2)(z+2)+(2z+1)]}{[(2z+1)(z+2)]^2}$$

\( z = 0 \):
- 分子の第1項: \( 4\cdot 0\cdot(-1)\cdot 1\cdot 2 = 0 \)
- 分子の第2項: \( -(1)^2[2\cdot 2 + 1] = -5 \)
- 分母: \( (1\cdot 2)^2 = 4 \)

$$g'(0) = \frac{0-(-5)}{4} = -\frac{5}{4}$$

(注意: 分子の第2項の符号は \( -(z^2-1)^2[\cdots] \) の \( (z^2-1)^2|_{z=0} = 1 \), \( 2(z+2)+(2z+1)|_{z=0} = 4+1=5 \) なので \( -1\cdot 5 = -5 \)。)

$$g'(0) = \frac{-5}{4}$$

$$I = \frac{-1}{4i}\cdot 2\pi i\left(\frac{3}{4} + \left(-\frac{5}{4}\right)\right) = \frac{-1}{4i}\cdot 2\pi i \cdot\left(-\frac{1}{2}\right) = \frac{-1}{4i}\cdot(-\pi i) = \frac{\pi}{4}$$

$$\boxed{\int_0^{2\pi}\frac{\sin^2\theta}{5+4\cos\theta}d\theta = \frac{\pi}{4}}$$

---

## Problem 19: \( \int_0^{2\pi} d\theta/(1+a\cos\theta) \)

\( z = e^{i\theta} \), \( d\theta = dz/(iz) \), \( \cos\theta = (z+z^{-1})/2 \):

$$\oint \frac{dz/(iz)}{1+a(z+z^{-1})/2} = \oint \frac{dz}{iz(1+az/2+a/(2z))} = \oint \frac{2\,dz}{i(2z+az^2+a)} = \frac{2}{i}\oint\frac{dz}{az^2+2z+a}$$

\( az^2+2z+a = 0 \implies z = \dfrac{-2\pm\sqrt{4-4a^2}}{2a} = \dfrac{-1\pm\sqrt{1-a^2}}{a} \)

\( 0 \leq a < 1 \) のとき、\( z_1 = \dfrac{-1+\sqrt{1-a^2}}{a} \) は \( |z_1| < 1 \)（単位円内）。

（\( z_1 = \dfrac{-1+\sqrt{1-a^2}}{a} \)。\( a \to 0^+ \) で \( z_1 \to 0 \)、\( a \to 1^- \) で \( z_1 \to 0 \)。常に \( |z_1| < 1 \)。）

$$\text{Res}(z_1) = \frac{1}{a(z_1-z_2)} = \frac{1}{a \cdot 2\sqrt{1-a^2}/a} = \frac{1}{2\sqrt{1-a^2}}$$

$$\int_0^{2\pi}\frac{d\theta}{1+a\cos\theta} = \frac{2}{i}\cdot 2\pi i \cdot \frac{1}{2\sqrt{1-a^2}} = \frac{2\pi}{\sqrt{1-a^2}}$$

---

## Problem 20: 極の位数と留数

**(a)** \( \dfrac{z-2}{z(z-1)} \): \( z = 0 \)（1位）, \( z = 1 \)（1位）。

- Res\((0) = \dfrac{0-2}{0-1} = 2\)
- Res\((1) = \dfrac{1-2}{1} = -1\)

**(b)** \( \dfrac{z-2}{z^2} \): \( z = 0 \) は2位の極。

$$\text{Res}(0) = \frac{d}{dz}(z-2)\bigg|_{z=0} = 1$$

**(c)** \( \dfrac{z}{\sin\pi z} \): 極は \( z = n \)（\( n \neq 0 \) は1位）。\( z = 0 \) は除去可能特異点（\( \lim_{z\to 0} z/\sin\pi z = 1/\pi \)）。

\( z = n \neq 0 \): Res \( = \dfrac{n}{\pi\cos(n\pi)} = \dfrac{n}{\pi(-1)^n} = \dfrac{(-1)^n n}{\pi} \)

**(d)** \( \dfrac{1-e^{iz}}{z^3} \): \( z = 0 \)。\( 1 - e^{iz} = -iz + z^2/2 + iz^3/6 + \cdots \) なので

$$\frac{1-e^{iz}}{z^3} = \frac{-i}{z^2} + \frac{1}{2z} + \frac{i}{6} + \cdots$$

\( z = 0 \) は2位の極（\( z^{-3} \) の項は 0）。Res \( = 1/2 \)。

---

## Problem 21: ML 評価と実際の積分

**(a)** \( \displaystyle\left|\oint_{|z+1|=2}\frac{dz}{z}\right| \)

\( |z+1| = 2 \) 上で \( z = -1+2e^{i\theta} \)。\( |z| \geq ||z+1| - 1| = 2-1 = 1 \) なので \( |1/z| \leq 1 \)。経路長 \( L = 4\pi \)。

$$ML = 1 \cdot 4\pi = 4\pi \quad \checkmark$$

実際: \( z = 0 \) は円内。Res\((0) = 1\)。\( \displaystyle\oint = 2\pi i \)。\( |\oint| = 2\pi < 4\pi \)。

**(b)** \( \displaystyle\left|\oint_{|z-i|=1}\frac{dz}{1+z^2}\right| \)

\( |z-i| = 1 \) 上で \( 1+z^2 = (z-i)(z+i) \)。\( |z-i| = 1 \), \( |z+i| \geq |z-i+2i| - |2i| \)... \( z = i+e^{i\theta} \) なので \( z+i = 2i+e^{i\theta} \)、\( |z+i| \geq 2-1 = 1 \)。

$$|1/(1+z^2)| = 1/(|z-i||z+i|) \leq 1/(1\cdot 1) = 1$$

経路長 \( L = 2\pi \)。\( ML = 2\pi \)。

実際: \( z = i \) は円上（**境界上**）なので... 通常の留数定理は適用不可。しかし円が \( z = i \) を「囲む」と解釈すれば: Res\((i) = 1/(2i)\)。\( \oint = 2\pi i/(2i) = \pi \)。\( |\oint| = \pi < 2\pi \)。

---

## Problem 22: ダイヤモンド経路の ML 評価

ダイヤモンド: 頂点 \( 1, i, -1, -i \)。経路長 \( L = 4\sqrt{2} \)（各辺 \( \sqrt{2} \)）。経路上 \( |z| \leq 1 \)。

**(a)** \( \left|\oint_C z^n\,dz\right| \leq M \cdot L \)。\( |z^n| \leq 1^n = 1 \)。

$$ML = 1 \cdot 4\sqrt{2} = 4\sqrt{2}$$

（実際にはコーシーの定理で \( \oint z^n\,dz = 0 \)（\( n \geq 0 \)）。）

**(b)** \( \left|\oint_C e^{iz}\,dz\right| \)。経路上 \( z = x+iy \) で \( |y| \leq 1 \) なので \( |e^{iz}| = e^{-y} \leq e^1 = e \)。

$$ML = e \cdot 4\sqrt{2} = 4\sqrt{2}\,e$$

（実際にはコーシーの定理で \( \oint e^{iz}\,dz = 0 \)。）

---

## Problem 23: ジョルダンの不等式

\( y = \sin\theta \) と \( y = 2\theta/\pi \) を \( [0, \pi/2] \) で比較する。

- \( \theta = 0 \): 両方 0。\( \theta = \pi/2 \): 両方 1。
- \( \sin\theta \) は下に凸ではなく上に凸（\( \sin'' = -\sin \leq 0 \)）なので直線より上。

よって \( \sin\theta \geq 2\theta/\pi \)（\( 0 \leq \theta \leq \pi/2 \)）。

**半円上の積分**: \( z = Re^{i\theta} \), \( dz = iRe^{i\theta}d\theta \):

$$\int_0^{\pi}\left|\frac{e^{iz}}{z}\right||dz| = \int_0^{\pi}\frac{e^{-R\sin\theta}}{R}\cdot R\,d\theta = \int_0^{\pi}e^{-R\sin\theta}d\theta$$

対称性で \( = 2\int_0^{\pi/2}e^{-R\sin\theta}d\theta \)。ジョルダンの不等式 \( \sin\theta \geq 2\theta/\pi \) を使って:

$$\leq 2\int_0^{\pi/2}e^{-2R\theta/\pi}d\theta = 2\left[\frac{-\pi}{2R}e^{-2R\theta/\pi}\right]_0^{\pi/2} = 2\cdot\frac{\pi}{2R}(1-e^{-R}) < \frac{\pi}{R}$$

（厳密には \( < \pi/(2R) \) ではなく \( < \pi/R \) だが、片側 \( [0, \pi/2] \) のみなら \( < \pi/(2R) \)。全体で \( < \pi/R \to 0 \) as \( R \to \infty \)。）

---

## Problem 24: \( \int_0^\infty \sin x / x\,dx = \pi/2 \)

\( \sin z / z \) は上半面の半円上で巨大になる（\( |\sin z| \sim e^{R\sin\theta}/2 \)）ので直接は使えない。

**解法**: \( e^{iz}/z \) を使う。\( \text{Im}(e^{ix}/x) = \sin x / x \)。

\( e^{iz}/z \) は \( z = 0 \) に1位の極を持つ。\( z = 0 \) を小さな半円 \( C_\epsilon \) で迂回した経路を考える:

- 実軸: \( (-R, -\epsilon) \cup (\epsilon, R) \)
- 小半円 \( C_\epsilon \): \( z = \epsilon e^{i\theta} \)（\( \pi \to 0 \)、上から迂回）
- 大半円 \( C_R \): \( z = Re^{i\theta} \)（\( 0 \to \pi \)）

閉経路内に極がないのでコーシーの定理より全体 = 0。

- 大半円 \( C_R \): Problem 23 より \( R \to \infty \) で \( \to 0 \)。
- 小半円 \( C_\epsilon \): \( \epsilon \to 0 \) で \( \to -\pi i \cdot \text{Res}(0) = -\pi i \cdot 1 = -\pi i \)（半分の留数）。

$$\int_{-\infty}^{\infty}\frac{e^{ix}}{x}dx + (-\pi i) = 0$$

$$\text{Im}\int_{-\infty}^{\infty}\frac{e^{ix}}{x}dx = \pi$$

\( \sin x/x \) は偶関数なので:

$$\int_0^{\infty}\frac{\sin x}{x}dx = \frac{1}{2}\cdot\pi = \frac{\pi}{2}$$

---

## Problem 25: \( \int_0^\infty \sin^2 x / x^2\,dx = \pi/2 \)

\( \sin^2 x = \frac{1}{2}(1-\cos 2x) = \frac{1}{2}\text{Re}(1-e^{2ix}) \) なので \( (1-e^{2iz})/z^2 \) を使う。

**(a)** \( z = 0 \) での留数: \( 1 - e^{2iz} = -2iz - (2iz)^2/2 - \cdots = -2iz + 2z^2 + \cdots \) なので

$$\frac{1-e^{2iz}}{z^2} = \frac{-2i}{z} + 2 + \cdots$$

Res\((z=0) = -2i\)。

**(b)** Problem 24 と同様の経路（\( z = 0 \) を小半円で迂回）。

- 大半円: \( |1-e^{2iz}|/|z|^2 \leq (1+e^{-2R\sin\theta})/R^2 \to 0 \) で寄与 0。
  (\( e^{2iz} = e^{-2R\sin\theta} \) は上半面で減衰、\( 1/R^2 \) の因子もある。)
- 小半円: \( \to -\pi i \cdot (-2i) = -2\pi \)

$$\int_{-\infty}^{\infty}\frac{1-e^{2ix}}{x^2}dx - 2\pi = 0$$

実部を取る:

$$\text{Re}\int_{-\infty}^{\infty}\frac{1-e^{2ix}}{x^2}dx = \int_{-\infty}^{\infty}\frac{1-\cos 2x}{x^2}dx = 2\int_{-\infty}^{\infty}\frac{\sin^2 x}{x^2}dx$$

よって

$$2\int_{-\infty}^{\infty}\frac{\sin^2 x}{x^2}dx = 2\pi \implies \int_{-\infty}^{\infty}\frac{\sin^2 x}{x^2}dx = \pi$$

\( \sin^2 x/x^2 \) は偶関数なので:

$$\int_0^{\infty}\frac{\sin^2 x}{x^2}dx = \frac{\pi}{2}$$

（問題文の「\( = \pi/4 \)」は \( 1/4 \) が \( \text{Re}(2\pi i \cdot(-2i))/8 \) のステップを指しているが、正しくは上の通り \( \pi/2 \)。詳細: \( \text{Re}[2\pi i\cdot(-2i)] = \text{Re}[4\pi] = 4\pi \) で、\( \int \sin^2 x/x^2\,dx = 4\pi/4 = \pi \)（全実軸）、片側 = \( \pi/2 \)。問題文の「1/4」は半分の留数と偶関数の1/2を合わせた因子。）

---

## Problem 26: \( \int_0^{2\pi}\cos^4\theta\,d\theta \)

Problem 13(a) と同じ方法。\( \cos\theta = \frac{1}{2}(z+z^{-1}) \), \( d\theta = dz/(iz) \)。

$$\cos^4\theta = \frac{1}{16}(z+z^{-1})^4 = \frac{1}{16}(z^4 + 4z^2 + 6 + 4z^{-2} + z^{-4})$$

$$\int_0^{2\pi}\cos^4\theta\,d\theta = \frac{1}{16}\oint \frac{z^4+4z^2+6+4z^{-2}+z^{-4}}{iz}dz$$

\( z^{-1} \) の項（すなわち被積分関数で \( z^{-1} \) の係数）: 分子の \( 6 \) を \( z \) で割って \( 6/z \)。他の項は \( z^{-1} \) を生じない。

$$= \frac{1}{16i}\cdot 6 \cdot 2\pi i = \frac{6\cdot 2\pi}{16} = \frac{3\pi}{4}$$

$$\boxed{\int_0^{2\pi}\cos^4\theta\,d\theta = \frac{3\pi}{4}}$$

---

> **まとめ**: テイラー級数の収束半径は最近傍の特異点で決まる（Hadamard: \( R = 1/\limsup|a_n|^{1/n} \)）。留数定理が実積分の計算に威力を発揮する。ジョルダンの補題により半円上の寄与を制御し、\( \sin x/x \) や \( \sin^2 x/x^2 \) のような非自明な積分を評価できる。
