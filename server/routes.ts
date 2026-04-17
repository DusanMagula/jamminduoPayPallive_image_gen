import type { Express } from "express";
import { createServer, type Server } from "http";
import { supabase } from "./lib/supabase";

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

  const httpServer = createServer(app);
  return httpServer;
}
