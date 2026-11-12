import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getTrades, getTradeCounts } from '../../../api/tradesApi';
import type { Trade, TradeCounts } from '../../../types/trade';
import { useAuthStore } from '../../../store/authStore';
import type { ToastMessage } from '../../../components/Toast';
import { useQuery } from '../../../hooks/useQuery';
import { useTranslation } from '../../../i18n';
import { useTradeActions } from './useTradeActions';

export type TabType = 'requests' | 'agreed' | 'completed';
export type SortOption = 'turn' | 'newest' | 'oldest' | 'updated';

const DEFAULT_COUNTS: TradeCounts = {
  incoming: 0,
  outgoing: 0,
  requests: 0,
  agreed: 0,
  completed: 0,
  total: 0,
};

export const useTradesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { t, language, tApiError } = useTranslation();

  const rawTab = searchParams.get('tab');
  const currentTab: TabType = rawTab === 'agreed' || rawTab === 'completed' ? rawTab : 'requests';
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('turn');

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToasts([{ id: String(Date.now()), text, type }]);
  }, []);

  const removeToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== toastId));
  }, []);

  const { data: trades = [], loading: tradesLoading } = useQuery<Trade[]>(
    `trades:tab:${currentTab}`,
    (signal) => getTrades(currentTab, { signal }),
    {
      staleTime: 15_000,
      onError: (err) => addToast(tApiError(err.message || t('trades.toasts.loadError')), 'error'),
    }
  );

  const { data: counts = DEFAULT_COUNTS } = useQuery<TradeCounts>(
    'trades:counts',
    (signal) => getTradeCounts({ signal }),
    { staleTime: 15_000 }
  );

  const tradeActions = useTradeActions(addToast);

  const changeTab = useCallback(
    (tab: TabType) => setSearchParams({ tab }),
    [setSearchParams]
  );

  const getBadgeCount = useCallback((trade: Trade): number => {
    try {
      const raw = localStorage.getItem(`trade_seen_${trade.id}`);
      if (!raw) {
        return trade.status === 'PENDING' && !trade.isSender
          ? Math.max(1, trade.messagesCount || 0)
          : trade.messagesCount || 0;
      }
      const seen = JSON.parse(raw);
      const seenAt = new Date(seen.seenAt || 0).getTime();
      const tradeUpdated = new Date(trade.updatedAt || trade.createdAt).getTime();

      let count = tradeUpdated > seenAt + 1000 ? 1 : 0;
      if (typeof trade.messagesCount === 'number' && typeof seen.messagesCount === 'number') {
        count += Math.max(0, trade.messagesCount - seen.messagesCount);
      }
      return count;
    } catch {
      return 0;
    }
  }, []);

  const formatDate = useCallback(
    (dateStr?: string) => {
      if (!dateStr) return '';
      try {
        return new Date(dateStr).toLocaleDateString(language === 'en' ? 'en-US' : 'uk-UA', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return dateStr;
      }
    },
    [language]
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = q
      ? trades.filter((trade) => {
          const partner = trade.isSender ? trade.receiver : trade.sender;
          const partnerMatch = partner?.username?.toLowerCase().includes(q);
          const messageMatch = trade.message?.toLowerCase().includes(q);
          const bookMatch = [...(trade.offeredBooks || []), ...(trade.requestedBooks || [])].some(
            (b) => b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q)
          );
          return partnerMatch || messageMatch || bookMatch;
        })
      : trades;

    return [...list].sort((a, b) => {
      if (sortBy === 'turn') {
        if (currentTab === 'requests') {
          const diff = (!a.isSender ? 0 : 1) - (!b.isSender ? 0 : 1);
          if (diff !== 0) return diff;
        }
        if (currentTab === 'agreed') {
          const aTurn = (a.isSender ? a.receiverCompleted : a.senderCompleted) && !(a.isSender ? a.senderCompleted : a.receiverCompleted) ? 0 : 1;
          const bTurn = (b.isSender ? b.receiverCompleted : b.senderCompleted) && !(b.isSender ? b.senderCompleted : b.receiverCompleted) ? 0 : 1;
          if (aTurn !== bTurn) return aTurn - bTurn;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'updated') {
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      }
      return 0;
    });
  }, [trades, searchQuery, sortBy, currentTab]);

  return {
    currentUser,
    navigation: { currentTab, changeTab, navigate },
    list: {
      trades,
      filtered,
      counts,
      loading: tradesLoading,
      searchQuery,
      setSearchQuery,
      sortBy,
      setSortBy,
    },
    actions: { ...tradeActions, getBadgeCount, formatDate },
    toasts: { items: toasts, remove: removeToast },
  };
};
