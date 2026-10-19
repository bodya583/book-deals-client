import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { getBooks, createBook, updateBook, deleteBook } from '../../../api/booksApi';
import api from '../../../api/axiosInstance';
import type { Book, BookFormData } from '../../../types/book';
import type { ToastMessage } from '../../../components/Toast';

export const useProfilePage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const userId = user?.id;
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));

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

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    getBooks({ userId })
      .then((data) => {
        if (isMounted) {
          setBooks(data.books || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      logout();
      navigate('/login');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указано';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  // Modals open/close helpers
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
    showToast(`Книга «${newBook.title}» успешно добавлена!`);
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
    navigate,
    handleLogout,
    formatDate,
    getInitials,
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

export default useProfilePage;
