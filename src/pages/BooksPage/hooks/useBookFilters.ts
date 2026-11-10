import { useState, useEffect, useMemo, useCallback } from 'react';
import type { BookSortOption } from '../../../types/book';

export const useBookFilters = () => {
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Genres
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [strictGenres, setStrictGenres] = useState(false);

  // Languages
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  // Year range
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  // Settlements / Cities
  const [selectedSettlements, setSelectedSettlements] = useState<string[]>([]);

  // Distance / Radius
  const [nearMe, setNearMe] = useState(false);
  const [radius, setRadius] = useState(50);
  const [nearCenter, setNearCenter] = useState<{ name: string; lat: number; lng: number } | null>(null);

  // Sorting & View mode
  const [sortBy, setSortBy] = useState<BookSortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Genre helpers
  const toggleGenre = useCallback((genreName: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreName) ? prev.filter((g) => g !== genreName) : [...prev, genreName]
    );
  }, []);

  const clearGenres = useCallback(() => {
    setSelectedGenres([]);
  }, []);

  // Language helpers
  const toggleLanguage = useCallback((lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  }, []);

  // Year helpers
  const setYearRange = useCallback((from: string, to: string) => {
    setYearFrom(from);
    setYearTo(to);
  }, []);

  // Settlement helpers
  const toggleSettlement = useCallback((settlementName: string) => {
    setSelectedSettlements((prev) =>
      prev.includes(settlementName)
        ? prev.filter((s) => s !== settlementName)
        : [...prev, settlementName]
    );
  }, []);

  const clearSettlements = useCallback(() => {
    setSelectedSettlements([]);
  }, []);

  // Check if any non-default filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim().length > 0 ||
      selectedGenres.length > 0 ||
      selectedLanguages.length > 0 ||
      selectedSettlements.length > 0 ||
      yearFrom.trim().length > 0 ||
      yearTo.trim().length > 0 ||
      nearMe ||
      nearCenter !== null ||
      sortBy !== 'newest'
    );
  }, [
    searchQuery,
    selectedGenres,
    selectedLanguages,
    selectedSettlements,
    yearFrom,
    yearTo,
    nearMe,
    nearCenter,
    sortBy,
  ]);

  // Reset all filters to default
  const resetFilters = useCallback(() => {
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

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    selectedGenres,
    setSelectedGenres,
    strictGenres,
    setStrictGenres,
    toggleGenre,
    clearGenres,
    selectedLanguages,
    setSelectedLanguages,
    toggleLanguage,
    yearFrom,
    setYearFrom,
    yearTo,
    setYearTo,
    setYearRange,
    selectedSettlements,
    setSelectedSettlements,
    toggleSettlement,
    clearSettlements,
    nearMe,
    setNearMe,
    radius,
    setRadius,
    nearCenter,
    setNearCenter,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    hasActiveFilters,
    resetFilters,
  };
};
