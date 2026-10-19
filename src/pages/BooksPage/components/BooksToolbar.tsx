import React from 'react';
import { SearchIcon, BookOpenIcon, CloseIcon } from '../../../components/icons';

interface BooksToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  count: number;
}

export const BooksToolbar: React.FC<BooksToolbarProps> = ({
  searchQuery,
  onSearchChange,
  count,
}) => {
  const formatCount = (n: number) => {
    if (n === 1) return '1 книга';
    if (n > 1 && n < 5) return `${n} книги`;
    return `${n} книг`;
  };

  return (
    <section className="books-toolbar">
      <div className="books-search-wrapper">
        <SearchIcon size={18} className="books-search-icon" />
        <input
          id="books-search-input"
          type="text"
          placeholder="Поиск по названию или автору..."
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

      <div className="books-stats-badge">
        <BookOpenIcon size={16} />
        <span>{formatCount(count)}</span>
      </div>
    </section>
  );
};

export default BooksToolbar;
