import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { getUserProfileById } from '../../../api/usersApi';
import { createBook, updateBook, deleteBook, setBookTradeStatus } from '../../../api/booksApi';
import api from '../../../api/axiosInstance';
import type { Book, BookFormData } from '../../../types/book';
import type { ToastMessage } from '../../../components/Toast';
import { useBookModals } from '../../BooksPage/hooks/useBookModals';
import { useTranslation } from '../../../i18n';
import type { ProfileUser } from '../components/ProfileHero';

export type ProfileTradeFilter = 'all' | 'for_trade' | 'hidden';

export interface ProfileBooksFiltersController {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  tradeFilter: ProfileTradeFilter;
  setTradeFilter: (f: ProfileTradeFilter) => void;
  genreFilter: string;
  setGenreFilter: (g: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  hasActive: boolean;
  reset: () => void;
}

export const useProfileBooks = (routeUserId?: string, currentUserId?: string) => {
  const { t, tApiError } = useTranslation();
  const tRef = useRef(t);
  const tApiErrorRef = useRef(tApiError);
  tRef.current = t;
  tApiErrorRef.current = tApiError;

  const isOtherUser = Boolean(routeUserId && routeUserId !== currentUserId);

  const [otherUser, setOtherUser] = useState<ProfileUser | null>(null);
  const [otherBooks, setOtherBooks] = useState<Book[]>([]);
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [togglingBookId, setTogglingBookId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(isOtherUser);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const modals = useBookModals();

  const [searchQuery, setSearchQuery] = useState('');
  const [tradeFilter, setTradeFilter] = useState<ProfileTradeFilter>('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    if (!isOtherUser || !routeUserId) return;

    const fetchOtherProfile = async () => {
      try {
        setLoading(true);
        const [profileData, booksRes] = await Promise.all([
          getUserProfileById(routeUserId),
          api.get('/books', { params: { userId: routeUserId, limit: 100 } }),
        ]);
        setOtherUser(profileData);
        const books = booksRes.data.books || booksRes.data || [];
        setOtherBooks(books.filter((b: Book) => b.isForTrade !== false));
      } catch {
        // Fallback handled gracefully
      } finally {
        setLoading(false);
      }
    };

    fetchOtherProfile();
  }, [isOtherUser, routeUserId]);

  useEffect(() => {
    if (isOtherUser || !currentUserId) return;

    api
      .get('/books', { params: { userId: currentUserId, limit: 100 } })
      .then((res) => setMyBooks(res.data.books || res.data || []))
      .catch(() => {});
  }, [isOtherUser, currentUserId]);

  const toggleTradeStatus = useCallback(async (book: Book) => {
    const nextStatus = !(book.isForTrade ?? true);
    try {
      setTogglingBookId(book.id);
      await setBookTradeStatus(book.id, nextStatus);
      setMyBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, isForTrade: nextStatus } : b))
      );
    } catch {
      // ignore
    } finally {
      setTogglingBookId(null);
    }
  }, []);

  const submitForm = useCallback(
    async (formData: BookFormData): Promise<void> => {
      try {
        if (modals.state.formModal.mode === 'create') {
          const newBook = await createBook(formData);
          setMyBooks((prev) => [newBook, ...prev]);
          showToast(tRef.current('catalog.toastBookAdded'));
        } else if (modals.state.formModal.mode === 'edit' && modals.state.formModal.book) {
          const updated = await updateBook(modals.state.formModal.book.id, formData);
          setMyBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
          showToast(tRef.current('catalog.toastBookUpdated'));
        }
        modals.actions.closeForm();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : tRef.current('catalog.errSaveBook');
        showToast(tApiErrorRef.current(message), 'error');
      }
    },
    [modals.state.formModal, modals.actions, showToast]
  );

  const confirmDelete = useCallback(
    async (_bookId?: string): Promise<void> => {
      const target = modals.state.deletingBook;
      if (!target) return;
      try {
        await deleteBook(target.id);
        setMyBooks((prev) => prev.filter((b) => b.id !== target.id));
        showToast(tRef.current('catalog.toastBookDeleted'));
        modals.actions.closeDelete();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : tRef.current('catalog.errDeleteBook');
        showToast(tApiErrorRef.current(message), 'error');
      }
    },
    [modals.state.deletingBook, modals.actions, showToast]
  );

  const source = isOtherUser ? otherBooks : myBooks;

  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    source.forEach((b) => b.genres?.forEach((g) => g.name && set.add(g.name)));
    return Array.from(set).sort();
  }, [source]);

  const filtered = useMemo(() => {
    return source
      .filter((book) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          if (
            !book.title?.toLowerCase().includes(q) &&
            !book.author?.toLowerCase().includes(q)
          ) {
            return false;
          }
        }
        if (!isOtherUser && tradeFilter !== 'all') {
          const inTrade = book.isForTrade !== false;
          if (tradeFilter === 'for_trade' && !inTrade) return false;
          if (tradeFilter === 'hidden' && inTrade) return false;
        }
        if (genreFilter !== 'all' && !book.genres?.some((g) => g.name === genreFilter)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title_asc') return (a.title || '').localeCompare(b.title || '');
        if (sortBy === 'title_desc') return (b.title || '').localeCompare(a.title || '');
        if (sortBy === 'year_desc') return (b.year || 0) - (a.year || 0);
        if (sortBy === 'year_asc') return (a.year || 0) - (b.year || 0);
        return 0;
      });
  }, [source, searchQuery, tradeFilter, genreFilter, sortBy, isOtherUser]);

  const hasActive = Boolean(
    searchQuery.trim() ||
      (!isOtherUser && tradeFilter !== 'all') ||
      genreFilter !== 'all' ||
      sortBy !== 'default'
  );

  const reset = useCallback(() => {
    setSearchQuery('');
    setTradeFilter('all');
    setGenreFilter('all');
    setSortBy('default');
  }, []);

  const filters: ProfileBooksFiltersController = {
    searchQuery,
    setSearchQuery,
    tradeFilter,
    setTradeFilter,
    genreFilter,
    setGenreFilter,
    sortBy,
    setSortBy,
    hasActive,
    reset,
  };

  const modalBundle = useMemo(
    () => ({
      state: modals.state,
      actions: {
        ...modals.actions,
        submitForm,
        confirmDelete,
      },
    }),
    [modals.state, modals.actions, submitForm, confirmDelete]
  );

  return {
    isOtherUser,
    otherUser,
    loading,
    books: {
      source,
      filtered,
      availableGenres,
      togglingBookId,
      toggleTradeStatus,
    },
    filters,
    modals: modalBundle,
    toasts: { items: toasts, remove: removeToast },
  };
};
