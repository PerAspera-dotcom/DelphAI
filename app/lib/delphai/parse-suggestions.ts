import type { Suggestions } from './types';

export function parseSuggestions(text: string): { clean: string; suggestions: Suggestions | null } {
  const match = text.match(/\[SUGGESTIONS\]([\s\S]*?)\[\/SUGGESTIONS\]/i);
  if (!match) return { clean: text, suggestions: null };
  const clean = text.replace(match[0], '').trim();
  try {
    const suggestions = JSON.parse(match[1].trim()) as Suggestions;
    return { clean, suggestions };
  } catch {
    return { clean, suggestions: null };
  }
}
