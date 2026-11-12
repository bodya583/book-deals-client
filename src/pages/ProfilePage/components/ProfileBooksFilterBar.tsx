import React from 'react';
import { SearchIcon, CloseIcon, CheckIcon, LockIcon } from '../../../components/icons';
import { useTranslation } from '../../../i18n';
import type { Book } from '../../../types/book';
import type { ProfileBooksFiltersController } from '../hooks/useProfileBooks';

interface ProfileBooksFilterBarProps {
  filters: ProfileBooksFiltersController;
  availableGenres: string[];
  sourceBooks: Book[];
  filteredCount: number;
  isOtherUser: boolean;
}

export const ProfileBooksFilterBar: React.FC<ProfileBooksFilterBarProps> = ({
  filters,
  availableGenres,
  sourceBooks,
  filteredCount,
  isOtherUser,
}) => {
  const { t, tGenre } = useTranslation();

  return (
    <div className="profile-filter-bar">
      <div className="profile-filter-controls">
        <div className="profile-search-box">
          <SearchIcon size={18} />
          <input
            type="text"
            placeholder={t('profile.searchBooksPlaceholder')}
            value={filters.searchQuery}
            onChange={(e) => filters.setSearchQuery(e.target.value)}
            className="profile-search-input"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => filters.setSearchQuery('')}
              className="profile-search-clear"
              title={t('common.clearSearch')}
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>

        {availableGenres.length > 0 && (
          <select
            value={filters.genreFilter}
            onChange={(e) => filters.setGenreFilter(e.target.value)}
            className="profile-filter-select"
          >
            <option value="all">{t('profile.allGenres', { count: availableGenres.length })}</option>
            {availableGenres.map((g) => (
              <option key={g} value={g}>
                {tGenre(g)}
              </option>
            ))}
          </select>
        )}

        <select
          value={filters.sortBy}
          onChange={(e) => filters.setSortBy(e.target.value)}
          className="profile-filter-select"
        >
          <option value="default">{t('profile.sortDefault')}</option>
          <option value="title_asc">{t('profile.sortTitleAsc')}</option>
          <option value="title_desc">{t('profile.sortTitleDesc')}</option>
          <option value="year_desc">{t('profile.sortYearDesc')}</option>
          <option value="year_asc">{t('profile.sortYearAsc')}</option>
        </select>
      </div>

      {!isOtherUser && (
        <div className="profile-trade-tabs">
          <span className="profile-trade-status-label">{t('profile.bookStatusLabel')}</span>
          <button
            type="button"
            onClick={() => filters.setTradeFilter('all')}
            className={`trade-tab-btn profile-trade-tab-btn ${filters.tradeFilter === 'all' ? 'active' : ''}`}
          >
            {t('profile.allBooksTab')} ({sourceBooks.length})
          </button>
          <button
            type="button"
            onClick={() => filters.setTradeFilter('for_trade')}
            className={`trade-tab-btn profile-trade-tab-btn ${filters.tradeFilter === 'for_trade' ? 'active' : ''}`}
          >
            <CheckIcon size={13} />
            <span>
              {t('profile.forTradeTab')} ({sourceBooks.filter((b) => b.isForTrade !== false).length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => filters.setTradeFilter('hidden')}
            className={`trade-tab-btn profile-trade-tab-btn ${filters.tradeFilter === 'hidden' ? 'active' : ''}`}
          >
            <LockIcon size={13} />
            <span>
              {t('profile.collectionTab')} ({sourceBooks.filter((b) => b.isForTrade === false).length})
            </span>
          </button>
        </div>
      )}

      {filters.hasActive && (
        <div className="profile-filter-summary">
          <span>
            {t('profile.foundCount', {
              count: filteredCount,
              total: sourceBooks.length,
            })}
          </span>
          <button type="button" onClick={filters.reset} className="profile-filter-reset-link">
            {t('profile.resetFilters')}
          </button>
        </div>
      )}
    </div>
  );
};
