export interface BookOwner {
  id: string;
  username: string;
  photoURL?: string | null;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string | null;
  coverURL: string | null;
  userId: string | null;
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

export interface BookFormData {
  title: string;
  author: string;
  description: string;
  coverURL: string;
}

export type ModalType = 
  | { type: 'NONE' }
  | { type: 'DETAILS'; book: Book }
  | { type: 'CREATE' }
  | { type: 'EDIT'; book: Book }
  | { type: 'DELETE'; book: Book };
