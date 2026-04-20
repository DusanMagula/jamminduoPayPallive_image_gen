import { supabase } from '../lib/supabase.js'
import { randomUUID } from 'crypto'

export async function uploadLabelImage(
  imageBuffer: Buffer,
  mimeType: 'image/png' | 'image/jpeg' = 'image/png'
): Promise<{ storage_path: string; image_url: string }> {
  const extension = mimeType === 'image/png' ? 'png' : 'jpg'
  const filename = `${randomUUID()}.${extension}`
  const storage_path = `labels/${filename}`

  const { error } = await supabase.storage
    .from('label-images')
    .upload(storage_path, imageBuffer, {
      contentType: mimeType,
      upsert: false,
    })

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }

  const { data } = supabase.storage
    .from('label-images')
    .getPublicUrl(storage_path)

  return { storage_path, image_url: data.publicUrl }
}
