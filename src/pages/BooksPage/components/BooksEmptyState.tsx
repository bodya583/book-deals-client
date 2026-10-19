import React from 'react';
import { BookOpenIcon, PlusIcon } from '../../../components/icons';

interface BooksEmptyStateProps {
  isSearch: boolean;
  searchQuery?: string;
  onClearSearch: () => void;
  onAddBook: () => void;
}

export const BooksEmptyState: React.FC<BooksEmptyStateProps> = ({
  isSearch,
  searchQuery,
  onClearSearch,
  onAddBook,
}) => {
  return (
    <div className="books-empty-card">
      <div className="empty-icon-box">
        <BookOpenIcon size={48} />
      </div>

      {isSearch ? (
        <>
          <h3 className="empty-title">Ничего не найдено</h3>
          <p className="empty-desc">
            По запросу «<strong>{searchQuery}</strong>» книг не найдено. Попробуйте изменить параметры поиска.
          </p>
          <button
            type="button"
            className="btn-secondary-action"
            onClick={onClearSearch}
          >
            Очистить поиск
          </button>
        </>
      ) : (
        <>
          <h3 className="empty-title">В вашей библиотеке пока нет книг</h3>
          <p className="empty-desc">
            Добавьте свои любимые книги, чтобы создать персональную полку для чтения!
          </p>
          <button
            id="add-first-book-btn"
            type="button"
            className="btn-primary-action"
            onClick={onAddBook}
          >
            <PlusIcon size={20} />
            <span>Добавить первую книгу</span>
          </button>
        </>
      )}
    </div>
  );
};

export default BooksEmptyState;
