// Shopify接続テスト
// 実行方法: pnpm tsx test-shopify.ts

import { config } from 'dotenv';
config(); // .envを読み込み

// デバッグ用
console.log('環境変数チェック:', process.env.VITE_SHOPIFY_DOMAIN);

import { getShopInfo, getProducts } from './src/lib/shopify';

async function testShopifyConnection() {
  console.log('🧪 Shopify接続テスト開始...\n');

  try {
    // 1. ストア情報を取得
    console.log('1️⃣ ストア情報を取得中...');
    const shopInfo = await getShopInfo();
    console.log('✅ ストア名:', shopInfo.shop.name);
    if (shopInfo.shop.description) {
      console.log('   説明:', shopInfo.shop.description);
    }

    // 2. 商品一覧を取得
    console.log('\n2️⃣ 商品一覧を取得中...');
    const productsData = await getProducts(5);
    const products = productsData.products.edges;

    console.log(`✅ 商品数: ${products.length}件`);

    if (products.length === 0) {
      console.log('\n⚠️  商品が見つかりません。');
      console.log('   Shopify管理画面で商品を「オンラインストア」で公開してください。');
    } else {
      console.log('\n📦 商品一覧:');
      products.forEach((edge, index) => {
        const product = edge.node;
        console.log(`\n${index + 1}. ${product.title}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   価格: ¥${product.priceRange.minVariantPrice.amount}`);
        console.log(`   バリアント数: ${product.variants.edges.length}個`);

        // 最初のバリアントを表示
        if (product.variants.edges.length > 0) {
          const variant = product.variants.edges[0].node;
          console.log(`   バリアントID (コピーしてNoboriEstimator.tsxに貼り付け):`);
          console.log(`   ${variant.id}`);
        }
      });
    }

    console.log('\n\n🎉 テスト完了！Shopify連携が正常に動作しています！');
    console.log('\n次のステップ:');
    console.log('1. 上記のバリアントIDをコピー');
    console.log('2. src/components/NoboriEstimator.tsx を開く');
    console.log('3. handleSubmit関数内の "gid://shopify/ProductVariant/xxxxx" を実際のIDに置き換え');

  } catch (error: any) {
    console.error('\n❌ エラーが発生しました:');
    console.error(error.message);

    if (error.message.includes('VITE_SHOPIFY_DOMAIN')) {
      console.log('\n💡 解決方法:');
      console.log('1. .env ファイルを開く');
      console.log('2. VITE_SHOPIFY_DOMAIN を設定:');
      console.log('   VITE_SHOPIFY_DOMAIN=your-store.myshopify.com');
      console.log('3. 開発サーバーを再起動: pnpm dev');
    } else if (error.message.includes('fetch')) {
      console.log('\n💡 解決方法:');
      console.log('1. .env ファイルのドメイン名を確認');
      console.log('2. Shopifyストアが存在するか確認');
      console.log('3. インターネット接続を確認');
    }
  }
}

// テスト実行
testShopifyConnection();
