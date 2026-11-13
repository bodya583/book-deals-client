import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { BooksPagination } from '../../../types/book';
import type { BookPaginationController } from './booksPage.types';

export const useBookPagination = (initialLimit = 12): BookPaginationController => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getUrlPage = useCallback(() => {
    const p = Number(searchParams.get('page'));
    return p && !isNaN(p) && p > 0 ? p : 1;
  }, [searchParams]);

  const [page, setPage] = useState<number>(getUrlPage);
  const [limit, setLimit] = useState(initialLimit);
  const [meta, setPagination] = useState<BooksPagination>({
    total: 0,
    page: getUrlPage(),
    limit: initialLimit,
    totalPages: 1,
  });

  const lastAppliedPageRef = useRef(page);

  useEffect(() => {
    const urlPage = getUrlPage();
    if (urlPage !== page) {
      lastAppliedPageRef.current = urlPage;
      setPage(urlPage);
    }
  }, [getUrlPage, page]);

  const changePage = useCallback(
    (newPage: number) => {
      if (newPage === page) return;
      lastAppliedPageRef.current = newPage;
      setPage(newPage);

      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newPage > 1) {
            next.set('page', String(newPage));
          } else {
            next.delete('page');
          }
          return next;
        },
        { replace: true }
      );
    },
    [page, setSearchParams]
  );

  const changeLimit = useCallback(
    (newLimit: number) => {
      setLimit(newLimit);
      setPage(1);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('page');
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
