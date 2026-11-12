import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createTrade, counterTrade } from '../../../api/tradesApi';
import type { Book } from '../../../types/book';
import type { TradePartner } from '../../../types/trade';
import type { ToastMessage } from '../../../components/Toast';
import { useAuthStore } from '../../../store/authStore';
import { useTranslation } from '../../../i18n';
import { useTradeOfferData, computeBooksHash } from './useTradeOfferData';

export { computeBooksHash };

export interface TradeOfferBooksController {
  myCount: number;
  partnerCount: number;
  offeredIds: string[];
  targetIds: string[];
  stagedOffered: Book[];
  stagedTarget: Book[];
  toggleOffered: (bookId: string) => void;
  toggleTarget: (bookId: string) => void;
}

export interface TradeOfferInventoryController {
  tab: 'my' | 'partner';
  setTab: (tab: 'my' | 'partner') => void;
  searchFilter: string;
  setSearchFilter: (q: string) => void;
  filtered: Book[];
  loading: boolean;
}

export const useTradeOffer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { t, tApiError } = useTranslation();

  const preselectedPartnerId = searchParams.get('partnerId') || '';
  const preselectedBookId = searchParams.get('bookId') || '';
  const counterTradeId = searchParams.get('counterTradeId') || '';

  const [offeredBookIds, setOfferedBookIds] = useState<string[]>([]);
  const [targetBookIds, setTargetBookIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [initialBooksHash, setInitialBooksHash] = useState('');
  const [inventoryTab, setInventoryTab] = useState<'my' | 'partner'>('my');
  const [searchFilter, setSearchFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToasts([{ id: String(Date.now()), text, type }]);
  }, []);

  const removeToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== toastId));
  }, []);

  const {
    partners,
    selectedPartnerId,
    setSelectedPartnerId,
    myBooks,
    partnerBooks,
    loading,
  } = useTradeOfferData({
    currentUserId: currentUser?.id,
    preselectedPartnerId,
    preselectedBookId,
    counterTradeId,
    addToast,
    setOfferedBookIds,
    setTargetBookIds,
    setInitialBooksHash,
    setInventoryTab,
    setMessage,
  });

  const selectedPartner: TradePartner | null = useMemo(
    () => partners.find((p) => p.id === selectedPartnerId) || null,
    [partners, selectedPartnerId]
  );

  const stagedOffered = useMemo(
    () => myBooks.filter((b) => offeredBookIds.includes(b.id)),
    [myBooks, offeredBookIds]
  );

  const stagedTarget = useMemo(
    () => partnerBooks.filter((b) => targetBookIds.includes(b.id)),
    [partnerBooks, targetBookIds]
  );

  const toggleOffered = useCallback((bookId: string) => {
    setOfferedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  }, []);

  const toggleTarget = useCallback((bookId: string) => {
    setTargetBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  }, []);

  const currentBooksHash = useMemo(
    () => computeBooksHash(offeredBookIds, targetBookIds),
    [offeredBookIds, targetBookIds]
  );

  const isTradeUnchanged = Boolean(counterTradeId && initialBooksHash && currentBooksHash === initialBooksHash);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId) return addToast(t('offer.errSelectPartner'), 'error');
    if (currentUser?.id && selectedPartnerId === currentUser.id) {
      return addToast(t('offer.errSelfTrade'), 'error');
    }
    if (counterTradeId && isTradeUnchanged) {
      return addToast(t('offer.unchangedTitle'), 'error');
    }
    if (offeredBookIds.length === 0 || targetBookIds.length === 0) {
      return addToast(t('offer.errSelectBoth'), 'error');
    }

    try {
      setSubmitting(true);
      const payload = {
        receiverId: selectedPartnerId,
        offerBookIds: offeredBookIds,
        targetBookIds,
        message,
      };
      if (counterTradeId) {
        await counterTrade(counterTradeId, payload);
        addToast(t('offer.successCounter'), 'success');
      } else {
        await createTrade(payload);
        addToast(t('offer.successCreated'), 'success');
      }
      setTimeout(() => navigate('/trades?tab=requests'), 800);
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === 'object' && 'response' in err && (err as any).response?.data?.message
          ? (err as any).response.data.message
          : t('offer.errSubmit');
      addToast(tApiError(errorMsg), 'error');
      setSubmitting(false);
    }
  };

  const activeBooks = inventoryTab === 'my' ? myBooks : partnerBooks;
  const filtered = useMemo(() => {
    if (!searchFilter.trim()) return activeBooks;
    const q = searchFilter.toLowerCase().trim();
    return activeBooks.filter(
      (b) => b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q)
    );
  }, [activeBooks, searchFilter]);

  const books: TradeOfferBooksController = {
    myCount: myBooks.length,
    partnerCount: partnerBooks.length,
    offeredIds: offeredBookIds,
    targetIds: targetBookIds,
    stagedOffered,
    stagedTarget,
    toggleOffered,
    toggleTarget,
  };

  const inventory: TradeOfferInventoryController = {
    tab: inventoryTab,
    setTab: setInventoryTab,
    searchFilter,
    setSearchFilter,
    filtered,
    loading,
  };

  return {
    meta: { counterTradeId, loading, submitting, isTradeUnchanged },
    partner: { selected: selectedPartner, list: partners, select: setSelectedPartnerId },
    books,
    inventory,
    composer: { message, setMessage, submit },
    toasts: { items: toasts, remove: removeToast },
  };
};
