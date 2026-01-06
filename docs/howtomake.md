# のぼり専門店 - 5つの設計ドキュメント

Cursor/Claude Codeで実装できる完全な設計書を作成します。

---

## 1. プロジェクト概要・システム設計

<canvas>
<title>01-project-overview.md</title>
<content># プロジェクト概要・システム設計

## 📋 プロジェクト情報

| 項目 | 内容 |
|------|------|
| プロジェクト名 | のぼり専門店 オンライン見積もりシステム |
| 技術スタック | React + Vite + TypeScript + Shopify |
| ホスティング | Vercel (Frontend) + Shopify (Backend) |
| リポジトリ | nobori-app |

---

## 🏗️ システムアーキテクチャ

```
┌──────────────────────────────────────────┐
│  User Interface (React SPA)              │
│  ┌────────────────────────────────────┐  │
│  │ - のぼり見積もりフォーム           │  │
│  │ - リアルタイム価格計算             │  │
│  │ - ファイルアップロード             │  │
│  │ - レスポンシブデザイン             │  │
│  └────────────────────────────────────┘  │
└───────────────┬──────────────────────────┘
                │ HTTPS/REST
                │
┌───────────────▼──────────────────────────┐
│  Shopify (Full Backend)                  │
│  ┌────────────────────────────────────┐  │
│  │ - 商品管理（テストモード）         │  │
│  │ - 在庫管理（生地在庫）             │  │
│  │ - 注文管理（製造フロー）           │  │
│  │ - 決済処理（Stripe統合）           │  │
│  │ - 事業所管理画面                   │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## 📁 プロジェクト構造

```
nobori-app/
├── src/
│   ├── components/          # UIコンポーネント
│   │   ├── NoboriEstimator.tsx
│   │   ├── SizeSelector.tsx
│   │   ├── FabricSelector.tsx
│   │   ├── QuantityInput.tsx
│   │   ├── OptionsSelector.tsx
│   │   ├── PriceDisplay.tsx
│   │   └── FileUploader.tsx
│   │
│   ├── hooks/               # カスタムフック
│   │   ├── useShopify.ts
│   │   ├── useNoboriPrice.ts
│   │   └── useFileUpload.ts
│   │
│   ├── utils/               # ユーティリティ
│   │   ├── priceCalculator.ts
│   │   ├── constants.ts
│   │   └── validators.ts
│   │
│   ├── types/               # 型定義
│   │   └── nobori.types.ts
│   │
│   ├── App.tsx              # ルートコンポーネント
│   ├── main.tsx             # エントリーポイント
│   └── index.css            # グローバルスタイル
│
├── public/                  # 静的ファイル
│
├── docs/                    # ドキュメント
│   ├── 01-project-overview.md
│   ├── 02-nobori-specs.md
│   ├── 03-frontend-implementation.md
│   ├── 04-shopify-integration.md
│   └── 05-operations.md
│
├── .env                     # 環境変数
├── .env.example             # 環境変数テンプレート
├── package.json             # 依存関係
├── tsconfig.json            # TypeScript設定
├── vite.config.ts           # Vite設定
├── tailwind.config.js       # Tailwind設定
└── README.md                # プロジェクト説明
```

---

## 🚀 セットアップ手順

### 1. 前提条件

```bash
Node.js 20+
pnpm (推奨) or npm
Shopify アカウント
```

### 2. プロジェクト作成

```bash
# Viteプロジェクト作成
pnpm create vite nobori-app --template react-ts

cd nobori-app

# 依存関係インストール
pnpm install

# 追加パッケージ
pnpm add axios zustand react-dropzone
pnpm add -D tailwindcss postcss autoprefixer
pnpm add @shopify/shopify-api

# Tailwind初期化
pnpm dlx tailwindcss init -p
```

### 3. 環境変数設定

```bash
# .env.example をコピー
cp .env.example .env

# .env を編集
VITE_SHOPIFY_DOMAIN=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=xxxxx
```

### 4. 開発サーバー起動

```bash
pnpm dev
# → http://localhost:5173
```

---

## 🎯 主要機能

### フロントエンド機能

```
1. のぼり見積もりフォーム
   ├─ サイズ選択（4種類）
   ├─ 生地選択（3種類）
   ├─ 印刷方法選択
   ├─ 数量入力
   ├─ オプション選択
   └─ リアルタイム価格計算

2. ファイルアップロード
   ├─ ドラッグ&ドロップ
   ├─ デザインデータ（PDF/AI）
   └─ 後日入稿オプション

3. 注文確認
   └─ Shopifyチェックアウトへ遷移
```

### バックエンド機能（Shopify）

```
1. 商品管理
   ├─ のぼり商品登録
   ├─ バリアント設定（生地種類）
   └─ メタフィールド（カスタム情報）

2. 在庫管理
   ├─ 生地在庫追跡
   ├─ 自動在庫調整
   └─ 発注アラート

3. 注文管理
   ├─ 注文受付
   ├─ タグ管理（製造状況）
   ├─ メモ管理（製造メモ）
   └─ ステータス更新

4. 決済処理
   ├─ クレジットカード
   ├─ コンビニ決済
   └─ テストモード
```

---

## 🔄 データフロー

```
ユーザー: のぼり仕様選択
    ↓
フロントエンド: 価格計算（即座）
    ↓
ユーザー: 数量・オプション変更
    ↓
フロントエンド: 価格再計算（即座）
    ↓
ユーザー: ファイルアップロード
    ↓
フロントエンド: Cloudflare R2に直接アップロード
    ↓
ユーザー: 注文確定
    ↓
フロントエンド: Shopify カート追加
    │ （カスタム属性に仕様を保存）
    ↓
Shopify: チェックアウトページ表示
    ↓
ユーザー: 配送先・決済情報入力
    ↓
Shopify: 決済処理
    ↓
Shopify Admin: 注文表示
    ↓
事業所: 注文確認・製造開始
    ↓
事業所: ステータス更新
    ↓
ユーザー: 進捗メール受信
```

---

## 🎨 技術スタック詳細

### フロントエンド

```typescript
// React 18.2+ - UIライブラリ
import React from 'react';

// Vite 5.0+ - ビルドツール
// 高速な開発サーバー、HMR

// TypeScript 5.3+ - 型安全性
// 型定義で開発効率UP

// Tailwind CSS 3.4+ - スタイリング
// ユーティリティファーストCSS

// Zustand 4.4+ - 状態管理
// シンプルで軽量な状態管理

// Axios - HTTP通信
// Shopify API連携
```

### バックエンド（Shopify）

```
Shopify Storefront API
- GraphQL
- 商品取得
- カート操作

Shopify Admin API
- REST / GraphQL
- 商品管理
- 注文管理
- 在庫管理

Shopify Admin Dashboard
- ブラウザ管理画面
- 注文処理
- 在庫調整
- 顧客管理
```

### ホスティング

```
Vercel
- フロントエンド自動デプロイ
- CDN配信
- プレビューURL

Shopify
- バックエンド・管理画面
- 決済処理
- セキュア
```

---

## 📊 パフォーマンス目標

```
初回ロード: < 2秒
価格計算: < 0.1秒（即座）
ページ遷移: < 0.3秒
ファイルUP: プログレス表示
```

---

## 🔐 セキュリティ

```
HTTPS通信: 全て暗号化
API認証: Shopify トークン
CORS設定: 許可ドメイン限定
ファイルUP: 署名付きURL（1時間有効）
決済: Shopify Payments（PCI準拠）
```

---

## 📝 開発規約

### ファイル命名

```
コンポーネント: PascalCase.tsx
  例: NoboriEstimator.tsx

