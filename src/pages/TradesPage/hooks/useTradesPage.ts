import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  getTrades,
  getTradeCounts,
  acceptTrade,
  completeTrade,
  rejectTrade,
  cancelTrade,
} from '../../../api/tradesApi';
import type { Trade, TradeCounts } from '../../../types/trade';
import { useAuthStore } from '../../../store/authStore';
import type { ToastMessage } from '../../../components/Toast';
import { useQuery } from '../../../hooks/useQuery';
import { queryClient } from '../../../utils/queryClient';
import { useTranslation } from '../../../i18n';

export type TabType = 'requests' | 'agreed' | 'completed';
export type SortOption = 'turn' | 'newest' | 'oldest' | 'updated';

export const useTradesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { t, language, tApiError } = useTranslation();

  const rawTab = searchParams.get('tab');
  const currentTab: TabType = (rawTab === 'agreed' || rawTab === 'completed') ? rawTab : 'requests';

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToasts([{ id: String(Date.now()), text, type }]);
  }, []);

  const removeToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  // Resilient query hook with AbortController, deduplication, and cache
  const {
    data: trades = [],
    loading: tradesLoading,
  } = useQuery<Trade[]>(
    `trades:tab:${currentTab}`,
    (signal) => getTrades(currentTab, { signal }),
    {
      staleTime: 15_000,
      onError: (err) => addToast(tApiError(err.message || t('trades.toasts.loadError')), 'error'),
    }
  );

  const {
    data: counts = {
      incoming: 0,
      outgoing: 0,
      requests: 0,
      agreed: 0,
      completed: 0,
      total: 0,
    },
    loading: countsLoading,
  } = useQuery<TradeCounts>(
    'trades:counts',
    (signal) => getTradeCounts({ signal }),
    {
      staleTime: 15_000,
    }
  );

  const loading = tradesLoading || countsLoading;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('turn');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectModalTradeId, setRejectModalTradeId] = useState<string | null>(null);

  const handleTabChange = useCallback((tab: TabType) => {
    setSearchParams({ tab });
  }, [setSearchParams]);

  const handleAccept = async (tradeId: string) => {
    if (!window.confirm(t('trades.toasts.acceptConfirm'))) {
      return;
    }
    try {
      setActionLoadingId(tradeId);
      await acceptTrade(tradeId);
      addToast(t('trades.toasts.acceptSuccess'), 'success');
      queryClient.invalidate('trades');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('trades.toasts.acceptError');
      addToast(tApiError(message), 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleComplete = async (tradeId: string) => {
    if (!window.confirm(t('trades.toasts.completeConfirm'))) {
      return;
    }
    try {
      setActionLoadingId(tradeId);
      const updated = await completeTrade(tradeId);
      if (updated.status === 'COMPLETED') {
        addToast(t('trades.toasts.completeSuccessBoth'), 'success');
      } else {
        addToast(t('trades.toasts.completeSuccessWaiting'), 'info');
      }
      queryClient.invalidate('trades');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('trades.toasts.completeError');
      addToast(tApiError(message), 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = (tradeId: string) => {
    setRejectModalTradeId(tradeId);
  };

  const handleConfirmReject = async (reason?: string) => {
    if (!rejectModalTradeId) return;
    try {
      setActionLoadingId(rejectModalTradeId);
      await rejectTrade(rejectModalTradeId, reason);
      addToast(t('trades.toasts.rejectSuccess'), 'success');
      setRejectModalTradeId(null);
      queryClient.invalidate('trades');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('trades.toasts.rejectError');
      addToast(tApiError(message), 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (tradeId: string) => {
    if (!window.confirm(t('trades.toasts.cancelConfirm'))) {
      return;
    }
    try {
      setActionLoadingId(tradeId);
      await cancelTrade(tradeId);
      addToast(t('trades.toasts.cancelSuccess'), 'success');
      queryClient.invalidate('trades');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('trades.toasts.cancelError');
      addToast(tApiError(message), 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getTradeBadgeCount = useCallback((trade: Trade): number => {
    try {
      const raw = localStorage.getItem(`trade_seen_${trade.id}`);
      if (!raw) {
        return trade.status === 'PENDING' && !trade.isSender
          ? Math.max(1, trade.messagesCount || 0)
          : (trade.messagesCount || 0);
      }
      const seen = JSON.parse(raw);
      const seenAt = new Date(seen.seenAt || 0).getTime();
      const tradeUpdated = new Date(trade.updatedAt || trade.createdAt).getTime();

      let count = 0;
      if (tradeUpdated > seenAt + 1000) {
        count += 1;
      }
      if (typeof trade.messagesCount === 'number' && typeof seen.messagesCount === 'number') {
        const newMessages = trade.messagesCount - seen.messagesCount;
        if (newMessages > 0) {
          count += newMessages;
        }
      }
      return count;
    } catch {
      return 0;
    }
  }, []);

  const formatDate = useCallback((dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(language === 'en' ? 'en-US' : 'uk-UA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }, [language]);

  // Filter & sort trades
  const filteredTrades = useMemo(() => {
    let list = trades;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((trade) => {
        const partner = trade.isSender ? trade.receiver : trade.sender;
        const partnerMatch = partner?.username?.toLowerCase().includes(q);
        const messageMatch = trade.message?.toLowerCase().includes(q);
        const bookMatch = [
          ...(trade.offeredBooks || []),
          ...(trade.requestedBooks || []),
        ].some(
          (b) =>
            b.title?.toLowerCase().includes(q) ||
            b.author?.toLowerCase().includes(q)
        );
        return partnerMatch || messageMatch || bookMatch;
      });
    }

    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sortBy === 'turn') {
        if (currentTab === 'requests') {
          const aNeedsUser = !a.isSender ? 0 : 1;
          const bNeedsUser = !b.isSender ? 0 : 1;
          if (aNeedsUser !== bNeedsUser) return aNeedsUser - bNeedsUser;
        }
        if (currentTab === 'agreed') {
          const aMyTurn = (a.isSender ? a.receiverCompleted : a.senderCompleted) && !(a.isSender ? a.senderCompleted : a.receiverCompleted) ? 0 : 1;
          const bMyTurn = (b.isSender ? b.receiverCompleted : b.senderCompleted) && !(b.isSender ? b.senderCompleted : b.receiverCompleted) ? 0 : 1;
          if (aMyTurn !== bMyTurn) return aMyTurn - bMyTurn;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'updated') {
        const aTime = new Date(a.updatedAt || a.createdAt).getTime();
        const bTime = new Date(b.updatedAt || b.createdAt).getTime();
        return bTime - aTime;
      }
      return 0;
    });

    return sorted;
  }, [trades, searchQuery, sortBy, currentTab]);

  return {
    currentUser,
    currentTab,
    handleTabChange,
    trades,
    filteredTrades,
    counts,
    loading,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    actionLoadingId,
    rejectModalTradeId,
    setRejectModalTradeId,
    toasts,
    removeToast,
    handleAccept,
    handleComplete,
    handleReject,
    handleConfirmReject,
    handleCancel,
    getTradeBadgeCount,
    formatDate,
    navigate,
  };
};
