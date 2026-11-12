import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { getBooks, getGenres, getSettlements, createBook, updateBook, deleteBook } from '../../../api/booksApi';
import type { Book, BookFormData, Genre, Settlement } from '../../../types/book';
import type { ToastMessage } from '../../../components/Toast';
import { useBookFilters } from './useBookFilters';
import { useBookPagination } from './useBookPagination';
import { useBookModals } from './useBookModals';
import { useTranslation } from '../../../i18n';

export interface UseBooksPageOptions {
  scope?: 'my' | 'all';
}

export const useBooksPage = ({ scope = 'my' }: UseBooksPageOptions = {}) => {
  const { t, tApiError } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;

  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const hasLoadedInitial = useRef(false);

  const filters = useBookFilters();
  const pagination = useBookPagination(12);
  const modals = useBookModals();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    Promise.all([getGenres().catch(() => []), getSettlements().catch(() => [])]).then(
      ([genresData, settlementsData]) => {
        setGenres(genresData || []);
        setSettlements(settlementsData || []);
      }
    );
  }, []);

  const { setPage } = pagination;
  useEffect(() => {
    setPage(1);
  }, [
    scope,
    setPage,
    filters.search.debounced,
    filters.genres.selected,
    filters.genres.strict,
    filters.languages.selected,
    filters.location.settlements,
    filters.year.from,
    filters.year.to,
    filters.location.nearMe,
    filters.location.radius,
    filters.location.nearCenter,
    filters.display.sortBy,
  ]);

  const fetchBooks = useCallback(async () => {
    if (scope === 'my' && !userId) return;
    if (!hasLoadedInitial.current) setLoading(true);
    else setIsFetching(true);

    const parsedYearFrom =
      filters.year.from.trim() && !isNaN(Number(filters.year.from))
        ? Number(filters.year.from)
        : undefined;
    const parsedYearTo =
      filters.year.to.trim() && !isNaN(Number(filters.year.to))
        ? Number(filters.year.to)
        : undefined;

    const useProximity = filters.location.nearMe || filters.display.sortBy === 'distance';
    const center = filters.location.nearCenter;
    const effectiveNearLat = useProximity
      ? center
        ? center.lat
        : user?.latitude ?? undefined
      : undefined;
    const effectiveNearLng = useProximity
      ? center
        ? center.lng
        : user?.longitude ?? undefined
      : undefined;

    const isMap = filters.display.viewMode === 'map';

    try {
      setError('');
      const data = await getBooks({
        userId: scope === 'my' ? userId : undefined,
        search: filters.search.debounced.trim() || undefined,
        genres: filters.genres.selected.length > 0 ? filters.genres.selected : undefined,
        strictGenres: filters.genres.strict || undefined,
        languages: filters.languages.selected.length > 0 ? filters.languages.selected : undefined,
        cities: filters.location.settlements.length > 0 ? filters.location.settlements : undefined,
        yearFrom: parsedYearFrom,
        yearTo: parsedYearTo,
        nearLat: effectiveNearLat,
        nearLng: effectiveNearLng,
        radius: filters.location.nearMe || center ? filters.location.radius : undefined,
        sortBy: filters.display.sortBy,
        page: isMap ? 1 : pagination.page,
        limit: isMap ? 100 : pagination.limit,
      });

      setBooks(data.books || []);
      if (data.pagination) {
        pagination.setPagination(data.pagination);
      }
      hasLoadedInitial.current = true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('catalog.errLoadBooks');
      setError(tApiError(message));
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [scope, userId, user?.latitude, user?.longitude, filters, pagination.page, pagination.limit, pagination.setPagination, t, tApiError]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const submitForm = useCallback(
    async (formData: BookFormData): Promise<void> => {
      try {
        if (modals.state.formModal.mode === 'create') {
          const newBook = await createBook(formData);
          setBooks((prev) => [newBook, ...prev]);
          showToast(t('catalog.toastBookAdded'));
        } else if (modals.state.formModal.mode === 'edit' && modals.state.formModal.book) {
          const updated = await updateBook(modals.state.formModal.book.id, formData);
          setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
          showToast(t('catalog.toastBookUpdated'));
        }
        modals.actions.closeForm();
        fetchBooks();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t('catalog.errSaveBook');
        showToast(tApiError(message), 'error');
      }
    },
    [modals.state.formModal, modals.actions, fetchBooks, showToast, t, tApiError]
  );

  const confirmDelete = useCallback(async (_bookId?: string): Promise<void> => {
    const target = modals.state.deletingBook;
    if (!target) return;
    try {
      await deleteBook(target.id);
      setBooks((prev) => prev.filter((b) => b.id !== target.id));
      showToast(t('catalog.toastBookDeleted'));
      modals.actions.closeDelete();
      fetchBooks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('catalog.errDeleteBook');
      showToast(tApiError(message), 'error');
    }
  }, [modals.state.deletingBook, modals.actions, fetchBooks, showToast, t, tApiError]);

  const auth = useMemo(() => ({ user, userId }), [user, userId]);
  const catalog = useMemo(
    () => ({ books, genres, settlements, loading, isFetching, error, refresh: fetchBooks }),
    [books, genres, settlements, loading, isFetching, error, fetchBooks]
  );
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
  const toastsBundle = useMemo(() => ({ items: toasts, remove: removeToast }), [toasts, removeToast]);

  return { auth, catalog, pagination, filters, modals: modalBundle, toasts: toastsBundle };
};

export default useBooksPage;
