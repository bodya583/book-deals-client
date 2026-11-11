import React from 'react';
import { PlusIcon } from '../../../components/icons';
import { useTranslation } from '../../../i18n';

interface BooksHeaderProps {
  scope?: 'my' | 'all';
  onAddBook: () => void;
}

export const BooksHeader: React.FC<BooksHeaderProps> = ({
  scope = 'my',
  onAddBook,
}) => {
  const { t } = useTranslation();
  const isAll = scope === 'all';

  return (
    <section className="books-hero-header">
      <div className="books-hero-left">
        <h1 className="books-hero-title">
          {isAll ? t('catalog.title') : t('catalog.myBooksTitle')}
        </h1>
        <p className="books-hero-subtitle">
          {isAll ? t('catalog.subtitle') : t('catalog.myBooksSubtitle')}
        </p>
      </div>

      <div className="books-hero-actions">
        <button
          id="add-book-hero-btn"
          type="button"
          className="btn-primary-action"
          onClick={onAddBook}
        >
          <PlusIcon size={20} />
          <span>{t('catalog.addBook')}</span>
        </button>
      </div>
    </section>
  );
};

export default BooksHeader;

