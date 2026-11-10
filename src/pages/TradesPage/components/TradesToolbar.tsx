import React from 'react';
import type { SortOption } from '../hooks/useTradesPage';
import { SearchIcon, CloseIcon } from '../../../components/icons';

interface TradesToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
}

export const TradesToolbar: React.FC<TradesToolbarProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="trades-search-toolbar">
      <div className="inventory-search-wrap trades-search-box">
        <SearchIcon size={16} className="inventory-search-icon" />
        <input
          type="text"
          placeholder="Поиск по названию книги, автору или партнеру..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="inventory-search-input"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="books-search-clear"
            title="Очистить поиск"
          >
            <CloseIcon size={13} />
          </button>
        )}
      </div>

      <div className="trades-sort-wrap">
        <label htmlFor="trades-sort-select" className="trades-sort-label">
          Сортировка:
        </label>
        <select
          id="trades-sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="trades-sort-select"
          aria-label="Сортировка предложений обмена"
        >
          <option value="turn">По ходу действия</option>
          <option value="newest">Сначала новые</option>
          <option value="updated">По последнему изменению</option>
          <option value="oldest">Сначала старые</option>
        </select>
      </div>
    </div>
  );
};

export default TradesToolbar;
