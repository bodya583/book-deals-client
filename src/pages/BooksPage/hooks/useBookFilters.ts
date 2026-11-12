import { useState, useEffect, useMemo, useCallback } from 'react';
import type { BookSortOption } from '../../../types/book';
import type { BookFiltersController, NearCenter } from './booksPage.types';

export const useBookFilters = (): BookFiltersController => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [strictGenres, setStrictGenres] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [selectedSettlements, setSelectedSettlements] = useState<string[]>([]);
  const [nearMe, setNearMe] = useState(false);
  const [radius, setRadius] = useState(50);
  const [nearCenter, setNearCenter] = useState<NearCenter | null>(null);
  const [sortBy, setSortBy] = useState<BookSortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleGenre = useCallback((genreName: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreName) ? prev.filter((g) => g !== genreName) : [...prev, genreName]
    );
  }, []);

  const clearGenres = useCallback(() => setSelectedGenres([]), []);

  const toggleLanguage = useCallback((lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  }, []);

  const clearLanguages = useCallback(() => setSelectedLanguages([]), []);

  const setYearRange = useCallback((from: string, to: string) => {
    setYearFrom(from);
    setYearTo(to);
  }, []);

  const clearYears = useCallback(() => {
    setYearFrom('');
    setYearTo('');
  }, []);

  const toggleSettlement = useCallback((settlementName: string) => {
    setSelectedSettlements((prev) =>
      prev.includes(settlementName)
        ? prev.filter((s) => s !== settlementName)
        : [...prev, settlementName]
    );
  }, []);

  const clearSettlements = useCallback(() => setSelectedSettlements([]), []);

  const hasActiveFilters = useMemo(
    () =>
      searchQuery.trim().length > 0 ||
      selectedGenres.length > 0 ||
      selectedLanguages.length > 0 ||
      selectedSettlements.length > 0 ||
      yearFrom.trim().length > 0 ||
      yearTo.trim().length > 0 ||
      nearMe ||
      nearCenter !== null ||
      sortBy !== 'newest',
    [
      searchQuery,
      selectedGenres,
      selectedLanguages,
      selectedSettlements,
      yearFrom,
      yearTo,
      nearMe,
      nearCenter,
      sortBy,
    ]
  );

  const reset = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedGenres([]);
    setStrictGenres(false);
    setSelectedLanguages([]);
    setSelectedSettlements([]);
    setYearFrom('');
    setYearTo('');
    setNearMe(false);
    setRadius(50);
    setNearCenter(null);
    setSortBy('newest');
  }, []);

  const search = useMemo(
    () => ({ query: searchQuery, debounced: debouncedSearch, setQuery: setSearchQuery }),
    [searchQuery, debouncedSearch]
  );

  const genres = useMemo(
    () => ({
      selected: selectedGenres,
      strict: strictGenres,
      toggle: toggleGenre,
      clear: clearGenres,
      setStrict: setStrictGenres,
    }),
    [selectedGenres, strictGenres, toggleGenre, clearGenres]
  );

  const languages = useMemo(
    () => ({ selected: selectedLanguages, toggle: toggleLanguage, clear: clearLanguages }),
    [selectedLanguages, toggleLanguage, clearLanguages]
  );

  const year = useMemo(
    () => ({
      from: yearFrom,
      to: yearTo,
      setFrom: setYearFrom,
      setTo: setYearTo,
      setRange: setYearRange,
      clear: clearYears,
    }),
    [yearFrom, yearTo, setYearRange, clearYears]
  );

  const location = useMemo(
    () => ({
      settlements: selectedSettlements,
      toggleSettlement,
      clearSettlements,
      nearMe,
      setNearMe,
      radius,
      setRadius,
      nearCenter,
      setNearCenter,
    }),
    [selectedSettlements, toggleSettlement, clearSettlements, nearMe, radius, nearCenter]
  );

  const display = useMemo(
    () => ({ sortBy, setSortBy, viewMode, setViewMode }),
    [sortBy, viewMode]
  );

  return useMemo(
    () => ({ search, genres, languages, year, location, display, hasActiveFilters, reset }),
    [search, genres, languages, year, location, display, hasActiveFilters, reset]
  );
};
