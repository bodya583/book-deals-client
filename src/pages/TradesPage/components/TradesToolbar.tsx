import React from 'react';
import type { SortOption } from '../hooks/useTradesPage';
import { SearchIcon, CloseIcon } from '../../../components/icons';
import { useTranslation } from '../../../i18n';

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
  const { t, language } = useTranslation();

  return (
    <div className="trades-search-toolbar">
      <div className="inventory-search-wrap trades-search-box">
        <SearchIcon size={16} className="inventory-search-icon" />
        <input
          type="text"
          placeholder={t('trades.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="inventory-search-input"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="books-search-clear"
            title={language === 'en' ? 'Clear search' : 'Очистити пошук'}
          >
            <CloseIcon size={13} />
          </button>
        )}
      </div>

      <div className="trades-sort-wrap">
        <label htmlFor="trades-sort-select" className="trades-sort-label">
          {language === 'en' ? 'Sort by:' : 'Сортування:'}
        </label>
        <select
          id="trades-sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="trades-sort-select"
          aria-label="Сортировка предложений обмена"
        >
          <option value="turn">{t('trades.sort.turn')}</option>
          <option value="newest">{t('trades.sort.newest')}</option>
          <option value="updated">{t('trades.sort.updated')}</option>
          <option value="oldest">{t('trades.sort.oldest')}</option>
        </select>
      </div>
    </div>
  );
};

export default TradesToolbar;
