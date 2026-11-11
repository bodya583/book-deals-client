import React from 'react';
import { BookOpenIcon, PlusIcon, CloseIcon } from '../../../components/icons';
import { useTranslation } from '../../../i18n';

interface BooksEmptyStateProps {
  scope?: 'my' | 'all';
  isFiltered: boolean;
  searchQuery?: string;
  selectedGenres?: string[];
  strictGenres?: boolean;
  selectedLanguages?: string[];
  yearFrom?: string;
  yearTo?: string;
  onResetFilters: () => void;
  onAddBook: () => void;
}

export const BooksEmptyState: React.FC<BooksEmptyStateProps> = ({
  scope = 'my',
  isFiltered,
  searchQuery,
  selectedGenres = [],
  strictGenres = false,
  selectedLanguages = [],
  yearFrom,
  yearTo,
  onResetFilters,
  onAddBook,
}) => {
  const { t, language } = useTranslation();
  const isAll = scope === 'all';

  return (
    <div className="books-empty-card">
      <div className="empty-icon-box">
        <BookOpenIcon size={48} />
      </div>

      {isFiltered ? (
        <>
          <h3 className="empty-title">{t('catalog.emptyCatalogTitle')}</h3>
          <p className="empty-desc">
            {searchQuery && (
              <span>{language === 'en' ? 'By query ' : 'За запитом '}«<strong>{searchQuery}</strong>» </span>
            )}
            {selectedGenres.length > 0 && (
              <span>
                {language === 'en' ? 'by genres ' : 'за жанрами '}
                <strong>{selectedGenres.join(', ')}</strong>{' '}
                {selectedGenres.length > 1 && (
                  <em>({strictGenres ? (language === 'en' ? 'mode: all together' : 'режим: усі одночасно') : (language === 'en' ? 'mode: any' : 'режим: будь-який')})</em>
                )}{' '}
              </span>
            )}
            {selectedLanguages.length > 0 && (
              <span>
                {language === 'en' ? 'in languages ' : 'мовами '}
                <strong>{selectedLanguages.join(', ')}</strong>{' '}
              </span>
            )}
            {(yearFrom || yearTo) && (
              <span>
                {language === 'en' ? 'published ' : 'за період '}
                <strong>
                  {yearFrom && yearTo
                    ? `${yearFrom} – ${yearTo}`
                    : yearFrom
                    ? `від ${yearFrom}`
                    : `до ${yearTo}`}
                </strong>{' '}
              </span>
            )}
            {language === 'en' ? 'books not found. Try adjusting criteria.' : 'книг не знайдено. Спробуйте змінити критерії пошуку.'}
          </p>
          <button
            type="button"
            className="btn-secondary-action"
            onClick={onResetFilters}
          >
            <CloseIcon size={16} />
            <span>{language === 'en' ? 'Reset all filters' : 'Скинути всі фільтри'}</span>
          </button>
        </>
      ) : isAll ? (
        <>
          <h3 className="empty-title">{t('catalog.emptyCatalogTitle')}</h3>
          <p className="empty-desc">
            {t('catalog.emptyCatalogText')}
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
      ) : (
        <>
          <h3 className="empty-title">{t('catalog.emptyMyBooksTitle')}</h3>
          <p className="empty-desc">
            {t('catalog.emptyMyBooksText')}
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
