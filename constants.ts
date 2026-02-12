import { Author } from './types';

export const AUTHOR_COLORS = {
  [Author.Amiram]: {
    bg: 'bg-blue-100',
    border: 'border-blue-500',
    text: 'text-blue-800',
    badge: 'bg-blue-500'
  },
  [Author.David]: {
    bg: 'bg-green-100',
    border: 'border-green-500',
    text: 'text-green-800',
    badge: 'bg-green-500'
  },
  [Author.Shoval]: {
    bg: 'bg-purple-100',
    border: 'border-purple-500',
    text: 'text-purple-800',
    badge: 'bg-purple-500'
  }
};

export const AVATARS = {
  [Author.Amiram]: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amiram&backgroundColor=b6e3f4",
  [Author.David]: "https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=c0aede",
  [Author.Shoval]: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shoval&backgroundColor=ffdfbf"
};