フック: camelCase.ts
  例: useNoboriPrice.ts

ユーティリティ: camelCase.ts
  例: priceCalculator.ts
```

### Git ブランチ戦略

```
main - 本番環境
develop - 開発環境
feature/* - 機能開発
fix/* - バグ修正
```

### コミットメッセージ

```
feat: 新機能
fix: バグ修正
docs: ドキュメント
style: フォーマット
refactor: リファクタリング
```

---

## 🧪 テスト戦略

```
単体テスト: Vitest
  - 価格計算ロジック
  - バリデーション

E2Eテスト: Playwright（将来）
  - 見積もり作成フロー
  - 注文フロー

手動テスト:
  - UI/UX確認
  - Shopify連携
```

---

## 📞 サポート・リソース

```
Shopify Dev Docs: https://shopify.dev
Vite Docs: https://vitejs.dev
React Docs: https://react.dev
Tailwind Docs: https://tailwindcss.com
```
</content>
</canvas>

---

## 2. のぼり商品仕様・価格計算

<canvas>
<title>02-nobori-specs.md</title>
<content># のぼり商品仕様・価格計算

## 🎌 のぼり商品マスタ

### サイズ仕様

```typescript
// src/utils/constants.ts

export const SIZES = {
  standard: {
    id: 'standard',
    name: 'レギュラー',
    displayName: '60×180cm（レギュラー）',
    width: 60,
    height: 180,
    basePrice: 2000,
    description: '最も一般的なサイズ。店舗前や道路沿いに最適',
  },
  slim: {
    id: 'slim',
    name: 'スリム',
    displayName: '45×180cm（スリム）',
    width: 45,
    height: 180,
    basePrice: 1800,
    description: '幅が狭く設置場所を選ばない。省スペース',
  },
  short: {
    id: 'short',
    name: 'ショート',
    displayName: '60×150cm（ショート）',
    width: 60,
    height: 150,
    basePrice: 1700,
    description: '高さ控えめ。風の影響を受けにくい',
  },
  mini: {
    id: 'mini',
    name: 'ミニ',
    displayName: '45×150cm（ミニ）',
    width: 45,
    height: 150,
    basePrice: 1500,
    description: 'コンパクトサイズ。店内・卓上用に',
  },
} as const;

export type SizeId = keyof typeof SIZES;
```

---

### 生地仕様

```typescript
// src/utils/constants.ts

export const FABRICS = {
  polyester: {
    id: 'polyester',
    name: 'ポンジ',
    displayName: 'ポンジ（標準）',
    multiplier: 1.0,
    description: '軽量で安価。一般的な用途に最適',
    features: ['軽い', '安価', '乾きやすい'],
    recommended: true, // デフォルト推奨
  },
  toromatto: {
    id: 'toromatto',
    name: 'トロマット',
    displayName: 'トロマット',
    multiplier: 1.3,
    description: '厚手で高級感。長期使用向け',
    features: ['厚手', '高級感', '耐久性'],
    recommended: false,
  },
  twill: {
    id: 'twill',
    name: 'ツイル',
    displayName: 'ツイル（最高級）',
    multiplier: 1.4,
    description: '最高級生地。長持ちで発色が良い',
    features: ['最高級', '長持ち', '発色良好'],
    recommended: false,
  },
} as const;

export type FabricId = keyof typeof FABRICS;
```

---

### 印刷方法

```typescript
// src/utils/constants.ts

export const PRINT_METHODS = {
  full_color: {
    id: 'full_color',
    name: 'フルカラー印刷',
    multiplier: 1.0,
    description: '写真やグラデーションも美しく再現',
    recommended: true,
  },
  single_color: {
    id: 'single_color',
    name: '単色印刷',
    multiplier: 0.7,
    description: '1色のみ。シンプルなデザインに最適',
    recommended: false,
  },
} as const;

export type PrintMethodId = keyof typeof PRINT_METHODS;
```

---

### オプション加工

```typescript
// src/utils/constants.ts

export const OPTIONS = {
  pole_pocket: {
    id: 'pole_pocket',
    name: '棒袋加工',
    displayName: '棒袋加工（上下）',
    price: 200,
    description: 'のぼりポールを通す袋を上下に縫製',
    required: false,
  },
  chichi: {
    id: 'chichi',
    name: 'チチ加工',
    displayName: 'チチ加工（ハトメ）',
    price: 100,
    description: 'ポールに取り付けるための輪（チチ）を付ける',
    required: false,
  },
  heat_cut: {
    id: 'heat_cut',
    name: 'ヒートカット',
    displayName: 'ヒートカット仕上げ',
    price: 150,
    description: '熱で裁断しほつれを防止。綺麗な仕上がり',
    required: false,
  },
  waterproof: {
    id: 'waterproof',
    name: '防水加工',
    displayName: '防水加工',
    price: 300,
    description: '屋外での使用に。雨に強い',
    required: false,
  },
} as const;

export type OptionId = keyof typeof OPTIONS;
```

---

### 数量割引テーブル

```typescript
// src/utils/constants.ts

export const QUANTITY_DISCOUNTS = [
  { min: 1, max: 9, rate: 0, label: '割引なし' },
  { min: 10, max: 29, rate: 0.10, label: '10%OFF' },
  { min: 30, max: 49, rate: 0.15, label: '15%OFF' },
  { min: 50, max: 99, rate: 0.20, label: '20%OFF' },
  { min: 100, max: Infinity, rate: 0.25, label: '25%OFF' },
] as const;

// 割引適用の判定
export function getDiscountRate(quantity: number): number {
  const bracket = QUANTITY_DISCOUNTS.find(
    d => quantity >= d.min && quantity <= d.max
  );
  return bracket?.rate || 0;
}

export function getDiscountLabel(quantity: number): string {
  const bracket = QUANTITY_DISCOUNTS.find(
    d => quantity >= d.min && quantity <= d.max
  );
  return bracket?.label || '';
}
```

---

## 💰 価格計算ロジック

### 型定義

```typescript
// src/types/nobori.types.ts

export interface NoboriSpecs {
  size: SizeId;
  fabric: FabricId;
  printMethod: PrintMethodId;
  quantity: number;
  options: OptionId[];
}

export interface PriceBreakdown {
  // 基本料金（サイズ×生地×印刷）
  basePrice: number;
  
  // 生地による追加料金
  fabricCost: number;
  
  // オプション料金合計
  optionsCost: number;
  
  // 小計（割引前）
  subtotal: number;
  
  // 数量割引額
  discount: number;
  
  // 合計金額
  totalPrice: number;
  
  // 1枚あたり単価
  unitPrice: number;
  
  // 適用された割引率
  discountRate: number;
  
  // 割引ラベル
  discountLabel: string;
}
```

---

### 価格計算関数

```typescript
// src/utils/priceCalculator.ts

import { SIZES, FABRICS, PRINT_METHODS, OPTIONS } from './constants';
import { getDiscountRate, getDiscountLabel } from './constants';
import type { NoboriSpecs, PriceBreakdown } from '@/types/nobori.types';

/**
 * のぼり価格を計算
 * 
 * 計算式:
 * 1. サイズ基本料金 × 生地倍率 × 印刷倍率 = 1枚あたり基本価格
 * 2. 基本価格 × 数量 = 基本料金合計
 * 3. オプション料金 × 数量 = オプション合計
 * 4. (基本料金 + オプション) × (1 - 割引率) = 合計金額
 */
