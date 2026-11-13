import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axiosInstance';
import { getTradeById, getTradePartners } from '../../../api/tradesApi';
import { getUserProfileById } from '../../../api/usersApi';
import type { TradePartner } from '../../../types/trade';
import type { Book } from '../../../types/book';
import { useTranslation } from '../../../i18n';

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

interface UseTradeOfferDataParams {
  currentUserId?: string;
  preselectedPartnerId: string;
  preselectedBookId: string;
  counterTradeId: string;
  addToast: (text: string, type?: 'success' | 'error') => void;
  setOfferedBookIds: (ids: string[]) => void;
  setTargetBookIds: (ids: string[]) => void;
  setInitialBooksHash: (hash: string) => void;
  setInventoryTab: (tab: 'my' | 'partner') => void;
  setMessage: (msg: string) => void;
}

export const useTradeOfferData = ({
  currentUserId,
  preselectedPartnerId,
  preselectedBookId,
  counterTradeId,
  addToast,
  setOfferedBookIds,
  setTargetBookIds,
  setInitialBooksHash,
  setInventoryTab,
  setMessage,
}: UseTradeOfferDataParams) => {
  const navigate = useNavigate();
  const { t, tApiError } = useTranslation();
  const [partners, setPartners] = useState<TradePartner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(preselectedPartnerId);
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [partnerBooks, setPartnerBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const callbacksRef = useRef({
    addToast,
    setOfferedBookIds,
    setTargetBookIds,
    setInitialBooksHash,
    setInventoryTab,
    setMessage,
    t,
    tApiError,
  });

  useEffect(() => {
    callbacksRef.current = {
      addToast,
      setOfferedBookIds,
      setTargetBookIds,
      setInitialBooksHash,
      setInventoryTab,
      setMessage,
      t,
      tApiError,
    };
  });

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const myBooksParams: Record<string, string | number> = { limit: 100 };
        if (currentUserId) myBooksParams.userId = currentUserId;

        const [partnersData, myBooksRes] = await Promise.all([
          getTradePartners(),
          api.get('/books', { params: myBooksParams }),
        ]);

        const finalPartners = [...partnersData];
        setMyBooks(myBooksRes.data.books || myBooksRes.data || []);

        if (counterTradeId) {
          try {
            const orig = await getTradeById(counterTradeId);
            if (orig.senderId === currentUserId) {
              callbacksRef.current.addToast(callbacksRef.current.t('offer.errNotYourTurn'), 'error');
              navigate(`/trades/${orig.id}`);
              return;
            }

            const partnerId = orig.senderId;
            const partnerUser = orig.sender;

            setSelectedPartnerId(partnerId);
            if (partnerUser && !finalPartners.some((p) => p.id === partnerId)) {
              finalPartners.unshift(partnerUser);
            }

            const origOffered = (orig.requestedBooks || []).map((b) => b.id);
            const origTarget = (orig.offeredBooks || []).map((b) => b.id);

            callbacksRef.current.setOfferedBookIds(origOffered);
            callbacksRef.current.setTargetBookIds(origTarget);
            callbacksRef.current.setInitialBooksHash(computeBooksHash(origOffered, origTarget));
            callbacksRef.current.setMessage('');
          } catch {
            callbacksRef.current.addToast(callbacksRef.current.t('offer.errLoadOriginal'), 'error');
          }
        } else {
          if (preselectedPartnerId) {
            if (!finalPartners.some((p) => p.id === preselectedPartnerId)) {
              try {
                const profile = await getUserProfileById(preselectedPartnerId);
                finalPartners.unshift({
                  id: profile.id,
                  username: profile.username,
                  photoURL: profile.photoURL,
                  city: profile.city,
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
            callbacksRef.current.setTargetBookIds([preselectedBookId]);
            callbacksRef.current.setInventoryTab('my');
          }
        }

        setPartners(finalPartners);
      } catch (err: unknown) {
        const errorMsg =
          err && typeof err === 'object' && 'response' in err && (err as any).response?.data?.message
            ? (err as any).response.data.message
            : callbacksRef.current.t('offer.errLoadData');
        callbacksRef.current.addToast(callbacksRef.current.tApiError(errorMsg), 'error');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [preselectedPartnerId, preselectedBookId, counterTradeId, currentUserId, navigate]);

  useEffect(() => {
    if (!selectedPartnerId) {
      setPartnerBooks([]);
      return;
    }

    api
      .get('/books', { params: { userId: selectedPartnerId, limit: 100 } })
      .then((res) => {
        const allBooks = res.data.books || res.data || [];
        setPartnerBooks(allBooks.filter((b: Book) => b.isForTrade !== false));
      })
      .catch(() => setPartnerBooks([]));
  }, [selectedPartnerId]);

  return {
    partners,
    selectedPartnerId,
    setSelectedPartnerId,
    myBooks,
    partnerBooks,
    loading,
  };
};
