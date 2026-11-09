import React from 'react';
import type { BooksPagination as BooksPaginationType, BookSortOption } from '../../../types/book';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ArrowUpDownIcon,
} from '../../../components/icons';

interface BooksPaginationProps {
  pagination: BooksPaginationType;
  onPageChange: (page: number, scrollToTop?: boolean) => void;
  onLimitChange: (limit: number) => void;
  variant?: 'top' | 'bottom';
  className?: string;
  limitOptions?: number[];
  sortBy?: BookSortOption;
  onSortChange?: (sort: BookSortOption) => void;
}

const SORT_OPTIONS: { value: BookSortOption; label: string }[] = [
  { value: 'newest', label: '🆕 Сначала новые' },
  { value: 'popular', label: '🔥 По популярности' },
  { value: 'distance', label: '📍 По расстоянию (ближе)' },
  { value: 'title_asc', label: '🔤 По названию (А–Я)' },
  { value: 'title_desc', label: '🔤 По названию (Я–А)' },
  { value: 'oldest', label: '⏳ Сначала старые' },
];

export const BooksPagination: React.FC<BooksPaginationProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
  variant = 'bottom',
  className = '',
  limitOptions = [12, 24, 36, 48, 96],
  sortBy = 'newest',
  onSortChange,
}) => {
  const { page, limit, total, totalPages } = pagination;

  // Don't render pagination if there are no items
  if (total <= 0) {
    return null;
  }

  const isBottom = variant === 'bottom';
  const fromItem = Math.min(total, (page - 1) * limit + 1);
  const toItem = Math.min(total, page * limit);

  // Top variant: compact & uncluttered, includes sorting & quick controls without wrapping awkwardly
  if (variant === 'top') {
    return (
      <nav
        className={`books-pagination books-pagination-top ${className}`}
        aria-label="Верхняя панель пагинации и сортировки"
      >
        {/* Left: Range Info */}
        <div className="pagination-info">
          <span className="pagination-info-text">
            Показано <strong className="pagination-strong">{fromItem}–{toItem}</strong> из{' '}
            <strong className="pagination-strong">{total}</strong>
          </span>
          {totalPages > 1 && (
            <span className="pagination-page-indicator">
              (Стр. {page} из {totalPages})
            </span>
          )}
        </div>

        {/* Right: Controls Cluster (Sort + Compact Pager + Compact Limit) */}
        <div className="pagination-top-controls">
          {/* Sorting dropdown */}
          {onSortChange && (
            <div className="pagination-sort-wrapper">
              <span className="pagination-sort-label">Сортировка:</span>
              <div className="pagination-sort-select-box">
                <ArrowUpDownIcon size={14} className="pagination-sort-icon" />
                <select
                  id="books-sort-select"
                  className="pagination-sort-select"
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value as BookSortOption)}
                  aria-label="Сортировка каталога книг"
                  title="Выбрать порядок сортировки"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Quick mini-pager if more than 1 page */}
          {totalPages > 1 && (
            <div className="pagination-top-nav" aria-label="Быстрый переход по страницам">
              <button
                type="button"
                className="pagination-btn pagination-btn-mini"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1, false)}
                title="Предыдущая страница"
                aria-label="Предыдущая страница"
              >
                <ChevronLeftIcon size={13} />
              </button>
              <span className="pagination-mini-counter">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                className="pagination-btn pagination-btn-mini"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1, false)}
                title="Следующая страница"
                aria-label="Следующая страница"
              >
                <ChevronRightIcon size={13} />
              </button>
            </div>
          )}

          {/* Compact limit selector */}
          <div className="pagination-top-limit">
            <span className="pagination-limit-caption">По:</span>
            <select
              className="pagination-limit-select"
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              aria-label="Книг на странице"
              title="Количество книг на странице"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
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
      aria-label="Пагинация снизу"
    >
      {/* 1. Range Info */}
      <div className="pagination-info">
        <span className="pagination-info-text">
          Показано <strong className="pagination-strong">{fromItem}–{toItem}</strong> из{' '}
          <strong className="pagination-strong">{total}</strong>
        </span>
        <span className="pagination-page-indicator">
          (Стр. {page} из {totalPages})
        </span>
      </div>

      {/* 2. Page Navigation Buttons */}
      <div className="pagination-nav-group">
        <button
          type="button"
          className="pagination-btn pagination-btn-first"
          disabled={page <= 1}
          onClick={() => onPageChange(1, isBottom)}
          title="Первая страница"
          aria-label="Первая страница"
        >
          <ChevronsLeftIcon size={15} />
        </button>

        <button
          type="button"
          className="pagination-btn pagination-btn-prev"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1, isBottom)}
          title="Предыдущая страница"
          aria-label="Предыдущая страница"
        >
          <ChevronLeftIcon size={15} />
          <span className="pagination-btn-label">Назад</span>
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
                aria-label={`Страница ${item}`}
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
          title="Следующая страница"
          aria-label="Следующая страница"
        >
          <span className="pagination-btn-label">Вперёд</span>
          <ChevronRightIcon size={15} />
        </button>

        <button
          type="button"
          className="pagination-btn pagination-btn-last"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages, isBottom)}
          title="Последняя страница"
          aria-label="Последняя страница"
        >
          <ChevronsRightIcon size={15} />
        </button>
      </div>

      {/* 3. Limit per page selector */}
      <div className="pagination-limit-group">
        <span className="pagination-limit-caption">На странице:</span>
        <div className="pagination-limit-options" role="radiogroup" aria-label="Лимит книг на страницу">
          {limitOptions.map((opt) => {
            const isSelected = limit === opt;
            return (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`pagination-limit-chip ${isSelected ? 'active' : ''}`}
                onClick={() => onLimitChange(opt)}
                title={`Показывать по ${opt} книг на странице`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BooksPagination;
