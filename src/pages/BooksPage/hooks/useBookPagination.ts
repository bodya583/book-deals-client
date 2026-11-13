import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { BooksPagination } from '../../../types/book';
import type { BookPaginationController } from './booksPage.types';

export const useBookPagination = (initialLimit = 12): BookPaginationController => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialPage = () => {
    const p = Number(searchParams.get('page'));
    return p && !isNaN(p) && p > 0 ? p : 1;
  };

  const [page, setPage] = useState<number>(getInitialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [meta, setPagination] = useState<BooksPagination>({
    total: 0,
    page: getInitialPage(),
    limit: initialLimit,
    totalPages: 1,
  });

  const lastPageParamRef = useRef(searchParams.get('page') || '');

  // Sync external URL searchParam changes (e.g. browser Back/Forward navigation)
  useEffect(() => {
    const currentPageParam = searchParams.get('page') || '';
    if (currentPageParam === lastPageParamRef.current) return;
    lastPageParamRef.current = currentPageParam;

    const urlPage = Number(currentPageParam);
    const resolvedPage = urlPage && !isNaN(urlPage) && urlPage > 0 ? urlPage : 1;
    setPage(resolvedPage);
  }, [searchParams]);

  const changePage = useCallback(
    (newPage: number) => {
      setPage(newPage);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newPage > 1) {
            next.set('page', String(newPage));
          } else {
            next.delete('page');
          }
          lastPageParamRef.current = next.get('page') || '';
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const changeLimit = useCallback(
    (newLimit: number) => {
      setLimit(newLimit);
      setPage(1);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('page');
          lastPageParamRef.current = '';
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

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

export default useBookPagination;
