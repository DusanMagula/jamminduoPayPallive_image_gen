const cache = new Map<string, Buffer>();

export async function getLabelBuffer(filename: string): Promise<Buffer> {
  const cached = cache.get(filename);
  if (cached) return cached;

  const baseUrl = process.env.LABEL_ASSET_BASE_URL;
  if (!baseUrl) throw new Error('LABEL_ASSET_BASE_URL is not set');

  const url = `${baseUrl}/${filename}.png`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Label asset download failed: ${response.status} ${response.statusText} — ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  cache.set(filename, buffer);
  return buffer;
}
