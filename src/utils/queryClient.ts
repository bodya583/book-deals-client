export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
}

class QueryClient {
  private cache = new Map<string, CacheEntry>();
  private inFlight = new Map<string, Promise<unknown>>();
  private listeners = new Set<(key: string) => void>();

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
    this.notify(key);
  }

  invalidate(keyOrPrefix?: string): void {
    if (!keyOrPrefix) {
      this.cache.clear();
      this.notify('*');
      return;
    }
    for (const key of this.cache.keys()) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
        this.cache.delete(key);
      }
    }
    this.notify(keyOrPrefix);
  }

  async fetch<T>(
    key: string,
    fetcher: (signal: AbortSignal) => Promise<T>,
    signal?: AbortSignal,
    staleTimeMs = 15_000
  ): Promise<T> {
    // 1. Return fresh cached copy if available and not expired
    const cached = this.get<T>(key, staleTimeMs);
    if (cached !== undefined) {
      return cached;
    }

    // 2. Return pending in-flight promise if identical request is already underway
    const existing = this.inFlight.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    // 3. Initiate request
    const controller = new AbortController();
    const activeSignal = signal || controller.signal;

    const promise = fetcher(activeSignal)
      .then((data) => {
        this.set(key, data);
        return data;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, promise);
    return promise;
  }

  subscribe(listener: (key: string) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(key: string): void {
    this.listeners.forEach((listener) => {
      try {
        listener(key);
      } catch {
        // ignore listener errors
      }
    });
  }
}

export const queryClient = new QueryClient();
