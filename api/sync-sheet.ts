import { google } from 'googleapis';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Default Config (Can be overridden by request body)
const DEFAULT_SHEET_ID = '1vVLc_q4F4i186AuzSo82N-9VBs1rQt3DQKRtFiM7r-8';

// Ranges (Default assumptions, client should provide specific ranges)
const DEFAULT_RANGES = {
    discount: 'シート1!A:C',      // Min, Rate, Label
    matrix: 'シート1!E:J',        // Fabric/Size Matrix
    options: 'シート1!L:P',       // Options Master
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            googleServiceAccountEmail,
            googlePrivateKey,
            sheetId,
            ranges
        } = req.body;

        if (!googleServiceAccountEmail && !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
            return res.status(400).json({ error: 'Missing credentials' });
        }

        const email = googleServiceAccountEmail || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const key = (googlePrivateKey || process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
        const targetSheetId = sheetId || DEFAULT_SHEET_ID;
        const targetRanges = { ...DEFAULT_RANGES, ...ranges };

        const auth = new google.auth.JWT(
            email,
            undefined,
            key,
            ['https://www.googleapis.com/auth/spreadsheets.readonly']
        );

        const sheets = google.sheets({ version: 'v4', auth } as any);

        // Batch Get all ranges
        const response: any = await sheets.spreadsheets.values.batchGet({
            spreadsheetId: targetSheetId,
            ranges: [
                targetRanges.discount,
                targetRanges.matrix,
                targetRanges.options
            ],
            majorDimension: 'ROWS',
        });

        const valueRanges = response.data.valueRanges;
        if (!valueRanges) {
            throw new Error('No data returned from Google Sheets');
        }

        // Helper: safe get
        const getData = (index: number) => {
            const range = valueRanges[index];
            return range && range.values ? range.values : [];
        };

        const discountRows = getData(0);
        const matrixRows = getData(1);
        const optionsRows = getData(2);

        // Parse Discounts (A:C -> min, rate, label)
        const discountRules = discountRows.slice(1).map((row: any) => {
            if (!row[0]) return null;
            return {
                minQuantity: parseInt(row[0], 10),
                rate: parseFloat(row[1]),
                label: row[2] || ''
            };
        }).filter(Boolean).sort((a: any, b: any) => a.minQuantity - b.minQuantity);

        // Parse Matrix (Assuming Row 0 = Size IDs, Col 0 = Fabric IDs)
        // E.g.
        //       | standard | slim | short |
        // ponji | 1200     | 1000 | 1100  |
        // ...
        const priceMatrix: any = {};
        if (matrixRows.length > 1) {
            const headerSizeIds = matrixRows[0].slice(1); // ["standard", "slim", ...]

            for (let i = 1; i < matrixRows.length; i++) {
                const row = matrixRows[i];
                const fabricId = row[0]; // "ponji"
                if (!fabricId) continue;

                priceMatrix[fabricId] = {};

                headerSizeIds.forEach((sizeId: string, idx: number) => {
                    const price = parseInt(row[idx + 1] || '0', 10);
                    if (sizeId) {
                        priceMatrix[fabricId][sizeId] = price;
                    }
                });
            }
        }

        // Parse Options (Row: ID, Name, Price, Type, Display)
        const optionsMaster: any = {};
        optionsRows.slice(1).forEach((row: any) => {
            const id = row[0];
            if (!id) return;

            optionsMaster[id] = {
                id,
                name: row[1] || id,
                price: parseInt(row[2] || '0', 10),
                type: row[3] || 'standard',
                displayPrice: row[4] || undefined,
                // Defaults
                displayName: row[1] || id,
                description: '',
                required: false
            };
        });

        return res.status(200).json({
            discountRules,
            priceMatrix,
            options: optionsMaster
        });

    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
