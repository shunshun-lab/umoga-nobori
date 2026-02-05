import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const SHOPIFY_SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = '2023-10';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!SHOPIFY_SHOP_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
    console.warn('Missing Shopify admin credentials for order listing');
    return res.status(500).json({ error: 'Shopify credentials not configured.' });
  }

  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const url = `https://${SHOPIFY_SHOP_DOMAIN}/admin/api/${API_VERSION}/orders.json`;
    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      params: {
        status: 'any',
        limit,
        order: 'created_at desc',
      },
    });

    const orders = (response.data.orders || []).map((o: any) => ({
      id: o.id,
      name: o.name,
      createdAt: o.created_at,
      totalPrice: o.total_price,
      currency: o.currency,
      financialStatus: o.financial_status,
      fulfillmentStatus: o.fulfillment_status,
      customer: o.customer
        ? {
            name: `${o.customer.first_name || ''} ${o.customer.last_name || ''}`.trim(),
            email: o.customer.email,
          }
        : null,
      tags: o.tags,
      lineItems: (o.line_items || []).map((li: any) => ({
        id: li.id,
        title: li.title,
        quantity: li.quantity,
        price: li.price,
        sku: li.sku,
        properties: li.properties || [],
      })),
    }));

    return res.status(200).json({ orders });
  } catch (error: any) {
    console.error('Failed to fetch Shopify orders', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to fetch orders from Shopify',
      details: error.response?.data || error.message,
    });
  }
}

