import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Snippet, SnippetCategory, ViewMode } from './types/snippet';
import { loadSnippets, saveSnippets, resetToDefaults, exportSnippetsToJson } from './utils/storage';
import { filterAndScoreSnippets } from './utils/fuzzySearch';
import { TuiView } from './components/TuiView';
import { LinearView } from './components/LinearView';
import { SnippetModal } from './components/SnippetModal';
import { GlobalTooltip } from './components/GlobalTooltip';
import { Terminal, Check, LayoutGrid, Sun, Moon } from 'lucide-react';

export function App() {
  const [snippets, setSnippets] = useState<Snippet[]>(loadSnippets);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SnippetCategory>('all');
  const [onlyPinned, setOnlyPinned] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // View Mode: 'tui' (Zed/Helix Terminal) or 'linear' (Linear Precision 3-Pane)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('commandvault_view_mode');
    return saved === 'linear' || saved === 'tui' ? saved : 'tui';
  });

  // Theme: 'dark' | 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('commandvault_theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snippetToEdit, setSnippetToEdit] = useState<Snippet | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Sync theme with document root attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('commandvault_theme', theme);
  }, [theme]);

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

  const handleToggleViewMode = useCallback((mode?: ViewMode) => {
    setViewMode((prev) => {
      const next = mode ?? (prev === 'tui' ? 'linear' : 'tui');
      localStorage.setItem('commandvault_view_mode', next);
      showToast(`Switched to ${next === 'tui' ? 'Zed / Helix TUI' : 'Linear Precision'} workspace`);
      return next;
    });
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      showToast(`Switched to ${next === 'light' ? 'Light' : 'Dark'} theme`);
      return next;
    });
  }, []);

  const handleCopyCommand = useCallback((cmdString: string) => {
    navigator.clipboard.writeText(cmdString);
    showToast(`Copied: ${cmdString.slice(0, 48)}${cmdString.length > 48 ? '...' : ''}`);
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

  const handleExportSnippets = useCallback(() => {
    exportSnippetsToJson(snippets);
    showToast(`Exported ${snippets.length} snippets to JSON`);
  }, [snippets]);

  // Keyboard navigation & hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Focus Search: Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // 2. Toggle View Mode: Cmd+M or Ctrl+M
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleToggleViewMode();
        return;
      }

      // 3. Toggle Theme: Cmd+T or Ctrl+T
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleToggleTheme();
        return;
      }

      // If typing inside the modal, don't hijack keys
      if (isModalOpen) return;

      // 4. New Snippet: Cmd+N or Ctrl+N
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setSnippetToEdit(null);
        setIsModalOpen(true);
        return;
      }

      // 5. Favorite / Pin: Cmd+P or Ctrl+P
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (activeSnippet) {
          handleTogglePin(activeSnippet.id);
        }
        return;
      }

      // 6. Arrow Down
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredSnippets.length - 1));
        return;
      }

      // 7. Arrow Up
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      // 8. Enter -> Copy active command
      if (e.key === 'Enter') {
        if (activeSnippet && document.activeElement !== searchInputRef.current) {
          e.preventDefault();
          handleCopyCommand(activeSnippet.command);
        }
        return;
      }

      // 9. Escape -> Clear search
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
    handleToggleViewMode,
    handleToggleTheme,
  ]);

  return (
    <div className="app-layout">
      {/* Top Masthead with Brand, Mode Switcher, and Theme Toggle */}
      <header className="app-masthead">
        <div className="masthead-brand">
          <div className="masthead-icon">
            <Terminal size={17} />
          </div>
          <div>
            <h1 className="masthead-title">
              CommandVault
            </h1>
            <p className="masthead-subtitle">
              Developer Snippet & Command Cheat Sheet
            </p>
          </div>
        </div>

        {/* View Mode & Theme Controls */}
        <div className="masthead-controls">
          {/* Mode Switcher */}
          <div className="mode-switcher" role="tablist" aria-label="Layout view switcher">
            <button
              type="button"
              className={`mode-btn ${viewMode === 'tui' ? 'active' : ''}`}
              onClick={() => handleToggleViewMode('tui')}
              role="tab"
              aria-selected={viewMode === 'tui'}
              data-tooltip-pos="bottom"
              data-tooltip="Zed / Helix Terminal TUI (⌘M)"
            >
              <Terminal size={13} />
              <span>1. Zed TUI</span>
            </button>
            <button
              type="button"
              className={`mode-btn ${viewMode === 'linear' ? 'active' : ''}`}
              onClick={() => handleToggleViewMode('linear')}
              role="tab"
              aria-selected={viewMode === 'linear'}
              data-tooltip-pos="bottom"
              data-tooltip="Linear Precision 3-Pane (⌘M)"
            >
              <LayoutGrid size={13} />
              <span>2. Linear 3-Pane</span>
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={handleToggleTheme}
            data-tooltip-pos="bottom"
            data-tooltip={theme === 'dark' ? 'Switch to Light theme (⌘T)' : 'Switch to Dark theme (⌘T)'}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* Main View Area (Zed TUI vs Linear Precision 3-Pane) */}
      <main>
        {viewMode === 'tui' ? (
          <TuiView
            snippets={filteredSnippets}
            totalSnippetsCount={snippets.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedIndex={selectedIndex}
            onSelectIndex={setSelectedIndex}
            activeSnippet={activeSnippet}
            onCopyCommand={handleCopyCommand}
            onTogglePin={handleTogglePin}
            onEdit={(s) => {
              setSnippetToEdit(s);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteSnippet}
            onCreateNew={() => {
              setSnippetToEdit(null);
              setIsModalOpen(true);
            }}
            onResetDefaults={handleResetDefaults}
            searchInputRef={searchInputRef}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            onlyPinned={onlyPinned}
            onTogglePinned={() => setOnlyPinned((prev) => !prev)}
            pinnedCount={snippets.filter((s) => s.isPinned).length}
            onExport={handleExportSnippets}
          />
        ) : (
          <LinearView
            snippets={filteredSnippets}
            allSnippets={snippets}
            totalSnippetsCount={snippets.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedIndex={selectedIndex}
            onSelectIndex={setSelectedIndex}
            activeSnippet={activeSnippet}
            onCopyCommand={handleCopyCommand}
            onTogglePin={handleTogglePin}
            onEdit={(s) => {
              setSnippetToEdit(s);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteSnippet}
            onCreateNew={() => {
              setSnippetToEdit(null);
              setIsModalOpen(true);
            }}
            onResetDefaults={handleResetDefaults}
            searchInputRef={searchInputRef}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            onlyPinned={onlyPinned}
            onTogglePinned={() => setOnlyPinned((prev) => !prev)}
            onExport={handleExportSnippets}
          />
        )}
      </main>

      {/* Add / Edit Snippet Modal Dialog */}
      <SnippetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSnippet}
        snippetToEdit={snippetToEdit}
      />

      {/* Global Portal Floating Tooltip (Never clipped by overflow) */}
      <GlobalTooltip />

      {/* Toast Notification */}
      {toastMessage && (
        <aside className="toast-notice" role="status" aria-live="polite">
          <div className="toast-icon">
            <Check size={12} strokeWidth={2.5} />
          </div>
          <span className="toast-text">{toastMessage}</span>
        </aside>
      )}
    </div>
  );
}

export default App;
