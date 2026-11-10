import { useState, useEffect, useMemo, useCallback } from 'react';
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

export type TabType = 'requests' | 'agreed' | 'completed';
export type SortOption = 'turn' | 'newest' | 'oldest' | 'updated';

export const useTradesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const rawTab = searchParams.get('tab');
  const currentTab: TabType = (rawTab === 'agreed' || rawTab === 'completed') ? rawTab : 'requests';

  const [trades, setTrades] = useState<Trade[]>([]);
  const [counts, setCounts] = useState<TradeCounts>({
    incoming: 0,
    outgoing: 0,
    requests: 0,
    agreed: 0,
    completed: 0,
    total: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('turn');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectModalTradeId, setRejectModalTradeId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToasts([{ id: String(Date.now()), text, type }]);
  }, []);

  const removeToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  const fetchTradeData = useCallback(async () => {
    try {
      setLoading(true);
      const [tradesData, countsData] = await Promise.all([
        getTrades(currentTab),
        getTradeCounts(),
      ]);
      setTrades(tradesData);
      setCounts(countsData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить трейды';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [currentTab, addToast]);

  useEffect(() => {
    fetchTradeData();
  }, [fetchTradeData]);

  const handleTabChange = useCallback((tab: TabType) => {
    setSearchParams({ tab });
  }, [setSearchParams]);

  const handleAccept = async (tradeId: string) => {
    if (!window.confirm('Согласовать условия обмена? После этого состав сделки будет зафиксирован.')) {
      return;
    }
    try {
      setActionLoadingId(tradeId);
      await acceptTrade(tradeId);
      addToast('Обмен успешно согласован! Условия зафиксированы.', 'success');
      await fetchTradeData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка при согласовании трейда';
      addToast(message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleComplete = async (tradeId: string) => {
    if (!window.confirm('Подтвердить получение книг? Сделка перейдёт в статус завершённой, когда обе стороны подтвердят получение.')) {
      return;
    }
    try {
      setActionLoadingId(tradeId);
      const updated = await completeTrade(tradeId);
      if (updated.status === 'COMPLETED') {
        addToast('Обмен успешно завершён обеими сторонами! Книги получены.', 'success');
      } else {
        addToast('Вы подтвердили получение книг! Ожидается подтверждение партнёра.', 'info');
      }
      await fetchTradeData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка при завершении трейда';
      addToast(message, 'error');
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
      addToast('Предложение обмена отклонено', 'success');
      setRejectModalTradeId(null);
      await fetchTradeData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка при отклонении трейда';
      addToast(message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (tradeId: string) => {
    if (!window.confirm('Отозвать ваше предложение обмена?')) {
      return;
    }
    try {
      setActionLoadingId(tradeId);
      await cancelTrade(tradeId);
      addToast('Предложение обмена отозвано', 'success');
      await fetchTradeData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка при отмене трейда';
      addToast(message, 'error');
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

  const formatDate = useCallback((dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }, []);

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
