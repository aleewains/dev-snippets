import React, { useState, useEffect, useRef } from 'react';
import { Snippet, SnippetCategory } from '../types/snippet';
import { Copy, Check, Star, Edit3, Trash2, Search, Plus, RotateCcw, Box, GitBranch, Terminal, Shield, Database, Code, Sliders, Tag } from 'lucide-react';

interface LinearViewProps {
  snippets: Snippet[];
  allSnippets: Snippet[];
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
  onlyPinned: boolean;
  onTogglePinned: () => void;
}

export const LinearView: React.FC<LinearViewProps> = ({
  snippets,
  allSnippets,
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
  onlyPinned,
  onTogglePinned,
}) => {
  const [copied, setCopied] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const selectedCardRef = useRef<HTMLDivElement | null>(null);

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

  // Keep active card scrolled into view
  useEffect(() => {
    if (selectedCardRef.current) {
      selectedCardRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  // Calculate resolved command
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

  // Compute category counts
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: allSnippets.length };
    allSnippets.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [allSnippets]);

  const pinnedCount = React.useMemo(() => {
    return allSnippets.filter((s) => s.isPinned).length;
  }, [allSnippets]);

  const categories: { label: string; value: SnippetCategory; icon: React.ReactNode }[] = [
    { label: 'All Recipes', value: 'all', icon: <Terminal size={14} /> },
    { label: 'Docker', value: 'docker', icon: <Box size={14} /> },
    { label: 'Git', value: 'git', icon: <GitBranch size={14} /> },
    { label: 'Bash / Linux', value: 'bash', icon: <Terminal size={14} /> },
    { label: 'Kubernetes', value: 'k8s', icon: <Shield size={14} /> },
    { label: 'PostgreSQL', value: 'sql', icon: <Database size={14} /> },
    { label: 'Regex', value: 'regex', icon: <Code size={14} /> },
    { label: 'Custom', value: 'custom', icon: <Sliders size={14} /> },
  ];

  return (
    <div className="linear-workspace">
      {/* Top Header */}
      <div className="linear-header">
        <div className="linear-header-search">
          <Search size={14} className="linear-search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="linear-search-input"
            placeholder="Search commands, flags, or tags... (⌘K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <kbd className="linear-kbd">⌘K</kbd>
        </div>

        <div className="linear-header-actions">
          <button
            type="button"
            className={`linear-pin-filter ${onlyPinned ? 'active' : ''}`}
            onClick={onTogglePinned}
            title="Show only pinned favorites"
          >
            <Star size={13} fill={onlyPinned ? '#fbbf24' : 'transparent'} stroke={onlyPinned ? '#fbbf24' : 'currentColor'} />
            <span>Favorites ({pinnedCount})</span>
          </button>

          <button
            type="button"
            className="linear-btn-primary"
            onClick={onCreateNew}
            title="Create new snippet (⌘N)"
          >
            <Plus size={14} />
            <span>New Snippet</span>
          </button>

          <button
            type="button"
            className="linear-btn-ghost"
            onClick={onResetDefaults}
            title="Reset vault to default starter snippets"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* 3-Pane Body */}
      <div className="linear-panes">
        {/* Pane 1: Sidebar Categories */}
        <aside className="linear-sidebar">
          <div className="linear-sidebar-title">CATEGORIES</div>
          <div className="linear-sidebar-list">
            {categories.map((c) => {
              const count = categoryCounts[c.value] || 0;
              const isActive = activeCategory === c.value && !onlyPinned;
              return (
                <button
                  key={c.value}
                  type="button"
                  className={`linear-side-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (onlyPinned) onTogglePinned();
                    onSelectCategory(c.value);
                  }}
                >
                  <div className="linear-side-label">
                    {c.icon}
                    <span>{c.label}</span>
                  </div>
                  <span className="linear-side-count">{count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Pane 2: Command Stream List */}
        <section className="linear-stream" role="listbox" aria-label="Command snippets">
          <div className="linear-stream-header">
            <span>COMMANDS ({snippets.length})</span>
            <span style={{ fontSize: '0.72rem', color: '#71717a' }}>↑↓ to navigate</span>
          </div>

          <div className="linear-stream-content">
            {snippets.length === 0 ? (
              <div className="linear-empty">
                <Terminal size={24} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                <div>No commands found</div>
                <p style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '0.25rem' }}>
                  Try relaxing your search query or switch categories.
                </p>
              </div>
            ) : (
              snippets.map((s, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={s.id}
                    ref={isSelected ? selectedCardRef : null}
                    className={`linear-card ${isSelected ? 'active' : ''}`}
                    onClick={() => onSelectIndex(idx)}
                    onDoubleClick={() => onCopyCommand(s.command)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="linear-card-top">
                      <span className="linear-card-name">
                        {s.isPinned && (
                          <Star size={12} fill="#fbbf24" stroke="#fbbf24" style={{ flexShrink: 0 }} />
                        )}
                        <span>{s.title}</span>
                      </span>
                      <span className={`linear-tag linear-tag-${s.category}`}>
                        {s.category}
                      </span>
                    </div>

                    <p className="linear-card-desc">{s.description}</p>

                    <div className="linear-card-footer">
                      <code className="linear-card-preview">{s.command}</code>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Pane 3: Inspector / Parameter Pane */}
        <section className="linear-inspector">
          {activeSnippet ? (
            <div className="linear-inspector-inner">
              {/* Header Info */}
              <div className="linear-inspect-head">
                <div>
                  <div className="linear-inspect-meta">
                    <span className={`linear-tag linear-tag-${activeSnippet.category}`}>
                      {activeSnippet.category}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#71717a' }}>ID: {activeSnippet.id}</span>
                  </div>
                  <h2 className="linear-inspect-title">{activeSnippet.title}</h2>
                  <p className="linear-inspect-desc">{activeSnippet.description}</p>
                </div>

                <div className="linear-inspect-controls">
                  <button
                    type="button"
                    className="linear-icon-btn"
                    onClick={() => onTogglePin(activeSnippet.id)}
                    data-tooltip-pos="bottom"
                    data-tooltip={activeSnippet.isPinned ? 'Unpin snippet (⌘P)' : 'Pin snippet (⌘P)'}
                  >
                    <Star
                      size={15}
                      fill={activeSnippet.isPinned ? '#fbbf24' : 'transparent'}
                      stroke={activeSnippet.isPinned ? '#fbbf24' : 'currentColor'}
                    />
                  </button>
                  <button
                    type="button"
                    className="linear-icon-btn"
                    onClick={() => onEdit(activeSnippet)}
                    data-tooltip-pos="bottom"
                    data-tooltip="Edit snippet"
                  >
                    <Edit3 size={15} />
                  </button>
                  <div className="delete-btn-wrapper">
                    <button
                      type="button"
                      className="linear-icon-btn linear-icon-danger"
                      onClick={() => setShowDeleteConfirm((prev) => !prev)}
                      data-tooltip-pos="bottom"
                      data-tooltip={showDeleteConfirm ? '' : 'Delete snippet'}
                      aria-haspopup="dialog"
                      aria-expanded={showDeleteConfirm}
                    >
                      <Trash2 size={15} />
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

              {/* Ready-to-run Code Box */}
              <div className="linear-codebox">
                <div className="linear-code-inner">
                  <code>{resolvedCommand}</code>
                </div>
                <button
                  type="button"
                  className={`linear-copy-button ${copied ? 'copied' : ''}`}
                  onClick={handleCopy}
                  data-tooltip-pos="bottom"
                  data-tooltip="Copy resolved command (↵)"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Command (↵)'}</span>
                </button>
              </div>

              {/* Parameter Substitution Inputs */}
              {activeSnippet.placeholders && activeSnippet.placeholders.length > 0 && (
                <div className="linear-params-wrap">
                  <div className="linear-section-heading">
                    <Sliders size={13} />
                    <span>INTERACTIVE PARAMETERS</span>
                  </div>
                  <div className="linear-params-list">
                    {activeSnippet.placeholders.map((p) => (
                      <div key={p.key} className="linear-param-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label
                            className="linear-param-label"
                            data-tooltip-pos="bottom"
                            data-tooltip={`Replaces ${p.key} in command`}
                          >
                            {p.label || p.key}
                          </label>
                          <span style={{ fontSize: '0.72rem', color: '#737373', fontFamily: 'var(--font-mono)' }}>{p.key}</span>
                        </div>
                        <input
                          type="text"
                          className="linear-param-field"
                          placeholder={p.defaultValue}
                          value={paramValues[p.key] || ''}
                          onChange={(e) =>
                            setParamValues((prev) => ({ ...prev, [p.key]: e.target.value }))
                          }
                          data-tooltip-pos="bottom"
                          data-tooltip={`Default: ${p.defaultValue}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Explanations & Documentation */}
              {activeSnippet.explanationMarkdown && (
                <div className="linear-docs-wrap">
                  <div className="linear-section-heading">FLAGS & USAGE NOTES</div>
                  <div
                    className="linear-docs-body"
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
                <div className="linear-tags-wrap">
                  <Tag size={13} style={{ color: '#71717a' }} />
                  {activeSnippet.tags.map((t) => (
                    <span key={t} className="linear-tag-chip">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="linear-empty">Select a snippet from the list to view options</div>
          )}
        </section>
      </div>

      {/* Bottom Shortcuts HUD */}
      <div className="linear-footer">
        <div className="linear-footer-shortcuts">
          <span><kbd className="linear-kbd">↑↓</kbd> Navigate</span>
          <span><kbd className="linear-kbd">↵</kbd> Copy</span>
          <span><kbd className="linear-kbd">⌘K</kbd> Search</span>
          <span><kbd className="linear-kbd">⌘P</kbd> Pin</span>
          <span><kbd className="linear-kbd">⌘N</kbd> New</span>
          <span><kbd className="linear-kbd">⌘M</kbd> Toggle View</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#71717a' }}>
          Linear Precision UI // CommandVault
        </div>
      </div>
    </div>
  );
};
