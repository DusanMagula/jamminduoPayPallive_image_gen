import { useState } from 'react';

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

  const selectedImage = images.find(img => img.image_id === selectedId);

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
            onClick={() => setSelectedId(img.image_id)}
            className={`rounded overflow-hidden border-2 transition ${
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
    </div>
  );
}
