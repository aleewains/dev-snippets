import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Snippet, SnippetCategory } from './types/snippet';
import { loadSnippets, saveSnippets, resetToDefaults } from './utils/storage';
import { filterAndScoreSnippets } from './utils/fuzzySearch';
import { CommandPaletteHeader } from './components/CommandPaletteHeader';
import { SnippetList } from './components/SnippetList';
import { SnippetPreview } from './components/SnippetPreview';
import { FooterShortcuts } from './components/FooterShortcuts';
import { SnippetModal } from './components/SnippetModal';
import { Terminal, Check } from 'lucide-react';

export function App() {
  const [snippets, setSnippets] = useState<Snippet[]>(loadSnippets);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SnippetCategory>('all');
  const [onlyPinned, setOnlyPinned] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snippetToEdit, setSnippetToEdit] = useState<Snippet | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Compute filtered & ranked snippets
  const filteredSnippets = useMemo(() => {
    return filterAndScoreSnippets(snippets, searchQuery, activeCategory, onlyPinned);
  }, [snippets, searchQuery, activeCategory, onlyPinned]);

  // Keep selected index within bounds
  useEffect(() => {
    if (selectedIndex >= filteredSnippets.length) {
      setSelectedIndex(Math.max(0, filteredSnippets.length - 1));
    }
  }, [filteredSnippets.length, selectedIndex]);

  const activeSnippet = filteredSnippets[selectedIndex] || null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyCommand = useCallback((cmdString: string) => {
    navigator.clipboard.writeText(cmdString);
    showToast(`Copied to clipboard: ${cmdString}`);
  }, []);

  const handleTogglePin = useCallback((id: string) => {
    setSnippets((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s));
      saveSnippets(updated);
      return updated;
    });
  }, []);

  const handleDeleteSnippet = useCallback((id: string) => {
    setSnippets((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSnippets(updated);
      return updated;
    });
    showToast('Snippet deleted');
  }, []);

  const handleSaveSnippet = (
    data: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    if (editId) {
      setSnippets((prev) => {
        const updated = prev.map((s) =>
          s.id === editId ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
        );
        saveSnippets(updated);
        return updated;
      });
      showToast('Snippet updated');
    } else {
      const newSnippet: Snippet = {
        ...data,
        id: `custom-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSnippets((prev) => {
        const updated = [newSnippet, ...prev];
        saveSnippets(updated);
        return updated;
      });
      showToast('Created new snippet');
    }
  };

  const handleResetDefaults = () => {
    const defaults = resetToDefaults();
    setSnippets(defaults);
    showToast('Reset vault to default cheatsheet recipes');
  };

  // Keyboard navigation & Raycast hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Focus Search: Cmd+K or Ctrl+K or '/'
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // If typing in an input/textarea inside the modal, don't hijack keys
      if (isModalOpen) return;

      // 2. New Snippet: Cmd+N or Ctrl+N
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setSnippetToEdit(null);
        setIsModalOpen(true);
        return;
      }

      // 3. Favorite / Pin: Cmd+P or Ctrl+P
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (activeSnippet) {
          handleTogglePin(activeSnippet.id);
        }
        return;
      }

      // 4. Arrow Down
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredSnippets.length - 1));
        return;
      }

      // 5. Arrow Up
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      // 6. Enter -> Copy command
      if (e.key === 'Enter') {
        // Only if search input isn't active or if user hit Enter to trigger copy
        if (activeSnippet) {
          e.preventDefault();
          handleCopyCommand(activeSnippet.command);
        }
        return;
      }

      // 7. Escape -> Clear search
      if (e.key === 'Escape') {
        if (searchQuery) {
          e.preventDefault();
          setSearchQuery('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isModalOpen,
    activeSnippet,
    filteredSnippets.length,
    searchQuery,
    handleCopyCommand,
    handleTogglePin,
  ]);

  return (
    <div className="app-layout">
      {/* Masthead */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <Terminal size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              CommandVault
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Keyboard-first developer cheatsheet & snippet organizer
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Quick Search: <kbd>⌘</kbd> <kbd>K</kbd>
          </span>
        </div>
      </div>

      {/* Palette Window */}
      <main className="palette-window">
        {/* Top Search & Filter Bar */}
        <CommandPaletteHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onlyPinned={onlyPinned}
          onTogglePinned={() => setOnlyPinned((prev) => !prev)}
          inputRef={searchInputRef}
          totalCount={filteredSnippets.length}
        />

        {/* Split View Body */}
        <div className="palette-body">
          <SnippetList
            snippets={filteredSnippets}
            selectedIndex={selectedIndex}
            onSelectIndex={setSelectedIndex}
            onCopySnippet={(s) => handleCopyCommand(s.command)}
          />

          <SnippetPreview
            snippet={activeSnippet}
            onCopy={handleCopyCommand}
            onTogglePin={handleTogglePin}
            onEdit={(s) => {
              setSnippetToEdit(s);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteSnippet}
          />
        </div>

        {/* Bottom Keyboard HUD */}
        <FooterShortcuts
          onOpenCreateModal={() => {
            setSnippetToEdit(null);
            setIsModalOpen(true);
          }}
          onResetDefaults={handleResetDefaults}
          activeCount={filteredSnippets.length}
        />
      </main>

      {/* Modal Dialog for Add/Edit */}
      <SnippetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSnippet}
        snippetToEdit={snippetToEdit}
      />

      {/* Tactile Copy Toast */}
      {toastMessage && (
        <aside className="toast-notice" role="status" aria-live="polite">
          <Check size={16} style={{ color: '#10b981' }} />
          <span>{toastMessage}</span>
        </aside>
      )}
    </div>
  );
}

export default App;
