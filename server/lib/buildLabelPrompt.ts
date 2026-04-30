export const THEMES = [
  {
    id: "modern",
    label: "Modern",
    stylePrompt: "clean, contemporary, geometric design with bold shapes and a fresh colour palette",
  },
  {
    id: "minimalist",
    label: "Minimalist",
    stylePrompt: "simple, airy, sparse composition with generous whitespace and subtle tones",
  },
  {
    id: "retro",
    label: "Retro",
    stylePrompt: "nostalgic mid-century illustration with muted earthy tones and classic typography-inspired motifs",
  },
  {
    id: "80s",
    label: "80s",
    stylePrompt: "vibrant neon synthwave with electric purples, pinks, and chrome accents on a dark background",
  },
  {
    id: "watercolour",
    label: "Watercolour",
    stylePrompt: "soft, flowing watercolour washes with delicate brush strokes and natural botanical details",
  },
  {
    id: "vintage",
    label: "Vintage",
    stylePrompt: "aged, antique aesthetic with sepia tones, ornate borders, and classic hand-crafted illustration",
  },
  {
    id: "bold-bright",
    label: "Bold & Bright",
    stylePrompt: "high-contrast, vivid colours with strong outlines and energetic pattern-filled surfaces",
  },
] as const;

export type Theme = (typeof THEMES)[number];

const DANGEROUS_CHARS = /[<>`']/g;

export function buildLabelPrompt(description: string, theme: Theme): string {
  const safeDesc = description.trim().replace(DANGEROUS_CHARS, "").slice(0, 200);

  return `Create a ${theme.stylePrompt} scene: ${safeDesc}.
The image is a flat rectangular background for a jam jar label.
Generate a single flat rectangular image — this is the front label background only.
Fill the entire canvas with the themed scene.
Do not generate a jar, bottle, or any product packaging.
Do not show front and back label layouts.
Do not include any product photography.
The image will be used purely as a label background — it is a flat scene only.
CRITICAL: The central 40% of the image (both horizontally and vertically) must be completely clear — a plain, low-detail area of a single muted colour or gentle gradient with absolutely no text, no faces, no objects, no logos, and no complex patterns. This blank central zone is essential so a product label can be composited on top.
All decorative detail, illustration, and pattern must be confined entirely to the outer edges and corners of the image, leaving the centre empty.
Do not add any text or branding to the image.`;
}
