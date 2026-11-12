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
  const tRef = useRef(t);
  const tApiErrorRef = useRef(tApiError);
  tRef.current = t;
  tApiErrorRef.current = tApiError;

  const user = useAuthStore((s) => s.user);
  const userId = user?.id;

  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const hasLoadedInitial = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  const { setPage, setPagination } = pagination;
  const debouncedSearch = filters.search.debounced;
  const selectedGenres = filters.genres.selected;
  const strictGenres = filters.genres.strict;
  const selectedLanguages = filters.languages.selected;
  const selectedSettlements = filters.location.settlements;
  const yearFrom = filters.year.from;
  const yearTo = filters.year.to;
  const nearMe = filters.location.nearMe;
  const radius = filters.location.radius;
  const nearCenter = filters.location.nearCenter;
  const sortBy = filters.display.sortBy;
  const viewMode = filters.display.viewMode;

  useEffect(() => {
    setPage(1);
  }, [
    scope,
    setPage,
    debouncedSearch,
    selectedGenres,
    strictGenres,
    selectedLanguages,
    selectedSettlements,
    yearFrom,
    yearTo,
    nearMe,
    radius,
    nearCenter,
    sortBy,
  ]);

  const fetchBooks = useCallback(async () => {
    if (scope === 'my' && !userId) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (!hasLoadedInitial.current) setLoading(true);
    else setIsFetching(true);

    const parsedYearFrom =
      yearFrom.trim() && !isNaN(Number(yearFrom)) ? Number(yearFrom) : undefined;
    const parsedYearTo =
      yearTo.trim() && !isNaN(Number(yearTo)) ? Number(yearTo) : undefined;

    const useProximity = nearMe || sortBy === 'distance';
    const effectiveNearLat = useProximity
      ? nearCenter
        ? nearCenter.lat
        : user?.latitude ?? undefined
      : undefined;
    const effectiveNearLng = useProximity
      ? nearCenter
        ? nearCenter.lng
        : user?.longitude ?? undefined
      : undefined;

    const isMap = viewMode === 'map';

    try {
      setError('');
      const data = await getBooks(
        {
          userId: scope === 'my' ? userId : undefined,
          isForTrade: scope === 'my' ? undefined : true,
          search: debouncedSearch.trim() || undefined,
          genres: selectedGenres.length > 0 ? selectedGenres : undefined,
          strictGenres: strictGenres || undefined,
          languages: selectedLanguages.length > 0 ? selectedLanguages : undefined,
          cities: selectedSettlements.length > 0 ? selectedSettlements : undefined,
          yearFrom: parsedYearFrom,
          yearTo: parsedYearTo,
          nearLat: effectiveNearLat,
          nearLng: effectiveNearLng,
          radius: nearMe ? radius : undefined,
          sortBy,
          page: isMap ? 1 : pagination.page,
          limit: isMap ? 100 : pagination.limit,
        },
        { signal: controller.signal }
      );

      if (controller.signal.aborted) return;
      setBooks(data.books || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
      hasLoadedInitial.current = true;
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      const errObj = err as { name?: string; message?: string } | undefined;
      if (errObj?.name === 'CanceledError' || errObj?.name === 'AbortError') return;
      const message = err instanceof Error ? err.message : tRef.current('catalog.errLoadBooks');
      setError(tApiErrorRef.current(message));
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setIsFetching(false);
      }
    }
  }, [
    scope,
    userId,
    user?.latitude,
    user?.longitude,
    debouncedSearch,
    selectedGenres,
    strictGenres,
    selectedLanguages,
    selectedSettlements,
    yearFrom,
    yearTo,
    nearMe,
    radius,
    nearCenter,
    sortBy,
    viewMode,
    pagination.page,
    pagination.limit,
    setPagination,
  ]);

  useEffect(() => {
    fetchBooks();
    return () => abortControllerRef.current?.abort();
  }, [fetchBooks]);

  const submitForm = useCallback(
    async (formData: BookFormData): Promise<void> => {
      try {
        if (modals.state.formModal.mode === 'create') {
          const newBook = await createBook(formData);
          setBooks((prev) => [newBook, ...prev]);
          showToast(tRef.current('catalog.toastBookAdded'));
        } else if (modals.state.formModal.mode === 'edit' && modals.state.formModal.book) {
          const updated = await updateBook(modals.state.formModal.book.id, formData);
          setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
          showToast(tRef.current('catalog.toastBookUpdated'));
        }
        modals.actions.closeForm();
        fetchBooks();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : tRef.current('catalog.errSaveBook');
        showToast(tApiErrorRef.current(message), 'error');
      }
    },
    [modals.state.formModal, modals.actions, fetchBooks, showToast]
  );

  const confirmDelete = useCallback(
    async (_bookId?: string): Promise<void> => {
      const target = modals.state.deletingBook;
      if (!target) return;
      try {
        await deleteBook(target.id);
        setBooks((prev) => prev.filter((b) => b.id !== target.id));
        showToast(tRef.current('catalog.toastBookDeleted'));
        modals.actions.closeDelete();
        fetchBooks();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : tRef.current('catalog.errDeleteBook');
        showToast(tApiErrorRef.current(message), 'error');
      }
    },
    [modals.state.deletingBook, modals.actions, fetchBooks, showToast]
  );

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
