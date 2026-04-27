import { FIXED_SUGGESTION, SUGGESTION_POOL, WELCOME_POOL } from './content-pools';

export function getRandomSuggestions(count: number, lang: string): string[] {
  const pool = SUGGESTION_POOL[lang] ?? SUGGESTION_POOL['English'];
  const fixed = FIXED_SUGGESTION[lang] ?? FIXED_SUGGESTION['English'];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return [fixed, ...shuffled.slice(0, count)];
}

export function getRandomWelcome(lang: string): string {
  const pool = WELCOME_POOL[lang] ?? WELCOME_POOL['English'];
  return pool[Math.floor(Math.random() * pool.length)];
}
