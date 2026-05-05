import { useState, useEffect } from 'react';

interface GeneratedImage {
  image_id: string;
  image_url: string;
}

interface ImageSelectorProps {
  images: GeneratedImage[];
  productId: string;
  productName: string;
  price: number;
  onSelect: (selectedImageId: string, selectedImageUrl: string) => void;
  onRegenerate: () => void;
  onSkip: () => void;
}

export default function ImageSelector({ images, productName, onSelect, onRegenerate, onSkip }: ImageSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);

  const selectedImage = images.find(img => img.image_id === selectedId);

  // Close lightbox on Escape key
  useEffect(() => {
    if (!lightboxImage) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxImage(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxImage]);

  return (
    <div className="mt-4">
      <h4 className="text-lg font-bold mb-1">Choose your label</h4>
      <p className="text-sm text-gray-500 mb-3">
        Select one of the generated designs, or skip to use no custom label
      </p>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {images.slice(0, 3).map((img, i) => (
          <button
            key={img.image_id}
            onClick={() => setLightboxImage(img)}
            className={`rounded overflow-hidden border-2 transition cursor-zoom-in ${
              selectedId === img.image_id ? 'border-red-500 ring-2 ring-red-500' : 'border-transparent'
            }`}
          >
            <img
              src={img.image_url}
              alt={`${productName} custom label option ${i + 1}`}
              className="w-full h-[200px] object-cover"
            />
          </button>
        ))}
      </div>

      {selectedId && (
        <button
          onClick={() => selectedImage && onSelect(selectedImage.image_id, selectedImage.image_url)}
          className="w-full bg-red-500 text-white py-2 rounded-full hover:bg-red-600 transition mb-2"
        >
          Add to cart with this label
        </button>
      )}

      <div className="flex justify-between text-sm">
        <button onClick={onRegenerate} className="text-red-500 hover:text-red-600 underline">
          Try different labels
        </button>
        <button onClick={onSkip} className="text-gray-500 hover:text-gray-700 underline">
          Skip custom label
        </button>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white text-3xl leading-none hover:text-gray-300 transition"
              aria-label="Close preview"
            >
              &times;
            </button>

            <img
              src={lightboxImage.image_url}
              alt={`${productName} label full preview`}
              className="w-full h-auto rounded shadow-xl"
            />

            <button
              onClick={() => {
                setSelectedId(lightboxImage.image_id);
                setLightboxImage(null);
              }}
              className={`mt-4 w-full py-2 rounded-full font-semibold transition ${
                selectedId === lightboxImage.image_id
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {selectedId === lightboxImage.image_id ? 'Selected' : 'Select this label'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
