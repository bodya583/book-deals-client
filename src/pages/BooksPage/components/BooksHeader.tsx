import React from 'react';
import { PlusIcon, GlobeIcon, BookOpenIcon } from '../../../components/icons';

interface BooksHeaderProps {
  scope?: 'my' | 'all';
  onAddBook: () => void;
  onScopeChange?: (newScope: 'my' | 'all') => void;
}

export const BooksHeader: React.FC<BooksHeaderProps> = ({
  scope = 'my',
  onAddBook,
  onScopeChange,
}) => {
  const isAll = scope === 'all';

  return (
    <section className="books-hero-header">
      <div className="books-hero-left">
        <h1 className="books-hero-title">
          {isAll ? 'Каталог книг' : 'Моя библиотека'}
        </h1>
        <p className="books-hero-subtitle">
          {isAll
            ? 'Книги всех читателей сообщества. Находите интересные произведения, фильтруйте по авторам, жанрам и языкам.'
            : 'Книги на вашем аккаунте. Читайте, управляйте и пополняйте свою личную коллекцию.'}
        </p>
      </div>

      <div className="books-hero-actions">
        {onScopeChange && (
          <div className="books-scope-switch" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={isAll}
              className={`scope-switch-btn ${isAll ? 'active' : ''}`}
              onClick={() => onScopeChange('all')}
            >
              <GlobeIcon size={16} />
              <span>Все книги</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isAll}
              className={`scope-switch-btn ${!isAll ? 'active' : ''}`}
              onClick={() => onScopeChange('my')}
            >
              <BookOpenIcon size={16} />
              <span>Мои книги</span>
            </button>
          </div>
        )}

        <button
          id="add-book-hero-btn"
          type="button"
          className="btn-primary-action"
          onClick={onAddBook}
        >
          <PlusIcon size={20} />
          <span>Добавить книгу</span>
        </button>
      </div>
    </section>
  );
};

export default BooksHeader;
