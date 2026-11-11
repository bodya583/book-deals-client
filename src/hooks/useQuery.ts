import { useState, useEffect, useRef, useCallback } from 'react';
import { queryClient } from '../utils/queryClient';

export interface UseQueryOptions<T> {
  staleTime?: number;
  enabled?: boolean;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (err: Error) => void;
}

export function useQuery<T>(
  key: string | null | undefined,
  queryFn: (signal: AbortSignal) => Promise<T>,
  options: UseQueryOptions<T> = {}
) {
  const {
    staleTime = 15_000,
    enabled = true,
    initialData,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | undefined>(() => {
    if (key) {
      const cached = queryClient.get<T>(key, staleTime);
      if (cached !== undefined) return cached;
    }
    return initialData;
  });

  const [loading, setLoading] = useState<boolean>(() => {
    if (!enabled || !key) return false;
    const cached = queryClient.get<T>(key, staleTime);
    return cached === undefined;
  });

  const [error, setError] = useState<Error | null>(null);

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  const abortControllerRef = useRef<AbortController | null>(null);

  const executeFetch = useCallback(
    async (ignoreCache = false) => {
      if (!key || !enabled) return;

      // Abort previous in-flight request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        if (!ignoreCache) {
          const cached = queryClient.get<T>(key, staleTime);
          if (cached !== undefined) {
            setData(cached);
            setLoading(false);
            return cached;
          }
        }

        setLoading(true);
        setError(null);

        const result = await queryClient.fetch<T>(
          key,
          (sig) => queryFnRef.current(sig),
          controller.signal,
          ignoreCache ? 0 : staleTime
        );

        if (!controller.signal.aborted) {
          setData(result);
          setLoading(false);
          onSuccessRef.current?.(result);
        }
        return result;
      } catch (err: unknown) {
        const errorObj = err as { name?: string; message?: string } | undefined;
        if (!controller.signal.aborted && errorObj?.name !== 'CanceledError' && errorObj?.name !== 'AbortError') {
          const parsedErr = err instanceof Error ? err : new Error(String(err));
          setError(parsedErr);
          setLoading(false);
          onErrorRef.current?.(parsedErr);
        }
      }
    },
    [key, enabled, staleTime]
  );

  useEffect(() => {
    executeFetch();

    // Subscribe to external cache invalidations
    const unsubscribe = queryClient.subscribe((invalidatedKey) => {
      if (key && (invalidatedKey === '*' || invalidatedKey === key || key.startsWith(invalidatedKey))) {
        executeFetch(true);
      }
    });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      unsubscribe();
    };
  }, [key, executeFetch]);

  const refetch = useCallback(() => executeFetch(true), [executeFetch]);

  return {
    data,
    loading,
    error,
    refetch,
    setData,
  };
}
