import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { BookSortOption } from '../../../types/book';
import type { BookFiltersController, NearCenter } from './booksPage.types';

export const useBookFilters = (): BookFiltersController => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getParam = useCallback((key: string) => searchParams.get(key) || '', [searchParams]);
  const getArrayParam = useCallback(
    (key: string): string[] => {
      const val = searchParams.get(key);
      if (!val) return [];
      return val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    },
    [searchParams]
  );

  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);

  const [selectedGenres, setSelectedGenres] = useState<string[]>(() => {
    const val = searchParams.get('genres');
    return val ? val.split(',').map((s) => s.trim()).filter(Boolean) : [];
  });

  const [strictGenres, setStrictGenres] = useState<boolean>(() => {
    return searchParams.get('strict') === 'true' || searchParams.get('strict') === '1';
  });

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(() => {
    const val = searchParams.get('languages');
    return val ? val.split(',').map((s) => s.trim()).filter(Boolean) : [];
  });

  const [yearFrom, setYearFrom] = useState(() => searchParams.get('from') || '');
  const [yearTo, setYearTo] = useState(() => searchParams.get('to') || '');

  const [selectedSettlements, setSelectedSettlements] = useState<string[]>(() => {
    const val = searchParams.get('cities');
    return val ? val.split(',').map((s) => s.trim()).filter(Boolean) : [];
  });

  const [nearMe, setNearMe] = useState(() => {
    return searchParams.get('nearMe') === 'true' || searchParams.get('nearMe') === '1';
  });

  const [radius, setRadius] = useState<number>(() => {
    const r = Number(searchParams.get('radius'));
    return r && !isNaN(r) && r > 0 ? r : 50;
  });

  const [nearCenter, setNearCenter] = useState<NearCenter | null>(() => {
    const lat = searchParams.get('nearLat');
    const lng = searchParams.get('nearLng');
    const name = searchParams.get('nearName');
    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      return { lat: Number(lat), lng: Number(lng), name: name || '' };
    }
    return null;
  });

  const [sortBy, setSortBy] = useState<BookSortOption>(() => {
    const s = searchParams.get('sort');
    if (s && ['newest', 'oldest', 'popular', 'distance', 'title_asc', 'title_desc'].includes(s)) {
      return s as BookSortOption;
    }
    return 'newest';
  });

  const [viewMode, setViewMode] = useState<'grid' | 'map'>(() => {
    return searchParams.get('view') === 'map' ? 'map' : 'grid';
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Synchronize state when browser Back/Forward is clicked (URL params change externally)
  const lastAppliedParamsRef = useRef(searchParams.toString());

  useEffect(() => {
    const currentParamsString = searchParams.toString();
    if (currentParamsString === lastAppliedParamsRef.current) {
      return;
    }
    lastAppliedParamsRef.current = currentParamsString;

    const q = getParam('q');
    setSearchQuery(q);
    setDebouncedSearch(q);

    const g = getArrayParam('genres');
    setSelectedGenres(g);

    const strict = searchParams.get('strict') === 'true' || searchParams.get('strict') === '1';
    setStrictGenres(strict);

    const l = getArrayParam('languages');
    setSelectedLanguages(l);

    const c = getArrayParam('cities');
    setSelectedSettlements(c);

    setYearFrom(getParam('from'));
    setYearTo(getParam('to'));
    setNearMe(searchParams.get('nearMe') === 'true' || searchParams.get('nearMe') === '1');

    const r = Number(searchParams.get('radius'));
    setRadius(r && !isNaN(r) && r > 0 ? r : 50);

    const lat = searchParams.get('nearLat');
    const lng = searchParams.get('nearLng');
    const name = searchParams.get('nearName');
    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      setNearCenter({ lat: Number(lat), lng: Number(lng), name: name || '' });
    } else {
      setNearCenter(null);
    }

    const s = searchParams.get('sort');
    if (s && ['newest', 'oldest', 'popular', 'distance', 'title_asc', 'title_desc'].includes(s)) {
      setSortBy(s as BookSortOption);
    } else {
      setSortBy('newest');
    }

    const v = searchParams.get('view') === 'map' ? 'map' : 'grid';
    setViewMode(v);
  }, [searchParams, getParam, getArrayParam]);

  // Synchronize state to URL searchParams whenever filters change
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const newParams = new URLSearchParams(searchParams);

    if (debouncedSearch.trim()) newParams.set('q', debouncedSearch.trim());
    else newParams.delete('q');

    if (selectedGenres.length > 0) newParams.set('genres', selectedGenres.join(','));
    else newParams.delete('genres');

    if (strictGenres) newParams.set('strict', 'true');
    else newParams.delete('strict');

    if (selectedLanguages.length > 0) newParams.set('languages', selectedLanguages.join(','));
    else newParams.delete('languages');

    if (selectedSettlements.length > 0) newParams.set('cities', selectedSettlements.join(','));
    else newParams.delete('cities');

    if (yearFrom.trim()) newParams.set('from', yearFrom.trim());
    else newParams.delete('from');

    if (yearTo.trim()) newParams.set('to', yearTo.trim());
    else newParams.delete('to');

    if (nearMe) newParams.set('nearMe', 'true');
    else newParams.delete('nearMe');

    if (radius !== 50) newParams.set('radius', String(radius));
    else newParams.delete('radius');

    if (nearCenter) {
      newParams.set('nearLat', String(nearCenter.lat));
      newParams.set('nearLng', String(nearCenter.lng));
      if (nearCenter.name) newParams.set('nearName', nearCenter.name);
    } else {
      newParams.delete('nearLat');
      newParams.delete('nearLng');
      newParams.delete('nearName');
    }

    if (sortBy !== 'newest') newParams.set('sort', sortBy);
    else newParams.delete('sort');

    if (viewMode !== 'grid') newParams.set('view', viewMode);
    else newParams.delete('view');

    const newParamsString = newParams.toString();
    if (newParamsString !== searchParams.toString()) {
      lastAppliedParamsRef.current = newParamsString;
      setSearchParams(newParams, { replace: true });
    }
  }, [
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
    searchParams,
    setSearchParams,
  ]);

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

    const newParams = new URLSearchParams(searchParams);
    [
      'q',
      'genres',
      'strict',
      'languages',
      'cities',
      'from',
      'to',
      'nearMe',
      'radius',
      'nearLat',
      'nearLng',
      'nearName',
      'sort',
      'page',
    ].forEach((k) => newParams.delete(k));
    lastAppliedParamsRef.current = newParams.toString();
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

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

export default useBookFilters;
