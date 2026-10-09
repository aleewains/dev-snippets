import { Snippet } from '../types/snippet';

export interface ScoredSnippet {
  snippet: Snippet;
  score: number;
}

export function fuzzyScore(target: string, query: string): number {
  const t = target.toLowerCase();
  const q = query.toLowerCase().trim();

  if (!q) return 1;
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60 + (q.length / t.length) * 20;

  // Subsequence matching
  let tIndex = 0;
  let qIndex = 0;
  let matches = 0;

  while (tIndex < t.length && qIndex < q.length) {
    if (t[tIndex] === q[qIndex]) {
      matches++;
      qIndex++;
    }
    tIndex++;
  }

  if (qIndex === q.length) {
    return 30 + (matches / t.length) * 15;
  }

  return 0;
}

export function filterAndScoreSnippets(
  snippets: Snippet[],
  query: string,
  category: string,
  onlyPinned: boolean
): Snippet[] {
  const trimmed = query.trim().toLowerCase();

  return snippets
    .filter((s) => {
      if (onlyPinned && !s.isPinned) return false;
      if (category !== 'all' && s.category !== category) return false;
      return true;
    })
    .map((snippet) => {
      if (!trimmed) {
        // Unscored sorting: pinned first, then updated recently
        return { snippet, score: snippet.isPinned ? 10 : 1 };
      }

      const titleScore = fuzzyScore(snippet.title, trimmed) * 3;
      const cmdScore = fuzzyScore(snippet.command, trimmed) * 2.5;
      const descScore = fuzzyScore(snippet.description, trimmed) * 1.5;
      const tagsScore = snippet.tags.some((t) => fuzzyScore(t, trimmed) > 40) ? 50 : 0;
      const pinBonus = snippet.isPinned ? 15 : 0;

      const totalScore = Math.max(titleScore, cmdScore, descScore, tagsScore) + pinBonus;
      return { snippet, score: totalScore };
    })
    .filter((item) => !trimmed || item.score > 20)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.snippet);
}
