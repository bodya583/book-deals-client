import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { BookSortOption } from '../../../types/book';
import type { BookFiltersController, NearCenter } from './booksPage.types';

const STORAGE_KEY = 'bookswap_catalog_filters';

interface SavedFilters {
  q?: string;
  genres?: string[];
  strict?: boolean;
  languages?: string[];
  cities?: string[];
  from?: string;
  to?: string;
  nearMe?: boolean;
  radius?: number;
  nearCenter?: NearCenter | null;
  sort?: BookSortOption;
  view?: 'grid' | 'map';
}

const getSavedFilters = (): SavedFilters | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedFilters;
  } catch {
    return null;
  }
};

const saveFiltersToStorage = (filters: SavedFilters) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // ignore
  }
};

const clearFiltersFromStorage = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

export const useBookFilters = (): BookFiltersController => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine initial state: URL searchParams take top precedence, sessionStorage is fallback
  const saved = useMemo(() => getSavedFilters(), []);
  const hasUrlParams = useMemo(() => {
    return Boolean(
      searchParams.get('q') ||
        searchParams.get('genres') ||
        searchParams.get('strict') ||
        searchParams.get('languages') ||
        searchParams.get('cities') ||
        searchParams.get('from') ||
        searchParams.get('to') ||
        searchParams.get('nearMe') ||
        searchParams.get('radius') ||
        searchParams.get('nearLat') ||
        searchParams.get('sort') ||
        searchParams.get('view')
    );
  }, [searchParams]);

  const initialQuery = searchParams.get('q') ?? (hasUrlParams ? '' : saved?.q ?? '');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);

  const [selectedGenres, setSelectedGenres] = useState<string[]>(() => {
    const val = searchParams.get('genres');
    if (val) return val.split(',').map((s) => s.trim()).filter(Boolean);
    if (!hasUrlParams && saved?.genres) return saved.genres;
    return [];
  });

  const [strictGenres, setStrictGenres] = useState<boolean>(() => {
    const val = searchParams.get('strict');
    if (val) return val === 'true' || val === '1';
    if (!hasUrlParams && saved?.strict !== undefined) return saved.strict;
    return false;
  });

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(() => {
    const val = searchParams.get('languages');
    if (val) return val.split(',').map((s) => s.trim()).filter(Boolean);
    if (!hasUrlParams && saved?.languages) return saved.languages;
    return [];
  });

  const [yearFrom, setYearFrom] = useState<string>(() => {
    return searchParams.get('from') ?? (!hasUrlParams && saved?.from ? saved.from : '');
  });

  const [yearTo, setYearTo] = useState<string>(() => {
    return searchParams.get('to') ?? (!hasUrlParams && saved?.to ? saved.to : '');
  });

  const [selectedSettlements, setSelectedSettlements] = useState<string[]>(() => {
    const val = searchParams.get('cities');
    if (val) return val.split(',').map((s) => s.trim()).filter(Boolean);
    if (!hasUrlParams && saved?.cities) return saved.cities;
    return [];
  });

  const [nearMe, setNearMe] = useState<boolean>(() => {
    const val = searchParams.get('nearMe');
    if (val) return val === 'true' || val === '1';
    if (!hasUrlParams && saved?.nearMe !== undefined) return saved.nearMe;
    return false;
  });

  const [radius, setRadius] = useState<number>(() => {
    const r = Number(searchParams.get('radius'));
    if (r && !isNaN(r) && r > 0) return r;
    if (!hasUrlParams && saved?.radius) return saved.radius;
    return 50;
  });

  const [nearCenter, setNearCenter] = useState<NearCenter | null>(() => {
    const lat = searchParams.get('nearLat');
    const lng = searchParams.get('nearLng');
    const name = searchParams.get('nearName');
    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      return { lat: Number(lat), lng: Number(lng), name: name || '' };
    }
    if (!hasUrlParams && saved?.nearCenter) return saved.nearCenter;
    return null;
  });

  const [sortBy, setSortBy] = useState<BookSortOption>(() => {
    const s = searchParams.get('sort');
    if (s && ['newest', 'oldest', 'popular', 'distance', 'title_asc', 'title_desc'].includes(s)) {
      return s as BookSortOption;
    }
    if (!hasUrlParams && saved?.sort) return saved.sort;
    return 'newest';
  });

  const [viewMode, setViewMode] = useState<'grid' | 'map'>(() => {
    const v = searchParams.get('view');
    if (v === 'map') return 'map';
    if (!hasUrlParams && saved?.view) return saved.view;
    return 'grid';
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Synchronize from external URL changes (e.g. browser Back / Forward buttons)
  const lastSerializedParamsRef = useRef(searchParams.toString());

  useEffect(() => {
    const currentSerialized = searchParams.toString();
    if (currentSerialized === lastSerializedParamsRef.current) {
      return;
    }
    lastSerializedParamsRef.current = currentSerialized;

    const q = searchParams.get('q') || '';
    setSearchQuery(q);
    setDebouncedSearch(q);

    const g = searchParams.get('genres');
    setSelectedGenres(g ? g.split(',').map((s) => s.trim()).filter(Boolean) : []);

    const strict = searchParams.get('strict') === 'true' || searchParams.get('strict') === '1';
    setStrictGenres(strict);

    const l = searchParams.get('languages');
    setSelectedLanguages(l ? l.split(',').map((s) => s.trim()).filter(Boolean) : []);

    const c = searchParams.get('cities');
    setSelectedSettlements(c ? c.split(',').map((s) => s.trim()).filter(Boolean) : []);

    setYearFrom(searchParams.get('from') || '');
    setYearTo(searchParams.get('to') || '');
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
  }, [searchParams]);

  // Synchronize state changes to URL searchParams & sessionStorage
  const isInitialMount = useRef(true);

  useEffect(() => {
    // If mounted with fallback from sessionStorage but URL had no params, sync URL once
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (!hasUrlParams && saved) {
        // Hydrate URL with the restored storage state
        const restoredParams = new URLSearchParams(searchParams);
        if (saved.q?.trim()) restoredParams.set('q', saved.q.trim());
        if (saved.genres?.length) restoredParams.set('genres', saved.genres.join(','));
        if (saved.strict) restoredParams.set('strict', 'true');
        if (saved.languages?.length) restoredParams.set('languages', saved.languages.join(','));
        if (saved.cities?.length) restoredParams.set('cities', saved.cities.join(','));
        if (saved.from?.trim()) restoredParams.set('from', saved.from.trim());
        if (saved.to?.trim()) restoredParams.set('to', saved.to.trim());
        if (saved.nearMe) restoredParams.set('nearMe', 'true');
        if (saved.radius && saved.radius !== 50) restoredParams.set('radius', String(saved.radius));
        if (saved.nearCenter) {
          restoredParams.set('nearLat', String(saved.nearCenter.lat));
          restoredParams.set('nearLng', String(saved.nearCenter.lng));
          if (saved.nearCenter.name) restoredParams.set('nearName', saved.nearCenter.name);
        }
        if (saved.sort && saved.sort !== 'newest') restoredParams.set('sort', saved.sort);
        if (saved.view && saved.view !== 'grid') restoredParams.set('view', saved.view);

        const restoredStr = restoredParams.toString();
        if (restoredStr && restoredStr !== searchParams.toString()) {
          lastSerializedParamsRef.current = restoredStr;
          setSearchParams(restoredParams, { replace: true });
        }
      }
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

    const nextSerialized = newParams.toString();

    // Persist active filters to sessionStorage
    const hasAny = Boolean(
      debouncedSearch.trim() ||
        selectedGenres.length > 0 ||
        strictGenres ||
        selectedLanguages.length > 0 ||
        selectedSettlements.length > 0 ||
        yearFrom.trim() ||
        yearTo.trim() ||
        nearMe ||
        radius !== 50 ||
        nearCenter !== null ||
        sortBy !== 'newest' ||
        viewMode !== 'grid'
    );

    if (hasAny) {
      saveFiltersToStorage({
        q: debouncedSearch.trim() || undefined,
        genres: selectedGenres.length ? selectedGenres : undefined,
        strict: strictGenres || undefined,
        languages: selectedLanguages.length ? selectedLanguages : undefined,
        cities: selectedSettlements.length ? selectedSettlements : undefined,
        from: yearFrom.trim() || undefined,
        to: yearTo.trim() || undefined,
        nearMe: nearMe || undefined,
        radius: radius !== 50 ? radius : undefined,
        nearCenter: nearCenter || undefined,
        sort: sortBy !== 'newest' ? sortBy : undefined,
        view: viewMode !== 'grid' ? viewMode : undefined,
      });
    } else {
      clearFiltersFromStorage();
    }

    if (nextSerialized !== searchParams.toString()) {
      lastSerializedParamsRef.current = nextSerialized;
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
    hasUrlParams,
    saved,
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
    clearFiltersFromStorage();
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

    lastSerializedParamsRef.current = newParams.toString();
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
