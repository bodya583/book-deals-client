import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  getTradeById,
  acceptTrade,
  completeTrade,
  rejectTrade,
  cancelTrade,
} from '../../../api/tradesApi';
import type { Trade } from '../../../types/trade';
import { useAuthStore } from '../../../store/authStore';
import type { ToastMessage } from '../../../components/Toast';
import { useQuery } from '../../../hooks/useQuery';
import { queryClient } from '../../../utils/queryClient';
import { useTranslation } from '../../../i18n';
import { useTradeChat, computeSimpleHash } from './useTradeChat';

export { computeSimpleHash };

export const useTradeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const { t, language, tApiError } = useTranslation();

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToasts([{ id: String(Date.now()), text, type }]);
  }, []);

  const removeToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== toastId));
  }, []);

  const { data: tradeData = null, loading, setData: setTrade } = useQuery<Trade | null>(
    id ? `trades:${id}` : null,
    (signal) => (id ? getTradeById(id, { signal }) : Promise.resolve(null)),
    {
      staleTime: 10_000,
      onError: (err) => addToast(tApiError(err.message || t('common.error')), 'error'),
    }
  );

  const { chat, handover, refetchMessages } = useTradeChat({
    tradeId: id,
    trade: tradeData,
    setTrade,
    currentUser,
    addToast,
  });

  useEffect(() => {
    if (tradeData && id) {
      try {
        localStorage.setItem(
          `trade_seen_${id}`,
          JSON.stringify({
            seenAt: new Date().toISOString(),
            messagesCount: chat.messages.length,
          })
        );
      } catch {
        // ignore localStorage errors
      }
    }
  }, [id, tradeData?.updatedAt, tradeData?.createdAt, chat.messages.length]);

  const accept = async () => {
    if (!id || !window.confirm(t('tradeDetails.confirmModalAccept'))) return;
    try {
      setActionLoading(true);
      const updated = await acceptTrade(id);
      setTrade(updated);
      queryClient.invalidate('trades');
      addToast(t('tradeDetails.toasts.acceptSuccess'), 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('tradeDetails.toasts.errorGeneric');
      addToast(tApiError(message), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const complete = async () => {
    if (!id || !window.confirm(t('tradeDetails.confirmModalComplete'))) return;
    try {
      setActionLoading(true);
      const updated = await completeTrade(id);
      setTrade(updated);
      queryClient.invalidate('trades');
      addToast(
        updated.status === 'COMPLETED'
          ? t('tradeDetails.toasts.completeSuccessBoth')
          : t('tradeDetails.toasts.completeSuccessWaiting'),
        updated.status === 'COMPLETED' ? 'success' : 'info'
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('tradeDetails.toasts.errorGeneric');
      addToast(tApiError(message), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async (reason?: string) => {
    if (!id) return;
    try {
      setActionLoading(true);
      const updated = await rejectTrade(id, reason);
      setTrade(updated);
      setRejectModalOpen(false);
      queryClient.invalidate('trades');
      addToast(t('tradeDetails.toasts.rejectSuccess'), 'success');
      await refetchMessages();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('tradeDetails.toasts.errorGeneric');
      addToast(tApiError(message), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const cancel = async () => {
    if (!id || !window.confirm(t('tradeDetails.confirmModalCancel'))) return;
    try {
      setActionLoading(true);
      const updated = await cancelTrade(id);
      setTrade(updated);
      queryClient.invalidate('trades');
      addToast(t('tradeDetails.toasts.cancelSuccess'), 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('tradeDetails.toasts.errorGeneric');
      addToast(tApiError(message), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = useCallback(
    (dateStr?: string) => {
      if (!dateStr) return '';
      try {
        return new Date(dateStr).toLocaleDateString(language === 'en' ? 'en-US' : 'uk-UA', {
          day: 'numeric',
          month: 'long',
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

  const formatMessageTime = useCallback((isoString?: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const trade = useMemo(
    () => ({ id, data: tradeData, loading, actionLoading, formatDate, formatMessageTime }),
    [id, tradeData, loading, actionLoading, formatDate, formatMessageTime]
  );

  const actions = {
    accept,
    complete,
    openReject: () => setRejectModalOpen(true),
    confirmReject,
    cancel,
    rejectModalOpen,
    setRejectModalOpen,
  };

  const toastsBundle = useMemo(() => ({ items: toasts, remove: removeToast }), [toasts, removeToast]);

  return { currentUser, trade, chat, handover, actions, toasts: toastsBundle };
};
