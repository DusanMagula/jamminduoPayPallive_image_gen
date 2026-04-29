export interface Theme {
  id: string;
  label: string;
  emoji: string;
  tagline: string;
}

export const THEMES: Theme[] = [
  { id: 'modern',       emoji: '⚡', label: 'Modern',       tagline: 'Clean & contemporary' },
  { id: 'minimalist',   emoji: '□', label: 'Minimalist',   tagline: 'Simple & elegant' },
  { id: 'retro',        emoji: '📼', label: 'Retro',        tagline: 'Mid-century charm' },
  { id: '80s',          emoji: '🕹', label: '80s',          tagline: 'Neon & electric' },
  { id: 'watercolour',  emoji: '🎨', label: 'Watercolour',  tagline: 'Soft & painterly' },
  { id: 'vintage',      emoji: '📜', label: 'Vintage',      tagline: 'Classic & ornate' },
  { id: 'bold-bright',  emoji: '🔥', label: 'Bold & Bright', tagline: 'Vivid & energetic' },
];

interface ThemePickerProps {
  themes: Theme[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ThemePicker({ themes, selectedId, onSelect }: ThemePickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {themes.map((theme) => {
        const isSelected = theme.id === selectedId;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => onSelect(theme.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              isSelected
                ? 'bg-red-500 border-red-500 text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:border-red-400 hover:text-red-500'
            }`}
          >
            <span>{theme.emoji}</span>
            <span>{theme.label}</span>
            <span className={`hidden sm:inline ${isSelected ? 'text-red-100' : 'text-gray-400'}`}>
              — {theme.tagline}
            </span>
          </button>
        );
      })}
    </div>
  );
}
