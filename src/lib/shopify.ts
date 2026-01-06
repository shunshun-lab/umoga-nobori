// Tokenless Shopify Storefront API クライアント
// トークン不要！ドメイン名だけで動作します

function getShopifyDomain(): string {
  // ブラウザ環境
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_SHOPIFY_DOMAIN || '';
  }
  // Node.js環境
  return '';
}

const API_VERSION = '2024-10';

interface ShopifyError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: string[];
}

interface ShopifyResponse<T> {
  data: T;
  errors?: ShopifyError[];
}

/**
 * Shopify Storefront APIへのリクエスト（Tokenless）
 *
 * @param query GraphQLクエリ
 * @param variables GraphQL変数
 * @returns APIレスポンスのdataフィールド
 */
export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T> {
  const SHOPIFY_DOMAIN = getShopifyDomain();

  if (!SHOPIFY_DOMAIN) {
    throw new Error(
      'VITE_SHOPIFY_DOMAIN が設定されていません。.env ファイルを確認してください。'
    );
  }

  const endpoint = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Tokenless: トークン不要！これだけでOK
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Shopify API error: ${response.status} ${response.statusText}`
      );
    }

    const json: ShopifyResponse<T> = await response.json();

    if (json.errors && json.errors.length > 0) {
      console.error('GraphQL Errors:', json.errors);
      throw new Error(
        `GraphQL Error: ${json.errors[0].message}`
      );
    }

    return json.data;
  } catch (error) {
    console.error('Shopify fetch error:', error);
    throw error;
  }
}

/**
 * ストア情報を取得
 */
export async function getShopInfo() {
  const query = `
    {
      shop {
        name
        description
      }
    }
  `;

  return shopifyFetch<{ shop: { name: string; description: string | null } }>(
    query
  );
}

/**
 * 商品一覧を取得
 */
export async function getProducts(limit: number = 10) {
  const query = `
    query GetProducts($limit: Int!) {
      products(first: $limit) {
        edges {
          node {
            id
            title
            description
            handle
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
                    currencyCode
                  }
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  `;

  return shopifyFetch<{
    products: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          description: string;
          handle: string;
          priceRange: {
            minVariantPrice: {
              amount: string;
              currencyCode: string;
            };
          };
          variants: {
            edges: Array<{
              node: {
                id: string;
                title: string;
                price: {
                  amount: string;
                  currencyCode: string;
                };
                availableForSale: boolean;
              };
            }>;
          };
        };
      }>;
    };
  }>(query, { limit });
}

/**
 * カートを作成
 */
export async function createCart(
  merchandiseId: string,
  quantity: number,
  attributes: Array<{ key: string; value: string }> = []
) {
  const mutation = `
    mutation CreateCart($input: CartInput!) {
      cartCreate(input: $input) {
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
                  }
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
  `;

  const variables = {
    input: {
      lines: [
        {
          merchandiseId,
          quantity,
          attributes,
        },
      ],
    },
  };

  return shopifyFetch<{
    cartCreate: {
      cart: {
        id: string;
        checkoutUrl: string;
        lines: {
          edges: Array<{
            node: {
              id: string;
              quantity: number;
              merchandise: {
                id: string;
                title: string;
              };
            };
          }>;
        };
      };
      userErrors: Array<{
        field: string[];
        message: string;
      }>;
    };
  }>(mutation, variables);
}

/**
 * カートに商品を追加
 */
export async function addToCart(
  cartId: string,
  merchandiseId: string,
  quantity: number,
  attributes: Array<{ key: string; value: string }> = []
) {
  const mutation = `
    mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
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
  `;

  const variables = {
    cartId,
    lines: [
      {
        merchandiseId,
        quantity,
        attributes,
      },
    ],
  };

  return shopifyFetch<{
    cartLinesAdd: {
      cart: {
        id: string;
        checkoutUrl: string;
      };
      userErrors: Array<{
        field: string[];
        message: string;
      }>;
    };
  }>(mutation, variables);
}
