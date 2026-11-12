export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
}

export type QueryEvent =
  | { type: 'set'; key: string; data: unknown }
  | { type: 'invalidate'; key: string };

interface InFlightEntry {
  promise: Promise<unknown>;
  controller: AbortController;
}

class QueryClient {
  private cache = new Map<string, CacheEntry>();
  private inFlight = new Map<string, InFlightEntry>();
  private listeners = new Set<(event: QueryEvent) => void>();

  get<T>(key: string, maxAgeMs = 15_000): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.timestamp > maxAgeMs) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    this.notify({ type: 'set', key, data });
  }

  invalidate(keyOrPrefix?: string): void {
    if (!keyOrPrefix) {
      this.cache.clear();
      this.inFlight.clear();
      this.notify({ type: 'invalidate', key: '*' });
      return;
    }
    for (const key of this.cache.keys()) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
        this.cache.delete(key);
      }
    }
    for (const [key, entry] of this.inFlight.entries()) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
        entry.controller.abort();
        this.inFlight.delete(key);
      }
    }
    this.notify({ type: 'invalidate', key: keyOrPrefix });
  }

  clear(): void {
    this.cache.clear();
    for (const entry of this.inFlight.values()) {
      entry.controller.abort();
    }
    this.inFlight.clear();
  }

  async fetch<T>(
    key: string,
    fetcher: (signal: AbortSignal) => Promise<T>,
    _signal?: AbortSignal,
    staleTimeMs = 15_000
  ): Promise<T> {
    if (staleTimeMs > 0) {
      const cached = this.get<T>(key, staleTimeMs);
      if (cached !== undefined) {
        return cached;
      }
    }

    const existing = this.inFlight.get(key);
    if (existing) {
      return existing.promise as Promise<T>;
    }

    const controller = new AbortController();
    const promise = fetcher(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          this.set(key, data);
        }
        return data;
      })
      .finally(() => {
        if (this.inFlight.get(key)?.promise === promise) {
          this.inFlight.delete(key);
        }
      });

    this.inFlight.set(key, { promise, controller });
    return promise;
  }

  subscribe(listener: (event: QueryEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(event: QueryEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch {
      }
    });
  }
}

export const queryClient = new QueryClient();
