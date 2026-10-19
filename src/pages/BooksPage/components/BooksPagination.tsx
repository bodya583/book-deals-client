import React from 'react';
import type { BooksPagination as BooksPaginationType } from '../../../types/book';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from '../../../components/icons';

interface BooksPaginationProps {
  pagination: BooksPaginationType;
  onPageChange: (page: number, scrollToTop?: boolean) => void;
  onLimitChange: (limit: number) => void;
  variant?: 'top' | 'bottom';
  className?: string;
  limitOptions?: number[];
}

export const BooksPagination: React.FC<BooksPaginationProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
  variant = 'bottom',
  className = '',
  limitOptions = [12, 24, 36, 48, 96],
}) => {
  const { page, limit, total, totalPages } = pagination;

  // Don't render pagination if there are no items
  if (total <= 0) {
    return null;
  }

  const isBottom = variant === 'bottom';
  const fromItem = Math.min(total, (page - 1) * limit + 1);
  const toItem = Math.min(total, page * limit);

  // Generate pagination page numbers with smart ellipsis
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include page 1
      pages.push(1);

      if (page <= 4) {
        // Near beginning: 1 2 3 4 5 ... totalPages
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis-right');
        pages.push(totalPages);
      } else if (page >= totalPages - 3) {
        // Near end: 1 ... (totalPages-4) (totalPages-3) (totalPages-2) (totalPages-1) totalPages
        pages.push('ellipsis-left');
        for (let i = totalPages - 4; i < totalPages; i++) {
          pages.push(i);
        }
        pages.push(totalPages);
      } else {
        // Middle: 1 ... (page-1) page (page+1) ... totalPages
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
      className={`books-pagination books-pagination-${variant} ${className}`}
      aria-label={`Пагинация (${variant === 'top' ? 'сверху' : 'снизу'})`}
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
