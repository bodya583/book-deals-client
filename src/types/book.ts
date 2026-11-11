export interface BookOwner {
  id: string;
  username: string;
  photoURL?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface Settlement {
  name: string;
  count?: number;
  latitude: number;
  longitude: number;
}

export interface Genre {
  id: string;
  name: string;
  _count?: {
    books: number;
  };
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  coverURL: string | null;
  language?: string | null;
  year?: number | null;
  genres?: Genre[];
  userId: string | null;
  isForTrade?: boolean;
  createdAt: string;
  updatedAt?: string;
  user?: BookOwner | null;
}

export interface BooksPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BooksResponse {
  books: Book[];
  pagination: BooksPagination;
}

export type BookSortOption = 'newest' | 'oldest' | 'title_asc' | 'title_desc' | 'distance' | 'popular';

export interface BookFormData {
  title: string;
  author: string;
  description: string;
  coverURL: string;
  language?: string;
  year?: number | null;
  genres?: string[];
}

export type ModalType =
  | { type: 'NONE' }
  | { type: 'DETAILS'; book: Book }
  | { type: 'CREATE' }
  | { type: 'EDIT'; book: Book }
  | { type: 'DELETE'; book: Book };

export const BOOK_LANGUAGES = [
  'Українська',
  'English',
  'Deutsch',
  'Français',
  'Español',
  'Polski',
  'Italiano',
  'Other',
] as const;

export { formatBookYear } from '../utils/formatters';
