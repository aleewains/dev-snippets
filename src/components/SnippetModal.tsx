import React, { useState, useEffect } from 'react';
import { Snippet, SnippetCategory } from '../types/snippet';
import { X } from 'lucide-react';

interface SnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  snippetToEdit?: Snippet | null;
}

export const SnippetModal: React.FC<SnippetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  snippetToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [command, setCommand] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SnippetCategory>('custom');
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (snippetToEdit) {
      setTitle(snippetToEdit.title);
      setCommand(snippetToEdit.command);
      setDescription(snippetToEdit.description);
      setCategory(snippetToEdit.category);
      setTagsInput(snippetToEdit.tags.join(', '));
      setNotes(snippetToEdit.explanationMarkdown || '');
    } else {
      setTitle('');
      setCommand('');
      setDescription('');
      setCategory('custom');
      setTagsInput('');
      setNotes('');
    }
    setError(null);
  }, [snippetToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !command.trim()) {
      setError('Please provide both Title and Command.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    // Auto-detect placeholders like <my_param>
    const matches = command.match(/<[^>]+>/g) || [];
    const uniqueKeys = Array.from(new Set(matches));
    const placeholders = uniqueKeys.map((key) => ({
      key,
      label: key.replace(/[<>]/g, ''),
      defaultValue: '',
    }));

    onSave(
      {
        title: title.trim(),
        command: command.trim(),
        description: description.trim() || 'Custom user snippet',
        category,
        tags,
        isPinned: snippetToEdit?.isPinned || false,
        explanationMarkdown: notes.trim() || undefined,
        placeholders,
      },
      snippetToEdit?.id
    );

    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{snippetToEdit ? 'Edit Snippet' : 'New Command Snippet'}</h2>
          <button
            type="button"
            className="action-icon-btn"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  color: '#fda4af',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                }}
              >
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="snip-title">Title *</label>
              <input
                id="snip-title"
                type="text"
                className="form-input"
                placeholder="e.g. Docker Prune Dangling Images"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="snip-cmd">Command / Pattern *</label>
              <textarea
                id="snip-cmd"
                className="form-textarea"
                rows={2}
                style={{ fontFamily: 'var(--font-mono)' }}
                placeholder="e.g. docker rmi $(docker images -f 'dangling=true' -q)"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tip: Use &lt;placeholder&gt; syntax to allow dynamic runtime arguments.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="snip-cat">Category</label>
                <select
                  id="snip-cat"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SnippetCategory)}
                >
                  <option value="custom">Custom</option>
                  <option value="docker">Docker</option>
                  <option value="git">Git</option>
                  <option value="bash">Bash</option>
                  <option value="k8s">Kubernetes</option>
                  <option value="regex">Regex</option>
                  <option value="sql">SQL</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="snip-tags">Tags (comma separated)</label>
                <input
                  id="snip-tags"
                  type="text"
                  className="form-input"
                  placeholder="docker, clean, quick"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="snip-desc">Short Description</label>
              <input
                id="snip-desc"
                type="text"
                className="form-input"
                placeholder="Quick explanation of when and why to run this"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="snip-notes">Markdown Documentation / Flag Notes</label>
              <textarea
                id="snip-notes"
                className="form-textarea"
                rows={3}
                placeholder="### Usage Flags&#10;- `-a`: Target all dangling items&#10;- `-q`: Quiet output"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {snippetToEdit ? 'Save Changes' : 'Create Snippet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
