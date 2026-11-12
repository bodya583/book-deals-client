import React, { useState, useRef, useEffect } from 'react';
import type { Genre, Settlement } from '../../../types/book';
import { SearchIcon, CloseIcon } from '../../../components/icons';
import { GenreFilterPopover } from './filters/GenreFilterPopover';
import { LanguageFilterPopover } from './filters/LanguageFilterPopover';
import { YearFilterPopover } from './filters/YearFilterPopover';
import { LocationFilterPopover } from './filters/LocationFilterPopover';
import { ActiveFiltersChips } from './filters/ActiveFiltersChips';
import { useTranslation } from '../../../i18n';
import type { BookFiltersController } from '../hooks/booksPage.types';

export interface BooksToolbarProps {
  filters: BookFiltersController;
  availableGenres: Genre[];
  availableSettlements: Settlement[];
  userCoords?: { latitude: number | null; longitude: number | null };
}

export const BooksToolbar: React.FC<BooksToolbarProps> = ({
  filters,
  availableGenres,
  availableSettlements,
  userCoords,
}) => {
  const { t } = useTranslation();
  const [openDropdown, setOpenDropdown] = useState<'none' | 'genres' | 'languages' | 'year' | 'location'>('none');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown('none');
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleDropdown = (key: 'genres' | 'languages' | 'year' | 'location') =>
    setOpenDropdown((prev) => (prev === key ? 'none' : key));

  return (
    <section className="books-toolbar-section" aria-label={t('filters.title')} ref={containerRef}>
      <div className="books-toolbar-row">
        <div className="books-toolbar-left">
          <div className="books-search-wrapper">
            <SearchIcon size={16} className="books-search-icon" />
            <input
              type="text"
              id="books-search-input"
              className="books-search-input"
              placeholder={t('catalog.searchPlaceholder')}
              value={filters.search.query}
              onChange={(e) => filters.search.setQuery(e.target.value)}
              aria-label={t('catalog.searchPlaceholder')}
            />
            {filters.search.query && (
              <button
                type="button"
                className="books-search-clear"
                onClick={() => filters.search.setQuery('')}
                aria-label={t('common.close')}
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>

          <GenreFilterPopover
            isOpen={openDropdown === 'genres'}
            onToggleOpen={() => toggleDropdown('genres')}
            filter={filters.genres}
            availableGenres={availableGenres}
          />

          <LanguageFilterPopover
            isOpen={openDropdown === 'languages'}
            onToggleOpen={() => toggleDropdown('languages')}
            filter={filters.languages}
          />

          <YearFilterPopover
            isOpen={openDropdown === 'year'}
            onToggleOpen={() => toggleDropdown('year')}
            filter={filters.year}
          />

          <LocationFilterPopover
            isOpen={openDropdown === 'location'}
            onToggleOpen={() => toggleDropdown('location')}
            availableSettlements={availableSettlements}
            location={filters.location}
            userCoords={userCoords}
          />
        </div>

        {filters.hasActiveFilters && (
          <div className="books-toolbar-right">
            <button
              type="button"
              onClick={filters.reset}
              className="toolbar-reset-filters-btn"
              title={t('filters.resetAll')}
            >
              <CloseIcon size={14} />
              <span>{t('filters.resetAll')}</span>
            </button>
          </div>
        )}
      </div>

      {filters.hasActiveFilters && <ActiveFiltersChips filters={filters} />}
    </section>
  );
};

export default BooksToolbar;
