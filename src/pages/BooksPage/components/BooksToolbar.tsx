import React, { useState, useRef, useEffect } from 'react';
import type { Genre, Settlement } from '../../../types/book';
import { BOOK_LANGUAGES } from '../../../types/book';
import {
  SearchIcon,
  CloseIcon,
  GlobeIcon,
  TagIcon,
  FilterIcon,
  CalendarIcon,
  ChevronDownIcon,
  CheckIcon,
  MapPinIcon,
  NavigationIcon,
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
  // Popover open states
  const [openDropdown, setOpenDropdown] = useState<'none' | 'genres' | 'languages' | 'year' | 'location'>('none');
  const [genreSearch, setGenreSearch] = useState('');
  const [settlementSearch, setSettlementSearch] = useState('');
  const [locTab, setLocTab] = useState<'settlement' | 'radius'>('settlement');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

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

  const filteredGenres = availableGenres.filter((g) =>
    g.name.toLowerCase().includes(genreSearch.toLowerCase().trim())
  );

  const filteredSettlements = availableSettlements.filter((s) =>
    s.name.toLowerCase().includes(settlementSearch.toLowerCase().trim())
  );

  const getGenreButtonLabel = () => 'Жанры';
  const getLanguageButtonLabel = () => 'Языки';
  const getYearButtonLabel = () => 'Год издания';
  const getLocationButtonLabel = () => 'Локация';

  const isLocationActive = selectedSettlements.length > 0 || nearMe;
  const locationActiveCount = selectedSettlements.length + (nearMe ? 1 : 0);

  const userHasCoords = Boolean(userCoords?.latitude != null && userCoords?.longitude != null);

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Геолокация не поддерживается вашим браузером');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        onNearCenterChange({
          name: 'Моя геопозиция',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        onNearMeChange(true);
      },
      () => {
        setGeoLoading(false);
        setGeoError('Доступ к геолокации отклонён браузером');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
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
            placeholder="Поиск книги или автора..."
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
              {(yearFrom || yearTo) && (
                <span className="filter-count-badge">1</span>
              )}
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

          {/* 4. Location & Settlements Popover */}
          <div className="filter-popover-anchor">
            <button
              type="button"
              id="filter-location-button"
              className={`filter-trigger-btn ${isLocationActive ? 'active' : ''}`}
              onClick={() => setOpenDropdown(openDropdown === 'location' ? 'none' : 'location')}
              title="Фильтр по населённым пунктам и дистанции"
            >
              <MapPinIcon size={15} />
              <span className="filter-trigger-text">{getLocationButtonLabel()}</span>
              {locationActiveCount > 0 && (
                <span className="filter-count-badge">{locationActiveCount}</span>
              )}
              <ChevronDownIcon size={14} className={`filter-chevron ${openDropdown === 'location' ? 'open' : ''}`} />
            </button>

            {openDropdown === 'location' && (
              <div className="filter-popover-menu filter-popover-location" onClick={(e) => e.stopPropagation()}>
                {/* Mode Tabs */}
                <div className="location-popover-tabs">
                  <button
                    type="button"
                    className={`location-tab-btn ${locTab === 'settlement' ? 'active' : ''}`}
                    onClick={() => setLocTab('settlement')}
                  >
                    <MapPinIcon size={14} />
                    <span>По городам</span>
                    {selectedSettlements.length > 0 && (
                      <span className="location-tab-pill">{selectedSettlements.length}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    className={`location-tab-btn ${locTab === 'radius' ? 'active' : ''}`}
                    onClick={() => setLocTab('radius')}
                  >
                    <NavigationIcon size={14} />
                    <span>По дистанции</span>
                    {nearMe && <span className="location-tab-dot" />}
                  </button>
                </div>

                {locTab === 'settlement' ? (
                  /* Tab 1: Населённые пункты */
                  <div className="location-tab-content">
                    <div className="popover-search-wrap">
                      <SearchIcon size={14} className="popover-search-icon" />
                      <input
                        type="text"
                        placeholder="Поиск населённого пункта..."
                        value={settlementSearch}
                        onChange={(e) => setSettlementSearch(e.target.value)}
                        className="popover-search-input"
                      />
                      {settlementSearch && (
                        <button
                          type="button"
                          className="popover-search-clear"
                          onClick={() => setSettlementSearch('')}
                        >
                          <CloseIcon size={12} />
                        </button>
                      )}
                    </div>

                    <div className="popover-checklist location-settlements-list">
                      {filteredSettlements.length === 0 ? (
                        <div className="popover-empty-notice">Населённый пункт не найден</div>
                      ) : (
                        filteredSettlements.map((s) => {
                          const isChecked = selectedSettlements.includes(s.name);
                          return (
                            <label
                              key={s.name}
                              className={`popover-check-item ${isChecked ? 'selected' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => onToggleSettlement(s.name)}
                              />
                              <span className="check-custom">
                                {isChecked && <CheckIcon size={12} />}
                              </span>
                              <span className="check-label-text">{s.name}</span>
                              {s.count !== undefined && (
                                <span className="check-item-count">{s.count}</span>
                              )}
                            </label>
                          );
                        })
                      )}
                    </div>

                    {selectedSettlements.length > 0 && (
                      <div className="location-tab-footer">
                        <button
                          type="button"
                          onClick={onClearSettlements}
                          className="popover-clear-btn"
                        >
                          Сбросить выбор городов ({selectedSettlements.length})
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Tab 2: По дистанции / радиусу */
                  <div className="location-tab-content location-radius-content">
                    {/* Точка отсчёта */}
                    <div className="location-origin-box">
                      <div className="location-origin-title">Точка отсчёта:</div>

                      <div className="location-origin-choices">
                        {/* 1. Моя геопозиция */}
                        <button
                          type="button"
                          className={`location-origin-chip ${nearCenter === null ? 'selected' : ''}`}
                          onClick={() => onNearCenterChange(null)}
                        >
                          <NavigationIcon size={13} />
                          <span>Моя геопозиция</span>
                        </button>

                        {/* 2. Города как опорные точки */}
                        {availableSettlements.slice(0, 5).map((s) => (
                          <button
                            key={s.name}
                            type="button"
                            className={`location-origin-chip ${nearCenter?.name === s.name ? 'selected' : ''}`}
                            onClick={() => onNearCenterChange({ name: s.name, lat: s.latitude, lng: s.longitude })}
                          >
                            <span>{s.name}</span>
                          </button>
                        ))}
                      </div>

                      {/* Status / prompt */}
                      {nearCenter === null ? (
                        userHasCoords ? (
                          <div className="location-origin-status location-origin-status--ok">
                            <CheckIcon size={13} />
                            <span>Геопозиция сохранена ({userCoords?.latitude?.toFixed(2)}°, {userCoords?.longitude?.toFixed(2)}°)</span>
                          </div>
                        ) : (
                          <div className="location-origin-status location-origin-status--prompt">
                            <span>Локация пока не определена.</span>
                            <button
                              type="button"
                              className="location-geo-trigger-btn"
                              onClick={handleRequestLocation}
                              disabled={geoLoading}
                            >
                              <NavigationIcon size={13} />
                              <span>{geoLoading ? 'Определяем...' : 'Определить где я'}</span>
                            </button>
                            {geoError && <div className="location-geo-error">{geoError}</div>}
                          </div>
                        )
                      ) : (
                        <div className="location-origin-status location-origin-status--city">
                          Ищем вокруг: <strong>{nearCenter.name}</strong>
                        </div>
                      )}
                    </div>

                    {/* Радиус ползунок */}
                    <div className="location-radius-slider-wrap">
                      <div className="location-radius-info">
                        <span className="location-radius-title">Дистанция:</span>
                        <span className="location-radius-num">{radius} км</span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={500}
                        step={5}
                        value={radius}
                        onChange={(e) => onRadiusChange(Number(e.target.value))}
                        className="location-radius-slider"
                      />
                      <div className="radius-presets-row">
                        {[10, 25, 50, 100, 200].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            className={`radius-preset-chip ${radius === preset ? 'active' : ''}`}
                            onClick={() => onRadiusChange(preset)}
                          >
                            {preset} км
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Toggle activation button */}
                    <div className="location-radius-action-row">
                      {nearMe ? (
                        <button
                          type="button"
                          className="btn-danger-outline btn-full-width"
                          onClick={() => onNearMeChange(false)}
                        >
                          <CloseIcon size={13} />
                          <span>Отключить фильтр дистанции</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-primary-action btn-full-width"
                          onClick={() => {
                            if (nearCenter === null && !userHasCoords) {
                              handleRequestLocation();
                            } else {
                              onNearMeChange(true);
                            }
                          }}
                        >
                          Искать в радиусе {radius} км
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right-side cluster: Reset button (counter moved to pagination bar) */}
        {hasActiveFilters && (
          <div className="books-toolbar-right">
            <button
              type="button"
              onClick={onResetFilters}
              className="toolbar-reset-filters-btn"
              title="Сбросить все примененные фильтры"
            >
              <CloseIcon size={14} />
              <span>Сбросить всё</span>
            </button>
          </div>
        )}
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
                <CheckIcon size={11} />
                <span>{strictGenres ? 'Режим: И (все)' : 'Режим: ИЛИ (любой)'}</span>
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

            {/* Settlements active tags */}
            {selectedSettlements.map((city) => (
              <span key={city} className="active-filter-tag active-settlement-tag">
                <MapPinIcon size={11} />
                <span>{city}</span>
                <button
                  type="button"
                  onClick={() => onToggleSettlement(city)}
                  aria-label={`Удалить ${city}`}
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

            {/* Near Me active tag */}
            {nearMe && (
              <span className="active-filter-tag active-near-me-tag">
                <NavigationIcon size={11} />
                <span>{nearCenter ? `${radius} км от ${nearCenter.name}` : `В радиусе ${radius} км`}</span>
                <button
                  type="button"
                  onClick={() => onNearMeChange(false)}
                  aria-label="Отключить фильтр дистанции"
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
