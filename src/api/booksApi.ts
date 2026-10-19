import api from './axiosInstance';
import type { Book, BooksResponse, BookFormData } from '../types/book';

export const getBooks = async (params?: {
  userId?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<BooksResponse> => {
  const response = await api.get<BooksResponse>('/books', { params });
  return response.data;
};

export const getBookDetails = async (id: string): Promise<Book & { moreByAuthor?: Partial<Book>[] }> => {
  const response = await api.get<Book & { moreByAuthor?: Partial<Book>[] }>(`/books/${id}/details`);
  return response.data;
};

export const createBook = async (data: BookFormData): Promise<Book> => {
  const payload = {
    title: data.title.trim(),
    author: data.author.trim(),
    description: data.description?.trim() || undefined,
    coverURL: data.coverURL?.trim() || undefined,
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
  };
  const response = await api.put<Book>(`/books/${id}`, payload);
  return response.data;
};

export const deleteBook = async (id: string): Promise<void> => {
  await api.delete(`/books/${id}`);
};
