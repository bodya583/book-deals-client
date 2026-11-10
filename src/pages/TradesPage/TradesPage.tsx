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
  SendIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BookOpenIcon,
  PlusIcon,
  SearchIcon,
  MessageSquareIcon,
  MapPinIcon,
} from '../../components/icons';
import Toast, { type ToastMessage } from '../../components/Toast';
import '../trades.css';

type TabType = 'incoming' | 'outgoing' | 'agreed' | 'completed' | 'all';

export const TradesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentTab = (searchParams.get('tab') as TabType) || 'incoming';

  const [trades, setTrades] = useState<Trade[]>([]);
  const [counts, setCounts] = useState<TradeCounts>({
    incoming: 0,
    outgoing: 0,
    agreed: 0,
    completed: 0,
    total: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'error' = 'success') => {
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
    if (!window.confirm('Подтвердить получение книг? Сделка будет завершена, а книги перейдут новым владельцам.')) {
      return;
    }
    try {
      setActionLoadingId(tradeId);
      await completeTrade(tradeId);
      addToast('Обмен успешно завершён! Книги получены.', 'success');
      await fetchTradeData();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Ошибка при завершении трейда', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (tradeId: string) => {
    if (!window.confirm('Отклонить это предложение обмена?')) {
      return;
    }
    try {
      setActionLoadingId(tradeId);
      await rejectTrade(tradeId);
      addToast('Предложение обмена отклонено', 'success');
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

  // Filter trades by search query
  const filteredTrades = useMemo(() => {
    if (!searchQuery.trim()) return trades;
    const q = searchQuery.toLowerCase().trim();
    return trades.filter((trade) => {
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
  }, [trades, searchQuery]);

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

  const renderStatusBadge = (status: TradeStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="trade-status-pill status-pending" title="Обмен активен, возможны изменения или встречные предложения">
            <ClockIcon size={14} />
            <span>Ожидает ответа (Возможны изменения)</span>
          </span>
        );
      case 'AGREED':
      case 'ACCEPTED':
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
              <TradeIcon size={30} />
              <span>Обмен книгами (Трейды)</span>
            </h1>
            <p className="trades-header-subtitle">
              Steam-like обмен без денег: отдавайте прочитанные книги и получайте взамен желаемые
            </p>
          </div>

          <div className="trades-header-actions">
            <Link to="/trades/new" className="btn-new-trade">
              <PlusIcon size={18} />
              <span>Предложить обмен</span>
            </Link>
          </div>
        </div>

        {/* Tabs & Search Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="trades-tabs-nav">
            <button
              type="button"
              className={`trade-tab-btn ${currentTab === 'incoming' ? 'active' : ''}`}
              onClick={() => handleTabChange('incoming')}
            >
              <InboxIcon size={17} />
              <span>Входящие</span>
              <span className={`trade-tab-badge ${counts.incoming > 0 ? 'badge-highlight' : ''}`}>
                {counts.incoming}
              </span>
            </button>

            <button
              type="button"
              className={`trade-tab-btn ${currentTab === 'outgoing' ? 'active' : ''}`}
              onClick={() => handleTabChange('outgoing')}
            >
              <SendIcon size={17} />
              <span>Исходящие</span>
              <span className="trade-tab-badge">{counts.outgoing}</span>
            </button>

            <button
              type="button"
              className={`trade-tab-btn ${currentTab === 'agreed' ? 'active' : ''}`}
              onClick={() => handleTabChange('agreed')}
            >
              <CheckCircleIcon size={17} />
              <span>Согласованные</span>
              <span className="trade-tab-badge">{counts.agreed}</span>
            </button>

            <button
              type="button"
              className={`trade-tab-btn ${currentTab === 'completed' ? 'active' : ''}`}
              onClick={() => handleTabChange('completed')}
            >
              <CheckCircleIcon size={17} />
              <span>Завершённые</span>
              <span className="trade-tab-badge">{counts.completed}</span>
            </button>

            <button
              type="button"
              className={`trade-tab-btn ${currentTab === 'all' ? 'active' : ''}`}
              onClick={() => handleTabChange('all')}
            >
              <span>Все трейды</span>
              <span className="trade-tab-badge">{counts.total}</span>
            </button>
          </div>

          {/* Quick filter input */}
          <div className="inventory-search-wrap" style={{ minWidth: '240px', flex: '1 1 240px', maxWidth: '360px' }}>
            <SearchIcon size={16} className="inventory-search-icon" />
            <input
              type="text"
              placeholder="Поиск по книгам или партнеру..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="inventory-search-input"
            />
          </div>
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
              {currentTab === 'incoming'
                ? 'Нет входящих предложений'
                : currentTab === 'outgoing'
                ? 'Нет активных исходящих трейдов'
                : currentTab === 'agreed'
                ? 'Пока нет согласованных обменов'
                : currentTab === 'completed'
                ? 'Пока нет завершённых обменов'
                : 'Список трейдов пуст'}
            </h3>
            <p className="empty-state-text">
              {currentTab === 'incoming'
                ? 'Когда другой читатель предложит вам обменяться книгами, предложение появится здесь.'
                : currentTab === 'agreed'
                ? 'Здесь находятся сделки, условия которых зафиксированы, в ожидании передачи книг.'
                : currentTab === 'completed'
                ? 'Здесь сохраняется архив успешно проведённых сделок, в которых книги получены.'
                : 'Выберите интересную книгу в каталоге или предложите прямой обмен читателю.'}
            </p>
            <Link to="/trades/new" className="btn-new-trade" style={{ marginTop: '0.5rem' }}>
              <PlusIcon size={18} />
              <span>Создать предложение обмена</span>
            </Link>
          </div>
        ) : (
          <div className="trades-list">
            {filteredTrades.map((trade) => {
              const partner = trade.isSender ? trade.receiver : trade.sender;
              const isPartnerInitiator = !trade.isSender;

              // Perspective: What I give vs What I receive
              const myBooksToGive = trade.isSender ? trade.offeredBooks : trade.requestedBooks;
              const myBooksToReceive = trade.isSender ? trade.requestedBooks : trade.offeredBooks;

              return (
                <article key={trade.id} className="trade-card">
                  {/* Card Header: Partner info + status */}
                  <div className="trade-card-header">
                    <Link
                      to={partner?.id ? `/profile/${partner.id}` : '#'}
                      className="trade-card-user-info"
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
                              ? 'Предложил(а) вам обмен'
                              : 'Вы предложили обмен'}
                          </span>
                          <span>•</span>
                          <span>{formatDate(trade.createdAt)}</span>
                        </div>
                      </div>
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {renderStatusBadge(trade.status)}
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
                    <button
                      type="button"
                      className="btn-trade-details"
                      onClick={() => navigate(`/trades/${trade.id}`)}
                      title="Открыть детали обмена и чат согласования"
                    >
                      <span>Подробнее</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
                      {trade.status === 'PENDING' && trade.isReceiver && !trade.isSender && (
                        <>
                          <button
                            type="button"
                            className="btn-trade-counter"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              padding: '0.55rem 0.9rem',
                              borderRadius: '8px',
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              cursor: 'pointer',
                            }}
                            onClick={() => navigate(`/trades/new?counterTradeId=${trade.id}`)}
                            title="Изменить состав обмена и отправить встречное предложение"
                          >
                            <TradeIcon size={15} />
                            <span>Изменить</span>
                          </button>
                          <button
                            type="button"
                            className="btn-trade-reject"
                            disabled={actionLoadingId === trade.id}
                            onClick={() => handleReject(trade.id)}
                          >
                            <XCircleIcon size={16} />
                            <span>Отклонить</span>
                          </button>
                          <button
                            type="button"
                            className="btn-trade-accept"
                            disabled={actionLoadingId === trade.id}
                            onClick={() => handleAccept(trade.id)}
                          >
                            <CheckCircleIcon size={16} />
                            <span>Согласовать обмен</span>
                          </button>
                        </>
                      )}

                      {(trade.status === 'AGREED' || trade.status === 'ACCEPTED') && (
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
                          onClick={() => handleComplete(trade.id)}
                          title="Подтвердить получение книг и завершить сделку"
                        >
                          <CheckCircleIcon size={16} />
                          <span>Книги получены (Завершить)</span>
                        </button>
                      )}

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
                          onClick={() => handleCancel(trade.id)}
                          title="Отозвать предложение обмена, если передумали"
                        >
                          <XCircleIcon size={16} />
                          <span>Отозвать предложение</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradesPage;
