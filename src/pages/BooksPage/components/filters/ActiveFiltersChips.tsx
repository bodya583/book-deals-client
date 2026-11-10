import React from 'react';
import {
  FilterIcon,
  CloseIcon,
  TagIcon,
  CheckIcon,
  GlobeIcon,
  MapPinIcon,
  CalendarIcon,
  NavigationIcon,
} from '../../../../components/icons';

interface ActiveFiltersChipsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedGenres: string[];
  onToggleGenre: (genre: string) => void;
  strictGenres: boolean;
  selectedLanguages: string[];
  onToggleLanguage: (language: string) => void;
  selectedSettlements: string[];
  onToggleSettlement: (cityName: string) => void;
  yearFrom: string;
  yearTo: string;
  onClearYears: () => void;
  nearMe: boolean;
  radius: number;
  nearCenter: { name: string } | null;
  onNearMeChange: (val: boolean) => void;
}

export const ActiveFiltersChips: React.FC<ActiveFiltersChipsProps> = ({
  searchQuery,
  onSearchChange,
  selectedGenres,
  onToggleGenre,
  strictGenres,
  selectedLanguages,
  onToggleLanguage,
  selectedSettlements,
  onToggleSettlement,
  yearFrom,
  yearTo,
  onClearYears,
  nearMe,
  radius,
  nearCenter,
  onNearMeChange,
}) => {
  return (
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
            <span>Год издания</span>
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
  );
};
