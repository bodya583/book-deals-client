import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { createTrade, counterTrade, getTradeById, getTradePartners } from '../../api/tradesApi';
import { getUserProfileById } from '../../api/usersApi';
import type { TradePartner } from '../../types/trade';
import type { Book } from '../../types/book';
import {
  TradeIcon,
  ArrowLeftRightIcon,
  SearchIcon,
  BookOpenIcon,
  CheckIcon,
  UserIcon,
  ChevronLeftIcon,
  MessageSquareIcon,
  MapPinIcon,
} from '../../components/icons';
import Toast, { type ToastMessage } from '../../components/Toast';
import { useAuthStore } from '../../store/authStore';
import '../trades.css';

export const TradeOfferPage: React.FC = () => {
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

  // Initial books cache (for counter-trades to prevent sending unchanged trades)
  const [initialOfferedBookIds, setInitialOfferedBookIds] = useState<string[]>([]);
  const [initialTargetBookIds, setInitialTargetBookIds] = useState<string[]>([]);

  // Inventory tab: 'my' or 'partner'
  const [inventoryTab, setInventoryTab] = useState<'my' | 'partner'>('my');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToasts([{ id: String(Date.now()), text, type }]);
  };

  const removeToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

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
            const partnerId = originalTrade.senderId === currentUser?.id
              ? originalTrade.receiverId
              : originalTrade.senderId;
            const partnerUser = originalTrade.senderId === currentUser?.id
              ? originalTrade.receiver
              : originalTrade.sender;

            setSelectedPartnerId(partnerId);
            if (partnerUser && !finalPartners.some((p) => p.id === partnerId)) {
              finalPartners.unshift(partnerUser);
            }

            // Items from user's perspective:
            const origOffered = (originalTrade.senderId === currentUser?.id
              ? (originalTrade.offeredBooks || [])
              : (originalTrade.requestedBooks || [])).map((b) => b.id);
            const origTarget = (originalTrade.senderId === currentUser?.id
              ? (originalTrade.requestedBooks || [])
              : (originalTrade.offeredBooks || [])).map((b) => b.id);

            setOfferedBookIds(origOffered);
            setTargetBookIds(origTarget);
            setInitialOfferedBookIds(origOffered);
            setInitialTargetBookIds(origTarget);

            // Requirement 3: Do not pre-fill previous comment in counter-trade
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

          // If preselected book, pre-add it to targetBookIds
          if (preselectedBookId) {
            setTargetBookIds([preselectedBookId]);
            setInventoryTab('my'); // Prompt user to select what they give
          }
        }

        setPartners(finalPartners);
      } catch (err: any) {
        addToast(err.response?.data?.message || 'Не удалось загрузить данные обмена', 'error');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [preselectedPartnerId, preselectedBookId, counterTradeId]);

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
  const toggleOfferedBook = (bookId: string) => {
    setOfferedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const toggleTargetBook = (bookId: string) => {
    setTargetBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  // Check if book composition is unchanged from original trade in counter mode
  const isTradeUnchanged = useMemo(() => {
    if (!counterTradeId) return false;
    if (initialOfferedBookIds.length === 0 && initialTargetBookIds.length === 0) return false;

    if (offeredBookIds.length !== initialOfferedBookIds.length) return false;
    if (targetBookIds.length !== initialTargetBookIds.length) return false;

    const sameOffered = offeredBookIds.every((id) => initialOfferedBookIds.includes(id));
    const sameTarget = targetBookIds.every((id) => initialTargetBookIds.includes(id));

    return sameOffered && sameTarget;
  }, [counterTradeId, offeredBookIds, targetBookIds, initialOfferedBookIds, initialTargetBookIds]);

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
      addToast('Состав книг не изменился. Добавьте или удалите книги, чтобы отправить встречное предложение', 'error');
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
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Не удалось отправить предложение обмена', 'error');
      setSubmitting(false);
    }
  };

  // Filter current inventory
  const activeInventoryBooks = inventoryTab === 'my' ? myBooks : partnerBooks;
  const filteredInventoryBooks = useMemo(() => {
    if (!searchFilter.trim()) return activeInventoryBooks;
    const q = searchFilter.toLowerCase().trim();
    return activeInventoryBooks.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q)
    );
  }, [activeInventoryBooks, searchFilter]);

  return (
    <div className="trades-page">
      <Toast toasts={toasts} onRemove={removeToast} />

      <div className="trades-container">
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/trades" className="trade-back-btn">
            <ChevronLeftIcon size={16} />
            <span>Назад к списку трейдов</span>
          </Link>
        </div>

        {/* Partner Info Banner */}
        <div className="trade-partner-card">
          <div className="partner-card-left">
            <div className="trade-user-avatar" style={{ width: 44, height: 44 }}>
              {selectedPartner?.photoURL ? (
                <img src={selectedPartner.photoURL} alt={selectedPartner.username} />
              ) : (
                <span>{(selectedPartner?.username || 'П').slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  Обмен с {selectedPartner?.username ? `@${selectedPartner.username}` : 'читателем'}
                </span>
                {selectedPartner?.city && (
                  <span style={{ fontSize: '0.85rem', color: '#666660', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <MapPinIcon size={13} />
                    <span>{selectedPartner.city}</span>
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.85rem', color: '#666660' }}>
                Книг для обмена у партнера: {partnerBooks.length}
              </span>
            </div>
          </div>
        </div>

        <div className="steam-trade-table">
          <div className="steam-table-header">
            <h2 className="steam-table-title">
              <TradeIcon size={20} />
              <span>Стол обмена</span>
            </h2>
          </div>

          <div className="steam-matrix-grid">
            {/* Left Box: Your items to give */}
            <div className="steam-side-box">
              <div className="steam-side-header">
                <span className="steam-side-label">Ваше предложение (Вы отдаёте)</span>
                <span className="steam-side-count">{offeredBookIds.length} выбрано</span>
              </div>

              {stagedOfferedBooks.length === 0 ? (
                <div className="steam-slot-empty">
                  <BookOpenIcon size={28} />
                  <span>Перетащите или нажмите на книги из вашего инвентаря ниже, чтобы предложить их</span>
                </div>
              ) : (
                <div className="steam-slots-container">
                  {stagedOfferedBooks.map((book) => (
                    <div
                      key={book.id}
                      className="steam-slot-item"
                      onClick={() => toggleOfferedBook(book.id)}
                      title="Нажмите, чтобы убрать из предложения"
                    >
                      <div className="steam-remove-overlay">
                        <span>Убрать</span>
                      </div>
                      {book.coverURL ? (
                        <img src={book.coverURL} alt={book.title} className="steam-slot-cover" />
                      ) : (
                        <div className="steam-slot-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <BookOpenIcon size={24} color="#64748b" />
                        </div>
                      )}
                      <span className="steam-slot-title">{book.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Center: Direction exchange indicator */}
            <div className="steam-matrix-divider">
              <div className="steam-exchange-bubble">
                <ArrowLeftRightIcon size={22} />
              </div>
            </div>

            {/* Right Box: Partner's items to receive */}
            <div className="steam-side-box">
              <div className="steam-side-header">
                <span className="steam-side-label">
                  Предложение партнера (@{selectedPartner?.username || 'читатель'})
                </span>
                <span className="steam-side-count" style={{ color: '#4ade80' }}>
                  {targetBookIds.length} выбрано
                </span>
              </div>

              {stagedTargetBooks.length === 0 ? (
                <div className="steam-slot-empty">
                  <BookOpenIcon size={28} />
                  <span>Выберите книги партнера из вкладки «Инвентарь партнера»</span>
                </div>
              ) : (
                <div className="steam-slots-container">
                  {stagedTargetBooks.map((book) => (
                    <div
                      key={book.id}
                      className="steam-slot-item"
                      onClick={() => toggleTargetBook(book.id)}
                      title="Нажмите, чтобы убрать из запроса"
                    >
                      <div className="steam-remove-overlay">
                        <span>Убрать</span>
                      </div>
                      {book.coverURL ? (
                        <img src={book.coverURL} alt={book.title} className="steam-slot-cover" />
                      ) : (
                        <div className="steam-slot-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <BookOpenIcon size={24} color="#64748b" />
                        </div>
                      )}
                      <span className="steam-slot-title">{book.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STEAM INVENTORY DRAWER */}
        <div className="steam-inventory-box">
          <div className="inventory-tabs">
            <button
              type="button"
              className={`inventory-tab-btn ${inventoryTab === 'my' ? 'active' : ''}`}
              onClick={() => setInventoryTab('my')}
            >
              <UserIcon size={18} />
              <span>Ваш инвентарь ({myBooks.length})</span>
            </button>

            <button
              type="button"
              className={`inventory-tab-btn ${inventoryTab === 'partner' ? 'active' : ''}`}
              onClick={() => setInventoryTab('partner')}
            >
              <BookOpenIcon size={18} />
              <span>
                Инвентарь @{selectedPartner?.username || 'партнера'} ({partnerBooks.length})
              </span>
            </button>
          </div>

          {/* Search bar inside inventory */}
          <div className="inventory-toolbar">
            <div className="inventory-search-wrap">
              <SearchIcon size={16} className="inventory-search-icon" />
              <input
                type="text"
                placeholder={
                  inventoryTab === 'my'
                    ? 'Поиск по вашим книгам...'
                    : `Поиск по книгам @${selectedPartner?.username || 'партнера'}...`
                }
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="inventory-search-input"
              />
            </div>
            <span style={{ fontSize: '0.85rem', color: '#666660' }}>
              Нажмите на книгу, чтобы добавить или убрать её из обмена
            </span>
          </div>

          {/* Book Cards Grid */}
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666660' }}>
              Загрузка книг...
            </div>
          ) : filteredInventoryBooks.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#888880' }}>
              {inventoryTab === 'my'
                ? 'В вашей библиотеке нет доступных книг для обмена. Добавьте книги в каталоге или откройте их для обмена в профиле.'
                : 'У этого партнера пока нет книг для обмена.'}
            </div>
          ) : (
            <div className="inventory-grid">
              {filteredInventoryBooks.map((book) => {
                const isSelected =
                  inventoryTab === 'my'
                    ? offeredBookIds.includes(book.id)
                    : targetBookIds.includes(book.id);

                return (
                  <div
                    key={book.id}
                    className={`inventory-card ${isSelected ? 'in-trade' : ''}`}
                    onClick={() => {
                      if (inventoryTab === 'my') {
                        toggleOfferedBook(book.id);
                      } else {
                        toggleTargetBook(book.id);
                      }
                    }}
                  >
                    {isSelected && (
                      <span className="inventory-card-badge">
                        <span style={{ display: 'inline-flex', marginRight: 2 }}>
                          <CheckIcon size={12} />
                        </span>
                        В обмене
                      </span>
                    )}

                    {book.coverURL ? (
                      <img src={book.coverURL} alt={book.title} className="inventory-card-cover" />
                    ) : (
                      <div className="inventory-card-cover">
                        <BookOpenIcon size={32} />
                      </div>
                    )}

                    <h4 className="inventory-card-title">{book.title}</h4>
                    <p className="inventory-card-author">{book.author}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* STEAM ACTION FOOTER & SUBMIT */}
        <form onSubmit={handleSubmitTrade} className="steam-action-footer">
          <div className="trade-message-group">
            <label className="trade-message-label" htmlFor="trade-message">
              <MessageSquareIcon size={16} />
              <span>Сообщение партнеру (необязательно):</span>
            </label>
            <textarea
              id="trade-message"
              className="trade-message-textarea"
              placeholder="Привет! Предлагаю обменяться книгами. Могу отправить по почте или встретиться лично."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
            />
          </div>

          <div className="trade-footer-bottom">
            <div className="trade-summary-pills">
              <span className="summary-pill pill-give">
                Вы отдаёте: {offeredBookIds.length} {offeredBookIds.length === 1 ? 'книгу' : 'книг'}
              </span>
              <span className="summary-pill pill-get">
                Вы получаете: {targetBookIds.length} {targetBookIds.length === 1 ? 'книгу' : 'книг'}
              </span>
              {isTradeUnchanged && (
                <span
                  style={{
                    fontSize: '0.825rem',
                    color: '#b45309',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    fontWeight: 500,
                  }}
                >
                  Состав книг не изменён. Измените книги для отправки.
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn-steam-submit"
              disabled={submitting || (offeredBookIds.length === 0 && targetBookIds.length === 0) || isTradeUnchanged}
              style={
                counterTradeId
                  ? isTradeUnchanged
                    ? { background: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' }
                    : { background: '#2563eb', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)' }
                  : undefined
              }
              title={
                isTradeUnchanged
                  ? 'Состав книг не изменился. Добавьте или удалите книги, чтобы отправить встречное предложение'
                  : undefined
              }
            >
              <TradeIcon size={18} />
              <span>
                {submitting
                  ? 'Отправка...'
                  : counterTradeId
                  ? (isTradeUnchanged ? 'Состав книг не изменён' : 'Отправить встречное предложение')
                  : 'Предложить обмен'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeOfferPage;
