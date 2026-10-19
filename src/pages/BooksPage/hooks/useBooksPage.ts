import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { getBooks, getGenres, createBook, updateBook, deleteBook } from '../../../api/booksApi';
import type { Book, BookFormData, Genre, BooksPagination } from '../../../types/book';
import type { ToastMessage } from '../../../components/Toast';

export interface UseBooksPageOptions {
  scope?: 'my' | 'all';
}

export const useBooksPage = ({ scope = 'my' }: UseBooksPageOptions = {}) => {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;

  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [pagination, setPagination] = useState<BooksPagination>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [strictGenres, setStrictGenres] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

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

  // Fetch available genres from backend
  const fetchGenres = useCallback(async () => {
    try {
      const data = await getGenres();
      setGenres(data || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  // Reset page to 1 whenever search, scope, or any filter changes
  useEffect(() => {
    setPage(1);
  }, [scope, debouncedSearch, selectedGenres, strictGenres, selectedLanguages, yearFrom, yearTo]);

  // Fetch books when filters or search change
  useEffect(() => {
    if (scope === 'my' && !userId) return;
    let isMounted = true;
    setLoading(true);

    const parsedYearFrom = yearFrom.trim() && !isNaN(Number(yearFrom)) ? Number(yearFrom) : undefined;
    const parsedYearTo = yearTo.trim() && !isNaN(Number(yearTo)) ? Number(yearTo) : undefined;

    getBooks({
      userId: scope === 'my' ? userId : undefined,
      search: debouncedSearch.trim() || undefined,
      genres: selectedGenres.length > 0 ? selectedGenres : undefined,
      strictGenres,
      languages: selectedLanguages.length > 0 ? selectedLanguages : undefined,
      yearFrom: parsedYearFrom,
      yearTo: parsedYearTo,
      page,
      limit,
    })
      .then((data) => {
        if (isMounted) {
          setBooks(data.books || []);
          if (data.pagination) {
            setPagination(data.pagination);
          }
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
  }, [scope, userId, debouncedSearch, selectedGenres, strictGenres, selectedLanguages, yearFrom, yearTo, page, limit]);

  const handleManualRefresh = async () => {
    if (scope === 'my' && !userId) return;
    setLoading(true);
    try {
      const parsedYearFrom = yearFrom.trim() && !isNaN(Number(yearFrom)) ? Number(yearFrom) : undefined;
      const parsedYearTo = yearTo.trim() && !isNaN(Number(yearTo)) ? Number(yearTo) : undefined;

      const [booksData] = await Promise.all([
        getBooks({
          userId: scope === 'my' ? userId : undefined,
          search: debouncedSearch.trim() || undefined,
          genres: selectedGenres.length > 0 ? selectedGenres : undefined,
          strictGenres,
          languages: selectedLanguages.length > 0 ? selectedLanguages : undefined,
          yearFrom: parsedYearFrom,
          yearTo: parsedYearTo,
          page,
          limit,
        }),
        fetchGenres(),
      ]);
      setBooks(booksData.books || []);
      if (booksData.pagination) {
        setPagination(booksData.pagination);
      }
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не удалось загрузить книги';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genreName: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreName) ? prev.filter((g) => g !== genreName) : [...prev, genreName]
    );
  };

  const toggleLanguage = (langName: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(langName) ? prev.filter((l) => l !== langName) : [...prev, langName]
    );
  };

  const setYearRange = (from: string, to: string) => {
    setYearFrom(from);
    setYearTo(to);
  };

  const changePage = (newPage: number, scrollToTop = false) => {
    const target = Math.max(1, Math.min(pagination.totalPages || 1, newPage));
    setPage(target);
    if (scrollToTop && typeof window !== 'undefined') {
      const targetEl =
        document.querySelector('.books-toolbar-section') ||
        document.querySelector('.books-main-container');
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const changeLimit = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedGenres([]);
    setStrictGenres(false);
    setSelectedLanguages([]);
    setYearFrom('');
    setYearTo('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    debouncedSearch.trim() ||
    selectedGenres.length > 0 ||
    selectedLanguages.length > 0 ||
    yearFrom.trim() ||
    yearTo.trim()
  );

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
    fetchGenres();
    showToast(`Книга «${newBook.title}» успешно добавлена в библиотеку!`);
  };

  const handleUpdateSubmit = async (formData: BookFormData) => {
    if (!formModal.book) return;
    const updated = await updateBook(formModal.book.id, formData);
    setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    if (selectedBook?.id === updated.id) {
      setSelectedBook(updated);
    }
    fetchGenres();
    showToast(`Книга «${updated.title}» успешно обновлена!`);
  };

  const handleDeleteConfirm = async (bookId: string) => {
    await deleteBook(bookId);
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    if (selectedBook?.id === bookId) {
      setSelectedBook(null);
    }
    fetchGenres();
    showToast('Книга успешно удалена из библиотеки', 'info');
  };

  const submitForm = formModal.mode === 'create' ? handleCreateSubmit : handleUpdateSubmit;

  return {
    user,
    userId,
    books,
    genres,
    loading,
    error,
    // Pagination
    page,
    setPage,
    limit,
    setLimit,
    pagination,
    changePage,
    changeLimit,
    // Search
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    // Genres filter
    selectedGenres,
    setSelectedGenres,
    toggleGenre,
    strictGenres,
    setStrictGenres,
    // Languages filter
    selectedLanguages,
    setSelectedLanguages,
    toggleLanguage,
    // Year filter
    yearFrom,
    setYearFrom,
    yearTo,
    setYearTo,
    setYearRange,
    // Global filter resets & state
    resetFilters,
    hasActiveFilters,
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
