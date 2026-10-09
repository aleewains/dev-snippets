import React, { useState, useEffect, useRef } from 'react';
import { Snippet, SnippetCategory } from '../types/snippet';
import { Copy, Check, Star, Edit3, Trash2, Sliders, Terminal, Plus, RotateCcw, Download } from 'lucide-react';

interface TuiViewProps {
  snippets: Snippet[];
  totalSnippetsCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  activeSnippet: Snippet | null;
  onCopyCommand: (cmd: string) => void;
  onTogglePin: (id: string) => void;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  onResetDefaults: () => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  activeCategory: SnippetCategory;
  onSelectCategory: (cat: SnippetCategory) => void;
  onlyPinned?: boolean;
  onTogglePinned?: () => void;
  pinnedCount?: number;
  onExport?: () => void;
}

export const TuiView: React.FC<TuiViewProps> = ({
  snippets,
  totalSnippetsCount,
  searchQuery,
  onSearchChange,
  selectedIndex,
  onSelectIndex,
  activeSnippet,
  onCopyCommand,
  onTogglePin,
  onEdit,
  onDelete,
  onCreateNew,
  onResetDefaults,
  searchInputRef,
  activeCategory,
  onSelectCategory,
  onlyPinned = false,
  onTogglePinned,
  pinnedCount = 0,
  onExport,
}) => {
  const [copied, setCopied] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const selectedRef = useRef<HTMLDivElement | null>(null);

  // Sync parameter defaults when active snippet changes
  useEffect(() => {
    setShowDeleteConfirm(false);
    if (!activeSnippet) {
      setParamValues({});
      return;
    }
    const initial: Record<string, string> = {};
    activeSnippet.placeholders?.forEach((p) => {
      initial[p.key] = p.defaultValue;
    });
    setParamValues(initial);
  }, [activeSnippet]);

  // Scroll active item into view
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  // Calculate resolved command with placeholders
  let resolvedCommand = activeSnippet ? activeSnippet.command : '';
  if (activeSnippet) {
    Object.entries(paramValues).forEach(([key, val]) => {
      if (val.trim()) {
        resolvedCommand = resolvedCommand.split(key).join(val.trim());
      }
    });
  }

  const handleCopy = () => {
    if (!resolvedCommand) return;
    onCopyCommand(resolvedCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories: { label: string; value: SnippetCategory }[] = [
    { label: 'ALL', value: 'all' },
    { label: 'DOCKER', value: 'docker' },
    { label: 'GIT', value: 'git' },
    { label: 'BASH', value: 'bash' },
    { label: 'K8S', value: 'k8s' },
    { label: 'SQL', value: 'sql' },
    { label: 'REGEX', value: 'regex' },
    { label: 'CUSTOM', value: 'custom' },
  ];

  return (
    <div className="tui-container">
      {/* Top Titlebar */}
      <div className="tui-titlebar">
        <div className="tui-titlebar-left">
          <span className="tui-mode-badge">NORMAL</span>
          <span className="tui-buffer-name">vault://active-commands.sh</span>
        </div>
        <div className="tui-titlebar-right">
          <span className="tui-counter">
            MATCHES: {snippets.length}/{totalSnippetsCount}
          </span>
          {onTogglePinned && (
            <button
              type="button"
              className={`tui-mini-btn tui-star-toggle ${onlyPinned ? 'active' : ''}`}
              onClick={onTogglePinned}
              data-tooltip-pos="bottom"
              data-tooltip={onlyPinned ? "Show all commands (⌘P)" : "Filter favorites only (⌘P)"}
            >
              <Star size={11} fill={onlyPinned ? "#fbbf24" : "none"} stroke={onlyPinned ? "#fbbf24" : "currentColor"} />
              <span>FAV{pinnedCount > 0 ? `:${pinnedCount}` : ''}</span>
            </button>
          )}
          <button
            type="button"
            className="tui-mini-btn"
            onClick={onCreateNew}
            data-tooltip-pos="bottom"
            data-tooltip="Create new snippet (⌘N)"
          >
            <Plus size={12} />
            <span>NEW</span>
          </button>
          <button
            type="button"
            className="tui-mini-btn"
            onClick={onResetDefaults}
            data-tooltip-pos="bottom"
            data-tooltip="Reset vault to default recipes"
          >
            <RotateCcw size={12} />
          </button>
          {onExport && (
            <button
              type="button"
              className="tui-mini-btn"
              onClick={onExport}
              data-tooltip-pos="bottom"
              data-tooltip="Export vault backup to JSON"
            >
              <Download size={12} />
              <span>EXPORT</span>
            </button>
          )}
        </div>
      </div>

      {/* TUI Search Prompt */}
      <div className="tui-searchbar">
        <span className="tui-prompt-symbol">❯</span>
        <input
          ref={searchInputRef}
          type="text"
          className="tui-search-input"
          placeholder="Filter commands or tags... (e.g. docker, kill, reset, port)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
        {searchQuery && (
          <button
            type="button"
            className="tui-mini-btn"
            onClick={() => onSearchChange('')}
            style={{ padding: '0.15rem 0.4rem' }}
          >
            ESC
          </button>
        )}
      </div>

      {/* Category Filter Bar */}
      <div className="tui-category-bar">
        <span style={{ color: 'var(--tui-muted)', fontSize: '0.72rem' }}>FILTER:</span>
        {onTogglePinned && (
          <button
            type="button"
            className={`tui-cat-btn tui-fav-btn ${onlyPinned ? 'active' : ''}`}
            onClick={onTogglePinned}
            data-tooltip-pos="bottom"
            data-tooltip={onlyPinned ? "Showing favorites only (click to show all)" : "Filter pinned favorites (⌘P)"}
          >
            <Star size={10} fill={onlyPinned ? "#fbbf24" : "none"} stroke={onlyPinned ? "#fbbf24" : "currentColor"} style={{ verticalAlign: 'middle', marginRight: '2px' }} />
            [FAVS{pinnedCount > 0 ? `:${pinnedCount}` : ''}]
          </button>
        )}
        {categories.map((cat) => (
          <button
            key={cat.value}
            type="button"
            className={`tui-cat-btn ${activeCategory === cat.value && !onlyPinned ? 'active' : ''}`}
            onClick={() => {
              if (onlyPinned && onTogglePinned) onTogglePinned();
              onSelectCategory(cat.value);
            }}
          >
            [{cat.label}]
          </button>
        ))}
      </div>

      {/* 2-Pane Split Body */}
      <div className="tui-panes">
        {/* Left List Pane (Scrollable) */}
        <div className="tui-list" role="listbox" aria-label="Command snippets">
          {snippets.length === 0 ? (
            <div className="tui-empty">
              <Terminal size={24} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
              <div>NO MATCHING COMMANDS FOUND</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--tui-muted)', marginTop: '0.25rem' }}>
                Press ESC to clear search or ⌘N to create a snippet.
              </div>
            </div>
          ) : (
            snippets.map((s, idx) => {
              const isSelected = idx === selectedIndex;
              const formattedIdx = String(idx + 1).padStart(2, '0');
              return (
                <div
                  key={s.id}
                  ref={isSelected ? selectedRef : null}
                  className={`tui-item ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectIndex(idx)}
                  onDoubleClick={() => onCopyCommand(s.command)}
                  role="option"
                  aria-selected={isSelected}
                  title={`${s.title} — ${s.command}`}
                >
                  <div className="tui-item-head">
                    <span className="tui-item-title">
                      {s.isPinned && <span style={{ color: '#fbbf24', marginRight: '4px' }}>★</span>}
                      {formattedIdx}. {s.title}
                    </span>
                    <span className={`tui-cat-tag tui-cat-${s.category}`}>
                      [{s.category}]
                    </span>
                  </div>
                  <div className="tui-item-cmd" title={s.command}>{s.command}</div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail Pane (Scrollable) */}
        <div className="tui-detail">
          {activeSnippet ? (
            <>
              {/* Header Info */}
              <div className="tui-detail-header">
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--tui-muted)', textTransform: 'uppercase' }}>
                    COMMAND SPECIFICATION // ID: {activeSnippet.id}
                  </div>
                  <h3 className="tui-detail-title">{activeSnippet.title}</h3>
                  <p className="tui-detail-desc">{activeSnippet.description}</p>
                </div>

                <div className="tui-detail-actions">
                  <button
                    type="button"
                    className="tui-btn-action"
                    onClick={() => onTogglePin(activeSnippet.id)}
                    data-tooltip-pos="bottom"
                    data-tooltip={activeSnippet.isPinned ? 'Unpin snippet (⌘P)' : 'Pin snippet (⌘P)'}
                  >
                    <Star
                      size={13}
                      fill={activeSnippet.isPinned ? '#fbbf24' : 'transparent'}
                      stroke={activeSnippet.isPinned ? '#fbbf24' : 'currentColor'}
                    />
                  </button>
                  <button
                    type="button"
                    className="tui-btn-action"
                    onClick={() => onEdit(activeSnippet)}
                    data-tooltip-pos="bottom"
                    data-tooltip="Edit snippet"
                  >
                    <Edit3 size={13} />
                  </button>
                  <div className="delete-btn-wrapper">
                    <button
                      type="button"
                      className="tui-btn-action tui-btn-delete"
                      onClick={() => setShowDeleteConfirm((prev) => !prev)}
                      data-tooltip-pos="bottom"
                      data-tooltip={showDeleteConfirm ? '' : 'Delete snippet'}
                      aria-haspopup="dialog"
                      aria-expanded={showDeleteConfirm}
                    >
                      <Trash2 size={13} />
                    </button>

                    {showDeleteConfirm && (
                      <div className="delete-confirm-popover" role="dialog" aria-label="Confirm deletion">
                        <div className="delete-confirm-arrow" />
                        <span className="delete-confirm-msg">Delete snippet?</span>
                        <div className="delete-confirm-actions">
                          <button
                            type="button"
                            className="delete-confirm-btn cancel"
                            onClick={() => setShowDeleteConfirm(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="delete-confirm-btn confirm"
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              onDelete(activeSnippet.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Codeblock */}
              <div className="tui-codeblock">
                <span className="tui-code-text">{resolvedCommand}</span>
                <button
                  type="button"
                  className={`tui-copy-btn ${copied ? 'copied' : ''}`}
                  onClick={handleCopy}
                  data-tooltip-pos="bottom"
                  data-tooltip="Copy resolved command (↵)"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'COPIED' : 'COPY (↵)'}</span>
                </button>
              </div>

              {/* Placeholder Replacers */}
              {activeSnippet.placeholders && activeSnippet.placeholders.length > 0 && (
                <div className="tui-params-section">
                  <div className="tui-section-title">
                    <Sliders size={12} />
                    <span>ARGUMENT SUBSTITUTIONS</span>
                  </div>
                  <div className="tui-params-grid">
                    {activeSnippet.placeholders.map((p) => (
                      <div key={p.key} className="tui-param-row">
                        <div className="tui-param-label-group">
                          <label
                            className="tui-param-label"
                            data-tooltip-pos="bottom"
                            data-tooltip={`Replaces ${p.key} in command`}
                          >
                            {p.label || p.key}
                          </label>
                          <span
                            className="tui-param-key"
                            data-tooltip-pos="bottom"
                            data-tooltip="Parameter placeholder syntax"
                          >
                            {p.key}
                          </span>
                        </div>
                        <input
                          type="text"
                          className="tui-param-input"
                          placeholder={p.defaultValue}
                          value={paramValues[p.key] || ''}
                          onChange={(e) =>
                            setParamValues((prev) => ({ ...prev, [p.key]: e.target.value }))
                          }
                          data-tooltip-pos="bottom"
                          data-tooltip={`Default value: "${p.defaultValue}"`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Markdown Notes / Docs */}
              {activeSnippet.explanationMarkdown && (
                <div className="tui-docs-section">
                  <div className="tui-section-title">DOCUMENTATION & FLAGS</div>
                  <div
                    className="tui-markdown"
                    dangerouslySetInnerHTML={{
                      __html: activeSnippet.explanationMarkdown
                        .replace(/^### (.*$)/gim, '<h4>$1</h4>')
                        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
                        .replace(/`([^`]+)`/g, '<code>$1</code>')
                        .replace(/\n- (.*$)/gim, '<li>$1</li>')
                        .replace(/\n\n/g, '<br/>'),
                    }}
                  />
                </div>
              )}

              {/* Tags */}
              {activeSnippet.tags.length > 0 && (
                <div className="tui-tags-row">
                  <span style={{ color: 'var(--tui-muted)', fontSize: '0.72rem' }}>TAGS:</span>
                  {activeSnippet.tags.map((t) => (
                    <span key={t} className="tui-tag-pill">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="tui-empty">SELECT A COMMAND TO INSPECT</div>
          )}
        </div>
      </div>

      {/* Bottom Statusbar */}
      <div className="tui-statusbar">
        <div className="tui-status-hints">
          <span><kbd className="tui-kbd">↑↓</kbd> NAV</span>
          <span><kbd className="tui-kbd">↵</kbd> COPY</span>
          <span><kbd className="tui-kbd">⌘K</kbd> SEARCH</span>
          <span><kbd className="tui-kbd">⌘P</kbd> PIN</span>
          <span><kbd className="tui-kbd">⌘N</kbd> NEW</span>
          <span><kbd className="tui-kbd">⌘M</kbd> TOGGLE VIEW</span>
        </div>
        <div className="tui-status-info">
          <span>UTF-8</span>
          <span>SHELL</span>
          <span>STATUS: READY</span>
        </div>
      </div>
    </div>
  );
};
