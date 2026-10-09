import React from 'react';
import { RotateCcw, Plus } from 'lucide-react';

interface FooterShortcutsProps {
  onOpenCreateModal: () => void;
  onResetDefaults: () => void;
  activeCount: number;
}

export const FooterShortcuts: React.FC<FooterShortcutsProps> = ({
  onOpenCreateModal,
  onResetDefaults,
  activeCount,
}) => {
  return (
    <footer className="palette-footer">
      <div className="hud-shortcuts">
        <span className="hud-item">
          <kbd>↑</kbd> <kbd>↓</kbd> Navigate
        </span>
        <span className="hud-item">
          <kbd>↵</kbd> Copy Snippet
        </span>
        <span className="hud-item">
          <kbd>⌘</kbd> <kbd>P</kbd> Favorite
        </span>
        <span className="hud-item">
          <kbd>⌘</kbd> <kbd>K</kbd> Search
        </span>
        <span className="hud-item">
          <kbd>Esc</kbd> Clear
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          type="button"
          className="copy-button"
          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
          onClick={onOpenCreateModal}
          title="Create custom snippet (⌘N)"
        >
          <Plus size={13} /> New Snippet (⌘N)
        </button>

        <button
          type="button"
          className="copy-button"
          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
          onClick={onResetDefaults}
          title="Reset default snippets"
        >
          <RotateCcw size={12} /> Reset Defaults
        </button>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {activeCount} items
        </span>
      </div>
    </footer>
  );
};
