import { Snippet } from '../types/snippet';
import { DEFAULT_SNIPPETS } from '../data/defaultSnippets';

const STORAGE_KEY = 'dev_snippets_vault_v1';

export function loadSnippets(): Snippet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SNIPPETS));
      return DEFAULT_SNIPPETS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load snippets from localStorage:', err);
    return DEFAULT_SNIPPETS;
  }
}

export function saveSnippets(snippets: Snippet[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
  } catch (err) {
    console.error('Failed to save snippets to localStorage:', err);
  }
}

export function resetToDefaults(): Snippet[] {
  saveSnippets(DEFAULT_SNIPPETS);
  return DEFAULT_SNIPPETS;
}

export function exportSnippetsToJson(snippets: Snippet[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snippets, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `commandvault-backup-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
