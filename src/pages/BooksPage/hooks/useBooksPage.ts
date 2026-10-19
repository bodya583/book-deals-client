import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { getBooks, createBook, updateBook, deleteBook } from '../../../api/booksApi';
import type { Book, BookFormData } from '../../../types/book';
import type { ToastMessage } from '../../../components/Toast';

export const useBooksPage = () => {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals state
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

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch books
  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    getBooks({
      userId,
      search: debouncedSearch.trim() || undefined,
    })
      .then((data) => {
        if (isMounted) {
          setBooks(data.books || []);
          setError('');
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Не удалось загрузить книги';
          setError(msg);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId, debouncedSearch]);

  const handleManualRefresh = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getBooks({
        userId,
        search: debouncedSearch.trim() || undefined,
      });
      setBooks(data.books || []);
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не удалось загрузить книги';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Modal open/close helpers
  const openDetails = (book: Book) => setSelectedBook(book);
  const closeDetails = () => setSelectedBook(null);

  const openCreate = () => setFormModal({ isOpen: true, mode: 'create', book: null });
  const openEdit = (book: Book) => setFormModal({ isOpen: true, mode: 'edit', book });
  const closeForm = () => setFormModal({ isOpen: false, mode: 'create', book: null });

  const openDelete = (book: Book) => setDeletingBook(book);
  const closeDelete = () => setDeletingBook(null);

  // CRUD actions
  const handleCreateSubmit = async (formData: BookFormData) => {
    const newBook = await createBook(formData);
    setBooks((prev) => [newBook, ...prev]);
    showToast(`Книга «${newBook.title}» успешно добавлена в библиотеку!`);
  };

  const handleUpdateSubmit = async (formData: BookFormData) => {
    if (!formModal.book) return;
    const updated = await updateBook(formModal.book.id, formData);
    setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    if (selectedBook?.id === updated.id) {
      setSelectedBook(updated);
    }
    showToast(`Книга «${updated.title}» успешно обновлена!`);
  };

  const handleDeleteConfirm = async (bookId: string) => {
    await deleteBook(bookId);
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    if (selectedBook?.id === bookId) {
      setSelectedBook(null);
    }
    showToast('Книга успешно удалена из библиотеки', 'info');
  };

  const submitForm = formModal.mode === 'create' ? handleCreateSubmit : handleUpdateSubmit;

  return {
    user,
    userId,
    books,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    handleManualRefresh,
    // Modals state & actions
    modalsState: {
      selectedBook,
      formModal,
      deletingBook,
    },
    modalsActions: {
      openDetails,
      closeDetails,
      openCreate,
      openEdit,
      closeForm,
      openDelete,
      closeDelete,
      submitForm,
      confirmDelete: handleDeleteConfirm,
    },
    // Toasts
    toasts,
    removeToast,
  };
};

export default useBooksPage;
