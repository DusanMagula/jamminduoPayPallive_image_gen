import type { Express } from "express";
import { createServer, type Server } from "http";
import { supabase } from "./lib/supabase";
import { generateLabelImages } from "./services/imageGeneration";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
