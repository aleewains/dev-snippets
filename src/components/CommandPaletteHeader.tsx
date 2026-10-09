import React from 'react';
import { Search, Star, X } from 'lucide-react';
import { SnippetCategory } from '../types/snippet';

interface CommandPaletteHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCategory: SnippetCategory;
  onSelectCategory: (cat: SnippetCategory) => void;
  onlyPinned: boolean;
  onTogglePinned: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  totalCount: number;
}

const CATEGORIES: { id: SnippetCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'docker', label: 'Docker' },
  { id: 'git', label: 'Git' },
  { id: 'bash', label: 'Bash' },
  { id: 'k8s', label: 'K8s' },
  { id: 'regex', label: 'Regex' },
  { id: 'sql', label: 'SQL' },
  { id: 'custom', label: 'Custom' },
];

export const CommandPaletteHeader: React.FC<CommandPaletteHeaderProps> = ({
  searchQuery,
  onSearchChange,
  activeCategory,
  onSelectCategory,
  onlyPinned,
  onTogglePinned,
  inputRef,
  totalCount,
}) => {
  return (
    <header className="palette-header">
      <div className="search-input-wrapper">
        <Search size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search snippets, flags, or commands... (⌘K)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          autoFocus
        />
        {searchQuery && (
          <button
            type="button"
            className="action-icon-btn"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => onSearchChange('')}
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="header-tags">
        <button
          type="button"
          className={`category-pill ${onlyPinned ? 'active' : ''}`}
          onClick={onTogglePinned}
          title="Filter only pinned snippets"
        >
          <Star size={12} fill={onlyPinned ? 'currentColor' : 'transparent'} />
          Favorites
        </button>

        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
          ({totalCount})
        </span>
      </div>
    </header>
  );
};
