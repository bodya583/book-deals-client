import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getTradeById,
  acceptTrade,
  completeTrade,
  rejectTrade,
  cancelTrade,
  getTradeMessages,
  sendTradeMessage,
} from '../../api/tradesApi';
import type { Trade, TradeStatus, TradeMessage } from '../../types/trade';
import { useAuthStore } from '../../store/authStore';
import {
  TradeIcon,
  ArrowLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BookOpenIcon,
  ChevronLeftIcon,
  MessageSquareIcon,
  MapPinIcon,
} from '../../components/icons';
import Toast, { type ToastMessage } from '../../components/Toast';
import {
  parseHandoverFromMessages,
  HandoverBanner,
  HandoverToolbar,
  renderProposalBubbleContent,
} from './components/TradeHandoverSection';
import '../trades.css';

export const TradeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Trade Chat state
  const [messages, setMessages] = useState<TradeMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(true);
  const [messageText, setMessageText] = useState<string>('');
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handover = useMemo(() => parseHandoverFromMessages(messages), [messages]);

  const addToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToasts([{ id: String(Date.now()), text, type }]);
  };

  const removeToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const handleSendCustomMessage = async (text: string) => {
    if (!id || sendingMessage) return;
    try {
      setSendingMessage(true);
      const newMsg = await sendTradeMessage(id, text);
      setMessages((prev) => [...prev, newMsg]);
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Не удалось отправить сообщение', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAcceptLocation = async (loc: string) => {
    await handleSendCustomMessage(`Точка встречи согласована: ${loc}`);
    addToast('Точка встречи согласована!', 'success');
  };

  const handleAcceptTime = async (tm: string) => {
    await handleSendCustomMessage(`Время встречи согласовано: ${tm}`);
    addToast('Время встречи согласовано!', 'success');
  };

  const fetchTrade = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getTradeById(id);
      setTrade(data);
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Не удалось загрузить данные трейда', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
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
  };

  useEffect(() => {
    fetchTrade();
    fetchMessages();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text || !id || sendingMessage) return;

    try {
      setSendingMessage(true);
      const newMsg = await sendTradeMessage(id, text);
      setMessages((prev) => [...prev, newMsg]);
      setMessageText('');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Не удалось отправить сообщение', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Ошибка при согласовании трейда', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!id || !window.confirm('Подтвердить получение книг? Сделка будет завершена, а книги перейдут новым владельцам.')) {
      return;
    }
    try {
      setActionLoading(true);
      const updated = await completeTrade(id);
      setTrade(updated);
      addToast('Обмен успешно завершён! Книги получены.', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Ошибка при завершении трейда', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id || !window.confirm('Отклонить это предложение обмена?')) {
      return;
    }
    try {
      setActionLoading(true);
      const updated = await rejectTrade(id);
      setTrade(updated);
      addToast('Предложение обмена отклонено', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Ошибка при отклонении трейда', 'error');
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
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Ошибка при отмене трейда', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
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
  };

  const renderStatusBadge = (status: TradeStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="trade-status-pill status-pending" style={{ fontSize: '0.95rem', padding: '0.5rem 1rem' }}>
            <ClockIcon size={16} />
            <span>Ожидает ответа (Возможны изменения)</span>
          </span>
        );
      case 'AGREED':
      case 'ACCEPTED':
        return (
          <span
            className="trade-status-pill status-accepted"
            style={{ fontSize: '0.95rem', padding: '0.5rem 1rem', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
          >
            <CheckCircleIcon size={16} />
            <span>Согласован (Условия зафиксированы)</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span
            className="trade-status-pill status-completed"
            style={{ fontSize: '0.95rem', padding: '0.5rem 1rem', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}
          >
            <CheckCircleIcon size={16} />
            <span>Завершён (Книги получены)</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="trade-status-pill status-rejected" style={{ fontSize: '0.95rem', padding: '0.5rem 1rem' }}>
            <XCircleIcon size={16} />
            <span>Предложение отклонено</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="trade-status-pill status-cancelled" style={{ fontSize: '0.95rem', padding: '0.5rem 1rem' }}>
            <XCircleIcon size={16} />
            <span>Предложение отозвано</span>
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="trades-page">
        <div className="trades-container" style={{ textAlign: 'center', padding: '4rem' }}>
          Загрузка информации о трейде...
        </div>
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="trades-page">
        <div className="trades-container">
          <div className="trades-empty-state">
            <h3 className="empty-state-title">Трейд не найден</h3>
            <Link to="/trades" className="btn-new-trade">
              Вернуться ко всем трейдам
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const partner = trade.isSender ? trade.receiver : trade.sender;
  const myBooksToGive = trade.isSender ? trade.offeredBooks : trade.requestedBooks;
  const myBooksToReceive = trade.isSender ? trade.requestedBooks : trade.offeredBooks;

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

        {/* Detailed Card */}
        <div className="trade-details-card">
          <div className="trade-details-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                  Предложение обмена с{' '}
                  <Link
                    to={partner?.id ? `/profile/${partner.id}` : '#'}
                    style={{ color: '#2d6a4f', textDecoration: 'none' }}
                    title="Перейти в профиль пользователя"
                  >
                    @{partner?.username || 'читателем'}
                  </Link>
                </h1>
                {partner?.city && (
                  <span style={{ fontSize: '0.9rem', color: '#666660', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPinIcon size={14} />
                    <span>{partner.city}</span>
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.85rem', color: '#888880' }}>
                Создан: {formatDate(trade.createdAt)}
                {trade.status === 'ACCEPTED' && ` • Согласован: ${formatDate(trade.updatedAt)}`}
              </span>
            </div>

            <div>{renderStatusBadge(trade.status)}</div>
          </div>

          {/* Message quote if any */}
          {trade.message && (
            <div className="trade-card-message" style={{ fontSize: '0.95rem', padding: '1rem' }}>
              <span style={{ flexShrink: 0, marginTop: '2px', color: '#2d6a4f', display: 'inline-flex' }}>
                <MessageSquareIcon size={18} />
              </span>
              <div>
                <strong style={{ display: 'block', marginBottom: '0.2rem', color: '#1a1a1a' }}>
                  Сообщение от @{trade.sender?.username}:
                </strong>
                <span>«{trade.message}»</span>
              </div>
            </div>
          )}

          {/* Full Trade Matrix */}
          <div className="steam-trade-table">
            <div className="steam-table-header">
              <span className="steam-table-title">Состав обмена</span>
            </div>

            <div className="steam-matrix-grid">
              {/* What I give */}
              <div className="steam-side-box">
                <div className="steam-side-header">
                  <span className="steam-side-label" style={{ color: '#dc2626' }}>
                    Вы отдаёте ({myBooksToGive.length})
                  </span>
                </div>
                {myBooksToGive.length === 0 ? (
                  <div className="steam-slot-empty">Ни одной книги</div>
                ) : (
                  <div className="steam-slots-container">
                    {myBooksToGive.map((book) => (
                      <div key={book.id} className="steam-slot-item" style={{ cursor: 'default' }}>
                        {book.coverURL ? (
                          <img src={book.coverURL} alt={book.title} className="steam-slot-cover" />
                        ) : (
                          <div className="steam-slot-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpenIcon size={24} color="#64748b" />
                          </div>
                        )}
                        <span className="steam-slot-title">{book.title}</span>
                        <span style={{ fontSize: '0.72rem', color: '#666660' }}>{book.author}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Center */}
              <div className="steam-matrix-divider">
                <div className="steam-exchange-bubble">
                  <ArrowLeftRightIcon size={22} />
                </div>
              </div>

              {/* What I receive */}
              <div className="steam-side-box">
                <div className="steam-side-header">
                  <span className="steam-side-label" style={{ color: '#2d6a4f' }}>
                    Вы получаете ({myBooksToReceive.length})
                  </span>
                </div>
                {myBooksToReceive.length === 0 ? (
                  <div className="steam-slot-empty">Ни одной книги</div>
                ) : (
                  <div className="steam-slots-container">
                    {myBooksToReceive.map((book) => (
                      <div key={book.id} className="steam-slot-item" style={{ cursor: 'default' }}>
                        {book.coverURL ? (
                          <img src={book.coverURL} alt={book.title} className="steam-slot-cover" />
                        ) : (
                          <div className="steam-slot-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpenIcon size={24} color="#64748b" />
                          </div>
                        )}
                        <span className="steam-slot-title">{book.title}</span>
                        <span style={{ fontSize: '0.72rem', color: '#666660' }}>{book.author}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid #f0f0eb', paddingTop: '1.25rem' }}>
            <Link to="/trades" className="btn-trade-details">
              <span>Вернуться к списку</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {trade.status === 'PENDING' && trade.isReceiver && (
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
                      padding: '0.65rem 1.15rem',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.925rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/trades/new?counterTradeId=${trade.id}`)}
                    title="Изменить условия обмена и отправить встречное предложение"
                  >
                    <TradeIcon size={16} />
                    <span>Изменить предложение</span>
                  </button>
                  <button
                    type="button"
                    className="btn-trade-reject"
                    disabled={actionLoading}
                    onClick={handleReject}
                  >
                    <XCircleIcon size={16} />
                    <span>Отклонить предложение</span>
                  </button>
                  <button
                    type="button"
                    className="btn-trade-accept"
                    disabled={actionLoading}
                    onClick={handleAccept}
                    style={{ padding: '0.7rem 1.5rem', fontSize: '1rem' }}
                  >
                    <CheckCircleIcon size={18} />
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
                    gap: '0.45rem',
                    background: '#2d6a4f',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.7rem 1.4rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.975rem',
                    cursor: 'pointer',
                  }}
                  disabled={actionLoading}
                  onClick={handleComplete}
                  title="Подтвердить получение книг и завершить сделку"
                >
                  <CheckCircleIcon size={18} />
                  <span>Книги получены (Завершить обмен)</span>
                </button>
              )}

              {trade.status === 'COMPLETED' && (
                <span style={{ fontSize: '0.95rem', color: '#2d6a4f', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircleIcon size={18} />
                  <span>Обмен успешно завершён</span>
                </span>
              )}

              {trade.status === 'PENDING' && trade.isSender && (
                <button
                  type="button"
                  className="btn-trade-cancel"
                  disabled={actionLoading}
                  onClick={handleCancel}
                >
                  <XCircleIcon size={16} />
                  <span>Отозвать предложение</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Trade Chat Section */}
        <div className="trade-chat-section">
          <div className="trade-chat-header">
            <div>
              <h3 className="trade-chat-title">
                <span className="trade-chat-title-icon"><MessageSquareIcon size={20} /></span>
                <span>Чат по сделке</span>
              </h3>
              <span className="trade-chat-subtitle">
                Обсуждение деталей сделки и передачи книг с @{partner?.username}
              </span>
            </div>
          </div>

          {/* Handover Agreement Status Banner */}
          <HandoverBanner handover={handover} partner={partner} />

          <div className="trade-chat-messages">
            {messagesLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#888880' }}>
                Загрузка сообщений...
              </div>
            ) : messages.length === 0 ? (
              <div className="trade-chat-empty">
                <MessageSquareIcon size={28} />
                <span>Пока нет сообщений в этом трейде</span>
                <span style={{ fontSize: '0.8rem', color: '#999990' }}>
                  Напишите сообщение или предложите время и точку передачи книг
                </span>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.senderId === currentUser?.id;
                return (
                  <div
                    key={msg.id}
                    className={`trade-chat-bubble-row ${isMine ? 'mine' : 'theirs'}`}
                  >
                    {!isMine && (
                      <div className="trade-chat-avatar">
                        {msg.sender?.photoURL ? (
                          <img src={msg.sender.photoURL} alt={msg.sender.username} />
                        ) : (
                          <span>{(msg.sender?.username || 'П').slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                    )}
                    <div className={`trade-chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
                      <div className="trade-chat-meta">
                        <span className="trade-chat-sender-name">
                          {isMine ? 'Вы' : `@${msg.sender?.username}`}
                        </span>
                      </div>
                      {renderProposalBubbleContent(
                        msg,
                        isMine,
                        handleAcceptLocation,
                        handleAcceptTime
                      )}
                      <span className="trade-chat-time">{formatMessageTime(msg.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Handover Toolbar (Propose location/time) */}
          <HandoverToolbar
            onSendProposal={handleSendCustomMessage}
            disabled={sendingMessage}
          />

          <form onSubmit={handleSendMessage} className="trade-chat-form">
            <input
              type="text"
              className="trade-chat-input"
              placeholder="Напишите сообщение партнеру по сделке..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={sendingMessage}
            />
            <button
              type="submit"
              className="btn-chat-send"
              disabled={!messageText.trim() || sendingMessage}
            >
              <TradeIcon size={16} />
              <span>{sendingMessage ? 'Отправка...' : 'Отправить'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TradeDetailsPage;
