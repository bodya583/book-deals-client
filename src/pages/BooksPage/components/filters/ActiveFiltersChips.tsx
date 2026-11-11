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
import { useTranslation } from '../../../../i18n';

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
  const { t, tGenre, tBookLanguage, tCity } = useTranslation();

  return (
    <div className="books-active-filters-bar">
      <span className="active-filters-label">
        <FilterIcon size={13} />
        <span>{t('filters.chips.filtersLabel')}</span>
      </span>

      <div className="active-filters-chips">
        {searchQuery && (
          <span className="active-filter-tag">
            {t('filters.chips.searchPrefix', { query: searchQuery })}
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label={t('filters.chips.removeSearch')}
            >
              <CloseIcon size={12} />
            </button>
          </span>
        )}

        {/* Genres active tags */}
        {selectedGenres.map((genre) => (
          <span key={genre} className="active-filter-tag active-genre-tag">
            <TagIcon size={11} />
            <span>{tGenre(genre)}</span>
            <button
              type="button"
              onClick={() => onToggleGenre(genre)}
              aria-label={t('filters.chips.removeItem', { item: tGenre(genre) })}
            >
              <CloseIcon size={12} />
            </button>
          </span>
        ))}

        {selectedGenres.length > 1 && (
          <span className={`active-mode-badge ${strictGenres ? 'strict-mode' : 'lenient-mode'}`}>
            <CheckIcon size={11} />
            <span>{strictGenres ? t('filters.genres.modeAnd') : t('filters.genres.modeOr')}</span>
          </span>
        )}

        {/* Languages active tags */}
        {selectedLanguages.map((lang) => (
          <span key={lang} className="active-filter-tag active-lang-tag">
            <GlobeIcon size={11} />
            <span>{tBookLanguage(lang)}</span>
            <button
              type="button"
              onClick={() => onToggleLanguage(lang)}
              aria-label={t('filters.chips.removeItem', {
                item: tBookLanguage(lang),
              })}
            >
              <CloseIcon size={12} />
            </button>
          </span>
        ))}

        {/* Settlements active tags */}
        {selectedSettlements.map((city) => (
          <span key={city} className="active-filter-tag active-settlement-tag">
            <MapPinIcon size={11} />
            <span>{tCity(city)}</span>
            <button
              type="button"
              onClick={() => onToggleSettlement(city)}
              aria-label={t('filters.chips.removeItem', { item: tCity(city) })}
            >
              <CloseIcon size={12} />
            </button>
          </span>
        ))}

        {/* Year active tags */}
        {(yearFrom || yearTo) && (
          <span className="active-filter-tag active-year-tag">
            <CalendarIcon size={11} />
            <span>{t('filters.chips.yearLabel')}</span>
            <button
              type="button"
              onClick={onClearYears}
              aria-label={t('filters.chips.removeYear')}
            >
              <CloseIcon size={12} />
            </button>
          </span>
        )}

        {/* Near Me active tag */}
        {nearMe && (
          <span className="active-filter-tag active-near-me-tag">
            <NavigationIcon size={11} />
            <span>
              {nearCenter
                ? t('filters.location.radiusKmFrom', {
                    radius,
                    name:
                      nearCenter.name === '__GPS__'
                        ? t('filters.location.myGpsLocation')
                        : tCity(nearCenter.name),
                  })
                : t('filters.location.radiusKm', { radius })}
            </span>
            <button
              type="button"
              onClick={() => onNearMeChange(false)}
              aria-label={t('filters.location.disableDistanceFilter')}
            >
              <CloseIcon size={12} />
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

export default ActiveFiltersChips;
