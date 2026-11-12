import { useEffect, useState, useMemo, useCallback } from 'react';
import { getUserProfileById } from '../../../api/usersApi';
import { setBookTradeStatus } from '../../../api/booksApi';
import api from '../../../api/axiosInstance';
import type { Book } from '../../../types/book';
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
  const isOtherUser = Boolean(routeUserId && routeUserId !== currentUserId);

  const [otherUser, setOtherUser] = useState<ProfileUser | null>(null);
  const [otherBooks, setOtherBooks] = useState<Book[]>([]);
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [togglingBookId, setTogglingBookId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(isOtherUser);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [tradeFilter, setTradeFilter] = useState<ProfileTradeFilter>('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

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
      selectedBook,
      setSelectedBook,
    },
    filters,
  };
};
