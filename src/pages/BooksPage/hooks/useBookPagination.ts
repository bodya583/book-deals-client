import { useState, useCallback } from 'react';
import type { BooksPagination } from '../../../types/book';

export const useBookPagination = (initialLimit = 12) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [pagination, setPagination] = useState<BooksPagination>({
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

  return {
    page,
    setPage,
    limit,
    setLimit,
    pagination,
    setPagination,
    changePage,
    changeLimit,
  };
};
