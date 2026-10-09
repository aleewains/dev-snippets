import React, { useEffect, useRef } from 'react';
import { Snippet } from '../types/snippet';
import { Star, Terminal } from 'lucide-react';

interface SnippetListProps {
  snippets: Snippet[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onCopySnippet: (snippet: Snippet) => void;
}

export const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  selectedIndex,
  onSelectIndex,
  onCopySnippet,
}) => {
  const selectedRef = useRef<HTMLDivElement | null>(null);

  // Keep selected element visible in scroll view
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  if (snippets.length === 0) {
    return (
      <div
        className="snippet-list-column"
        style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '3rem 1.5rem' }}
      >
        <Terminal size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
        <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>No matching snippets found</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
          Try clearing search or press ⌘N to create a new snippet.
        </p>
      </div>
    );
  }

  return (
    <div className="snippet-list-column" role="listbox" aria-label="Command snippets">
      {snippets.map((snippet, index) => {
        const isSelected = index === selectedIndex;

        return (
          <div
            key={snippet.id}
            ref={isSelected ? selectedRef : null}
            className={`snippet-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelectIndex(index)}
            onDoubleClick={() => onCopySnippet(snippet)}
            role="option"
            aria-selected={isSelected}
          >
            <div className="snippet-item-left">
              <div className="snippet-title">
                {snippet.isPinned && (
                  <Star size={12} fill="#fbbf24" stroke="#fbbf24" style={{ flexShrink: 0 }} />
                )}
                <span>{snippet.title}</span>
              </div>
              <div className="snippet-desc">{snippet.description}</div>
            </div>

            <span className={`snippet-meta-badge badge-${snippet.category}`}>
              {snippet.category}
            </span>
          </div>
        );
      })}
    </div>
  );
};
