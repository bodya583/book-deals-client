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
import type { BookFiltersController } from '../../hooks/booksPage.types';

interface ActiveFiltersChipsProps {
  filters: BookFiltersController;
}

export const ActiveFiltersChips: React.FC<ActiveFiltersChipsProps> = ({ filters }) => {
  const { t, tGenre, tBookLanguage, tCity } = useTranslation();
  const { search, genres, languages, year, location } = filters;

  return (
    <div className="books-active-filters-bar">
      <span className="active-filters-label">
        <FilterIcon size={13} />
        <span>{t('filters.chips.filtersLabel')}</span>
      </span>

      <div className="active-filters-chips">
        {search.query && (
          <span className="active-filter-tag">
            {t('filters.chips.searchPrefix', { query: search.query })}
            <button
              type="button"
              onClick={() => search.setQuery('')}
              aria-label={t('filters.chips.removeSearch')}
            >
              <CloseIcon size={12} />
            </button>
          </span>
        )}

        {genres.selected.map((genre) => (
          <span key={genre} className="active-filter-tag active-genre-tag">
            <TagIcon size={11} />
            <span>{tGenre(genre)}</span>
            <button
              type="button"
              onClick={() => genres.toggle(genre)}
              aria-label={t('filters.chips.removeItem', { item: tGenre(genre) })}
            >
              <CloseIcon size={12} />
            </button>
          </span>
        ))}

        {genres.selected.length > 1 && (
          <span className={`active-mode-badge ${genres.strict ? 'strict-mode' : 'lenient-mode'}`}>
            <CheckIcon size={11} />
            <span>{genres.strict ? t('filters.genres.modeAnd') : t('filters.genres.modeOr')}</span>
          </span>
        )}

        {languages.selected.map((lang) => (
          <span key={lang} className="active-filter-tag active-lang-tag">
            <GlobeIcon size={11} />
            <span>{tBookLanguage(lang)}</span>
            <button
              type="button"
              onClick={() => languages.toggle(lang)}
              aria-label={t('filters.chips.removeItem', { item: tBookLanguage(lang) })}
            >
              <CloseIcon size={12} />
            </button>
          </span>
        ))}

        {location.settlements.map((city) => (
          <span key={city} className="active-filter-tag active-settlement-tag">
            <MapPinIcon size={11} />
            <span>{tCity(city)}</span>
            <button
              type="button"
              onClick={() => location.toggleSettlement(city)}
              aria-label={t('filters.chips.removeItem', { item: tCity(city) })}
            >
              <CloseIcon size={12} />
            </button>
          </span>
        ))}

        {(year.from || year.to) && (
          <span className="active-filter-tag active-year-tag">
            <CalendarIcon size={11} />
            <span>{t('filters.chips.yearLabel')}</span>
            <button
              type="button"
              onClick={year.clear}
              aria-label={t('filters.chips.removeYear')}
            >
              <CloseIcon size={12} />
            </button>
          </span>
        )}

        {location.nearMe && (
          <span className="active-filter-tag active-near-me-tag">
            <NavigationIcon size={11} />
            <span>
              {location.nearCenter
                ? t('filters.location.radiusKmFrom', {
                    radius: location.radius,
                    name:
                      location.nearCenter.name === '__GPS__'
                        ? t('filters.location.myGpsLocation')
                        : tCity(location.nearCenter.name),
                  })
                : t('filters.location.radiusKm', { radius: location.radius })}
            </span>
            <button
              type="button"
              onClick={() => location.setNearMe(false)}
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
