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
import { parseHandoverFromMessages } from '../components/TradeHandoverSection';

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

  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);

  // Chat state
  const [messages, setMessages] = useState<TradeMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(true);
  const [messageText, setMessageText] = useState<string>('');
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handover = useMemo(() => parseHandoverFromMessages(messages), [messages]);

  const lastLocationProposalId = useMemo(() => {
    return [...messages]
      .reverse()
      .find((m) => m.text?.includes('Предложение точки передачи:'))?.id;
  }, [messages]);

  const lastTimeProposalId = useMemo(() => {
    return [...messages]
      .reverse()
      .find((m) => m.text?.includes('Предложение времени встречи:'))?.id;
  }, [messages]);

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToasts([{ id: String(Date.now()), text, type }]);
  }, []);

  const removeToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  const fetchTrade = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getTradeById(id);
      setTrade(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить данные трейда';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  const fetchMessages = useCallback(async () => {
    if (!id) return;
    try {
      setMessagesLoading(true);
      const msgs = await getTradeMessages(id);
      setMessages(msgs);
    } catch {
      // ignore
    } finally {
      setMessagesLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTrade();
    fetchMessages();
  }, [fetchTrade, fetchMessages]);

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
      setMessages((prev) => [...prev, newMsg]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Не удалось отправить сообщение';
      addToast(message, 'error');
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
        text: `Точка передачи уже согласована («${loc}»). Повторное сообщение в чат не отправлено.`,
        createdAt: new Date().toISOString(),
        isSelfOnly: true,
      };
      setMessages((prev) => [...prev, selfNotice]);
      addToast(`Точка передачи уже согласована: ${loc}`, 'info');
      return;
    }

    setTrade((prev) => (prev ? { ...prev, agreedLocationHash: locHash } : prev));
    await handleSendCustomMessage(`Точка встречи согласована: ${loc}`);
    addToast('Точка встречи согласована!', 'success');
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
        text: `Время встречи уже согласовано («${tm}»). Повторное сообщение в чат не отправлено.`,
        createdAt: new Date().toISOString(),
        isSelfOnly: true,
      };
      setMessages((prev) => [...prev, selfNotice]);
      addToast(`Время встречи уже согласовано: ${tm}`, 'info');
      return;
    }

    setTrade((prev) => (prev ? { ...prev, agreedTimeHash: timeHash } : prev));
    await handleSendCustomMessage(`Время встречи согласовано: ${tm}`);
    addToast('Время встречи согласовано!', 'success');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text || !id || sendingMessage) return;

    try {
      setSendingMessage(true);
      const newMsg = await sendTradeMessage(id, text);
      setMessages((prev) => [...prev, newMsg]);
      setMessageText('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Не удалось отправить сообщение';
      addToast(message, 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAccept = async () => {
    if (!id || !window.confirm('Согласовать условия обмена? После этого состав сделки будет зафиксирован.')) {
      return;
    }
    try {
      setActionLoading(true);
      const updated = await acceptTrade(id);
      setTrade(updated);
      addToast('Обмен успешно согласован! Условия зафиксированы.', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка при согласовании трейда';
      addToast(message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!id || !window.confirm('Подтвердить получение книг? Сделка перейдёт в статус завершённой, когда обе стороны подтвердят получение.')) {
      return;
    }
    try {
      setActionLoading(true);
      const updated = await completeTrade(id);
      setTrade(updated);
      if (updated.status === 'COMPLETED') {
        addToast('Обмен успешно завершён обеими сторонами! Книги перешли новым владельцам.', 'success');
      } else {
        addToast('Вы подтвердили получение книг! Ожидается подтверждение партнёра.', 'info');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка при завершении трейда';
      addToast(message, 'error');
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
      addToast('Предложение обмена отклонено', 'success');
      await fetchMessages();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка при отклонении трейда';
      addToast(message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id || !window.confirm('Отозвать предложение обмена?')) {
      return;
    }
    try {
      setActionLoading(true);
      const updated = await cancelTrade(id);
      setTrade(updated);
      addToast('Предложение обмена отозвано', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка при отмене трейда';
      addToast(message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = useCallback((dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }, []);

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
