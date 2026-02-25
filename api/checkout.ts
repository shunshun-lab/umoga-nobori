
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Display name maps (inlined to avoid importing from src/ which Vercel Functions can't resolve)
const SIZE_NAMES: Record<string, string> = {
    standard: '60×180cm（レギュラー）',
    slim: '45×180cm（スリム）',
    short: '60×150cm（ショート）',
    mini: '45×150cm（ミニ）',
};
const FABRIC_NAMES: Record<string, string> = {
    polyester: 'ポンジ（標準）',
    tropical: 'トロピカル',
};
const PRINT_METHOD_NAMES: Record<string, string> = {
    full_color: 'フルカラー印刷',
    single_color: '単色印刷',
};
const OPTION_NAMES: Record<string, string> = {
    pole_pocket: '棒袋加工',
    chichi: 'チチ加工',
    heat_cut: 'ヒートカット',
    reinforcement: '両面遮光材',
    waterproof: '防水加工',
};

// Environment variables
const SHOPIFY_SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-01';
const VARIANT_ID = process.env.VITE_SHOPIFY_NOBORI_VARIANT_ID?.trim();

interface CartItem {
    id: string;
    specs: {
        size: string;
        customDimensions?: { width: number; height: number };
        fabric: string;
        printMethod: string;
        quantity: number;
        options: string[];
        segments?: number;
        orderName?: string;
        designDataMethod: 'self' | 'request';
        designRequestDetails?: string;
    };
    price: {
        unitPrice: number;
        totalPrice: number;
        designFee: number;
    };
}

interface DeliveryInfo {
    name: string;
    phone: string;
    email: string;
}

const DRAFT_ORDER_CREATE = `
mutation DraftOrderCreate($input: DraftOrderInput!) {
  draftOrderCreate(input: $input) {
    draftOrder {
      id
      invoiceUrl
      status
    }
    userErrors {
      field
      message
    }
  }
}
`;

const DRAFT_ORDER_READY_QUERY = `
query DraftOrderReady($id: ID!) {
  node(id: $id) {
    ... on DraftOrder {
      id
      ready
      invoiceUrl
    }
  }
}
`;

async function shopifyGraphQL(query: string, variables: Record<string, unknown>) {
    const url = `https://${SHOPIFY_SHOP_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
    const response = await axios.post(url, { query, variables }, {
        headers: {
            'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN!,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
}

function resolveSizeName(specs: CartItem['specs']): string {
    if (specs.size === 'custom') {
        return `カスタム ${specs.customDimensions?.width}×${specs.customDimensions?.height}cm`;
    }
    return SIZE_NAMES[specs.size] ?? specs.size;
}

function resolveFabricName(fabricId: string): string {
    return FABRIC_NAMES[fabricId] ?? fabricId;
}

function resolvePrintMethodName(printMethodId: string): string {
    return PRINT_METHOD_NAMES[printMethodId] ?? printMethodId;
}

function resolveOptionNames(optionIds: string[]): string {
    if (optionIds.length === 0) return 'なし';
    return optionIds
        .map(oid => OPTION_NAMES[oid] ?? oid)
        .join(', ');
}

function buildCustomAttributes(specs: CartItem['specs'], index: number, total: number) {
    const attrs = [
        { key: 'サイズ', value: resolveSizeName(specs) },
        { key: '生地', value: resolveFabricName(specs.fabric) },
        { key: '印刷方法', value: resolvePrintMethodName(specs.printMethod) },
        { key: '数量', value: `${specs.quantity}枚` },
        { key: 'オプション', value: resolveOptionNames(specs.options) },
        { key: 'デザイン区分', value: specs.designDataMethod === 'self' ? '完全データ入稿' : 'デザイン制作依頼' },
        { key: '_商品番号', value: `${index + 1}/${total}` },
    ];
    if (specs.orderName) {
        attrs.push({ key: '注文名', value: specs.orderName });
    }
    if (specs.designRequestDetails) {
        // Shopify attribute value max 255 chars
        const truncated = specs.designRequestDetails.substring(0, 255);
        attrs.push({ key: 'デザイン要望', value: truncated });
    }
    if (specs.segments && specs.segments > 1) {
        attrs.push({ key: '分割数', value: `${specs.segments}分割` });
    }
    return attrs;
}

async function waitForReady(draftOrderId: string, invoiceUrl: string): Promise<string> {
    const MAX_POLLS = 5;
    const POLL_INTERVAL_MS = 500;

    for (let i = 0; i < MAX_POLLS; i++) {
        const result = await shopifyGraphQL(DRAFT_ORDER_READY_QUERY, { id: draftOrderId });
        const node = result.data?.node;
        if (node?.ready) {
            return node.invoiceUrl || invoiceUrl;
        }
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
    }
    // Timeout — return the original invoiceUrl anyway
    console.warn('Draft order ready polling timed out, returning invoiceUrl as-is');
    return invoiceUrl;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!SHOPIFY_SHOP_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
        console.warn('Missing Shopify credentials');
        return res.status(500).json({ error: 'Shopify credentials not configured.' });
    }

    if (!VARIANT_ID) {
        console.warn('Missing VITE_SHOPIFY_NOBORI_VARIANT_ID');
        return res.status(500).json({ error: 'Variant ID not configured.' });
    }

    try {
        const { cart, deliveryInfo, deliveryMode, surcharge } = req.body as {
            cart: CartItem[];
            deliveryInfo: DeliveryInfo;
            deliveryMode: 'standard' | 'rush';
            surcharge: number;
        };

        // Build line items from cart
        const lineItems: any[] = cart.map((item, index) => ({
            variantId: VARIANT_ID,
            quantity: item.specs.quantity,
            priceOverride: {
                amount: String(item.price.unitPrice),
                currencyCode: 'JPY',
            },
            customAttributes: buildCustomAttributes(item.specs, index, cart.length),
        }));

        // Add rush surcharge as a separate custom line item
        if (surcharge > 0) {
            lineItems.push({
                title: 'お急ぎ便手数料',
                quantity: 1,
                requiresShipping: false,
                priceOverride: {
                    amount: String(surcharge),
                    currencyCode: 'JPY',
                },
                customAttributes: [
                    { key: '種別', value: 'お急ぎ便手数料' },
                ],
            });
        }

        // Build draft order input
        const input: Record<string, unknown> = {
            lineItems,
            presentmentCurrencyCode: 'JPY',
            tags: ['nobori-app', deliveryMode],
        };

        // Attach customer contact info
        if (deliveryInfo) {
            input.note = [
                `お名前: ${deliveryInfo.name}`,
                `電話番号: ${deliveryInfo.phone}`,
                `メール: ${deliveryInfo.email}`,
            ].join('\n');
            input.email = deliveryInfo.email;
            // Shopify requires E.164 phone format — only set if it looks like a real phone number
            const cleanPhone = deliveryInfo.phone.replace(/[-\s()]/g, '');
            if (/^\+?\d{10,15}$/.test(cleanPhone)) {
                input.phone = cleanPhone.startsWith('+') ? cleanPhone : `+81${cleanPhone.replace(/^0/, '')}`;
            }
        }

        console.log('Creating draft order with input:', JSON.stringify(input, null, 2));

        const result = await shopifyGraphQL(DRAFT_ORDER_CREATE, { input });

        const draftOrder = result.data?.draftOrderCreate?.draftOrder;
        const userErrors = result.data?.draftOrderCreate?.userErrors;

        if (userErrors && userErrors.length > 0) {
            console.error('Draft order user errors:', userErrors);
            return res.status(400).json({
                error: 'Failed to create draft order',
                details: userErrors,
            });
        }

        if (!draftOrder) {
            console.error('No draft order returned. Full response:', JSON.stringify(result, null, 2));
            return res.status(500).json({ error: 'No draft order returned from Shopify' });
        }

        // Wait for draft order to be ready
        const invoiceUrl = await waitForReady(draftOrder.id, draftOrder.invoiceUrl);

        console.log('Draft order created:', draftOrder.id, '→', invoiceUrl);
        return res.status(200).json({ invoiceUrl });

    } catch (error: any) {
        console.error('Shopify API Error:', error.response?.data || error.message);
        return res.status(500).json({
            error: 'Failed to create checkout',
            details: error.response?.data,
        });
    }
}
