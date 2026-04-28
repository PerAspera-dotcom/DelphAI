export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export type Mode = 'philosopher' | 'reader' | 'seance';

export type Suggestions = {
  affirmative: string;
  negative: string;
  more: string[];
};
