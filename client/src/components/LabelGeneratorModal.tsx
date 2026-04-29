import { useState } from 'react';
import { useSession } from '@/context/SessionContext';
import ThemePicker, { THEMES } from './ThemePicker';

interface GeneratedImage {
  image_id: string;
  image_url: string;
}

interface LabelGeneratorModalProps {
  isOpen: boolean;
  productId: string;
  productName: string;
  onClose: () => void;
  onImagesGenerated: (images: GeneratedImage[]) => void;
}

export default function LabelGeneratorModal({
  isOpen,
  productId,
  productName,
  onClose,
  onImagesGenerated,
}: LabelGeneratorModalProps) {
  const { sessionId } = useSession();
  const [description, setDescription] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const descLen = description.length;
  const canSubmit = description.trim().length >= 3 && selectedTheme !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/labels/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          theme_id: selectedTheme,
          product_id: productId,
          session_id: sessionId,
        }),
      });

      if (!res.ok) throw new Error('Non-OK response');

      const data: { images: { url: string; generatedImageId: string }[] } = await res.json();
      const mapped: GeneratedImage[] = data.images.map((img) => ({
        image_id: img.generatedImageId,
        image_url: img.url,
      }));
      onImagesGenerated(mapped);
      onClose();
    } catch {
      setError('Label generation failed — please try again.');
      setIsLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg p-6 max-w-lg w-full mx-4 z-60 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4">
          Create a custom label for {productName}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Description */}
          <div className="mb-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Describe your label
            </label>
            <textarea
              rows={3}
              maxLength={200}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Strawberries with gold text on a cream background"
              className="w-full border border-gray-300 rounded-md p-3 resize-y focus:outline-none focus:ring-2 focus:ring-red-400"
              disabled={isLoading}
            />
          </div>
          <div
            className={`text-right text-xs mb-4 ${
              descLen > 180 ? 'text-red-500 font-medium' : 'text-gray-400'
            }`}
          >
            {descLen} / 200
          </div>

          {/* Theme picker */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose a style
            </label>
            <ThemePicker
              themes={THEMES}
              selectedId={selectedTheme}
              onSelect={setSelectedTheme}
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Cancel
            </button>

            {isLoading ? (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <svg
                  className="animate-spin h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Generating your labels… this takes around 30 seconds
              </div>
            ) : (
              <button
                type="submit"
                disabled={!canSubmit}
                className="bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Labels
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
