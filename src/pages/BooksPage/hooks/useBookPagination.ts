import { useState, useCallback, useMemo } from 'react';
import type { BooksPagination } from '../../../types/book';
import type { BookPaginationController } from './booksPage.types';

export const useBookPagination = (initialLimit = 12): BookPaginationController => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [meta, setPagination] = useState<BooksPagination>({
    total: 0,
    page: 1,
    limit: initialLimit,
    totalPages: 1,
  });

  const changePage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  return useMemo(
    () => ({
      meta,
      page,
      limit,
      setPage,
      setPagination,
      changePage,
      changeLimit,
    }),
    [meta, page, limit, changePage, changeLimit]
  );
};
