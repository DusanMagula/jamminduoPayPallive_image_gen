import { useState } from 'react';
import { useSession } from '@/context/SessionContext';

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
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, product_id: productId, session_id: sessionId }),
      });

      if (!res.ok) throw new Error('Non-OK response');

      const data = await res.json();
      onImagesGenerated(data.images);
      onClose();
    } catch {
      setError('Generation failed. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg p-6 max-w-lg w-full mx-4 z-60"
        onClick={e => e.stopPropagation()}
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
          <div className="mb-1">
            <textarea
              rows={3}
              maxLength={500}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe your label, e.g. 'watercolour strawberries with gold text on a cream background'"
              className="w-full border border-gray-300 rounded-md p-3 resize-y focus:outline-none focus:ring-2 focus:ring-red-400"
              disabled={isLoading}
            />
          </div>
          <div className="text-right text-xs text-gray-400 mb-2">
            {prompt.length}/500
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-3">{error}</p>
          )}

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
                Generating... (this takes ~15 seconds)
              </div>
            ) : (
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate labels
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
