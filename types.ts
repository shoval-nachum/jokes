export enum Author {
  Amiram = "Amiram Zocowitzky",
  David = "David Raskin",
  Shoval = "Shoval Nachum"
}

export interface Joke {
  id: string;
  content: string;
  author: Author;
  date: string;
  context?: string; // Optional context if available
}

export type ViewMode = 'swipe' | 'list' | 'grid' | 'cartoon';

export type SortOption = 'newest' | 'oldest' | 'az' | 'za';