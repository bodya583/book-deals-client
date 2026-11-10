import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../api/axiosInstance';
import { createTrade, counterTrade, getTradeById, getTradePartners } from '../../../api/tradesApi';
import { getUserProfileById } from '../../../api/usersApi';
import type { TradePartner } from '../../../types/trade';
import type { Book } from '../../../types/book';
import type { ToastMessage } from '../../../components/Toast';
import { useAuthStore } from '../../../store/authStore';

// Sort book IDs alphabetically and compute a hash so that selection order does not matter
export const computeBooksHash = (offeredIds: string[], targetIds: string[]): string => {
  const sortedOffered = [...offeredIds].sort().join(',');
  const sortedTarget = [...targetIds].sort().join(',');
  const rawKey = `give:[${sortedOffered}]|get:[${sortedTarget}]`;
  let hash = 0;
  for (let i = 0; i < rawKey.length; i++) {
    hash = (hash << 5) - hash + rawKey.charCodeAt(i);
    hash |= 0;
  }
  return `bh_${Math.abs(hash)}`;
};

export const useTradeOffer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const preselectedPartnerId = searchParams.get('partnerId') || '';
  const preselectedBookId = searchParams.get('bookId') || '';
  const counterTradeId = searchParams.get('counterTradeId') || '';

  // State
  const [partners, setPartners] = useState<TradePartner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(preselectedPartnerId);
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [partnerBooks, setPartnerBooks] = useState<Book[]>([]);

  // Staging items (offered by me, requested from partner)
  const [offeredBookIds, setOfferedBookIds] = useState<string[]>([]);
  const [targetBookIds, setTargetBookIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');

  // Initial books hash cache (pre-sorted before hashing so selection order does not matter)
  const [initialBooksHash, setInitialBooksHash] = useState<string>('');

  // Inventory tab: 'my' or 'partner'
  const [inventoryTab, setInventoryTab] = useState<'my' | 'partner'>('my');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToasts([{ id: String(Date.now()), text, type }]);
  }, []);

  const removeToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  // Load partners and my books on mount
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const myBooksParams: Record<string, any> = { limit: 100 };
        if (currentUser?.id) {
          myBooksParams.userId = currentUser.id;
        }

        const [partnersData, myBooksRes] = await Promise.all([
          getTradePartners(),
          api.get('/books', { params: myBooksParams }),
        ]);

        let finalPartners = [...partnersData];
        setMyBooks(myBooksRes.data.books || myBooksRes.data || []);

        // If counter-offering on an existing trade
        if (counterTradeId) {
          try {
            const originalTrade = await getTradeById(counterTradeId);
            // Partner is ALWAYS the other party, never the current user!
            const partnerId =
              originalTrade.senderId === currentUser?.id
                ? originalTrade.receiverId
                : originalTrade.senderId;
            const partnerUser =
              originalTrade.senderId === currentUser?.id
                ? originalTrade.receiver
                : originalTrade.sender;

            setSelectedPartnerId(partnerId);
            if (partnerUser && !finalPartners.some((p) => p.id === partnerId)) {
              finalPartners.unshift(partnerUser);
            }

            // Items from user's perspective:
            const origOffered = (
              originalTrade.senderId === currentUser?.id
                ? originalTrade.offeredBooks || []
                : originalTrade.requestedBooks || []
            ).map((b) => b.id);
            const origTarget = (
              originalTrade.senderId === currentUser?.id
                ? originalTrade.requestedBooks || []
                : originalTrade.offeredBooks || []
            ).map((b) => b.id);

            setOfferedBookIds(origOffered);
            setTargetBookIds(origTarget);

            // Pre-sort and hash initial trade book composition
            setInitialBooksHash(computeBooksHash(origOffered, origTarget));

            // Requirement: Do not pre-fill previous comment in counter-trade
            setMessage('');
          } catch {
            addToast('Не удалось загрузить исходный трейд для изменения', 'error');
          }
        } else {
          // If a partner was preselected from profile or book
          if (preselectedPartnerId) {
            if (!finalPartners.some((p) => p.id === preselectedPartnerId)) {
              try {
                const partnerProfile = await getUserProfileById(preselectedPartnerId);
                finalPartners.unshift({
                  id: partnerProfile.id,
                  username: partnerProfile.username,
                  photoURL: partnerProfile.photoURL,
                  city: partnerProfile.city,
                });
              } catch (e) {
                console.error('Could not load target partner profile', e);
              }
            }
            setSelectedPartnerId(preselectedPartnerId);
          } else if (finalPartners.length > 0) {
            setSelectedPartnerId(finalPartners[0].id);
          }

          if (preselectedBookId) {
            setTargetBookIds([preselectedBookId]);
            setInventoryTab('my'); // Prompt user to select what they give
          }
        }

        setPartners(finalPartners);
      } catch (err: unknown) {
        const errorMsg =
          err && typeof err === 'object' && 'response' in err && (err as any).response?.data?.message
            ? (err as any).response.data.message
            : 'Не удалось загрузить данные обмена';
        addToast(errorMsg, 'error');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [preselectedPartnerId, preselectedBookId, counterTradeId, currentUser?.id, addToast]);

  // Load partner's books whenever selectedPartner changes
  useEffect(() => {
    if (!selectedPartnerId) {
      setPartnerBooks([]);
      return;
    }

    const fetchPartnerBooks = async () => {
      try {
        const res = await api.get('/books', {
          params: { userId: selectedPartnerId, limit: 100 },
        });
        const allBooks = res.data.books || res.data || [];
        setPartnerBooks(allBooks.filter((b: Book) => b.isForTrade !== false));
      } catch {
        setPartnerBooks([]);
      }
    };

    fetchPartnerBooks();
  }, [selectedPartnerId]);

  const selectedPartner = useMemo(() => {
    return partners.find((p) => p.id === selectedPartnerId) || null;
  }, [partners, selectedPartnerId]);

  // Books currently staged
  const stagedOfferedBooks = useMemo(() => {
    return myBooks.filter((b) => offeredBookIds.includes(b.id));
  }, [myBooks, offeredBookIds]);

  const stagedTargetBooks = useMemo(() => {
    return partnerBooks.filter((b) => targetBookIds.includes(b.id));
  }, [partnerBooks, targetBookIds]);

  // Toggle books in staging
  const toggleOfferedBook = useCallback((bookId: string) => {
    setOfferedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  }, []);

  const toggleTargetBook = useCallback((bookId: string) => {
    setTargetBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  }, []);

  // Pre-sort books and compute hash to verify whether books were modified (order does not matter)
  const currentBooksHash = useMemo(() => {
    return computeBooksHash(offeredBookIds, targetBookIds);
  }, [offeredBookIds, targetBookIds]);

  const isTradeUnchanged = useMemo(() => {
    if (!counterTradeId || !initialBooksHash) return false;
    return currentBooksHash === initialBooksHash;
  }, [counterTradeId, initialBooksHash, currentBooksHash]);

  // Submit Trade Offer
  const handleSubmitTrade = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPartnerId) {
      addToast('Пожалуйста, выберите партнера по обмену', 'error');
      return;
    }

    if (currentUser?.id && selectedPartnerId === currentUser.id) {
      addToast('Нельзя создать предложение обмена с самим собой', 'error');
      return;
    }

    if (counterTradeId && isTradeUnchanged) {
      addToast(
        'Состав книг не изменился. Добавьте или удалите книги, чтобы отправить встречное предложение',
        'error'
      );
      return;
    }

    if (offeredBookIds.length === 0 && targetBookIds.length === 0) {
      addToast('Выберите хотя бы одну книгу для предложения или запроса', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (counterTradeId) {
        await counterTrade(counterTradeId, {
          receiverId: selectedPartnerId,
          offerBookIds: offeredBookIds,
          targetBookIds: targetBookIds,
          message,
        });
        addToast('Встречное предложение успешно отправлено!', 'success');
      } else {
        await createTrade({
          receiverId: selectedPartnerId,
          offerBookIds: offeredBookIds,
          targetBookIds: targetBookIds,
          message,
        });
        addToast('Предложение обмена успешно отправлено!', 'success');
      }

      setTimeout(() => {
        navigate('/trades?tab=requests');
      }, 800);
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === 'object' && 'response' in err && (err as any).response?.data?.message
          ? (err as any).response.data.message
          : 'Не удалось отправить предложение обмена';
      addToast(errorMsg, 'error');
      setSubmitting(false);
    }
  };

  // Filter current inventory
  const activeInventoryBooks = inventoryTab === 'my' ? myBooks : partnerBooks;
  const filteredInventoryBooks = useMemo(() => {
    if (!searchFilter.trim()) return activeInventoryBooks;
    const q = searchFilter.toLowerCase().trim();
    return activeInventoryBooks.filter(
      (b) => b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q)
    );
  }, [activeInventoryBooks, searchFilter]);

  return {
    counterTradeId,
    selectedPartner,
    partners,
    setSelectedPartnerId,
    partnerBooks,
    myBooks,
    offeredBookIds,
    targetBookIds,
    stagedOfferedBooks,
    stagedTargetBooks,
    toggleOfferedBook,
    toggleTargetBook,
    inventoryTab,
    setInventoryTab,
    searchFilter,
    setSearchFilter,
    filteredInventoryBooks,
    message,
    setMessage,
    isTradeUnchanged,
    loading,
    submitting,
    toasts,
    removeToast,
    handleSubmitTrade,
  };
};
