import React from 'react';
import type { BookDisplayController, BookPaginationController } from '../hooks/booksPage.types';
import { BooksTopControls } from './BooksTopControls';
import { BooksBottomPager } from './BooksBottomPager';

interface BooksPaginationProps {
  pagination: BookPaginationController;
  display?: BookDisplayController;
  variant?: 'top' | 'bottom';
  className?: string;
  limitOptions?: number[];
}

export const BooksPagination: React.FC<BooksPaginationProps> = ({
  pagination,
  display,
  variant = 'bottom',
  className = '',
  limitOptions = [12, 24, 36, 48, 96],
}) => {
  const { total, totalPages } = pagination.meta;
  const viewMode = display?.viewMode ?? 'grid';

  if (total <= 0) return null;
  if (variant === 'bottom' && (viewMode === 'map' || totalPages <= 1)) return null;

  if (variant === 'top') {
    return (
      <BooksTopControls
        pagination={pagination}
        display={display}
        limitOptions={limitOptions}
        className={className}
      />
    );
  }

  return <BooksBottomPager pagination={pagination} className={className} />;
};

export default BooksPagination;
