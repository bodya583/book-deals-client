import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  getTradeById,
  acceptTrade,
  completeTrade,
  rejectTrade,
  cancelTrade,
  getTradeMessages,
  sendTradeMessage,
} from '../../../api/tradesApi';
import type { Trade, TradeMessage } from '../../../types/trade';
import { useAuthStore } from '../../../store/authStore';
import type { ToastMessage } from '../../../components/Toast';
import {
  parseHandoverFromMessages,
  LOC_PROP_REGEX,
  TIME_PROP_REGEX,
} from '../components/TradeHandoverSection';
import { useQuery } from '../../../hooks/useQuery';
import { queryClient } from '../../../utils/queryClient';
import { useTranslation } from '../../../i18n';

export const computeSimpleHash = (str: string): string => {
  let hash = 0;
  const s = str.trim().toLowerCase();
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return `h_${Math.abs(hash)}`;
};

export const useTradeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const { t, language, tApiError } = useTranslation();

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToasts([{ id: String(Date.now()), text, type }]);
  }, []);

  const removeToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  // Resilient queries with AbortController, deduplication, and cache
  const {
    data: trade = null,
    loading,
    setData: setTrade,
  } = useQuery<Trade | null>(
    id ? `trades:${id}` : null,
    (signal) => (id ? getTradeById(id, { signal }) : Promise.resolve(null)),
    {
      staleTime: 10_000,
      onError: (err) => addToast(tApiError(err.message || t('common.error')), 'error'),
    }
  );

  const {
    data: messages = [],
    loading: messagesLoading,
    refetch: refetchMessages,
    setData: setMessages,
  } = useQuery<TradeMessage[]>(
    id ? `trades:${id}:messages` : null,
    (signal) => (id ? getTradeMessages(id, { signal }) : Promise.resolve([])),
    {
      staleTime: 5_000,
    }
  );

  // Chat state
  const [messageText, setMessageText] = useState<string>('');
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handover = useMemo(() => parseHandoverFromMessages(messages), [messages]);

  const lastLocationProposalId = useMemo(() => {
    return [...messages]
      .reverse()
      .find((m) => LOC_PROP_REGEX.test(m.text || ''))?.id;
  }, [messages]);

  const lastTimeProposalId = useMemo(() => {
    return [...messages]
      .reverse()
      .find((m) => TIME_PROP_REGEX.test(m.text || ''))?.id;
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark trade as seen in localStorage to clear unread badge
  useEffect(() => {
    if (trade && id) {
      try {
        localStorage.setItem(
          `trade_seen_${id}`,
          JSON.stringify({
            seenAt: new Date().toISOString(),
            messagesCount: messages.length,
          })
        );
      } catch {
        // ignore localStorage errors
      }
    }
  }, [id, trade?.updatedAt, trade?.createdAt, messages.length]);

  const handleSendCustomMessage = async (text: string) => {
    if (!id || sendingMessage) return;
    try {
      setSendingMessage(true);
      const newMsg = await sendTradeMessage(id, text);
      setMessages((prev = []) => [...prev, newMsg]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('tradeDetails.toasts.errorGeneric');
      addToast(tApiError(message), 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAcceptLocation = async (loc: string) => {
    const locHash = computeSimpleHash(loc);
    const alreadyAgreed =
      trade?.agreedLocationHash === locHash ||
      handover.agreedLocation?.trim().toLowerCase() === loc.trim().toLowerCase();

    if (alreadyAgreed) {
      const selfNotice: TradeMessage = {
        id: `self-notice-loc-${Date.now()}`,
        tradeId: trade?.id || '',
        senderId: currentUser?.id || '',
        sender: currentUser as any,
        text: t('tradeDetails.toasts.locAgreedAlready', { loc }),
        createdAt: new Date().toISOString(),
        isSelfOnly: true,
      };
      setMessages((prev = []) => [...prev, selfNotice]);
      addToast(t('tradeDetails.toasts.locAgreedAlready', { loc }), 'info');
      return;
    }

    setTrade((prev) => (prev ? { ...prev, agreedLocationHash: locHash } : prev));
    await handleSendCustomMessage(`Meeting location agreed: ${loc}`);
    addToast(t('handover.chatBubbleLocAgreed'), 'success');
  };

  const handleAcceptTime = async (tm: string) => {
    const timeHash = computeSimpleHash(tm);
    const alreadyAgreed =
      trade?.agreedTimeHash === timeHash ||
      handover.agreedTime?.trim().toLowerCase() === tm.trim().toLowerCase();

    if (alreadyAgreed) {
      const selfNotice: TradeMessage = {
        id: `self-notice-time-${Date.now()}`,
        tradeId: trade?.id || '',
        senderId: currentUser?.id || '',
        sender: currentUser as any,
        text: t('tradeDetails.toasts.timeAgreedAlready', { time: tm }),
        createdAt: new Date().toISOString(),
        isSelfOnly: true,
      };
      setMessages((prev = []) => [...prev, selfNotice]);
      addToast(t('tradeDetails.toasts.timeAgreedAlready', { time: tm }), 'info');
      return;
    }

    setTrade((prev) => (prev ? { ...prev, agreedTimeHash: timeHash } : prev));
    await handleSendCustomMessage(`Meeting time agreed: ${tm}`);
    addToast(t('handover.chatBubbleTimeAgreed'), 'success');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text || !id || sendingMessage) return;

    try {
      setSendingMessage(true);
      const newMsg = await sendTradeMessage(id, text);
      setMessages((prev = []) => [...prev, newMsg]);
      setMessageText('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('tradeDetails.toasts.errorGeneric');
      addToast(tApiError(message), 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAccept = async () => {
    if (!id || !window.confirm(t('tradeDetails.confirmModalAccept'))) {
      return;
    }
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

  const handleComplete = async () => {
    if (!id || !window.confirm(t('tradeDetails.confirmModalComplete'))) {
      return;
    }
    try {
      setActionLoading(true);
      const updated = await completeTrade(id);
      setTrade(updated);
      queryClient.invalidate('trades');
      if (updated.status === 'COMPLETED') {
        addToast(t('tradeDetails.toasts.completeSuccessBoth'), 'success');
      } else {
        addToast(t('tradeDetails.toasts.completeSuccessWaiting'), 'info');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('tradeDetails.toasts.errorGeneric');
      addToast(tApiError(message), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = () => {
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (reason?: string) => {
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

  const handleCancel = async () => {
    if (!id || !window.confirm(t('tradeDetails.confirmModalCancel'))) {
      return;
    }
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
        const d = new Date(dateStr);
        return d.toLocaleDateString(language === 'en' ? 'en-US' : 'uk-UA', {
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
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  return {
    id,
    currentUser,
    trade,
    loading,
    actionLoading,
    toasts,
    removeToast,
    rejectModalOpen,
    setRejectModalOpen,
    messages,
    messagesLoading,
    messageText,
    setMessageText,
    sendingMessage,
    messagesEndRef,
    handover,
    lastLocationProposalId,
    lastTimeProposalId,
    handleSendMessage,
    handleSendCustomMessage,
    handleAcceptLocation,
    handleAcceptTime,
    handleAccept,
    handleComplete,
    handleReject,
    handleConfirmReject,
    handleCancel,
    formatDate,
    formatMessageTime,
  };
};
