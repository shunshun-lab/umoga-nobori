import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import type {
  UiConfig,
  BannerItem,
  TemplateItem,
  OptionImagesConfig,
  SizeImagesConfig,
  FabricImagesConfig,
  NoboriTextSettings,
} from '@/utils/uiConfigTypes';

// Firebase Admin 初期化
if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    } as any),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const hasAdmin = !!admin.apps.length;
const db = hasAdmin ? admin.firestore() : null;

async function loadConfigFromFirestore(): Promise<UiConfig> {
  if (!db) {
    // Admin が無い場合は空のデフォルトを返す
    return {
      banners: [],
      templates: [],
      optionImages: { byOptionId: {} },
      sizeImages: { bySizeId: {} },
      fabricImages: { byFabricId: {} },
      noboriText: { title: '', subtitle: '' },
    };
  }

  const [bannersDoc, templatesDoc, optionDoc, sizeDoc, fabricDoc, textDoc] = await Promise.all([
    db.collection('ui_config').doc('banners').get(),
    db.collection('ui_config').doc('templates').get(),
    db.collection('ui_config').doc('optionImages').get(),
    db.collection('ui_config').doc('sizeImages').get(),
    db.collection('ui_config').doc('fabricImages').get(),
    db.collection('nobori_settings').doc('default').get(),
  ]);

  const banners = (bannersDoc.exists ? (bannersDoc.data()?.items ?? []) : []) as BannerItem[];
  const templates = (templatesDoc.exists ? (templatesDoc.data()?.items ?? []) : []) as TemplateItem[];
  const optionImages = (optionDoc.exists ? optionDoc.data() : { byOptionId: {} }) as OptionImagesConfig;
  const sizeImages = (sizeDoc.exists ? sizeDoc.data() : { bySizeId: {} }) as SizeImagesConfig;
  const fabricImages = (fabricDoc.exists ? fabricDoc.data() : { byFabricId: {} }) as FabricImagesConfig;
  const noboriText = (textDoc.exists ? textDoc.data() : { title: '', subtitle: '' }) as NoboriTextSettings;

  return {
    banners,
    templates,
    optionImages,
    sizeImages,
    fabricImages,
    noboriText,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;

  // サブパス判定（/api/ui-config, /api/ui-config/banners など）
  const subPath = url?.replace(/^.*\/api\/ui-config/, '') || '';

  try {
    // GET /api/ui-config → 全体取得
    if (method === 'GET' && (subPath === '' || subPath === '/')) {
      const config = await loadConfigFromFirestore();
      return res.status(200).json(config);
    }

    // POST /api/ui-config/banners → バナー更新
    if (method === 'POST' && subPath === '/banners') {
      const body = req.body as { items?: BannerItem[] };
      if (!body.items || !Array.isArray(body.items)) {
        return res.status(400).json({ error: 'Invalid payload: items is required' });
      }
      if (!db) {
        return res.status(500).json({ error: 'Firebase Admin is not configured' });
      }
      await db.collection('ui_config').doc('banners').set({ items: body.items }, { merge: true });
      return res.status(200).json({ ok: true });
    }

    // POST /api/ui-config/templates → テンプレ更新
    if (method === 'POST' && subPath === '/templates') {
      const body = req.body as { items?: TemplateItem[] };
      if (!body.items || !Array.isArray(body.items)) {
        return res.status(400).json({ error: 'Invalid payload: items is required' });
      }
      if (body.items.length > 10) {
        return res.status(400).json({ error: 'テンプレートは最大10件までです' });
      }
      if (!db) {
        return res.status(500).json({ error: 'Firebase Admin is not configured' });
      }
      await db.collection('ui_config').doc('templates').set({ items: body.items }, { merge: true });
      return res.status(200).json({ ok: true });
    }

    // POST /api/ui-config/images → 画像設定更新
    if (method === 'POST' && subPath === '/images') {
      const body = req.body as {
        optionImages?: OptionImagesConfig;
        sizeImages?: SizeImagesConfig;
        fabricImages?: FabricImagesConfig;
      };

      if (!body.optionImages || !body.sizeImages || !body.fabricImages) {
        return res.status(400).json({ error: 'Invalid payload: all image configs are required' });
      }

      if (!db) {
        return res.status(500).json({ error: 'Firebase Admin is not configured' });
      }

      await Promise.all([
        db.collection('ui_config').doc('optionImages').set(body.optionImages, { merge: true }),
        db.collection('ui_config').doc('sizeImages').set(body.sizeImages, { merge: true }),
        db.collection('ui_config').doc('fabricImages').set(body.fabricImages, { merge: true }),
      ]);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method or path not allowed' });
  } catch (err: any) {
    console.error('UI Config API error', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
}

