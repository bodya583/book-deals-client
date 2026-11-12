import React, { useMemo } from 'react';
import type { BookSortOption } from '../../../types/book';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpDownIcon,
  GridIcon,
  MapIcon,
} from '../../../components/icons';
import { useTranslation } from '../../../i18n';
import type { BookDisplayController, BookPaginationController } from '../hooks/booksPage.types';

interface BooksTopControlsProps {
  pagination: BookPaginationController;
  display?: BookDisplayController;
  limitOptions: number[];
  className?: string;
}

export const BooksTopControls: React.FC<BooksTopControlsProps> = ({
  pagination,
  display,
  limitOptions,
  className = '',
}) => {
  const { t } = useTranslation();
  const { page, limit, total, totalPages } = pagination.meta;
  const viewMode = display?.viewMode ?? 'grid';
  const sortBy = display?.sortBy ?? 'newest';

  const sortOptions = useMemo(
    (): { value: BookSortOption; label: string }[] => [
      { value: 'newest', label: t('pagination.sortNewest') },
      { value: 'popular', label: t('pagination.sortPopular') },
      { value: 'distance', label: t('pagination.sortDistance') },
      { value: 'title_asc', label: t('pagination.sortTitleAsc') },
      { value: 'title_desc', label: t('pagination.sortTitleDesc') },
      { value: 'oldest', label: t('pagination.sortOldest') },
    ],
    [t]
  );

  const fromItem = Math.min(total, (page - 1) * limit + 1);
  const toItem = Math.min(total, page * limit);

  return (
    <nav className={`books-pagination books-pagination-top ${className}`} aria-label={t('pagination.sortLabel')}>
      <div className="pagination-info">
        {viewMode === 'map' ? (
          <span className="pagination-info-text">{t('catalog.onMapCount', { total })}</span>
        ) : (
          <>
            <span className="pagination-info-text">
              {t('catalog.shownRange', { from: fromItem, to: toItem, total })}
            </span>
            {totalPages > 1 && (
              <span className="pagination-page-indicator">
                {t('catalog.pageIndicator', { page, totalPages })}
              </span>
            )}
          </>
        )}
      </div>

      <div className="pagination-top-controls">
        {display && (
          <div className="catalog-view-switcher" role="group">
            <button
              type="button"
              className={`catalog-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => display.setViewMode('grid')}
              title={t('catalog.viewGrid')}
            >
              <GridIcon size={14} />
              <span>{t('catalog.viewGrid')}</span>
            </button>
            <button
              type="button"
              className={`catalog-view-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => display.setViewMode('map')}
              title={t('catalog.viewMap')}
            >
              <MapIcon size={14} />
              <span>{t('catalog.viewMap')}</span>
            </button>
          </div>
        )}

        {display && (
          <div className="pagination-sort-wrapper">
            <span className="pagination-sort-label">{t('pagination.sortLabel')}</span>
            <div className="pagination-sort-select-box">
              <ArrowUpDownIcon size={14} className="pagination-sort-icon" />
              <select
                id="books-sort-select"
                className="pagination-sort-select"
                value={sortBy}
                onChange={(e) => display.setSortBy(e.target.value as BookSortOption)}
                aria-label={t('pagination.sortLabel')}
                title={t('pagination.sortLabel')}
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {viewMode === 'grid' && totalPages > 1 && (
          <div className="pagination-top-nav">
            <button
              type="button"
              className="pagination-btn pagination-btn-mini"
              disabled={page <= 1}
              onClick={() => pagination.changePage(page - 1)}
              title={t('pagination.prev')}
              aria-label={t('pagination.prev')}
            >
              <ChevronLeftIcon size={15} />
            </button>
            <span className="pagination-mini-counter">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className="pagination-btn pagination-btn-mini"
              disabled={page >= totalPages}
              onClick={() => pagination.changePage(page + 1)}
              title={t('pagination.next')}
              aria-label={t('pagination.next')}
            >
              <ChevronRightIcon size={15} />
            </button>
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="pagination-top-limit">
            <span className="pagination-limit-caption">{t('pagination.perPage')}</span>
            <select
              className="pagination-limit-select"
              value={limit}
              onChange={(e) => pagination.changeLimit(Number(e.target.value))}
              aria-label={t('pagination.perPage')}
              title={t('pagination.perPage')}
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </nav>
  );
};
