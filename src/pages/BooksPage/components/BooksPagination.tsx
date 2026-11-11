import React, { useMemo } from 'react';
import type { BooksPagination as BooksPaginationType, BookSortOption } from '../../../types/book';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ArrowUpDownIcon,
  GridIcon,
  MapIcon,
} from '../../../components/icons';
import { useTranslation } from '../../../i18n';

interface BooksPaginationProps {
  pagination: BooksPaginationType;
  onPageChange: (page: number, scrollToTop?: boolean) => void;
  onLimitChange: (limit: number) => void;
  variant?: 'top' | 'bottom';
  className?: string;
  limitOptions?: number[];
  sortBy?: BookSortOption;
  onSortChange?: (sort: BookSortOption) => void;
  viewMode?: 'grid' | 'map';
  onViewModeChange?: (mode: 'grid' | 'map') => void;
}

export const BooksPagination: React.FC<BooksPaginationProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
  variant = 'bottom',
  className = '',
  limitOptions = [12, 24, 36, 48, 96],
  sortBy = 'newest',
  onSortChange,
  viewMode = 'grid',
  onViewModeChange,
}) => {
  const { t } = useTranslation();
  const { page, limit, total, totalPages } = pagination;

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

  // Don't render pagination if there are no items, or if bottom variant has <= 1 page or map mode
  if (total <= 0) {
    return null;
  }

  const isBottom = variant === 'bottom';
  if (isBottom && (viewMode === 'map' || totalPages <= 1)) {
    return null;
  }

  const fromItem = Math.min(total, (page - 1) * limit + 1);
  const toItem = Math.min(total, page * limit);

  // Top variant: compact & uncluttered, includes sorting & quick controls without wrapping awkwardly
  if (variant === 'top') {
    return (
      <nav
        className={`books-pagination books-pagination-top ${className}`}
        aria-label={t('pagination.sortLabel')}
      >
        {/* Left: Range Info */}
        <div className="pagination-info">
          {viewMode === 'map' ? (
            <span className="pagination-info-text">
              {t('catalog.onMapCount', { total })}
            </span>
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

        {/* Right: Controls Cluster (Sort + View Switcher + Compact Pager + Compact Limit) */}
        <div className="pagination-top-controls">
          {/* View switcher (Grid vs Map) */}
          {onViewModeChange && (
            <div className="catalog-view-switcher" role="group">
              <button
                type="button"
                className={`catalog-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => onViewModeChange('grid')}
                title={t('catalog.viewGrid')}
              >
                <GridIcon size={14} />
                <span>{t('catalog.viewGrid')}</span>
              </button>
              <button
                type="button"
                className={`catalog-view-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => onViewModeChange('map')}
                title={t('catalog.viewMap')}
              >
                <MapIcon size={14} />
                <span>{t('catalog.viewMap')}</span>
              </button>
            </div>
          )}

          {/* Sorting dropdown */}
          {onSortChange && (
            <div className="pagination-sort-wrapper">
              <span className="pagination-sort-label">{t('pagination.sortLabel')}</span>
              <div className="pagination-sort-select-box">
                <ArrowUpDownIcon size={14} className="pagination-sort-icon" />
                <select
                  id="books-sort-select"
                  className="pagination-sort-select"
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value as BookSortOption)}
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

          {/* Quick mini-pager if more than 1 page (grid mode only) */}
          {viewMode === 'grid' && totalPages > 1 && (
            <div className="pagination-top-nav">
              <button
                type="button"
                className="pagination-btn pagination-btn-mini"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1, false)}
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
                onClick={() => onPageChange(page + 1, false)}
                title={t('pagination.next')}
                aria-label={t('pagination.next')}
              >
                <ChevronRightIcon size={15} />
              </button>
            </div>
          )}

          {/* Compact limit selector (grid mode only) */}
          {viewMode === 'grid' && (
            <div className="pagination-top-limit">
              <span className="pagination-limit-caption">{t('pagination.perPage')}</span>
              <select
                className="pagination-limit-select"
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
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
  }

  // Bottom variant: full rich pagination with smart ellipsis
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (page <= 4) {
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis-right');
        pages.push(totalPages);
      } else if (page >= totalPages - 3) {
        pages.push('ellipsis-left');
        for (let i = totalPages - 4; i < totalPages; i++) {
          pages.push(i);
        }
        pages.push(totalPages);
      } else {
        pages.push('ellipsis-left');
        pages.push(page - 1);
        pages.push(page);
        pages.push(page + 1);
        pages.push('ellipsis-right');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageItems = getPageNumbers();

  return (
    <nav
      className={`books-pagination books-pagination-bottom ${className}`}
      aria-label={t('pagination.perPage')}
    >
      {/* Page Navigation Buttons */}
      <div className="pagination-nav-group">
        <button
          type="button"
          className="pagination-btn pagination-btn-first"
          disabled={page <= 1}
          onClick={() => onPageChange(1, isBottom)}
          title={t('pagination.first')}
          aria-label={t('pagination.first')}
        >
          <ChevronsLeftIcon size={15} />
        </button>

        <button
          type="button"
          className="pagination-btn pagination-btn-prev"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1, isBottom)}
          title={t('pagination.prev')}
          aria-label={t('pagination.prev')}
        >
          <ChevronLeftIcon size={15} />
          <span className="pagination-btn-label">{t('pagination.prev')}</span>
        </button>

        <div className="pagination-page-numbers">
          {pageItems.map((item, idx) => {
            if (typeof item === 'string') {
              return (
                <span key={`ellipsis-${idx}`} className="pagination-ellipsis" aria-hidden="true">
                  …
                </span>
              );
            }

            const isCurrent = item === page;
            return (
              <button
                key={item}
                type="button"
                className={`pagination-page-num ${isCurrent ? 'active' : ''}`}
                onClick={() => onPageChange(item, isBottom)}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={t('common.pageLabel', { page: item })}
              >
                {item}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="pagination-btn pagination-btn-next"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1, isBottom)}
          title={t('pagination.next')}
          aria-label={t('pagination.next')}
        >
          <span className="pagination-btn-label">{t('pagination.next')}</span>
          <ChevronRightIcon size={15} />
        </button>

        <button
          type="button"
          className="pagination-btn pagination-btn-last"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages, isBottom)}
          title={t('pagination.last')}
          aria-label={t('pagination.last')}
        >
          <ChevronsRightIcon size={15} />
        </button>
      </div>
    </nav>
  );
};

export default BooksPagination;
