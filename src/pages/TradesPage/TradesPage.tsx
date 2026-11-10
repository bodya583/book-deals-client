import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  getTrades,
  getTradeCounts,
  acceptTrade,
  completeTrade,
  rejectTrade,
  cancelTrade,
} from '../../api/tradesApi';
import type { Trade, TradeCounts, TradeStatus } from '../../types/trade';
import {
  TradeIcon,
  ArrowLeftRightIcon,
  InboxIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BookOpenIcon,
  SearchIcon,
  MessageSquareIcon,
  MapPinIcon,
  ArchiveIcon,
  HandshakeIcon,
  CloseIcon,
} from '../../components/icons';
import { useAuthStore } from '../../store/authStore';
import Toast, { type ToastMessage } from '../../components/Toast';
import RejectTradeModal from '../../components/RejectTradeModal';
import '../trades.css';

type TabType = 'requests' | 'agreed' | 'completed';
type SortOption = 'turn' | 'newest' | 'oldest' | 'updated';

export const TradesPage: React.FC = () => {
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

  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToasts([{ id: String(Date.now()), text, type }]);
  };

  const removeToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const fetchTradeData = async () => {
    try {
      setLoading(true);
      const [tradesData, countsData] = await Promise.all([
        getTrades(currentTab),
        getTradeCounts(),
      ]);
      setTrades(tradesData);
      setCounts(countsData);
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Не удалось загрузить трейды', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTradeData();
  }, [currentTab]);

  const handleTabChange = (tab: TabType) => {
    setSearchParams({ tab });
  };

  const handleAccept = async (tradeId: string) => {
    if (!window.confirm('Согласовать условия обмена? После этого состав сделки будет зафиксирован.')) {
      return;
    }
    try {
      setActionLoadingId(tradeId);
      await acceptTrade(tradeId);
      addToast('Обмен успешно согласован! Условия зафиксированы.', 'success');
      await fetchTradeData();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Ошибка при согласовании трейда', 'error');
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
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Ошибка при завершении трейда', 'error');
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
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Ошибка при отклонении трейда', 'error');
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
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Ошибка при отмене трейда', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter trades by search query and sort by selected criteria
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
        // 1. В разделе "Запросы": трейды, требующие ответа пользователя (!isSender), идут первыми
        if (currentTab === 'requests') {
          const aNeedsUser = !a.isSender ? 0 : 1;
          const bNeedsUser = !b.isSender ? 0 : 1;
          if (aNeedsUser !== bNeedsUser) {
            return aNeedsUser - bNeedsUser;
          }
        }

        // 2. В разделе "Согласованные": трейды, где партнёр уже подтвердил передачу книг, а пользователь нет
        if (currentTab === 'agreed') {
          const aMyTurn = (a.isSender ? a.receiverCompleted : a.senderCompleted) && !(a.isSender ? a.senderCompleted : a.receiverCompleted) ? 0 : 1;
          const bMyTurn = (b.isSender ? b.receiverCompleted : b.senderCompleted) && !(b.isSender ? b.senderCompleted : b.receiverCompleted) ? 0 : 1;
          if (aMyTurn !== bMyTurn) {
            return aMyTurn - bMyTurn;
          }
        }

        // Вторично: по дате создания (сначала новые)
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

  const formatDate = (dateStr: string) => {
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
  };

  const getTradeBadgeCount = (trade: Trade): number => {
    try {
      const raw = localStorage.getItem(`trade_seen_${trade.id}`);
      if (!raw) {
        // Если трейд ещё не открывался: если входящий активный, то 1 (новое предложение), плюс сообщения
        return trade.status === 'PENDING' && !trade.isSender
          ? Math.max(1, trade.messagesCount || 0)
          : (trade.messagesCount || 0);
      }
      const seen = JSON.parse(raw);
      const seenAt = new Date(seen.seenAt || 0).getTime();
      const tradeUpdated = new Date(trade.updatedAt || trade.createdAt).getTime();

      let count = 0;
      // Условия или статус изменились после последнего просмотра
      if (tradeUpdated > seenAt + 1000) {
        count += 1;
      }
      // Пришли новые сообщения
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
  };

  const renderStatusBadge = (status: TradeStatus, trade?: Trade) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="trade-status-pill status-pending" title="Обмен активен, возможны изменения или встречные предложения">
            <ClockIcon size={14} />
            <span>Ожидает ответа (Возможны изменения)</span>
          </span>
        );
      case 'AGREED':
      case 'ACCEPTED': {
        const iAmConfirmed = trade?.isSender ? trade.senderCompleted : trade?.receiverCompleted;
        const partnerConfirmed = trade?.isSender ? trade?.receiverCompleted : trade?.senderCompleted;

        if (iAmConfirmed && !partnerConfirmed) {
          return (
            <span
              className="trade-status-pill status-partial"
              style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
              title="Вы подтвердили получение книг, ожидается подтверждение от партнёра"
            >
              <ClockIcon size={14} />
              <span>Ожидается подтверждение партнёра</span>
            </span>
          );
        }
        if (!iAmConfirmed && partnerConfirmed) {
          return (
            <span
              className="trade-status-pill status-partner-ready"
              style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}
              title="Партнёр уже подтвердил получение ваших книг. Подтвердите получение своих!"
            >
              <CheckCircleIcon size={14} />
              <span>Партнёр подтвердил получение!</span>
            </span>
          );
        }
        return (
          <span
            className="trade-status-pill status-accepted"
            style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
            title="Условия обмена зафиксированы обеими сторонами, ожидается передача книг"
          >
            <CheckCircleIcon size={14} />
            <span>Согласован (Зафиксирован)</span>
          </span>
        );
      }
      case 'COMPLETED':
        return (
          <span
            className="trade-status-pill status-completed"
            style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}
            title="Обмен успешно завершён, книги получены"
          >
            <CheckCircleIcon size={14} />
            <span>Завершён (Книги получены)</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="trade-status-pill status-rejected">
            <XCircleIcon size={14} />
            <span>Отклонён</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="trade-status-pill status-cancelled">
            <XCircleIcon size={14} />
            <span>Отозван</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="trades-page">
      <Toast toasts={toasts} onRemove={removeToast} />

      <div className="trades-container">
        {/* Header */}
        <div className="trades-header">
          <div className="trades-header-left">
            <h1 className="trades-header-title">
              <TradeIcon size={28} />
              <span>Обмен книгами</span>
            </h1>
            <p className="trades-header-subtitle">
              Steam-like обмен без денег: отдавайте прочитанные книги и получайте взамен желаемые
            </p>
          </div>
        </div>

        {/* Gmail-style Two-Column Layout */}
        <div className="trades-workspace-layout">
          {/* Left Sidebar */}
          <aside className="trades-sidebar">
            <nav className="trades-sidebar-nav" aria-label="Категории обменов">
              <button
                type="button"
                className={`trades-sidebar-item ${currentTab === 'requests' ? 'active' : ''}`}
                onClick={() => handleTabChange('requests')}
              >
                <div className="sidebar-item-left">
                  <InboxIcon size={17} />
                  <span>Запросы</span>
                </div>
                <span
                  className={`sidebar-badge ${counts.incoming > 0 ? 'badge-highlight' : ''}`}
                  title={
                    counts.incoming > 0
                      ? `${counts.incoming} требуют вашего ответа (всего: ${counts.requests ?? (counts.incoming + counts.outgoing)})`
                      : `Всего запросов: ${counts.requests ?? (counts.incoming + counts.outgoing)}`
                  }
                >
                  {counts.requests ?? (counts.incoming + counts.outgoing)}
                </span>
              </button>

              <button
                type="button"
                className={`trades-sidebar-item ${currentTab === 'agreed' ? 'active' : ''}`}
                onClick={() => handleTabChange('agreed')}
              >
                <div className="sidebar-item-left">
                  <HandshakeIcon size={17} />
                  <span>Согласованные</span>
                </div>
                <span className={`sidebar-badge ${counts.agreed > 0 ? 'badge-agreed' : ''}`}>
                  {counts.agreed}
                </span>
              </button>

              <button
                type="button"
                className={`trades-sidebar-item ${currentTab === 'completed' ? 'active' : ''}`}
                onClick={() => handleTabChange('completed')}
              >
                <div className="sidebar-item-left">
                  <ArchiveIcon size={17} />
                  <span>Архив</span>
                </div>
                <span className="sidebar-badge">{counts.completed}</span>
              </button>
            </nav>
          </aside>

          {/* Right Main Content */}
          <main className="trades-main-area">
            {/* Search and Sort Toolbar */}
            <div className="trades-search-toolbar">
              <div className="inventory-search-wrap trades-search-box">
                <SearchIcon size={16} className="inventory-search-icon" />
                <input
                  type="text"
                  placeholder="Поиск по названию книги, автору или партнеру..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="inventory-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="books-search-clear"
                    title="Очистить поиск"
                  >
                    <CloseIcon size={13} />
                  </button>
                )}
              </div>

              <div className="trades-sort-wrap">
                <label htmlFor="trades-sort-select" className="trades-sort-label">
                  Сортировка:
                </label>
                <select
                  id="trades-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="trades-sort-select"
                  aria-label="Сортировка предложений обмена"
                >
                  <option value="turn">По ходу действия</option>
                  <option value="newest">Сначала новые</option>
                  <option value="updated">По последнему изменению</option>
                  <option value="oldest">Сначала старые</option>
                </select>
              </div>
            </div>

            {/* Category Heading */}
            <div className="trades-section-heading">
              <h2 className="trades-section-title">
                {currentTab === 'requests' && 'Запросы на обмен'}
                {currentTab === 'agreed' && 'Согласованные сделки'}
                {currentTab === 'completed' && 'Архив завершённых обменов'}
              </h2>
              <span className="trades-section-counter">
                {filteredTrades.length} {filteredTrades.length === 1 ? 'сделка' : filteredTrades.length > 1 && filteredTrades.length < 5 ? 'сделки' : 'сделок'}
              </span>
            </div>

            {/* Trade Cards List */}
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#666660' }}>
                Загрузка предложений обмена...
              </div>
            ) : filteredTrades.length === 0 ? (
              <div className="trades-empty-state">
                <div className="empty-state-icon">
                  <TradeIcon size={32} />
                </div>
                <h3 className="empty-state-title">
                  {currentTab === 'requests'
                    ? 'Нет активных запросов на обмен'
                    : currentTab === 'agreed'
                    ? 'Пока нет согласованных обменов'
                    : 'Пока нет завершённых обменов'}
                </h3>
                <p className="empty-state-text">
                  {currentTab === 'requests'
                    ? 'Здесь будут отображаться входящие и исходящие предложения обмена на стадии переговоров.'
                    : currentTab === 'agreed'
                    ? 'Здесь находятся сделки, условия которых зафиксированы, в ожидании передачи книг.'
                    : 'Здесь сохраняется архив успешно проведённых сделок, в которых книги получены.'}
                </p>
                <Link to="/books" className="btn-new-trade" style={{ marginTop: '0.5rem' }}>
                  <BookOpenIcon size={18} />
                  <span>Выбрать книги в каталоге</span>
                </Link>
              </div>
            ) : (
              <div className="trades-list">
            {filteredTrades.map((trade) => {
              if (trade.senderId === trade.receiverId) return null;

              const isSender = trade.isSender ?? (trade.senderId === currentUser?.id);
              const partner = (isSender ? trade.receiver : trade.sender) || trade.sender;
              const isPartnerInitiator = !isSender;

              // Perspective: What I give vs What I receive
              const myBooksToGive = isSender ? trade.offeredBooks : trade.requestedBooks;
              const myBooksToReceive = isSender ? trade.requestedBooks : trade.offeredBooks;

              const unreadBadgeCount = getTradeBadgeCount(trade);

              const renderRoleBadge = () => {
                if (currentTab === 'requests' || trade.status === 'PENDING') {
                  if (!isSender) {
                    return (
                      <span
                        className="trade-role-badge role-action-needed"
                        title="Вам поступило предложение — требуется ваш ответ или согласование"
                      >
                        <span className="role-dot role-dot-needed" />
                        <span>Требует вашего ответа</span>
                      </span>
                    );
                  }
                  return (
                    <span
                      className="trade-role-badge role-waiting"
                      title="Вы отправили предложение — ожидается ответ партнёра"
                    >
                      <span className="role-dot role-dot-waiting" />
                      <span>Ожидание партнёра</span>
                    </span>
                  );
                }

                if (currentTab === 'agreed' || trade.status === 'AGREED' || trade.status === 'ACCEPTED') {
                  const iAmConfirmed = isSender ? trade.senderCompleted : trade.receiverCompleted;
                  const partnerConfirmed = isSender ? trade.receiverCompleted : trade.senderCompleted;

                  if (partnerConfirmed && !iAmConfirmed) {
                    return (
                      <span
                        className="trade-role-badge role-action-needed"
                        title="Партнёр уже подтвердил передачу книг. Подтвердите получение своих!"
                      >
                        <span className="role-dot role-dot-needed" />
                        <span>Подтвердите получение</span>
                      </span>
                    );
                  }
                  if (iAmConfirmed && !partnerConfirmed) {
                    return (
                      <span
                        className="trade-role-badge role-waiting"
                        title="Вы подтвердили передачу. Ожидается подтверждение от партнёра."
                      >
                        <span className="role-dot role-dot-waiting" />
                        <span>Ожидание партнёра</span>
                      </span>
                    );
                  }
                }

                return null;
              };

              return (
                <article
                  key={trade.id}
                  className="trade-card trade-card-clickable"
                  onClick={() => navigate(`/trades/${trade.id}`)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/trades/${trade.id}`);
                    }
                  }}
                  title="Нажмите, чтобы открыть подробности сделки и чат согласования"
                >
                  {/* Card Header: Partner info + status */}
                  <div className="trade-card-header">
                    <Link
                      to={partner?.id ? `/profile/${partner.id}` : '#'}
                      className="trade-card-user-info"
                      onClick={(e) => e.stopPropagation()}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                      title={`Перейти в профиль пользователя @${partner?.username}`}
                    >
                      <div className="trade-user-avatar">
                        {partner?.photoURL ? (
                          <img src={partner.photoURL} alt={partner.username} />
                        ) : (
                          <span>{(partner?.username || 'П').slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="trade-user-meta">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="trade-user-name" style={{ textDecoration: 'underline text-decoration-color: transparent' }}>
                            @{partner?.username || 'Читатель'}
                          </span>
                          {partner?.city && (
                            <span style={{ fontSize: '0.8rem', color: '#666660', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <MapPinIcon size={12} />
                              <span>{partner.city}</span>
                            </span>
                          )}
                        </div>
                        <div className="trade-date-meta">
                          <span>
                            {isPartnerInitiator
                              ? 'Входящее предложение'
                              : 'Исходящее предложение'}
                          </span>
                          <span>•</span>
                          <span>{formatDate(trade.createdAt)}</span>
                        </div>
                      </div>
                    </Link>

                    <div className="trade-card-header-badges">
                      {unreadBadgeCount > 0 && (
                        <span
                          className="trade-card-badge-circle"
                          title={`${unreadBadgeCount} ${unreadBadgeCount === 1 ? 'новое сообщение или изменение условий' : 'новых сообщений или изменений'}`}
                        >
                          {unreadBadgeCount}
                        </span>
                      )}
                      {renderRoleBadge()}
                      {renderStatusBadge(trade.status, trade)}
                    </div>
                  </div>

                  {/* Steam-Style Item Exchange Matrix */}
                  <div className="trade-exchange-row">
                    {/* Left: What I Give */}
                    <div className="trade-exchange-side">
                      <div className="trade-side-label" style={{ color: '#b91c1c' }}>
                        <span>Вы отдаёте:</span>
                        <span>({myBooksToGive.length})</span>
                      </div>
                      <div className="trade-items-preview-grid">
                        {myBooksToGive.length === 0 ? (
                          <span style={{ fontSize: '0.85rem', color: '#888880', fontStyle: 'italic' }}>
                            Ничего не отдаете (дар от партнера)
                          </span>
                        ) : (
                          myBooksToGive.map((book) => (
                            <div key={book.id} className="trade-mini-book" title={`${book.title} — ${book.author}`}>
                              {book.coverURL ? (
                                <img src={book.coverURL} alt={book.title} className="trade-mini-cover" />
                              ) : (
                                <div className="trade-mini-cover">
                                  <BookOpenIcon size={14} />
                                </div>
                              )}
                              <div className="trade-mini-info">
                                <span className="trade-mini-title">{book.title}</span>
                                <span className="trade-mini-author">{book.author}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Center: Exchange Icon */}
                    <div className="trade-direction-divider" title="Предметы на предметы, без валюты">
                      <ArrowLeftRightIcon size={20} />
                    </div>

                    {/* Right: What I Receive */}
                    <div className="trade-exchange-side">
                      <div className="trade-side-label" style={{ color: '#15803d' }}>
                        <span>Вы получаете:</span>
                        <span>({myBooksToReceive.length})</span>
                      </div>
                      <div className="trade-items-preview-grid">
                        {myBooksToReceive.length === 0 ? (
                          <span style={{ fontSize: '0.85rem', color: '#888880', fontStyle: 'italic' }}>
                            Ничего не запрашиваете (подарок партнеру)
                          </span>
                        ) : (
                          myBooksToReceive.map((book) => (
                            <div key={book.id} className="trade-mini-book" title={`${book.title} — ${book.author}`}>
                              {book.coverURL ? (
                                <img src={book.coverURL} alt={book.title} className="trade-mini-cover" />
                              ) : (
                                <div className="trade-mini-cover">
                                  <BookOpenIcon size={14} />
                                </div>
                              )}
                              <div className="trade-mini-info">
                                <span className="trade-mini-title">{book.title}</span>
                                <span className="trade-mini-author">{book.author}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Message Bubble if any */}
                  {trade.message && (
                    <div className="trade-card-message">
                      <span style={{ flexShrink: 0, marginTop: '2px', color: '#2d6a4f', display: 'inline-flex' }}>
                        <MessageSquareIcon size={16} />
                      </span>
                      <span>«{trade.message}»</span>
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="trade-card-actions">
                    {trade.status === 'PENDING' && trade.isReceiver && !trade.isSender && (
                      <>
                        <button
                          type="button"
                          className="btn-trade-reject"
                          disabled={actionLoadingId === trade.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(trade.id);
                          }}
                        >
                          <XCircleIcon size={16} />
                          <span>Отклонить</span>
                        </button>
                        <button
                          type="button"
                          className="btn-trade-accept"
                          disabled={actionLoadingId === trade.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccept(trade.id);
                          }}
                        >
                          <CheckCircleIcon size={16} />
                          <span>Согласовать обмен</span>
                        </button>
                      </>
                    )}

                    {(trade.status === 'AGREED' || trade.status === 'ACCEPTED') && (() => {
                      const iAmConfirmed = trade.isSender ? trade.senderCompleted : trade.receiverCompleted;
                      const partnerConfirmed = trade.isSender ? trade.receiverCompleted : trade.senderCompleted;

                      if (iAmConfirmed) {
                        return (
                          <span style={{ fontSize: '0.825rem', color: '#b45309', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <ClockIcon size={14} />
                            <span>Вы подтвердили. Ожидаем партнёра</span>
                          </span>
                        );
                      }

                      return (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          {partnerConfirmed && (
                            <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <CheckCircleIcon size={14} />
                              <span>Партнёр подтвердил!</span>
                            </span>
                          )}
                          <button
                            type="button"
                            className="btn-trade-complete"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              background: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              padding: '0.6rem 1rem',
                              borderRadius: '8px',
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                            }}
                            disabled={actionLoadingId === trade.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleComplete(trade.id);
                            }}
                            title="Подтвердить получение книг"
                          >
                            <CheckCircleIcon size={16} />
                            <span>{partnerConfirmed ? 'Подтвердить получение (Завершить)' : 'Книги получены'}</span>
                          </button>
                        </div>
                      );
                    })()}

                    {trade.status === 'COMPLETED' && (
                      <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircleIcon size={16} />
                        <span>Обмен успешно завершён</span>
                      </span>
                    )}

                    {trade.status === 'PENDING' && trade.isSender && (
                      <button
                        type="button"
                        className="btn-trade-cancel"
                        disabled={actionLoadingId === trade.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel(trade.id);
                        }}
                        title="Отозвать предложение обмена, если передумали"
                      >
                        <XCircleIcon size={16} />
                        <span>Отозвать предложение</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
          </main>
        </div>
      </div>

      <RejectTradeModal
        isOpen={Boolean(rejectModalTradeId)}
        onClose={() => setRejectModalTradeId(null)}
        onConfirm={handleConfirmReject}
        loading={Boolean(actionLoadingId)}
      />
    </div>
  );
};

export default TradesPage;
