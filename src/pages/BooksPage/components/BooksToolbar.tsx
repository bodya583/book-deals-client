import React, { useState, useRef, useEffect } from 'react';
import type { Genre } from '../../../types/book';
import { BOOK_LANGUAGES } from '../../../types/book';
import {
  SearchIcon,
  BookOpenIcon,
  CloseIcon,
  GlobeIcon,
  TagIcon,
  FilterIcon,
  CalendarIcon,
  ChevronDownIcon,
  CheckIcon,
} from '../../../components/icons';

interface BooksToolbarProps {
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
  // Global actions
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  count: number;
}

const YEAR_PRESETS = [
  { label: 'До 1900 г.', from: '', to: '1900' },
  { label: '1901 – 1950', from: '1901', to: '1950' },
  { label: '1951 – 2000', from: '1951', to: '2000' },
  { label: '2001 – 2019', from: '2001', to: '2019' },
  { label: 'Новинки (2020+)', from: '2020', to: '' },
];

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
  onResetFilters,
  hasActiveFilters,
  count,
}) => {
  // Popover open states
  const [openDropdown, setOpenDropdown] = useState<'none' | 'genres' | 'languages' | 'year'>('none');
  const [genreSearch, setGenreSearch] = useState('');

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

  const formatCount = (n: number) => {
    if (n === 1) return '1 книга';
    if (n > 1 && n < 5) return `${n} книги`;
    return `${n} книг`;
  };

  const filteredGenres = availableGenres.filter((g) =>
    g.name.toLowerCase().includes(genreSearch.toLowerCase().trim())
  );

  const getGenreButtonLabel = () => {
    if (selectedGenres.length === 0) return 'Все жанры';
    if (selectedGenres.length === 1) return selectedGenres[0];
    return `${selectedGenres.length} ${strictGenres ? 'жанра (И)' : 'жанра (ИЛИ)'}`;
  };

  const getLanguageButtonLabel = () => {
    if (selectedLanguages.length === 0) return 'Все языки';
    if (selectedLanguages.length === 1) return selectedLanguages[0];
    return `${selectedLanguages.length} языков`;
  };

  const getYearButtonLabel = () => {
    if (yearFrom && yearTo) return `${yearFrom} – ${yearTo} гг.`;
    if (yearFrom) return `От ${yearFrom} г.`;
    if (yearTo) return `До ${yearTo} г.`;
    return 'Год издания';
  };

  return (
    <section className="books-toolbar-section" ref={containerRef}>
      <div className="books-toolbar">
        {/* Search input */}
        <div className="books-search-wrapper">
          <SearchIcon size={18} className="books-search-icon" />
          <input
            id="books-search-input"
            type="text"
            placeholder="Поиск по названию, автору или жанру..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="books-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="books-search-clear"
              onClick={() => onSearchChange('')}
              title="Очистить поиск"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="books-filters-group">
          {/* 1. Genres Multi-Select Popover */}
          <div className="filter-popover-anchor">
            <button
              type="button"
              id="filter-genres-button"
              className={`filter-trigger-btn ${selectedGenres.length > 0 ? 'active' : ''}`}
              onClick={() => setOpenDropdown(openDropdown === 'genres' ? 'none' : 'genres')}
              title="Фильтр по жанрам (мульти-выбор)"
            >
              <TagIcon size={15} />
              <span className="filter-trigger-text">{getGenreButtonLabel()}</span>
              {selectedGenres.length > 0 && (
                <span className="filter-count-badge">{selectedGenres.length}</span>
              )}
              <ChevronDownIcon size={14} className={`filter-chevron ${openDropdown === 'genres' ? 'open' : ''}`} />
            </button>

            {openDropdown === 'genres' && (
              <div className="filter-popover-menu filter-popover-genres" onClick={(e) => e.stopPropagation()}>
                <div className="popover-header">
                  <div className="popover-header-title">
                    <TagIcon size={15} />
                    <span>Фильтр по жанрам</span>
                  </div>
                  {selectedGenres.length > 0 && (
                    <button
                      type="button"
                      onClick={onClearGenres}
                      className="popover-clear-btn"
                    >
                      Очистить ({selectedGenres.length})
                    </button>
                  )}
                </div>

                {/* Strict match checkbox toggle: 1 и 2 и 3 VS 1 или 2 или 3 */}
                <div className="strict-toggle-box">
                  <label className="strict-checkbox-label">
                    <input
                      type="checkbox"
                      checked={strictGenres}
                      onChange={(e) => onStrictGenresChange(e.target.checked)}
                      className="strict-checkbox-input"
                    />
                    <div className="strict-checkbox-info">
                      <span className="strict-title">
                        Жёсткая выборка
                      </span>
                      <span className="strict-subtitle">
                        {strictGenres
                          ? 'Книга обязана содержать ВСЕ выбранные жанры одновременно'
                          : 'Книга может содержать ЛЮБОЙ из выбранных жанров'}
                      </span>
                    </div>
                  </label>
                </div>

                {/* Quick search in genres */}
                <div className="popover-search-box">
                  <input
                    type="text"
                    placeholder="Найти жанр в списке..."
                    value={genreSearch}
                    onChange={(e) => setGenreSearch(e.target.value)}
                    className="popover-search-input"
                  />
                </div>

                {/* Genres checklist */}
                <div className="popover-checklist">
                  {filteredGenres.length === 0 ? (
                    <div className="popover-empty-list">Жанры не найдены</div>
                  ) : (
                    filteredGenres.map((g) => {
                      const isChecked = selectedGenres.includes(g.name);
                      return (
                        <label
                          key={g.id || g.name}
                          className={`popover-check-item ${isChecked ? 'selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => onToggleGenre(g.name)}
                          />
                          <span className="check-custom">
                            {isChecked && <CheckIcon size={12} />}
                          </span>
                          <span className="check-label-text">{g.name}</span>
                          {g._count?.books !== undefined && g._count.books > 0 && (
                            <span className="check-item-count">{g._count.books}</span>
                          )}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Languages Multi-Select Popover */}
          <div className="filter-popover-anchor">
            <button
              type="button"
              id="filter-languages-button"
              className={`filter-trigger-btn ${selectedLanguages.length > 0 ? 'active' : ''}`}
              onClick={() => setOpenDropdown(openDropdown === 'languages' ? 'none' : 'languages')}
              title="Фильтр по языкам издания"
            >
              <GlobeIcon size={15} />
              <span className="filter-trigger-text">{getLanguageButtonLabel()}</span>
              {selectedLanguages.length > 0 && (
                <span className="filter-count-badge">{selectedLanguages.length}</span>
              )}
              <ChevronDownIcon size={14} className={`filter-chevron ${openDropdown === 'languages' ? 'open' : ''}`} />
            </button>

            {openDropdown === 'languages' && (
              <div className="filter-popover-menu filter-popover-languages" onClick={(e) => e.stopPropagation()}>
                <div className="popover-header">
                  <div className="popover-header-title">
                    <GlobeIcon size={15} />
                    <span>Язык книги</span>
                  </div>
                  {selectedLanguages.length > 0 && (
                    <button
                      type="button"
                      onClick={onClearLanguages}
                      className="popover-clear-btn"
                    >
                      Очистить ({selectedLanguages.length})
                    </button>
                  )}
                </div>

                <div className="popover-checklist">
                  {BOOK_LANGUAGES.map((lang) => {
                    const isChecked = selectedLanguages.includes(lang);
                    return (
                      <label
                        key={lang}
                        className={`popover-check-item ${isChecked ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleLanguage(lang)}
                        />
                        <span className="check-custom">
                          {isChecked && <CheckIcon size={12} />}
                        </span>
                        <span className="check-label-text">{lang}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Year Filter Popover */}
          <div className="filter-popover-anchor">
            <button
              type="button"
              id="filter-years-button"
              className={`filter-trigger-btn ${yearFrom || yearTo ? 'active' : ''}`}
              onClick={() => setOpenDropdown(openDropdown === 'year' ? 'none' : 'year')}
              title="Фильтр по году издания"
            >
              <CalendarIcon size={15} />
              <span className="filter-trigger-text">{getYearButtonLabel()}</span>
              <ChevronDownIcon size={14} className={`filter-chevron ${openDropdown === 'year' ? 'open' : ''}`} />
            </button>

            {openDropdown === 'year' && (
              <div className="filter-popover-menu filter-popover-years" onClick={(e) => e.stopPropagation()}>
                <div className="popover-header">
                  <div className="popover-header-title">
                    <CalendarIcon size={15} />
                    <span>Год издания</span>
                  </div>
                  {(yearFrom || yearTo) && (
                    <button
                      type="button"
                      onClick={onClearYears}
                      className="popover-clear-btn"
                    >
                      Сбросить
                    </button>
                  )}
                </div>

                {/* Range inputs */}
                <div className="year-inputs-row">
                  <div className="year-input-col">
                    <label htmlFor="year-from-input">От года</label>
                    <input
                      id="year-from-input"
                      type="number"
                      placeholder="1800"
                      value={yearFrom}
                      onChange={(e) => onYearFromChange(e.target.value)}
                      className="year-number-input"
                    />
                  </div>
                  <span className="year-separator">—</span>
                  <div className="year-input-col">
                    <label htmlFor="year-to-input">До года</label>
                    <input
                      id="year-to-input"
                      type="number"
                      placeholder="2026"
                      value={yearTo}
                      onChange={(e) => onYearToChange(e.target.value)}
                      className="year-number-input"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="year-presets-section">
                  <span className="year-presets-title">Быстрый период:</span>
                  <div className="year-presets-chips">
                    {YEAR_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => onSetYearRange(preset.from, preset.to)}
                        className={`year-preset-btn ${yearFrom === preset.from && yearTo === preset.to ? 'active' : ''}`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="toolbar-reset-filters-btn"
              title="Сбросить все примененные фильтры"
            >
              <CloseIcon size={14} />
              <span>Сбросить всё</span>
            </button>
          )}
        </div>

        {/* Stats count badge */}
        <div className="books-stats-badge">
          <BookOpenIcon size={16} />
          <span>{formatCount(count)}</span>
        </div>
      </div>

      {/* Active filters summary bar when filters applied */}
      {hasActiveFilters && (
        <div className="books-active-filters-bar">
          <span className="active-filters-label">
            <FilterIcon size={13} />
            <span>Фильтры:</span>
          </span>

          <div className="active-filters-chips">
            {searchQuery && (
              <span className="active-filter-tag">
                Поиск: «{searchQuery}»
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Удалить фильтр поиска"
                >
                  <CloseIcon size={12} />
                </button>
              </span>
            )}

            {/* Genres active tags */}
            {selectedGenres.map((genre) => (
              <span key={genre} className="active-filter-tag active-genre-tag">
                <TagIcon size={11} />
                <span>{genre}</span>
                <button
                  type="button"
                  onClick={() => onToggleGenre(genre)}
                  aria-label={`Удалить ${genre}`}
                >
                  <CloseIcon size={12} />
                </button>
              </span>
            ))}

            {selectedGenres.length > 1 && (
              <span className={`active-mode-badge ${strictGenres ? 'strict-mode' : 'lenient-mode'}`}>
                {strictGenres ? '✓ Режим: И (все)' : '✓ Режим: ИЛИ (любой)'}
              </span>
            )}

            {/* Languages active tags */}
            {selectedLanguages.map((lang) => (
              <span key={lang} className="active-filter-tag active-lang-tag">
                <GlobeIcon size={11} />
                <span>{lang}</span>
                <button
                  type="button"
                  onClick={() => onToggleLanguage(lang)}
                  aria-label={`Удалить ${lang}`}
                >
                  <CloseIcon size={12} />
                </button>
              </span>
            ))}

            {/* Year active tags */}
            {(yearFrom || yearTo) && (
              <span className="active-filter-tag active-year-tag">
                <CalendarIcon size={11} />
                <span>{getYearButtonLabel()}</span>
                <button
                  type="button"
                  onClick={onClearYears}
                  aria-label="Удалить фильтр годов"
                >
                  <CloseIcon size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default BooksToolbar;
