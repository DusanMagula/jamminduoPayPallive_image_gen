import type { Express } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
import sharp from "sharp";
import { supabase } from "./lib/supabase";
import { generateLabelImages } from "./services/imageGeneration";
import { createPayPalOrder, capturePayPalOrder } from "./services/paypal";
import { THEMES, buildLabelPrompt } from "./lib/buildLabelPrompt";
import { getLabelBuffer } from "./lib/labelAssetCache";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const LABEL_BUCKET = "generated-labels";

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure the generated-labels bucket exists and is public
  await supabase.storage.createBucket(LABEL_BUCKET, { public: true }).catch(() => {
    // Bucket already exists — ignore
  });

  app.post('/api/sessions', async (req, res) => {
    const referrer = req.headers.referer ?? null;
    const userAgent = req.headers['user-agent'] ?? null;

    const { data, error } = await supabase
      .from('sessions')
      .insert({ referrer, user_agent: userAgent })
      .select('id')
      .single();

    if (error || !data) {
      return res.status(500).json({ error: 'Failed to create session' });
    }

    return res.status(201).json({ session_id: data.id });
  });

  app.get('/api/products', async (_req, res) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch products' });
    }

    return res.status(200).json(data);
  });

  app.post('/api/images/generate', async (req, res) => {
    const { prompt, product_id, session_id } = req.body;

    // Validate inputs
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0 || prompt.length > 500) {
      return res.status(400).json({ error: 'prompt must be a non-empty string of max 500 characters' });
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!product_id || typeof product_id !== 'string' || !uuidRegex.test(product_id)) {
      return res.status(400).json({ error: 'product_id must be a valid UUID' });
    }
    if (!session_id || typeof session_id !== 'string' || !uuidRegex.test(session_id)) {
      return res.status(400).json({ error: 'session_id must be a valid UUID' });
    }

    // Verify session exists
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', session_id)
      .single();
    if (sessionError || !sessionData) {
      return res.status(400).json({ error: 'Invalid session_id' });
    }

    // Verify product exists
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', product_id)
      .single();
    if (productError || !productData) {
      return res.status(400).json({ error: 'Invalid product_id' });
    }

    // Rate limit: max 20 images per session per day
    const { count, error: countError } = await supabase
      .from('generated_images')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', session_id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    if (!countError && count !== null && count >= 20) {
      return res.status(429).json({ error: 'Daily generation limit reached' });
    }

    try {
      const images = await generateLabelImages(prompt.trim(), product_id, session_id, 3);
      return res.status(200).json({
        images: images.map(({ image_id, image_url }) => ({ image_id, image_url })),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.startsWith('Failed to insert generated_image')) {
        return res.status(500).json({ error: 'Failed to store image' });
      }
      return res.status(502).json({ error: 'Image generation failed' });
    }
  });

  app.post('/api/orders/create', async (req, res) => {
    const { session_id, items } = req.body;

    // Validate session_id
    if (!session_id || typeof session_id !== 'string') {
      return res.status(400).json({ error: 'session_id is required' });
    }
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', session_id)
      .single();
    if (sessionError || !sessionData) {
      return res.status(400).json({ error: 'Invalid session_id' });
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items must be a non-empty array' });
    }
    for (const item of items) {
      if (!item.product_id || typeof item.product_id !== 'string') {
        return res.status(400).json({ error: 'Each item must have a product_id' });
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return res.status(400).json({ error: 'Each item quantity must be a positive integer' });
      }
    }

    // Validate selected_image_ids if present
    for (const item of items) {
      if (item.selected_image_id != null) {
        const { data: imgData, error: imgError } = await supabase
          .from('generated_images')
          .select('id, session_id')
          .eq('id', item.selected_image_id)
          .single();
        if (imgError || !imgData) {
          return res.status(400).json({ error: `Invalid selected_image_id: ${item.selected_image_id}` });
        }
        if (imgData.session_id !== session_id) {
          return res.status(400).json({ error: 'selected_image_id does not belong to this session' });
        }
      }
    }

    // Look up products and verify they exist and are active
    const productIds: string[] = items.map((i: { product_id: string }) => i.product_id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price, active')
      .in('id', productIds);
    if (productsError || !products) {
      return res.status(500).json({ error: 'Failed to create order' });
    }
    const productMap = new Map(products.map((p: { id: string; price: number; active: boolean }) => [p.id, p]));
    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product || !product.active) {
        return res.status(400).json({ error: `Invalid or inactive product_id: ${item.product_id}` });
      }
    }

    // Duplicate order check: pending order from same session in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, paypal_order_id')
      .eq('session_id', session_id)
      .eq('status', 'pending')
      .gte('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (existingOrder) {
      return res.status(201).json({ order_id: existingOrder.id, paypal_order_id: existingOrder.paypal_order_id });
    }

    // Calculate total from DB prices
    let totalAmount = 0;
    for (const item of items) {
      const product = productMap.get(item.product_id)!;
      totalAmount += product.price * item.quantity;
    }
    totalAmount = Math.round(totalAmount * 100) / 100;

    // Create PayPal order
    let paypalOrderId: string;
    try {
      paypalOrderId = await createPayPalOrder(totalAmount, 'GBP');
    } catch {
      return res.status(502).json({ error: 'Failed to create payment order' });
    }

    // Insert order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({ session_id, status: 'pending', total_amount: totalAmount, currency: 'GBP', paypal_order_id: paypalOrderId })
      .select('id')
      .single();
    if (orderError || !orderData) {
      return res.status(500).json({ error: 'Failed to create order' });
    }

    // Insert order items
    const orderItems = items.map((item: { product_id: string; quantity: number; selected_image_id?: string | null; selected_image_url?: string | null }) => ({
      order_id: orderData.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: productMap.get(item.product_id)!.price,
      selected_image_id: item.selected_image_id ?? null,
      selected_image_url: item.selected_image_url ?? null,
    }));
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      return res.status(500).json({ error: 'Failed to create order' });
    }

    return res.status(201).json({ order_id: orderData.id, paypal_order_id: paypalOrderId });
  });

  app.post('/api/orders/capture', async (req, res) => {
    const { order_id, paypal_order_id } = req.body;

    if (!order_id || !paypal_order_id) {
      return res.status(400).json({ error: 'order_id and paypal_order_id are required' });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, paypal_order_id')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paypal_order_id !== paypal_order_id) {
      return res.status(400).json({ error: 'paypal_order_id does not match order' });
    }

    if (order.status === 'paid') {
      return res.status(200).json({ order_id, status: 'paid' });
    }

    let captureId: string;
    let payerName: string;
    let payerEmail: string;
    try {
      ({ captureId, payerName, payerEmail } = await capturePayPalOrder(paypal_order_id));
    } catch {
      await supabase.from('orders').update({ status: 'failed' }).eq('id', order_id);
      return res.status(502).json({ error: 'Payment capture failed' });
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        paypal_capture_id: captureId,
        customer_name: payerName,
        customer_email: payerEmail,
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (updateError) {
      console.error('CRITICAL: PayPal captured but order update failed', {
        order_id,
        paypal_capture_id: captureId,
        error: updateError,
      });
      return res.status(500).json({ error: 'Order record update failed — please contact support' });
    }

    return res.status(200).json({ order_id, status: 'paid' });
  });

  app.get('/api/orders/:order_id', async (req, res) => {
    const { order_id } = req.params;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(order_id)) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, total_amount, currency, customer_name, customer_email, paid_at')
      .eq('id', order_id)
      .single();

    if (orderError || !order || order.status !== 'paid') {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { data: rawItems, error: itemsError } = await supabase
      .from('order_items')
      .select('quantity, unit_price, selected_image_url, products(name)')
      .eq('order_id', order_id);

    if (itemsError || !rawItems) {
      return res.status(500).json({ error: 'Failed to fetch order details' });
    }

    return res.status(200).json({
      order_id: order.id,
      status: 'paid' as const,
      total_amount: order.total_amount,
      currency: order.currency,
      customer_name: order.customer_name ?? null,
      customer_email: order.customer_email ?? null,
      paid_at: order.paid_at,
      items: rawItems.map((item: { quantity: number; unit_price: number; selected_image_url: string | null; products: { name: string }[] | { name: string } | null }) => ({
        product_name: (Array.isArray(item.products) ? item.products[0]?.name : item.products?.name) ?? 'Unknown',
        quantity: item.quantity,
        unit_price: item.unit_price,
        selected_image_url: item.selected_image_url ?? null,
      })),
    });
  });

  const THEME_IDS = new Set(THEMES.map((t) => t.id));
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  app.patch('/api/labels/:generatedImageId/select', async (req, res) => {
    const { generatedImageId } = req.params;
    const { sessionId, productId } = req.body;

    if (!UUID_RE.test(generatedImageId)) {
      return res.status(400).json({ error: 'generatedImageId must be a valid UUID' });
    }
    if (!sessionId || typeof sessionId !== 'string' || !UUID_RE.test(sessionId)) {
      return res.status(400).json({ error: 'sessionId must be a valid UUID' });
    }
    if (!productId || typeof productId !== 'string' || !UUID_RE.test(productId)) {
      return res.status(400).json({ error: 'productId must be a valid UUID' });
    }

    const { data: imgData, error: imgError } = await supabase
      .from('generated_images')
      .select('id, session_id, product_id')
      .eq('id', generatedImageId)
      .single();

    if (imgError || !imgData) {
      return res.status(404).json({ error: 'Image not found' });
    }
    if (imgData.session_id !== sessionId || imgData.product_id !== productId) {
      return res.status(403).json({ error: 'Image does not belong to this session/product' });
    }

    const { error: deselectError } = await supabase
      .from('generated_images')
      .update({ is_selected: false })
      .eq('session_id', sessionId)
      .eq('product_id', productId);

    if (deselectError) {
      return res.status(500).json({ error: 'Failed to update selection' });
    }

    const { error: selectError } = await supabase
      .from('generated_images')
      .update({ is_selected: true })
      .eq('id', generatedImageId);

    if (selectError) {
      return res.status(500).json({ error: 'Failed to update selection' });
    }

    return res.json({ ok: true });
  });

  app.post('/api/labels/generate', async (req, res) => {
    const { session_id, product_id, theme_id, description } = req.body;

    // Validate input
    if (!session_id || typeof session_id !== 'string' || !UUID_RE.test(session_id)) {
      return res.status(400).json({ error: 'session_id must be a valid UUID' });
    }
    if (!product_id || typeof product_id !== 'string' || !UUID_RE.test(product_id)) {
      return res.status(400).json({ error: 'product_id must be a valid UUID' });
    }
    if (!theme_id || typeof theme_id !== 'string' || !THEME_IDS.has(theme_id as (typeof THEMES)[number]['id'])) {
      return res.status(400).json({ error: `theme_id must be one of: ${Array.from(THEME_IDS).join(', ')}` });
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0 || description.length > 200) {
      return res.status(400).json({ error: 'description must be a non-empty string of max 200 characters' });
    }

    // Verify session exists
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', session_id)
      .single();
    if (sessionError || !sessionData) {
      return res.status(400).json({ error: 'Invalid session_id' });
    }

    // Verify product exists
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', product_id)
      .single();
    if (productError || !productData) {
      return res.status(400).json({ error: 'Invalid product_id' });
    }

    const theme = THEMES.find((t) => t.id === theme_id)!;
    const prompt = buildLabelPrompt(description.trim(), theme);

    const COUNT = 3;

    const LABEL_FILENAME_BY_PRODUCT: Record<string, string> = {
      'Strawberry Jam': 'jammin_duo_label_highres_strawberry',
      'Blueberry Jam': 'jammin_duo_label_highres_blueberry',
    };
    const labelFilename = LABEL_FILENAME_BY_PRODUCT[productData.name] ?? 'jammin_duo_label_highres_strawberry';

    // Download label asset (cached after first call)
    let labelBuffer: Buffer;
    try {
      labelBuffer = await getLabelBuffer(labelFilename);
    } catch {
      return res.status(503).json({ error: 'Label asset unavailable' });
    }

    // Generate all images in parallel
    const requests = Array.from({ length: COUNT }, (_, index) =>
      (async () => {
        // Call OpenAI
        let b64: string;
        try {
          const response = await openai.images.generate({
            model: 'gpt-image-1',
            prompt,
            n: 1,
            size: '1536x1024',
          });
          const raw = response.data?.[0]?.b64_json;
          if (!raw) throw new Error('No image data returned');
          b64 = raw;
        } catch (err) {
          throw Object.assign(new Error('openai'), { cause: err });
        }

        // Composite: resize label to 42% of generated image width, centre it
        const generatedBuffer = Buffer.from(b64, 'base64');
        const { width: bgWidth = 1536 } = await sharp(generatedBuffer).metadata();
        const labelTargetWidth = Math.round(bgWidth * 0.42);
        const resizedLabel = await sharp(labelBuffer).resize(labelTargetWidth).toBuffer();
        const compositedBuffer = await sharp(generatedBuffer)
          .composite([{ input: resizedLabel, gravity: 'center' }])
          .jpeg({ quality: 90 })
          .toBuffer();

        // Upload to generated-labels bucket
        const storagePath = `${session_id}/${product_id}/${Date.now()}-${index}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from(LABEL_BUCKET)
          .upload(storagePath, compositedBuffer, { contentType: 'image/jpeg', upsert: false });
        if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

        const { data: urlData } = supabase.storage.from(LABEL_BUCKET).getPublicUrl(storagePath);
        const publicUrl = urlData.publicUrl;

        // Insert DB row
        const { data: imgRow, error: insertError } = await supabase
          .from('generated_images')
          .insert({
            session_id,
            product_id,
            theme_id,
            prompt_used: prompt,
            storage_path: storagePath,
            image_url: publicUrl,
            public_url: publicUrl,
            status: 'ready',
            generation_model: 'gpt-image-1',
            is_selected: false,
          })
          .select('id')
          .single();
        if (insertError || !imgRow) throw new Error(`DB insert failed: ${insertError?.message}`);

        return { url: publicUrl, generatedImageId: imgRow.id as string };
      })()
    );

    try {
      const images = await Promise.all(requests);
      return res.status(200).json({ images });
    } catch (err: unknown) {
      console.error('Label generation error:', err);
      const message = err instanceof Error ? err.message : '';
      if (message === 'openai') {
        return res.status(502).json({ error: 'Image generation failed' });
      }
      return res.status(500).json({ error: 'Label generation failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
