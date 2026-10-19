import api from './axiosInstance';
import type { Book, BooksResponse, BookFormData, Genre } from '../types/book';

export interface GetBooksParams {
  userId?: string;
  search?: string;
  genre?: string;
  genres?: string[];
  strictGenres?: boolean;
  language?: string;
  languages?: string[];
  year?: number;
  yearFrom?: number;
  yearTo?: number;
  page?: number;
  limit?: number;
}

export const getBooks = async (params?: GetBooksParams): Promise<BooksResponse> => {
  const queryParams: Record<string, any> = { ...params };

  if (Array.isArray(params?.genres)) {
    queryParams.genres = params.genres.join(',');
  }
  if (Array.isArray(params?.languages)) {
    queryParams.languages = params.languages.join(',');
  }

  const response = await api.get<BooksResponse>('/books', { params: queryParams });
  return response.data;
};

export const getBookDetails = async (id: string): Promise<Book & { moreByAuthor?: Partial<Book>[] }> => {
  const response = await api.get<Book & { moreByAuthor?: Partial<Book>[] }>(`/books/${id}/details`);
  return response.data;
};

export const getGenres = async (): Promise<Genre[]> => {
  const response = await api.get<Genre[]>('/genres');
  return response.data;
};

export const createBook = async (data: BookFormData): Promise<Book> => {
  const payload = {
    title: data.title.trim(),
    author: data.author.trim(),
    description: data.description?.trim() || undefined,
    coverURL: data.coverURL?.trim() || undefined,
    language: data.language?.trim() || undefined,
    year: typeof data.year === 'number' && !isNaN(data.year) ? data.year : undefined,
    genres: data.genres,
  };
  const response = await api.post<Book>('/books', payload);
  return response.data;
};

export const updateBook = async (id: string, data: Partial<BookFormData>): Promise<Book> => {
  const payload = {
    ...(data.title !== undefined && { title: data.title.trim() }),
    ...(data.author !== undefined && { author: data.author.trim() }),
    ...(data.description !== undefined && { description: data.description.trim() }),
    ...(data.coverURL !== undefined && { coverURL: data.coverURL.trim() }),
    ...(data.language !== undefined && { language: data.language?.trim() || null }),
    ...(data.year !== undefined && {
      year: typeof data.year === 'number' && !isNaN(data.year) ? data.year : null,
    }),
    ...(data.genres !== undefined && { genres: data.genres }),
  };
  const response = await api.put<Book>(`/books/${id}`, payload);
  return response.data;
};

export const deleteBook = async (id: string): Promise<void> => {
  await api.delete(`/books/${id}`);
};