export function calculateNoboriPrice(specs: NoboriSpecs): PriceBreakdown {
  // 1. サイズ基本料金
  const sizeConfig = SIZES[specs.size];
  if (!sizeConfig) {
    throw new Error(`Invalid size: ${specs.size}`);
  }
  const sizeBasePrice = sizeConfig.basePrice;
  
  // 2. 生地倍率
  const fabricConfig = FABRICS[specs.fabric];
  if (!fabricConfig) {
    throw new Error(`Invalid fabric: ${specs.fabric}`);
  }
  const fabricMultiplier = fabricConfig.multiplier;
  
  // 3. 印刷方法倍率
  const printConfig = PRINT_METHODS[specs.printMethod];
  if (!printConfig) {
    throw new Error(`Invalid print method: ${specs.printMethod}`);
  }
  const printMultiplier = printConfig.multiplier;
  
  // 4. 1枚あたりの基本価格
  const unitBasePrice = sizeBasePrice * fabricMultiplier * printMultiplier;
  
  // 5. 基本料金合計
  const basePrice = Math.floor(unitBasePrice * specs.quantity);
  
  // 6. 生地による追加コスト
  const fabricCost = Math.floor(
    (unitBasePrice - sizeBasePrice) * specs.quantity
  );
  
  // 7. オプション料金（1枚あたり）
  const optionsPerUnit = specs.options.reduce((sum, optionId) => {
    const option = OPTIONS[optionId];
    if (!option) {
      console.warn(`Invalid option: ${optionId}`);
      return sum;
    }
    return sum + option.price;
  }, 0);
  
  // 8. オプション料金合計
  const optionsCost = optionsPerUnit * specs.quantity;
  
  // 9. 小計（割引前）
  const subtotal = basePrice + optionsCost;
  
  // 10. 数量割引
  const discountRate = getDiscountRate(specs.quantity);
  const discount = Math.floor(subtotal * discountRate);
  const discountLabel = getDiscountLabel(specs.quantity);
  
  // 11. 合計金額
  const totalPrice = subtotal - discount;
  
  // 12. 1枚あたり単価
  const unitPrice = Math.floor(totalPrice / specs.quantity);
  
  return {
    basePrice,
    fabricCost,
    optionsCost,
    subtotal,
    discount,
    totalPrice,
    unitPrice,
    discountRate,
    discountLabel,
  };
}
```

---

### 使用例

```typescript
// 使用例1: レギュラーサイズ、ポンジ生地、10枚
const specs1: NoboriSpecs = {
  size: 'standard',
  fabric: 'polyester',
  printMethod: 'full_color',
  quantity: 10,
  options: ['pole_pocket', 'chichi'],
};

const price1 = calculateNoboriPrice(specs1);
console.log(price1);
// {
//   basePrice: 20000,        // 2000円 × 10枚
//   fabricCost: 0,           // ポンジは標準生地なので追加なし
//   optionsCost: 3000,       // (200 + 100) × 10枚
//   subtotal: 23000,
//   discount: 2300,          // 10%OFF
//   totalPrice: 20700,
//   unitPrice: 2070,         // 1枚あたり
//   discountRate: 0.10,
//   discountLabel: '10%OFF'
// }

// 使用例2: スリムサイズ、トロマット生地、50枚
const specs2: NoboriSpecs = {
  size: 'slim',
  fabric: 'toromatto',
  printMethod: 'full_color',
  quantity: 50,
  options: ['pole_pocket', 'waterproof'],
};

const price2 = calculateNoboriPrice(specs2);
console.log(price2);
// {
//   basePrice: 117000,       // 1800 × 1.3 × 50枚
//   fabricCost: 27000,       // トロマット追加料金
//   optionsCost: 25000,      // (200 + 300) × 50枚
//   subtotal: 142000,
//   discount: 28400,         // 20%OFF
//   totalPrice: 113600,
//   unitPrice: 2272,
//   discountRate: 0.20,
//   discountLabel: '20%OFF'
// }
```

---

## 🧪 価格計算テスト

```typescript
// src/utils/priceCalculator.test.ts

import { describe, it, expect } from 'vitest';
import { calculateNoboriPrice } from './priceCalculator';

describe('のぼり価格計算', () => {
  it('基本価格が正しく計算される', () => {
    const specs = {
      size: 'standard',
      fabric: 'polyester',
      printMethod: 'full_color',
      quantity: 1,
      options: [],
    };
    
    const price = calculateNoboriPrice(specs);
    expect(price.basePrice).toBe(2000);
    expect(price.totalPrice).toBe(2000);
  });
  
  it('数量割引が正しく適用される', () => {
    const specs = {
      size: 'standard',
      fabric: 'polyester',
      printMethod: 'full_color',
      quantity: 10,
      options: [],
    };
    
    const price = calculateNoboriPrice(specs);
    expect(price.discount).toBe(2000); // 10%OFF
    expect(price.totalPrice).toBe(18000);
  });
  
  it('生地による追加料金が正しい', () => {
    const specs = {
      size: 'standard',
      fabric: 'toromatto',
      printMethod: 'full_color',
      quantity: 1,
      options: [],
    };
    
    const price = calculateNoboriPrice(specs);
    expect(price.basePrice).toBe(2600); // 2000 × 1.3
  });
  
  it('オプション料金が加算される', () => {
    const specs = {
      size: 'standard',
      fabric: 'polyester',
      printMethod: 'full_color',
      quantity: 1,
      options: ['pole_pocket', 'chichi'],
    };
    
    const price = calculateNoboriPrice(specs);
    expect(price.optionsCost).toBe(300); // 200 + 100
    expect(price.totalPrice).toBe(2300);
  });
});
```

---

## 📋 バリデーション

```typescript
// src/utils/validators.ts

import { SIZES, FABRICS, PRINT_METHODS, OPTIONS } from './constants';
import type { NoboriSpecs } from '@/types/nobori.types';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * のぼり仕様をバリデーション
 */
export function validateNoboriSpecs(specs: Partial<NoboriSpecs>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // サイズ
  if (!specs.size) {
    errors.push({ field: 'size', message: 'サイズを選択してください' });
  } else if (!(specs.size in SIZES)) {
    errors.push({ field: 'size', message: '無効なサイズです' });
  }
  
  // 生地
  if (!specs.fabric) {
    errors.push({ field: 'fabric', message: '生地を選択してください' });
  } else if (!(specs.fabric in FABRICS)) {
    errors.push({ field: 'fabric', message: '無効な生地です' });
  }
  
  // 印刷方法
  if (!specs.printMethod) {
    errors.push({ field: 'printMethod', message: '印刷方法を選択してください' });
  } else if (!(specs.printMethod in PRINT_METHODS)) {
    errors.push({ field: 'printMethod', message: '無効な印刷方法です' });
  }
  
  // 数量
  if (!specs.quantity) {
    errors.push({ field: 'quantity', message: '数量を入力してください' });
  } else if (specs.quantity < 1) {
    errors.push({ field: 'quantity', message: '数量は1以上を指定してください' });
  } else if (specs.quantity > 10000) {
    errors.push({ field: 'quantity', message: '数量は10000以下を指定してください' });
  }
  
  // オプション
  if (specs.options) {
    specs.options.forEach(optionId => {
      if (!(optionId in OPTIONS)) {
        errors.push({ field: 'options', message: `無効なオプション: ${optionId}` });
      }
    });
  }
  
  return errors;
}

