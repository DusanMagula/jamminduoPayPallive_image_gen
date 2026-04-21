import { useState } from 'react';
import { Car as Jar, ShoppingBasket } from 'lucide-react';
import type { CartItem } from '@/types/cart';
import LabelGeneratorModal from './LabelGeneratorModal';
import ImageSelector from './ImageSelector';

interface GeneratedImage {
  image_id: string;
  image_url: string;
}

interface ProductCardProps {
  id: string;
  name: string;
  displayName?: string;
  description: string;
  price: number;
  imageUrl?: string;
  onAddToCart: (item: Omit<CartItem, 'quantity'>) => void;
}

export default function ProductCard({ id, name, displayName, description, price, imageUrl, onAddToCart }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[] | null>(null);
  const [showImageSelector, setShowImageSelector] = useState(false);

  function handleImagesGenerated(images: GeneratedImage[]) {
    setGeneratedImages(images);
    setShowImageSelector(true);
  }

  function handleSelect(selectedImageId: string, selectedImageUrl: string) {
    onAddToCart({ id, product_id: id, name, price, selected_image_id: selectedImageId, selected_image_url: selectedImageUrl });
    setShowImageSelector(false);
    setGeneratedImages(null);
  }

  function handleRegenerate() {
    setShowImageSelector(false);
    setGeneratedImages(null);
    setIsModalOpen(true);
  }

  function handleSkip() {
    onAddToCart({ id, product_id: id, name, price });
    setShowImageSelector(false);
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition">
      <div className="mb-4 flex justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={displayName ?? name} className="w-48 h-auto object-contain" />
        ) : (
          <Jar className="w-24 h-24 text-red-500" />
        )}
      </div>
      <h3 className="text-2xl font-bold mb-2">{displayName ?? name}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex justify-between items-center">
        <span className="text-xl font-bold">£{price.toFixed(2)}</span>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => onAddToCart({ id, product_id: id, name, price })}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition"
          >
            <ShoppingBasket className="w-4 h-4" /> Add to Cart
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm text-red-500 hover:text-red-600 underline"
          >
            Custom label ✏️
          </button>
        </div>
      </div>

      {showImageSelector && generatedImages && (
        <ImageSelector
          images={generatedImages}
          productId={id}
          productName={displayName ?? name}
          price={price}
          onSelect={handleSelect}
          onRegenerate={handleRegenerate}
          onSkip={handleSkip}
        />
      )}

      <LabelGeneratorModal
        isOpen={isModalOpen}
        productId={id}
        productName={displayName ?? name}
        onClose={() => setIsModalOpen(false)}
        onImagesGenerated={handleImagesGenerated}
      />
    </div>
  );
}
