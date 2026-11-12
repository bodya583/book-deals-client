import { useState, useEffect, useRef, useMemo } from 'react';
import { getTradeMessages, sendTradeMessage } from '../../../api/tradesApi';
import type { Trade, TradeMessage } from '../../../types/trade';
import { useQuery } from '../../../hooks/useQuery';
import { useTranslation } from '../../../i18n';
import {
  parseHandoverFromMessages,
  LOC_PROP_REGEX,
  TIME_PROP_REGEX,
  type HandoverAgreement,
} from '../components/handoverParser';

export const computeSimpleHash = (str: string): string => {
  let hash = 0;
  const s = str.trim().toLowerCase();
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return `h_${Math.abs(hash)}`;
};

interface UseTradeChatParams {
  tradeId?: string;
  trade: Trade | null;
  setTrade: React.Dispatch<React.SetStateAction<Trade | null | undefined>>;
  currentUser: { id: string; username?: string; photoURL?: string | null } | null;
  addToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export interface TradeChatController {
  messages: TradeMessage[];
  loading: boolean;
  text: string;
  setText: (val: string) => void;
  sending: boolean;
  endRef: React.RefObject<HTMLDivElement | null>;
  sendMessage: (e: React.FormEvent) => Promise<void>;
  sendCustomMessage: (text: string) => Promise<void>;
}

export interface TradeHandoverController {
  agreement: HandoverAgreement;
  lastLocationProposalId?: string;
  lastTimeProposalId?: string;
  acceptLocation: (loc: string) => Promise<void>;
  acceptTime: (tm: string) => Promise<void>;
}

export const useTradeChat = ({
  tradeId,
  trade,
  setTrade,
  currentUser,
  addToast,
}: UseTradeChatParams) => {
  const { t, tApiError } = useTranslation();

  const {
    data: messages = [],
    loading: messagesLoading,
    refetch: refetchMessages,
    setData: setMessages,
  } = useQuery<TradeMessage[]>(
    tradeId ? `trades:${tradeId}:messages` : null,
    (signal) => (tradeId ? getTradeMessages(tradeId, { signal }) : Promise.resolve([])),
    { staleTime: 5_000 }
  );

  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agreement = useMemo(() => parseHandoverFromMessages(messages), [messages]);

  const lastLocationProposalId = useMemo(
    () => [...messages].reverse().find((m) => LOC_PROP_REGEX.test(m.text || ''))?.id,
    [messages]
  );

  const lastTimeProposalId = useMemo(
    () => [...messages].reverse().find((m) => TIME_PROP_REGEX.test(m.text || ''))?.id,
    [messages]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendCustomMessage = async (text: string) => {
    if (!tradeId || sendingMessage) return;
    try {
      setSendingMessage(true);
      const newMsg = await sendTradeMessage(tradeId, text);
      setMessages((prev = []) => [...prev, newMsg]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('tradeDetails.toasts.errorGeneric');
      addToast(tApiError(message), 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const acceptLocation = async (loc: string) => {
    const locHash = computeSimpleHash(loc);
    const alreadyAgreed =
      trade?.agreedLocationHash === locHash ||
      agreement.agreedLocation?.trim().toLowerCase() === loc.trim().toLowerCase();

    if (alreadyAgreed) {
      const noticeText = t('tradeDetails.toasts.locAgreedAlready', { loc });
      setMessages((prev = []) => [
        ...prev,
        {
          id: `self-notice-loc-${Date.now()}`,
          tradeId: trade?.id || '',
          senderId: currentUser?.id || '',
          sender: currentUser as any,
          text: noticeText,
          createdAt: new Date().toISOString(),
          isSelfOnly: true,
        },
      ]);
      addToast(noticeText, 'info');
      return;
    }

    setTrade((prev) => (prev ? { ...prev, agreedLocationHash: locHash } : prev));
    await sendCustomMessage(`Meeting location agreed: ${loc}`);
    addToast(t('handover.chatBubbleLocAgreed'), 'success');
  };

  const acceptTime = async (tm: string) => {
    const timeHash = computeSimpleHash(tm);
    const alreadyAgreed =
      trade?.agreedTimeHash === timeHash ||
      agreement.agreedTime?.trim().toLowerCase() === tm.trim().toLowerCase();

    if (alreadyAgreed) {
      const noticeText = t('tradeDetails.toasts.timeAgreedAlready', { time: tm });
      setMessages((prev = []) => [
        ...prev,
        {
          id: `self-notice-time-${Date.now()}`,
          tradeId: trade?.id || '',
          senderId: currentUser?.id || '',
          sender: currentUser as any,
          text: noticeText,
          createdAt: new Date().toISOString(),
          isSelfOnly: true,
        },
      ]);
      addToast(noticeText, 'info');
      return;
    }

    setTrade((prev) => (prev ? { ...prev, agreedTimeHash: timeHash } : prev));
    await sendCustomMessage(`Meeting time agreed: ${tm}`);
    addToast(t('handover.chatBubbleTimeAgreed'), 'success');
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text || !tradeId || sendingMessage) return;

    try {
      setSendingMessage(true);
      const newMsg = await sendTradeMessage(tradeId, text);
      setMessages((prev = []) => [...prev, newMsg]);
      setMessageText('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('tradeDetails.toasts.errorGeneric');
      addToast(tApiError(message), 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const chat: TradeChatController = {
    messages,
    loading: messagesLoading,
    text: messageText,
    setText: setMessageText,
    sending: sendingMessage,
    endRef: messagesEndRef,
    sendMessage,
    sendCustomMessage,
  };

  const handover: TradeHandoverController = {
    agreement,
    lastLocationProposalId,
    lastTimeProposalId,
    acceptLocation,
    acceptTime,
  };

  return { chat, handover, refetchMessages };
};
