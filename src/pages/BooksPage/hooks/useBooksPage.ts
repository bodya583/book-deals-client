import { useState, useEffect, useCallback, useRef } from 'react';
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
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;

  const [books, setBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const hasLoadedInitial = useRef(false);

  // Composed Sub-Hooks
  const filters = useBookFilters();
  const paginationHook = useBookPagination(12);
  const modals = useBookModals();

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch available genres and settlements
  const fetchMetadata = useCallback(async () => {
    try {
      const [genresData, settlementsData] = await Promise.all([
        getGenres().catch(() => []),
        getSettlements().catch(() => []),
      ]);
      setGenres(genresData || []);
      setSettlements(settlementsData || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Reset page to 1 whenever any filter changes
  useEffect(() => {
    paginationHook.setPage(1);
  }, [
    scope,
    filters.debouncedSearch,
    filters.selectedGenres,
    filters.strictGenres,
    filters.selectedLanguages,
    filters.selectedSettlements,
    filters.yearFrom,
    filters.yearTo,
    filters.nearMe,
    filters.radius,
    filters.nearCenter,
    filters.sortBy,
  ]);

  // Fetch books from backend
  const fetchBooks = useCallback(async () => {
    if (scope === 'my' && !userId) return;

    if (!hasLoadedInitial.current) {
      setLoading(true);
    } else {
      setIsFetching(true);
    }

    const parsedYearFrom = filters.yearFrom.trim() && !isNaN(Number(filters.yearFrom)) ? Number(filters.yearFrom) : undefined;
    const parsedYearTo = filters.yearTo.trim() && !isNaN(Number(filters.yearTo)) ? Number(filters.yearTo) : undefined;

    const effectiveNearLat = (filters.nearMe || filters.sortBy === 'distance')
      ? (filters.nearCenter ? filters.nearCenter.lat : user?.latitude != null ? user.latitude : undefined)
      : undefined;
    const effectiveNearLng = (filters.nearMe || filters.sortBy === 'distance')
      ? (filters.nearCenter ? filters.nearCenter.lng : user?.longitude != null ? user.longitude : undefined)
      : undefined;

    const effectiveLimit = filters.viewMode === 'map' ? 100 : paginationHook.limit;
    const effectivePage = filters.viewMode === 'map' ? 1 : paginationHook.page;

    try {
      setError('');
      const data = await getBooks({
        userId: scope === 'my' ? userId : undefined,
        search: filters.debouncedSearch.trim() || undefined,
        genres: filters.selectedGenres.length > 0 ? filters.selectedGenres : undefined,
        strictGenres: filters.strictGenres || undefined,
        languages: filters.selectedLanguages.length > 0 ? filters.selectedLanguages : undefined,
        cities: filters.selectedSettlements.length > 0 ? filters.selectedSettlements : undefined,
        yearFrom: parsedYearFrom,
        yearTo: parsedYearTo,
        nearLat: effectiveNearLat,
        nearLng: effectiveNearLng,
        radius: (filters.nearMe || filters.nearCenter) ? filters.radius : undefined,
        sortBy: filters.sortBy,
        page: effectivePage,
        limit: effectiveLimit,
      });

      setBooks(data.books || []);
      if (data.pagination) {
        paginationHook.setPagination(data.pagination);
      }
      hasLoadedInitial.current = true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('catalog.errLoadBooks');
      setError(message);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [
    scope,
    userId,
    user?.latitude,
    user?.longitude,
    filters.debouncedSearch,
    filters.selectedGenres,
    filters.strictGenres,
    filters.selectedLanguages,
    filters.selectedSettlements,
    filters.yearFrom,
    filters.yearTo,
    filters.nearMe,
    filters.radius,
    filters.nearCenter,
    filters.sortBy,
    filters.viewMode,
    paginationHook.page,
    paginationHook.limit,
    t,
  ]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // CRUD Operations
  const submitForm = async (formData: BookFormData): Promise<void> => {
    try {
      if (modals.formModal.mode === 'create') {
        const newBook = await createBook(formData);
        setBooks((prev) => [newBook, ...prev]);
        showToast(t('catalog.toastBookAdded'));
      } else if (modals.formModal.mode === 'edit' && modals.formModal.book) {
        const updated = await updateBook(modals.formModal.book.id, formData);
        setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        showToast(t('catalog.toastBookUpdated'));
      }
      modals.closeForm();
      fetchBooks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('catalog.errSaveBook');
      showToast(message, 'error');
    }
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!modals.deletingBook) return;
    try {
      await deleteBook(modals.deletingBook.id);
      setBooks((prev) => prev.filter((b) => b.id !== modals.deletingBook?.id));
      showToast(t('catalog.toastBookDeleted'));
      modals.closeDelete();
      fetchBooks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('catalog.errDeleteBook');
      showToast(message, 'error');
    }
  };

  return {
    user,
    userId,
    // Data
    books,
    genres,
    settlements,
    loading,
    isFetching,
    error,
    // Pagination
    page: paginationHook.page,
    setPage: paginationHook.setPage,
    limit: paginationHook.limit,
    setLimit: paginationHook.setLimit,
    pagination: paginationHook.pagination,
    changePage: paginationHook.changePage,
    changeLimit: paginationHook.changeLimit,
    // Search
    searchQuery: filters.searchQuery,
    setSearchQuery: filters.setSearchQuery,
    debouncedSearch: filters.debouncedSearch,
    // Genres filter
    selectedGenres: filters.selectedGenres,
    setSelectedGenres: filters.setSelectedGenres,
    toggleGenre: filters.toggleGenre,
    clearGenres: filters.clearGenres,
    strictGenres: filters.strictGenres,
    setStrictGenres: filters.setStrictGenres,
    // Languages filter
    selectedLanguages: filters.selectedLanguages,
    setSelectedLanguages: filters.setSelectedLanguages,
    toggleLanguage: filters.toggleLanguage,
    // Year filter
    yearFrom: filters.yearFrom,
    setYearFrom: filters.setYearFrom,
    yearTo: filters.yearTo,
    setYearTo: filters.setYearTo,
    setYearRange: filters.setYearRange,
    // Settlements filter
    selectedSettlements: filters.selectedSettlements,
    setSelectedSettlements: filters.setSelectedSettlements,
    toggleSettlement: filters.toggleSettlement,
    clearSettlements: filters.clearSettlements,
    // Distance / Proximity filter
    nearMe: filters.nearMe,
    setNearMe: filters.setNearMe,
    radius: filters.radius,
    setRadius: filters.setRadius,
    nearCenter: filters.nearCenter,
    setNearCenter: filters.setNearCenter,
    // Sorting & View mode
    sortBy: filters.sortBy,
    setSortBy: filters.setSortBy,
    viewMode: filters.viewMode,
    setViewMode: filters.setViewMode,
    // Filter controls
    resetFilters: filters.resetFilters,
    hasActiveFilters: filters.hasActiveFilters,
    handleManualRefresh: fetchBooks,
    // Modals
    modalsState: {
      selectedBook: modals.selectedBook,
      formModal: modals.formModal,
      deletingBook: modals.deletingBook,
    },
    modalsActions: {
      openDetails: modals.openDetails,
      closeDetails: modals.closeDetails,
      openCreate: modals.openCreate,
      openEdit: modals.openEdit,
      closeForm: modals.closeForm,
      openDelete: modals.openDelete,
      closeDelete: modals.closeDelete,
      submitForm,
      confirmDelete: handleDeleteConfirm,
    },
    // Toasts
    toasts,
    removeToast,
  };
};

export default useBooksPage;
