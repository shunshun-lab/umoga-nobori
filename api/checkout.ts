
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Environment variables
const SHOPIFY_SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = '2023-10';

interface CartItem {
    id: string;
    specs: any;
    price: {
        unitPrice: number;
        totalPrice: number;
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 1. Credentials Check
    if (!SHOPIFY_SHOP_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
        console.warn('Missing Shopify credentials');
        // For Dev/Demo: Return a mock success if no credentials set, or error.
        // Let's return error to prompt setup.
        return res.status(500).json({ error: 'Shopify credentials not configured.' });
    }

    try {
        const { cart, deliveryMode, surcharge } = req.body;

        // 2. Build Line Items
        const line_items = cart.map((item: CartItem) => {
            // Construct detailed properties
            const properties = [
                { name: 'Fabric', value: item.specs.fabric },
                {
                    name: 'Size', value: item.specs.size === 'custom'
                        ? `Custom (${item.specs.customDimensions?.width}x${item.specs.customDimensions?.height})`
                        : item.specs.size
                },
            ];

            if (item.specs.options && item.specs.options.length > 0) {
                properties.push({ name: 'Options', value: item.specs.options.join(', ') });
            }

            return {
                title: 'のぼり旗 (Custom Order)',
                quantity: item.specs.quantity,
                price: item.price.unitPrice,
                properties: properties
            };
        });

        // 3. Add Rush Fee as a custom item if applicable
        if (surcharge > 0) {
            line_items.push({
                title: 'お急ぎ便手数料 (Rush Fee)',
                quantity: 1,
                price: surcharge,
                properties: []
            });
        }

        // 4. Create Draft Order Payload
        const draftOrderPayload = {
            draft_order: {
                line_items: line_items,
                use_customer_default_address: false,
                tags: ['nobori-app', deliveryMode]
            }
        };

        // 5. Call Shopify API
        const shopUrl = `https://${SHOPIFY_SHOP_DOMAIN}/admin/api/${API_VERSION}/draft_orders.json`;
        const response = await axios.post(shopUrl, draftOrderPayload, {
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        const draftOrder = response.data.draft_order;
        const invoiceUrl = draftOrder.invoice_url;

        return res.status(200).json({ checkoutUrl: invoiceUrl });

    } catch (error: any) {
        console.error('Shopify API Error:', error.response?.data || error.message);
        return res.status(500).json({
            error: 'Failed to create checkout',
            details: error.response?.data
        });
    }
}
