import { useState, useCallback, useMemo } from 'react';
import type { Book } from '../../../types/book';

export const useBookModals = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    book: Book | null;
  }>({
    isOpen: false,
    mode: 'create',
    book: null,
  });
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);

  const openDetails = useCallback((book: Book) => setSelectedBook(book), []);
  const closeDetails = useCallback(() => setSelectedBook(null), []);
  const openCreate = useCallback(
    () => setFormModal({ isOpen: true, mode: 'create', book: null }),
    []
  );
  const openEdit = useCallback(
    (book: Book) => setFormModal({ isOpen: true, mode: 'edit', book }),
    []
  );
  const closeForm = useCallback(
    () => setFormModal({ isOpen: false, mode: 'create', book: null }),
    []
  );
  const openDelete = useCallback((book: Book) => setDeletingBook(book), []);
  const closeDelete = useCallback(() => setDeletingBook(null), []);

  const state = useMemo(
    () => ({ selectedBook, formModal, deletingBook }),
    [selectedBook, formModal, deletingBook]
  );

  const actions = useMemo(
    () => ({ openDetails, closeDetails, openCreate, openEdit, closeForm, openDelete, closeDelete }),
    [openDetails, closeDetails, openCreate, openEdit, closeForm, openDelete, closeDelete]
  );

  return { state, actions };
};
