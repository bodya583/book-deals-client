import React, { useState, useRef, useEffect } from 'react';
import type { Genre, Settlement } from '../../../types/book';
import { SearchIcon, CloseIcon } from '../../../components/icons';
import { GenreFilterPopover } from './filters/GenreFilterPopover';
import { LanguageFilterPopover } from './filters/LanguageFilterPopover';
import { YearFilterPopover } from './filters/YearFilterPopover';
import { LocationFilterPopover } from './filters/LocationFilterPopover';
import { ActiveFiltersChips } from './filters/ActiveFiltersChips';
import { useTranslation } from '../../../i18n';

export interface BooksToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  // Genres filter
  selectedGenres: string[];
  onToggleGenre: (genre: string) => void;
  onClearGenres: () => void;
  strictGenres: boolean;
  onStrictGenresChange: (strict: boolean) => void;
  availableGenres: Genre[];
  // Languages filter
  selectedLanguages: string[];
  onToggleLanguage: (language: string) => void;
  onClearLanguages: () => void;
  // Year filter
  yearFrom: string;
  onYearFromChange: (val: string) => void;
  yearTo: string;
  onYearToChange: (val: string) => void;
  onSetYearRange: (from: string, to: string) => void;
  onClearYears: () => void;
  // Settlement filter
  availableSettlements: Settlement[];
  selectedSettlements: string[];
  onToggleSettlement: (cityName: string) => void;
  onClearSettlements: () => void;
  // Proximity / Distance filter
  nearMe: boolean;
  onNearMeChange: (val: boolean) => void;
  radius: number;
  onRadiusChange: (val: number) => void;
  nearCenter: { name: string; lat: number; lng: number } | null;
  onNearCenterChange: (center: { name: string; lat: number; lng: number } | null) => void;
  userCoords?: { latitude: number | null; longitude: number | null };
  // Global actions
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const BooksToolbar: React.FC<BooksToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedGenres,
  onToggleGenre,
  onClearGenres,
  strictGenres,
  onStrictGenresChange,
  availableGenres,
  selectedLanguages,
  onToggleLanguage,
  onClearLanguages,
  yearFrom,
  onYearFromChange,
  yearTo,
  onYearToChange,
  onSetYearRange,
  onClearYears,
  availableSettlements,
  selectedSettlements,
  onToggleSettlement,
  onClearSettlements,
  nearMe,
  onNearMeChange,
  radius,
  onRadiusChange,
  nearCenter,
  onNearCenterChange,
  userCoords,
  onResetFilters,
  hasActiveFilters,
}) => {
  const { t } = useTranslation();
  const [openDropdown, setOpenDropdown] = useState<'none' | 'genres' | 'languages' | 'year' | 'location'>('none');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown('none');
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <section className="books-toolbar-section" aria-label={t('filters.title')} ref={containerRef}>
      <div className="books-toolbar-row">
        {/* Left-side cluster: Search input + Popover Buttons */}
        <div className="books-toolbar-left">
          {/* Main Search input */}
          <div className="books-search-wrapper">
            <SearchIcon size={16} className="books-search-icon" />
            <input
              type="text"
              id="books-search-input"
              className="books-search-input"
              placeholder={t('catalog.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label={t('catalog.searchPlaceholder')}
            />
            {searchQuery && (
              <button
                type="button"
                className="books-search-clear"
                onClick={() => onSearchChange('')}
                aria-label={t('common.close')}
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>

          {/* 1. Genres Popover */}
          <GenreFilterPopover
            isOpen={openDropdown === 'genres'}
            onToggleOpen={() => setOpenDropdown(openDropdown === 'genres' ? 'none' : 'genres')}
            selectedGenres={selectedGenres}
            onToggleGenre={onToggleGenre}
            onClearGenres={onClearGenres}
            strictGenres={strictGenres}
            onStrictGenresChange={onStrictGenresChange}
            availableGenres={availableGenres}
          />

          {/* 2. Languages Popover */}
          <LanguageFilterPopover
            isOpen={openDropdown === 'languages'}
            onToggleOpen={() => setOpenDropdown(openDropdown === 'languages' ? 'none' : 'languages')}
            selectedLanguages={selectedLanguages}
            onToggleLanguage={onToggleLanguage}
            onClearLanguages={onClearLanguages}
          />

          {/* 3. Year Popover */}
          <YearFilterPopover
            isOpen={openDropdown === 'year'}
            onToggleOpen={() => setOpenDropdown(openDropdown === 'year' ? 'none' : 'year')}
            yearFrom={yearFrom}
            onYearFromChange={onYearFromChange}
            yearTo={yearTo}
            onYearToChange={onYearToChange}
            onSetYearRange={onSetYearRange}
            onClearYears={onClearYears}
          />

          {/* 4. Location Popover */}
          <LocationFilterPopover
            isOpen={openDropdown === 'location'}
            onToggleOpen={() => setOpenDropdown(openDropdown === 'location' ? 'none' : 'location')}
            availableSettlements={availableSettlements}
            selectedSettlements={selectedSettlements}
            onToggleSettlement={onToggleSettlement}
            onClearSettlements={onClearSettlements}
            nearMe={nearMe}
            onNearMeChange={onNearMeChange}
            radius={radius}
            onRadiusChange={onRadiusChange}
            nearCenter={nearCenter}
            onNearCenterChange={onNearCenterChange}
            userCoords={userCoords}
          />
        </div>

        {/* Right-side cluster: Reset button */}
        {hasActiveFilters && (
          <div className="books-toolbar-right">
            <button
              type="button"
              onClick={onResetFilters}
              className="toolbar-reset-filters-btn"
              title={t('filters.resetAll')}
            >
              <CloseIcon size={14} />
              <span>{t('filters.resetAll')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Active filters summary bar when filters applied */}
      {hasActiveFilters && (
        <ActiveFiltersChips
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          selectedGenres={selectedGenres}
          onToggleGenre={onToggleGenre}
          strictGenres={strictGenres}
          selectedLanguages={selectedLanguages}
          onToggleLanguage={onToggleLanguage}
          selectedSettlements={selectedSettlements}
          onToggleSettlement={onToggleSettlement}
          yearFrom={yearFrom}
          yearTo={yearTo}
          onClearYears={onClearYears}
          nearMe={nearMe}
          radius={radius}
          nearCenter={nearCenter}
          onNearMeChange={onNearMeChange}
        />
      )}
    </section>
  );
};

export default BooksToolbar;