/**
 * 仕様が有効かチェック
 */
export function isValidNoboriSpecs(specs: Partial<NoboriSpecs>): specs is NoboriSpecs {
  return validateNoboriSpecs(specs).length === 0;
}
```
</content>
</canvas>

---

## 3. フロントエンド実装

<canvas>
<title>03-frontend-implementation.md</title>
<content># フロントエンド実装

## 🎨 メインコンポーネント

### NoboriEstimator.tsx

```typescript
// src/components/NoboriEstimator.tsx

import { useState } from 'react';
import { SizeSelector } from './SizeSelector';
import { FabricSelector } from './FabricSelector';
import { QuantityInput } from './QuantityInput';
import { OptionsSelector } from './OptionsSelector';
import { PriceDisplay } from './PriceDisplay';
import { FileUploader } from './FileUploader';
import { useNoboriPrice } from '@/hooks/useNoboriPrice';
import { useShopify } from '@/hooks/useShopify';
import type { NoboriSpecs } from '@/types/nobori.types';

export function NoboriEstimator() {
  const [step, setStep] = useState(1); // 1: 仕様, 2: ファイル, 3: 確認
  
  const [specs, setSpecs] = useState<NoboriSpecs>({
    size: 'standard',
    fabric: 'polyester',
    printMethod: 'full_color',
    quantity: 1,
    options: [],
  });
  
  const [files, setFiles] = useState<string[]>([]);
  
  const price = useNoboriPrice(specs);
  const { addToCart } = useShopify();
  
  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };
  
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };
  
  const handleSubmit = async () => {
    try {
      // カスタム属性を準備
      const customAttributes = [
        { key: 'サイズ', value: specs.size },
        { key: '生地', value: specs.fabric },
        { key: '印刷方法', value: specs.printMethod },
        { key: '数量', value: specs.quantity.toString() },
        { key: 'オプション', value: specs.options.join(', ') },
        { key: 'ファイル', value: files.join(', ') || '後日入稿' },
        { key: '見積金額', value: price.totalPrice.toString() },
      ];
      
      // Shopifyカートに追加
      const checkoutUrl = await addToCart(
        'gid://shopify/ProductVariant/xxxxx', // バリアントID
        1,
        customAttributes
      );
      
      // チェックアウトページへ遷移
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('注文の追加に失敗しました');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            のぼり製作 お見積もり
          </h1>
        </div>
      </header>
      
      {/* ステップインジケーター */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  font-bold transition-all
                  ${step >= s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {s}
              </div>
              {s < 3 && (
                <div className="w-24 h-1 bg-gray-200 mx-2" />
              )}
            </div>
          ))}
        </div>
        
        {/* メインコンテンツ */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左側: 入力フォーム */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: 仕様選択 */}
            {step === 1 && (
              <>
                <SizeSelector
                  value={specs.size}
                  onChange={(size) => setSpecs({ ...specs, size })}
                />
                
                <FabricSelector
                  value={specs.fabric}
                  onChange={(fabric) => setSpecs({ ...specs, fabric })}
                />
                
                <QuantityInput
                  value={specs.quantity}
                  onChange={(quantity) => setSpecs({ ...specs, quantity })}
                />
                
                <OptionsSelector
                  value={specs.options}
                  onChange={(options) => setSpecs({ ...specs, options })}
                />
                
                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                  >
                    次へ：デザインデータ →
                  </button>
                </div>
              </>
            )}
            
            {/* Step 2: ファイルアップロード */}
            {step === 2 && (
              <>
                <FileUploader
                  files={files}
                  onFilesChange={setFiles}
                />
                
                <div className="flex justify-between">
                  <button
                    onClick={handleBack}
                    className="px-8 py-3 text-gray-600 hover:text-gray-800"
                  >
                    ← 戻る
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                  >
                    次へ：確認 →
                  </button>
                </div>
              </>
            )}
            
            {/* Step 3: 確認 */}
            {step === 3 && (
              <>
                <div className="bg-white rounded-xl shadow p-6">
                  <h2 className="text-2xl font-bold mb-6">ご注文内容</h2>
                  
                  <dl className="space-y-4">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">サイズ</dt>
                      <dd className="font-semibold">{specs.size}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">生地</dt>
                      <dd className="font-semibold">{specs.fabric}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">数量</dt>
                      <dd className="font-semibold">{specs.quantity}枚</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">オプション</dt>
                      <dd className="font-semibold">
                        {specs.options.length > 0
                          ? specs.options.join(', ')
                          : 'なし'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">データ</dt>
                      <dd className="font-semibold">
                        {files.length > 0
                          ? `${files.length}ファイル`
                          : '後日入稿'}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={handleBack}
                    className="px-8 py-3 text-gray-600 hover:text-gray-800"
                  >
                    ← 戻る
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                  >
                    注文を確定する 🛒
                  </button>
                </div>
              </>
            )}
            
          </div>
          
          {/* 右側: 価格表示 */}
          <div className="lg:col-span-1">
            <PriceDisplay price={price} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 子コンポーネント

```typescript
// src/components/SizeSelector.tsx

import { SIZES, type SizeId } from '@/utils/constants';

interface Props {
  value: SizeId;
  onChange: (size: SizeId) => void;
}

export function SizeSelector({ value, onChange }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">サイズを選択</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(SIZES).map(([id, size]) => (
          <button
            key={id}
            onClick={() => onChange(id as SizeId)}
            className={`
              p-6 rounded-lg border-2 text-left transition-all
              ${value === id
                ? 'border-blue-600 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-blue-300'
              }
            `}
          >
            <div className="font-bold text-lg mb-2">{size.displayName}</div>
            <div className="text-sm text-gray-600 mb-3">{size.description}</div>
            <div className="text-blue-600 font-bold text-xl">
              ¥{size.basePrice.toLocaleString()}〜
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

```typescript
// src/components/FabricSelector.tsx

import { FABRICS, type FabricId } from '@/utils/constants';

interface Props {
  value: FabricId;
  onChange: (fabric: FabricId) => void;
}

export function FabricSelector({ value, onChange }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">生地を選択</h2>
      
      <div className="space-y-3">
        {Object.entries(FABRICS).map(([id, fabric]) => (
          <label
            key={id}
            className={`
              flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all
              ${value === id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
              }
            `}
          >
            <input
              type="radio"
              name="fabric"
              checked={value === id}
              onChange={() => onChange(id as FabricId)}
              className="mt-1 mr-4"
            />
            
            <div className="flex-1">
              <div className="font-bold text-lg mb-1">{fabric.displayName}</div>
              <div className="text-sm text-gray-600 mb-2">{fabric.description}</div>
              <div className="flex flex-wrap gap-2">
                {fabric.features.map((feature) => (
                  <span key={feature} className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            
            {fabric.multiplier > 1.0 && (
              <div className="text-orange-600 font-bold">
                +{Math.round((fabric.multiplier - 1) * 100)}%
              </div>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
```

```typescript
// src/components/QuantityInput.tsx

import { QUANTITY_DISCOUNTS } from '@/utils/constants';

interface Props {
  value: number;
  onChange: (quantity: number) => void;
}

export function QuantityInput({ value, onChange }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">数量</h2>
      
      {/* クイック選択 */}
      <div className="flex flex-wrap gap-3 mb-4">
        {[1, 10, 30, 50, 100].map((qty) => (
          <button
            key={qty}
            onClick={() => onChange(qty)}
            className="px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-blue-400"
          >
            {qty}枚
          </button>
        ))}
      </div>
      
      {/* 数値入力 */}
      <input
        type="number"
        min="1"
        max="10000"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 1)}
        className="w-full border-2 rounded-lg px-4 py-3 text-lg"
      />
      
      {/* 数量割引案内 */}
      <div className="mt-4 bg-yellow-50 rounded-lg p-4">
        <div className="font-bold mb-2">🎉 数量割引</div>
        <div className="text-sm text-gray-700 space-y-1">
          {QUANTITY_DISCOUNTS.map((d) => (
            <div key={d.min}>
              {d.min}〜{d.max === Infinity ? '' : d.max}枚: {d.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

```typescript
// src/components/PriceDisplay.tsx

import type { PriceBreakdown } from '@/types/nobori.types';

interface Props {
  price: PriceBreakdown;
}

export function PriceDisplay({ price }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6 sticky top-4">
      <h3 className="text-xl font-bold mb-4">お見積もり</h3>
      
      {/* 内訳 */}
      <div className="space-y-3 mb-4 pb-4 border-b">
        <div className="flex justify-between text-sm">
          <span>基本料金</span>
          <span>¥{price.basePrice.toLocaleString()}</span>
        </div>
        
        {price.fabricCost > 0 && (
          <div className="flex justify-between text-sm">
            <span>生地追加</span>
            <span>¥{price.fabricCost.toLocaleString()}</span>
          </div>
        )}
        
        {price.optionsCost > 0 && (
          <div className="flex justify-between text-sm">
            <span>オプション</span>
            <span>¥{price.optionsCost.toLocaleString()}</span>
          </div>
        )}
        
        {price.discount > 0 && (
          <div className="flex justify-between text-sm text-red-600 font-semibold">
            <span>数量割引 ({price.discountLabel})</span>
            <span>-¥{price.discount.toLocaleString()}</span>
          </div>
        )}
      </div>
      
      {/* 合計 */}
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-1">合計金額（税込）</div>
        <div className="text-4xl font-bold text-blue-600 mb-2">
          ¥{price.totalPrice.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">
          1枚あたり ¥{price.unitPrice.toLocaleString()}
        </div>
      </div>
      
      {/* 納期 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm font-semibold mb-1">📅 お届け予定</div>
        <div className="text-lg font-bold text-gray-800">
          ご注文から7〜10営業日
        </div>
      </div>
    </div>
  );
}
```

---

### カスタムフック

```typescript
// src/hooks/useNoboriPrice.ts

import { useMemo } from 'react';
import { calculateNoboriPrice } from '@/utils/priceCalculator';
import type { NoboriSpecs, PriceBreakdown } from '@/types/nobori.types';

export function useNoboriPrice(specs: NoboriSpecs): PriceBreakdown {
  return useMemo(() => {
    return calculateNoboriPrice(specs);
  }, [specs.size, specs.fabric, specs.printMethod, specs.quantity, specs.options]);
}
```

```typescript
// src/hooks/useShopify.ts

import { useState } from 'react';
import axios from 'axios';

const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN;
const STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

const shopifyClient = axios.create({
  baseURL: `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`,
  headers: {
    'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    'Content-Type': 'application/json',
  },
});

export function useShopify() {
  const [cartId, setCartId] = useState<string | null>(
    localStorage.getItem('shopify_cart_id')
  );
  
  const addToCart = async (
    variantId: string,
    quantity: number,
    customAttributes: Array<{ key: string; value: string }>
  ): Promise<string> => {
    try {
      let checkoutUrl: string;
      
      if (!cartId) {
        // カート作成
        const createMutation = `
          mutation {
            cartCreate(input: {
              lines: [{
                merchandiseId: "${variantId}"
                quantity: ${quantity}
                attributes: ${JSON.stringify(customAttributes).replace(/"/g, '\\"')}
              }]
            }) {
              cart {
                id
                checkoutUrl
              }
            }
          }
        `;
        
        const { data } = await shopifyClient.post('', { query: createMutation });
        const newCartId = data.data.cartCreate.cart.id;
        checkoutUrl = data.data.cartCreate.cart.checkoutUrl;
        
        setCartId(newCartId);
        localStorage.setItem('shopify_cart_id', newCartId);
      } else {
        // 既存カートに追加
        const addMutation = `
          mutation {
            cartLinesAdd(
              cartId: "${cartId}"
              lines: [{
                merchandiseId: "${variantId}"
                quantity: ${quantity}
                attributes: ${JSON.stringify(customAttributes).replace(/"/g, '\\"')}
              }]
            ) {
              cart {
                checkoutUrl
              }
            }
          }
        `;
        
        const { data } = await shopifyClient.post('', { query: addMutation });
        checkoutUrl = data.data.cartLinesAdd.cart.checkoutUrl;
      }
      
      return checkoutUrl;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };
  
  return { addToCart };
}
```

---

残り2つのドキュメントを作成します！

---

## 4. Shopify連携・設定

<canvas>
<title>04-shopify-integration.md</title>
<content># Shopify連携・設定

## 🏪 Shopify初期設定

### 1. Shopifyストア作成

```bash
1. https://www.shopify.com/jp にアクセス
2. 無料トライアルを開始
3. ストア情報入力
   - ストア名: nobori-shop（任意）
   - 業種: 印刷・出版
4. ストアURL: your-store.myshopify.com
```

j1qi5x-bq.myshopify.com


---

### 2. アプリ・API設定

```
Shopify Admin → 設定 → アプリと販売チャネル
→ アプリ開発 → アプリを作成

【アプリ情報】
アプリ名: Nobori Estimator
アプリURL: http://localhost:5173 (開発時)
        → https://your-app.vercel.app (本番)

【API権限】
必要なスコープ:
✅ read_products
✅ write_products
✅ read_orders
✅ write_orders
✅ read_inventory
✅ write_inventory
✅ unauthenticated_read_product_listings
✅ unauthenticated_write_checkouts

【APIキー取得】
1. API credentials タブ
2. Admin API access token: shpat_xxxxx（コピー）
3. Storefront API access token: xxxxx（コピー）
```
VITE_SHOPIFY_DOMAIN=j1qi5x-bq.myshopify.com
clientID: faa6f574454835042f0fd16c2423e769
clientSecret: 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

---

## 📦 商品登録

### テストモードでの商品設定

#### 商品1: のぼり（レギュラー60×180cm）

```
【基本情報】
タイトル: のぼり製作（レギュラー60×180cm）
説明: 
最も一般的なサイズののぼりです。
店舗前や道路沿いに最適です。

商品タイプ: のぼり
ベンダー: 自社

【価格とバリアント】
オプション名: 生地

バリアント1:
- 名前: ポンジ（標準）
- SKU: NOBORI-REG-POLY
- 価格: ¥2,000
- 在庫: 在庫を追跡しない

バリアント2:
- 名前: トロマット
- SKU: NOBORI-REG-TORO
- 価格: ¥2,600
- 在庫: 在庫を追跡しない

バリアント3:
- 名前: ツイル
- SKU: NOBORI-REG-TWILL
- 価格: ¥2,800
- 在庫: 在庫を追跡しない

【在庫設定】
☑️ 在庫を追跡しない
☑️ 在庫切れでも販売を続ける

【配送】
☐ 配送が必要な商品
重量: 0.1kg
```

---

#### 商品2: のぼり（スリム45×180cm）

```
【基本情報】
タイトル: のぼり製作（スリム45×180cm）
説明: 幅が狭く設置場所を選ばない省スペースタイプ

【バリアント】
- ポンジ: ¥1,800
- トロマット: ¥2,340
- ツイル: ¥2,520
```

---

#### 商品3: のぼり（ショート60×150cm）

```
【基本情報】
タイトル: のぼり製作（ショート60×150cm）
説明: 高さ控えめで風の影響を受けにくい

【バリアント】
- ポンジ: ¥1,700
- トロマット: ¥2,210
- ツイル: ¥2,380
```

---

#### 商品4: のぼり（ミニ45×150cm）

```
【基本情報】
タイトル: のぼり製作（ミニ45×150cm）
説明: コンパクトサイズ。店内・卓上用に最適

【バリアント】
- ポンジ: ¥1,500
- トロマット: ¥1,950
- ツイル: ¥2,100
```

---

### Metafields（カスタムフィールド）設定

```
設定 → カスタムデータ → Metafields → 定義を追加

【メタフィールド1: サイズ幅】
Namespace: nobori
Key: size_width
Type: 整数
説明: のぼりの幅（cm）

商品に値を設定:
- レギュラー: 60
- スリム: 45
- ショート: 60
- ミニ: 45

【メタフィールド2: サイズ高さ】
Namespace: nobori
Key: size_height
Type: 整数
説明: のぼりの高さ（cm）

商品に値を設定:
- レギュラー: 180
- スリム: 180
- ショート: 150
- ミニ: 150

【メタフィールド3: 利用可能オプション】
Namespace: nobori
Key: available_options
Type: JSON
説明: 選択可能なオプション加工

値:
["pole_pocket", "chichi", "heat_cut", "waterproof"]
```

---

## 🔌 Storefront API連携

### GraphQLクエリ例

#### 商品一覧取得

```graphql
query GetNoboriProducts {
  products(first: 10, query: "product_type:のぼり") {
    edges {
      node {
        id
        title
        description
        handle
        productType
        
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        
        variants(first: 10) {
          edges {
            node {
              id
              title
              price {
                amount
              }
              sku
            }
          }
        }
        
        metafields(identifiers: [
          {namespace: "nobori", key: "size_width"}
          {namespace: "nobori", key: "size_height"}
          {namespace: "nobori", key: "available_options"}
        ]) {
          namespace
          key
          value
        }
      }
    }
  }
}
```

---

#### カート作成

```graphql
mutation CreateCart($lines: [CartLineInput!]!, $attributes: [AttributeInput!]) {
  cartCreate(
    input: {
      lines: $lines
      attributes: $attributes
    }
  ) {
    cart {
      id
      checkoutUrl
      lines(first: 10) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                product {
                  title
                }
              }
            }
            attributes {
              key
              value
            }
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

**Variables:**

```json
{
  "lines": [
    {
      "merchandiseId": "gid://shopify/ProductVariant/44444444444444",
      "quantity": 1,
      "attributes": [
        { "key": "サイズ", "value": "レギュラー60×180cm" },
        { "key": "生地", "value": "ポンジ（標準）" },
        { "key": "印刷方法", "value": "フルカラー印刷" },
        { "key": "数量", "value": "10" },
        { "key": "オプション", "value": "棒袋加工, チチ加工" },
        { "key": "ファイル", "value": "https://storage.example.com/file.pdf" },
        { "key": "見積金額", "value": "20700" }
      ]
    }
  ],
  "attributes": [
    { "key": "注文タイプ", "value": "のぼり製作" }
  ]
}
```

---

#### カートに商品追加

```graphql
mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(
    cartId: $cartId
    lines: $lines
  ) {
    cart {
      id
      checkoutUrl
    }
    userErrors {
      field
      message
    }
  }
}
```

---

## 💳 決済設定

### テストモード有効化

```
設定 → 決済

【テストモード】
☑️ Shopify Paymentsのテストモードを有効にする

【テスト用カード情報】
カード番号: 4242 4242 4242 4242
有効期限: 任意の未来日（例: 12/25）
CVC: 任意の3桁（例: 123）
郵便番号: 任意

【決済方法】
☑️ Shopify Payments
☑️ コンビニ決済（Komoju）
☑️ 銀行振込
```

---

### 本番決済への切り替え

```
1. Shopify Paymentsの申請
   → 事業者情報入力
   → 審査（数日）
   
2. 審査完了後
   設定 → 決済
   → テストモードを無効化
   
3. 本番カードでテスト注文
```

---

## 📧 通知設定

### メール通知

```
設定 → 通知

【顧客向け通知】
☑️ 注文確認
☑️ 発送通知
☑️ 配達完了

【スタッフ向け通知】
☑️ 新規注文
   → メールアドレス: shop@example.com
   
☑️ 在庫切れアラート
   → 閾値: 10m
```

---

### Slackウェブフック（オプション）

```
1. Slackアプリを作成
   https://api.slack.com/apps
   
2. Incoming Webhooksを有効化

3. Shopify Admin → アプリ → Slack
   → Webhook URLを設定

4. 通知イベント選択
   - 新規注文
   - 決済完了
   - 在庫アラート
```

---

## 🔄 Webhook設定

### 注文作成時のWebhook

```
設定 → 通知 → Webhooks

【Webhook作成】
イベント: orders/create
形式: JSON
URL: https://your-backend.example.com/webhooks/order-created

【ペイロード例】
{
  "id": 5678901234,
  "order_number": 1001,
  "customer": {
    "email": "customer@example.com"
  },
  "line_items": [
    {
      "title": "のぼり製作（レギュラー60×180cm）",
      "variant_title": "ポンジ（標準）",
      "quantity": 1,
      "properties": [
        { "name": "サイズ", "value": "レギュラー60×180cm" },
        { "name": "数量", "value": "10" },
        { "name": "見積金額", "value": "20700" }
      ]
    }
  ],
  "total_price": "20700"
}
```

---

## 🧪 テストシナリオ

### 1. 商品取得テスト

```typescript
// テストコード
import { shopifyClient } from './shopifyClient';

const query = `
  query {
    products(first: 1, query: "のぼり") {
      edges {
        node {
          title
          variants(first: 3) {
            edges {
              node {
                title
                price { amount }
              }
            }
          }
        }
      }
    }
  }
`;

const response = await shopifyClient.post('', { query });
console.log(response.data);

// 期待される結果
// {
//   data: {
//     products: {
//       edges: [{
//         node: {
//           title: "のぼり製作（レギュラー60×180cm）",
//           variants: {
//             edges: [
//               { node: { title: "ポンジ（標準）", price: { amount: "2000" } } },
//               { node: { title: "トロマット", price: { amount: "2600" } } },
//               { node: { title: "ツイル", price: { amount: "2800" } } }
//             ]
//           }
//         }
//       }]
//     }
//   }
// }
```

---

### 2. カート作成テスト

```typescript
const createCartMutation = `
  mutation {
    cartCreate(input: {
      lines: [{
        merchandiseId: "gid://shopify/ProductVariant/44444444444444"
        quantity: 1
        attributes: [
          {key: "サイズ", value: "レギュラー60×180cm"}
          {key: "数量", value: "10"}
        ]
      }]
    }) {
      cart {
        id
        checkoutUrl
      }
    }
  }
`;

const response = await shopifyClient.post('', { query: createCartMutation });
const checkoutUrl = response.data.data.cartCreate.cart.checkoutUrl;

// チェックアウトURLに遷移
window.location.href = checkoutUrl;
```

---

### 3. 注文フロー統合テスト

```
【シナリオ】
1. フロントエンドでのぼり仕様選択
2. 価格計算（¥20,700）
3. カートに追加
4. Shopifyチェックアウトへ遷移
5. テストカードで決済
6. 注文完了

【確認項目】
✅ カスタム属性が正しく保存されている
✅ 金額が見積もりと一致
✅ Shopify Adminに注文が表示される
✅ 顧客にメール通知が送信される
```

---

## 🔐 環境変数管理

### 開発環境（.env）

```bash
# Shopify設定
VITE_SHOPIFY_DOMAIN=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=xxxxxxxxxxxxx

# 本番では使用しない
VITE_DEV_MODE=true
```

### 本番環境（Vercel）

```bash
# Vercel環境変数
VITE_SHOPIFY_DOMAIN=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=production_token_xxxxx

# 本番モード
VITE_DEV_MODE=false
```

---

## ⚠️ トラブルシューティング

### 商品が取得できない

```
原因: Storefront APIトークンが間違っている
解決: 
1. Shopify Admin → アプリ → API credentials
2. Storefront API access token を再確認
3. .env ファイルを更新
4. 開発サーバー再起動
```

---

### カート作成エラー

```
原因: バリアントIDが正しくない
解決:
1. GraphQLクエリで商品・バリアントIDを取得
2. フォーマットを確認
   正: gid://shopify/ProductVariant/44444444444444
   誤: 44444444444444
```

---

### CORS エラー

```
原因: Shopify側でオリジンが許可されていない
解決:
1. Shopify Admin → アプリ → アプリURL設定
2. 許可するオリジンを追加
   - http://localhost:5173 (開発)
   - https://your-app.vercel.app (本番)
```
</content>
</canvas>

---

## 5. 運用・事業所管理

<canvas>
<title>05-operations.md</title>
<content># 運用・事業所管理

## 🏢 事業所側の日次業務フロー

### 朝のルーティン（9:00）

```
1. Shopify Adminにログイン
   https://your-store.myshopify.com/admin

2. 新規注文確認
   注文 → フィルター: 「未決済」「処理待ち」
   
3. 注文詳細チェック
   各注文をクリックして確認:
   - 顧客情報
   - のぼり仕様（カスタム属性）
   - アップロードファイル
   - 見積金額
   
4. タグ付け
   注文ごとにタグを追加:
   - 「新規注文」
   - 「データ確認待ち」
   - 「緊急」（特急の場合）
```

---

### 注文処理（午前中）

```
【ステップ1: データ確認】

1. カスタム属性を確認
   サイズ: レギュラー60×180cm
   生地: ポンジ（標準）
   数量: 10枚
   オプション: 棒袋加工, チチ加工
   ファイル: https://storage.example.com/design.pdf
   
2. ファイルダウンロード
   URLをクリックしてデザインファイルをDL
   
3. デザイン確認
   ✅ サイズが正しい
   ✅ 塗り足し3mmあり
   ✅ 文字がアウトライン化済み
   ✅ 解像度350dpi以上
   
4. 問題があれば顧客に連絡
   注文メモに記録:
   「2025-01-10 10:30 - 顧客にデザイン修正依頼送信」
   
   タグ変更: 「データ確認待ち」→「修正依頼中」

【ステップ2: 製造手配】

1. 在庫確認
   商品 → 在庫
   ポンジ生地: 50m → OK（必要: 約20m）
   
2. 印刷工場へ送信
   - デザインファイル
   - 仕様書（サイズ、生地、数量、オプション）
   - 納期（注文から7営業日）
   
3. 注文メモに記録
   「2025-01-10 11:00 - 印刷工場へ送信完了」
   「製造開始予定: 2025-01-11」
   「完成予定: 2025-01-15」
   
4. ステータス更新
   処理待ち → 処理中
   
5. タグ変更
   「新規注文」→「製造中」
   
6. 顧客に進捗メール送信
   件名: 【のぼり製作】製造を開始しました
   本文:
   いつもありがとうございます。
   ご注文いただいたのぼりの製造を開始いたしました。
   
   完成予定日: 2025年1月15日
   発送予定日: 2025年1月16日
   
   進捗は随時ご連絡いたします。
```

---

### 午後の業務

```
【在庫管理】

1. 在庫一覧確認
   商品 → 在庫
   
2. 在庫アラート確認
   ポンジ生地: 10m以下 → 発注必要
   
3. 発注メモ作成
   注文 → メモ追加
   「ポンジ生地 10m → 100m発注必要」
   「発注日: 2025-01-10」
   「到着予定: 2025-01-15」
   
4. サプライヤーに発注
   
5. 発注記録
   スプレッドシートまたは専用システムに記録:
   | 日付 | 商品 | 数量 | 金額 | サプライヤー | 到着予定 |
   | 01/10 | ポンジ生地 | 100m | ¥50,000 | 田中商事 | 01/15 |

【製造進捗確認】

1. 製造中タグの注文を確認
   
2. 印刷工場に進捗確認
   
3. 注文メモに記録
   「2025-01-10 14:00 - 工場確認: 順調に進行中」
   
4. 遅延がある場合
   - 顧客に連絡
   - 新しい納期を提示
   - タグ追加: 「遅延」
```

---

## 📦 出荷・発送フロー

### 製造完了時

```
1. 印刷工場から連絡受領
   「のぼり完成しました」
   
2. 検品
   - 印刷品質チェック
   - サイズチェック
   - オプション加工チェック
   
3. 注文メモ記録
   「2025-01-15 10:00 - 製造完了、検品OK」
   
4. タグ変更
   「製造中」→「製造完了」
   
5. ステータス更新
   処理中 → 発送準備
```

---

### 梱包・発送

```
1. 梱包作業
   - のぼりを丁寧に折りたたむ
   - ビニール袋に入れる
   - 段ボール箱に詰める
   
2. 配送ラベル作成
   Shopify Admin → 注文 → 配送ラベルを作成
   
   配送業者: ヤマト運輸
   サイズ: 120サイズ
   
3. 発送
   
4. 追跡番号入力
   Shopify Admin → フルフィルメント情報を更新
   追跡番号: 1234-5678-9012
   
5. ステータス自動更新
   発送準備 → 発送済み
   
6. 顧客に自動メール送信
   件名: 【のぼり製作】発送完了のお知らせ
   本文:
   ご注文いただいたのぼりを発送いたしました。
   
   追跡番号: 1234-5678-9012
   お届け予定: 2025年1月17日
   
   追跡URL: https://track.kuronekoyamato.co.jp/...
   
7. タグ変更
   「製造完了」→「発送済み」
```

---

## 📊 在庫管理詳細

### 生地在庫の管理

```
【在庫追跡】

Shopify Admin → 商品 → 在庫

ポンジ生地:
- 現在庫: 50m
- 消費予測: 30m/週
- 発注点: 10m
- 発注量: 100m

トロマット生地:
- 現在庫: 30m
- 消費予測: 5m/週
- 発注点: 10m
- 発注量: 50m

ツイル生地:
- 現在庫: 20m
- 消費予測: 2m/週
- 発注点: 5m
- 発注量: 30m
```

---

### 在庫調整オペレーション

```
【入荷時】

1. 生地が到着
   
2. 検品
   - 数量確認
   - 品質確認
   
3. Shopify在庫更新
   商品 → 在庫 → 調整
   ポンジ生地: +100m
   
4. メモ記録
   「2025-01-15 入荷完了 100m」

【製造時の自動減算】

1. 注文確定
   レギュラーサイズ（60×180cm）× 10枚
   
2. 必要生地計算
   1枚あたり約2m（余裕を持って）
   10枚 = 20m
   
3. 在庫減算
   手動または自動（設定次第）
   ポンジ生地: 50m → 30m
   
4. アラート確認
   30m > 10m（発注点）→ まだOK
```

---

### 在庫アラート設定

```
Shopify Admin → 商品 → 在庫

【アラート設定】
1. ポンジ生地の設定を開く
2. 在庫ポリシー → 在庫が少ない場合に通知
3. 閾値: 10
4. 通知先: shop@example.com

【アラート受信時】
件名: 在庫アラート: ポンジ生地
本文: 
ポンジ生地の在庫が10m以下になりました。
発注をお願いします。

→ 速やかに発注手配
```

---

## 🏷️ タグ管理システム

### タグ一覧と使い方

```
【製造状況タグ】
🆕 新規注文 - 注文受付直後
🔍 データ確認待ち - 顧客からのファイル待ち
📝 修正依頼中 - デザイン修正依頼済み
✅ 製造準備OK - データ確認完了
🏭 製造中 - 印刷工場で製造中
📦 製造完了 - 検品完了、発送準備
🚚 発送済み - 配送中
✔️ 配達完了 - 完了

【優先度タグ】
🔴 緊急 - 特急対応
🟡 急ぎ - 通常より早め
🟢 通常 - 標準納期

【問題タグ】
⚠️ 遅延 - 納期遅延あり
❌ 問題あり - 何らかの問題
💬 顧客対応中 - 顧客とやり取り中

【その他】
🎁 初回注文 - 新規顧客
🔄 リピート - リピート顧客
💰 大口 - 100枚以上
```

---

### タグの活用例

```
【ケース1: 通常注文】
受注 → 🆕新規注文
データ確認 → ✅製造準備OK
製造開始 → 🏭製造中
完成 → 📦製造完了
発送 → 🚚発送済み
到着 → ✔️配達完了

【ケース2: データ待ち】
受注 → 🆕新規注文
ファイルなし → 🔍データ確認待ち
データ受領 → ✅製造準備OK
（以下同じ）

【ケース3: 特急対応】
受注 → 🆕新規注文 + 🔴緊急
即日製造 → 🏭製造中 + 🔴緊急
優先発送 → 🚚発送済み
```

---

## 📈 レポート・分析

### 週次レポート（毎週月曜）

```
Shopify Admin → 分析

【確認項目】
1. 売上
   - 先週の総売上
   - 注文件数
   - 平均注文額
   
2. 人気商品
   - 最も売れたサイズ
   - 最も選ばれた生地
   - 人気のオプション
   
3. 在庫状況
   - 生地残量
   - 発注が必要なもの
   
4. 納期遵守率
   - 予定通り発送できた割合
   - 遅延件数と原因

【レポート作成】
スプレッドシートにまとめる:
| 週 | 売上 | 件数 | 平均単価 | 納期遵守率 |
| 01/06-01/12 | ¥250,000 | 12 | ¥20,833 | 100% |
```

---

### 月次レポート（毎月1日）

```
1. 月間売上集計
2. 顧客分析
   - 新規 vs リピート
   - 地域別売上
3. 原価計算
   - 生地コスト
   - 印刷コスト
   - 配送コスト
4. 利益率算出
5. 次月の目標設定
```

---

## 🔄 定期メンテナンス

### 毎日

```
✅ 新規注文確認（朝）
✅ 在庫確認
✅ 製造進捗確認
✅ 顧客問い合わせ対応
```

### 毎週

```
✅ 週次レポート作成
✅ 在庫棚卸し
✅ サプライヤー連絡
✅ 顧客満足度確認
```

### 毎月

```
✅ 月次レポート作成
✅ 完全在庫棚卸し
✅ 設備点検
✅ 価格見直し検討
```

---

## 🆘 トラブル対応マニュアル

### ケース1: デザインデータに問題

```
問題: 解像度が低い、塗り足しがない

対応:
1. 注文メモに記録
   「データ問題: 解像度不足」
   
2. 顧客にメール
   件名: 【重要】デザインデータ修正のお願い
   
3. タグ: 「修正依頼中」

4. 修正データ受領後
   - 再確認
   - タグ: 「製造準備OK」
   - 製造開始
```

---

### ケース2: 在庫切れ

```
問題: 注文の生地在庫がない

対応:
1. 即座に発注
2. 顧客に連絡
   「申し訳ございません。生地の入荷待ちのため
    納期が3日遅れます」
3. 納期更新
4. タグ: 「遅延」
5. 入荷次第製造開始
```

---

### ケース3: 印刷ミス

```
問題: 印刷に不具合

対応:
1. すぐに再製造手配
2. 顧客に連絡
   「品質チェックで不具合を発見したため
    再製造いたします。費用は不要です」
3. 急ぎで再製造
4. 発送
5. 詫び状同梱
```

---

## 📞 顧客対応テンプレート

### 注文確認メール

```
件名: 【のぼり製作】ご注文ありがとうございます

○○様

この度は当店をご利用いただき誠にありがとうございます。
以下の内容でご注文を承りました。

■ご注文内容
注文番号: #1001
サイズ: レギュラー60×180cm
生地: ポンジ（標準）
数量: 10枚
オプション: 棒袋加工、チチ加工
合計金額: ¥20,700

■お届け予定日
2025年1月17日

製造開始次第、再度ご連絡いたします。

株式会社○○
のぼり製作担当
```

---

### 製造開始メール

```
件名: 【のぼり製作】製造を開始しました

○○様

ご注文いただいたのぼりの製造を開始いたしました。

完成予定: 2025年1月15日
発送予定: 2025年1月16日
お届け予定: 2025年1月17日

進捗は随時ご連絡いたします。
ご不明点がございましたらお気軽にお問い合わせください。
```

---

### 発送完了メール

```
件名: 【のぼり製作】発送完了のお知らせ

○○様

ご注文いただいたのぼりを発送いたしました。

追跡番号: 1234-5678-9012
配送業者: ヤマト運輸
お届け予定: 2025年1月17日

追跡URL: https://track.kuronekoyamato.co.jp/...

商品到着まで今しばらくお待ちください。
```

---