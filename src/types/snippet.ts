export type SnippetCategory =
  | 'all'
  | 'docker'
  | 'git'
  | 'bash'
  | 'regex'
  | 'k8s'
  | 'sql'
  | 'custom';

export type ViewMode = 'tui' | 'linear';

export interface SnippetPlaceholder {
  key: string;
  label: string;
  defaultValue: string;
}

export interface Snippet {
  id: string;
  title: string;
  command: string;
  description: string;
  category: SnippetCategory;
  tags: string[];
  isPinned?: boolean;
  explanationMarkdown?: string;
  placeholders?: SnippetPlaceholder[];
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  searchQuery: string;
  activeCategory: SnippetCategory;
  onlyPinned: boolean;
}

