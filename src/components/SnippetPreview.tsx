import React, { useState, useEffect } from 'react';
import { Snippet } from '../types/snippet';
import { Copy, Check, Star, Edit3, Trash2, Sliders, Tag } from 'lucide-react';

interface SnippetPreviewProps {
  snippet: Snippet | null;
  onCopy: (customizedCommand: string) => void;
  onTogglePin: (id: string) => void;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
}

export const SnippetPreview: React.FC<SnippetPreviewProps> = ({
  snippet,
  onCopy,
  onTogglePin,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  // Reset param values whenever snippet changes
  useEffect(() => {
    if (!snippet) {
      setParamValues({});
      return;
    }

    const initial: Record<string, string> = {};
    snippet.placeholders?.forEach((p) => {
      initial[p.key] = p.defaultValue;
    });
    setParamValues(initial);
  }, [snippet]);

  if (!snippet) {
    return (
      <div className="snippet-detail-column" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select a snippet to preview details</p>
      </div>
    );
  }

  // Calculate command string with customized parameter values
  let resolvedCommand = snippet.command;
  Object.entries(paramValues).forEach(([key, val]) => {
    if (val.trim()) {
      resolvedCommand = resolvedCommand.split(key).join(val.trim());
    }
  });

  const handleCopy = () => {
    onCopy(resolvedCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="snippet-detail-column">
      {/* Detail Header */}
      <div className="detail-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className={`snippet-meta-badge badge-${snippet.category}`}>
              {snippet.category}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {snippet.id}</span>
          </div>
          <h3 className="detail-title">{snippet.title}</h3>
          <p className="detail-desc">{snippet.description}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            type="button"
            className="copy-button"
            style={{ padding: '0.4rem', borderRadius: '4px' }}
            onClick={() => onTogglePin(snippet.id)}
            title={snippet.isPinned ? 'Unfavorite snippet' : 'Favorite snippet'}
          >
            <Star
              size={15}
              fill={snippet.isPinned ? '#fbbf24' : 'transparent'}
              stroke={snippet.isPinned ? '#fbbf24' : 'currentColor'}
            />
          </button>
          <button
            type="button"
            className="copy-button"
            style={{ padding: '0.4rem', borderRadius: '4px' }}
            onClick={() => onEdit(snippet)}
            title="Edit snippet"
          >
            <Edit3 size={15} />
          </button>
          <button
            type="button"
            className="copy-button"
            style={{ padding: '0.4rem', borderRadius: '4px', color: 'var(--accent-rose)' }}
            onClick={() => onDelete(snippet.id)}
            title="Delete snippet"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Command Block with 1-click Copy */}
      <div className="command-block">
        <code>{resolvedCommand}</code>
        <button
          type="button"
          className={`copy-button ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title="Copy command to clipboard (↵)"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy (↵)'}
        </button>
      </div>

      {/* Interactive Placeholder Replacers */}
      {snippet.placeholders && snippet.placeholders.length > 0 && (
        <div className="placeholders-panel">
          <div className="placeholders-title">
            <Sliders size={13} />
            <span>Customize Arguments</span>
          </div>

          {snippet.placeholders.map((p) => (
            <div key={p.key} className="placeholder-row">
              <label htmlFor={`param-${p.key}`} className="placeholder-key">
                {p.key}
              </label>
              <input
                id={`param-${p.key}`}
                type="text"
                className="placeholder-input"
                placeholder={p.defaultValue}
                value={paramValues[p.key] || ''}
                onChange={(e) =>
                  setParamValues((prev) => ({ ...prev, [p.key]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>
      )}

      {/* Markdown Notes / Documentation */}
      {snippet.explanationMarkdown && (
        <div className="markdown-notes">
          <div
            dangerouslySetInnerHTML={{
              __html: snippet.explanationMarkdown
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                .replace(/\n- (.*$)/gim, '<li>$1</li>')
                .replace(/\n\n/g, '<br/>'),
            }}
          />
        </div>
      )}

      {/* Tags */}
      {snippet.tags.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <Tag size={13} style={{ color: 'var(--text-muted)' }} />
          {snippet.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
