import OpenAI from 'openai'
import { uploadLabelImage } from './imageStorage.js'
import { supabase } from '../lib/supabase.js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

interface GeneratedImage {
  image_id: string
  image_url: string
  storage_path: string
}

export async function generateLabelImages(
  prompt: string,
  productId: string,
  sessionId: string,
  count: number = 3
): Promise<GeneratedImage[]> {
  // DALL-E 3 only supports n=1 per request, so we make `count` parallel calls
  const requests = Array.from({ length: count }, () =>
    openai.images.generate({
      model: 'dall-e-3',
      prompt: `Product label design for a jam jar: ${prompt}. Clean, professional label design. Square format.`,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    })
  )

  const responses = await Promise.all(requests)

  const results: GeneratedImage[] = []

  for (const response of responses) {
    const b64 = response.data?.[0]?.b64_json
    if (!b64) continue

    const buffer = Buffer.from(b64, 'base64')
    const { storage_path, image_url } = await uploadLabelImage(buffer, 'image/png')

    const { data, error } = await supabase
      .from('generated_images')
      .insert({
        session_id: sessionId,
        product_id: productId,
        prompt,
        storage_path,
        image_url,
        status: 'ready',
        generation_model: 'dall-e-3',
      })
      .select('id')
      .single()

    if (error || !data) throw new Error(`Failed to insert generated_image: ${error?.message}`)

    results.push({ image_id: data.id, image_url, storage_path })
  }

  return results
}
