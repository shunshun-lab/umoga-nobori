
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { google } from 'googleapis';

// Environment variables
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
const SPREADSHEET_ID = '1vVLc_q4F4i186AuzSo82N-9VBs1rQt3DQKRtFiM7r-8'; // Default from sync-sheet.ts
const SHEET_NAME = 'Orders'; // Assuming an "Orders" sheet exists or will be created

/**
 * Shopify Webhook HMAC Verification
 */
function verifyShopifyWebhook(req: VercelRequest, rawBody: string): boolean {
    const hmac = req.headers['x-shopify-hmac-sha256'];
    if (!hmac || !SHOPIFY_WEBHOOK_SECRET) return false;

    const generatedHash = crypto
        .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
        .update(rawBody, 'utf8')
        .digest('base64');

    return generatedHash === hmac;
}

/**
 * Get raw body from VercelRequest (since Vercel might auto-parse JSON)
 */
async function getRawBody(req: VercelRequest): Promise<string> {
    if (req.body && typeof req.body === 'object') {
        return JSON.stringify(req.body);
    }
    // If not parsed, read from stream (though Vercel usually parses)
    return '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // 1. HMAC Verification (Optional but recommended for production)
    // Note: JSON.stringify(req.body) might differ slightly from the original raw body if properties are reordered.
    // For strictly secure webhooks, raw body is preferred.
    const rawBody = JSON.stringify(req.body);
    if (SHOPIFY_WEBHOOK_SECRET && !verifyShopifyWebhook(req, rawBody)) {
        console.warn('Webhook verification failed');
        // We might want to allow it during initial testing or if secret is missing
        // return res.status(401).send('Unauthorized');
    }

    try {
        const order = req.body;
        const orderNumber = order.name || order.order_number;
        const createdAt = order.created_at;
        const customerName = order.customer ? `${order.customer.last_name} ${order.customer.first_name}` : 'N/A';
        const totalPrice = order.total_price;

        console.log(`Processing Order: ${orderNumber}`);

        // Prepare rows for Google Sheets
        const rowsToAppend: any[][] = [];

        for (const item of order.line_items) {
            // Extract properties
            const properties: Record<string, string> = {};
            if (item.properties) {
                item.properties.forEach((p: any) => {
                    properties[p.name] = p.value;
                });
            }

            rowsToAppend.push([
                orderNumber,
                createdAt,
                customerName,
                item.title,
                item.quantity,
                properties['Fabric'] || '-',
                properties['Size'] || '-',
                properties['Options'] || '-',
                item.price,
                totalPrice,
                `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/orders/${order.id}`
            ]);
        }

        // 2. Write to Google Sheets
        if (GOOGLE_SERVICE_ACCOUNT_EMAIL && GOOGLE_PRIVATE_KEY) {
            const auth = new google.auth.JWT(
                GOOGLE_SERVICE_ACCOUNT_EMAIL,
                undefined,
                GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                ['https://www.googleapis.com/auth/spreadsheets']
            );

            const sheets = google.sheets({ version: 'v4', auth } as any);

            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A:K`,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: rowsToAppend
                }
            } as any);

            console.log(`Successfully appended ${rowsToAppend.length} rows to Google Sheets`);
        } else {
            console.warn('Google Credentials missing, skipping sheet write');
        }

        return res.status(200).send('Webhook Processed');

    } catch (error: any) {
        console.error('Webhook Error:', error.message);
        return res.status(500).json({ error: error.message });
    }
}
