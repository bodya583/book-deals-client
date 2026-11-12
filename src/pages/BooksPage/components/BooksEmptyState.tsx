import React from 'react';
import { BookOpenIcon, PlusIcon, CloseIcon } from '../../../components/icons';
import { useTranslation } from '../../../i18n';
import type { BookFiltersController } from '../hooks/booksPage.types';

interface BooksEmptyStateProps {
  scope?: 'my' | 'all';
  filters: BookFiltersController;
  onAddBook: () => void;
}

export const BooksEmptyState: React.FC<BooksEmptyStateProps> = ({
  scope = 'my',
  filters,
  onAddBook,
}) => {
  const { t, tGenre, tBookLanguage } = useTranslation();
  const isAll = scope === 'all';
  const { search, genres, languages, year, hasActiveFilters, reset } = filters;

  return (
    <div className="books-empty-card">
      <div className="empty-icon-box">
        <BookOpenIcon size={48} />
      </div>

      {hasActiveFilters ? (
        <>
          <h3 className="empty-title">{t('catalog.emptyCatalogTitle')}</h3>
          <p className="empty-desc">
            {search.debounced && (
              <span>
                {t('catalog.emptyFilteredByQuery')} «<strong>{search.debounced}</strong>»{' '}
              </span>
            )}
            {genres.selected.length > 0 && (
              <span>
                {t('catalog.emptyFilteredByGenres')}{' '}
                <strong>{genres.selected.map(tGenre).join(', ')}</strong>{' '}
                {genres.selected.length > 1 && (
                  <em>
                    ({genres.strict ? t('catalog.emptyFilteredStrict') : t('catalog.emptyFilteredAny')})
                  </em>
                )}{' '}
              </span>
            )}
            {languages.selected.length > 0 && (
              <span>
                {t('catalog.emptyFilteredByLanguages')}{' '}
                <strong>{languages.selected.map(tBookLanguage).join(', ')}</strong>{' '}
              </span>
            )}
            {(year.from || year.to) && (
              <span>
                {t('catalog.emptyFilteredByPeriod')}{' '}
                <strong>
                  {year.from && year.to
                    ? `${year.from} – ${year.to}`
                    : year.from
                    ? t('catalog.emptyFilteredYearFrom', { year: year.from })
                    : t('catalog.emptyFilteredYearTo', { year: year.to || '' })}
                </strong>{' '}
              </span>
            )}
            {t('catalog.emptyFilteredSuffix')}
          </p>
          <button type="button" className="btn-secondary-action" onClick={reset}>
            <CloseIcon size={16} />
            <span>{t('catalog.resetAllFilters')}</span>
          </button>
        </>
      ) : (
        <>
          <h3 className="empty-title">
            {isAll ? t('catalog.emptyCatalogTitle') : t('catalog.emptyMyBooksTitle')}
          </h3>
          <p className="empty-desc">
            {isAll ? t('catalog.emptyCatalogText') : t('catalog.emptyMyBooksText')}
          </p>
          <button
            id="add-first-book-btn"
            type="button"
            className="btn-primary-action"
            onClick={onAddBook}
          >
            <PlusIcon size={20} />
            <span>{t('catalog.addBook')}</span>
          </button>
        </>
      )}
    </div>
  );
};

export default BooksEmptyState;
