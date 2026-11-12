import type { BookSortOption, BooksPagination } from '../../../types/book';

export interface NearCenter {
  name: string;
  lat: number;
  lng: number;
}

export interface SearchFilterController {
  query: string;
  debounced: string;
  setQuery: (val: string) => void;
}

export interface GenresFilterController {
  selected: string[];
  strict: boolean;
  toggle: (name: string) => void;
  clear: () => void;
  setStrict: (val: boolean) => void;
}

export interface LanguagesFilterController {
  selected: string[];
  toggle: (lang: string) => void;
  clear: () => void;
}

export interface YearFilterController {
  from: string;
  to: string;
  setFrom: (val: string) => void;
  setTo: (val: string) => void;
  setRange: (from: string, to: string) => void;
  clear: () => void;
}

export interface LocationFilterController {
  settlements: string[];
  toggleSettlement: (name: string) => void;
  clearSettlements: () => void;
  nearMe: boolean;
  setNearMe: (val: boolean) => void;
  radius: number;
  setRadius: (val: number) => void;
  nearCenter: NearCenter | null;
  setNearCenter: (center: NearCenter | null) => void;
}

export interface BookDisplayController {
  sortBy: BookSortOption;
  setSortBy: (sort: BookSortOption) => void;
  viewMode: 'grid' | 'map';
  setViewMode: (mode: 'grid' | 'map') => void;
}

export interface BookFiltersController {
  search: SearchFilterController;
  genres: GenresFilterController;
  languages: LanguagesFilterController;
  year: YearFilterController;
  location: LocationFilterController;
  display: BookDisplayController;
  hasActiveFilters: boolean;
  reset: () => void;
}

export interface BookPaginationController {
  meta: BooksPagination;
  page: number;
  limit: number;
  setPage: (p: number) => void;
  setPagination: (meta: BooksPagination) => void;
  changePage: (newPage: number) => void;
  changeLimit: (newLimit: number) => void;
}
