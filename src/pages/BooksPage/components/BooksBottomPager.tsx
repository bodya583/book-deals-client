import React from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from '../../../components/icons';
import { useTranslation } from '../../../i18n';
import type { BookPaginationController } from '../hooks/booksPage.types';

const getPageNumbers = (page: number, totalPages: number): (number | string)[] => {
  const pages: (number | string)[] = [];
  const maxVisible = 7;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  pages.push(1);
  if (page <= 4) {
    for (let i = 2; i <= 5; i++) pages.push(i);
    pages.push('ellipsis-right', totalPages);
  } else if (page >= totalPages - 3) {
    pages.push('ellipsis-left');
    for (let i = totalPages - 4; i < totalPages; i++) pages.push(i);
    pages.push(totalPages);
  } else {
    pages.push('ellipsis-left', page - 1, page, page + 1, 'ellipsis-right', totalPages);
  }
  return pages;
};

interface BooksBottomPagerProps {
  pagination: BookPaginationController;
  className?: string;
}

export const BooksBottomPager: React.FC<BooksBottomPagerProps> = ({
  pagination,
  className = '',
}) => {
  const { t } = useTranslation();
  const { page, totalPages } = pagination.meta;
  const pageItems = getPageNumbers(page, totalPages);

  return (
    <nav className={`books-pagination books-pagination-bottom ${className}`} aria-label={t('pagination.perPage')}>
      <div className="pagination-nav-group">
        <button
          type="button"
          className="pagination-btn pagination-btn-first"
          disabled={page <= 1}
          onClick={() => pagination.changePage(1)}
          title={t('pagination.first')}
          aria-label={t('pagination.first')}
        >
          <ChevronsLeftIcon size={15} />
        </button>

        <button
          type="button"
          className="pagination-btn pagination-btn-prev"
          disabled={page <= 1}
          onClick={() => pagination.changePage(page - 1)}
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
                onClick={() => pagination.changePage(item)}
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
          onClick={() => pagination.changePage(page + 1)}
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
          onClick={() => pagination.changePage(totalPages)}
          title={t('pagination.last')}
          aria-label={t('pagination.last')}
        >
          <ChevronsRightIcon size={15} />
        </button>
      </div>
    </nav>
  );
};
