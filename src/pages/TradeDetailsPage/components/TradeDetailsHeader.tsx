import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Trade, TradeStatus } from '../../../types/trade';
import {
  TradeIcon,
  ChevronLeftIcon,
  MapPinIcon,
  MessageSquareIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '../../../components/icons';

interface TradeDetailsHeaderProps {
  trade: Trade;
  partner: any;
  formatDate: (dateStr?: string) => string;
}

export const TradeDetailsHeader: React.FC<TradeDetailsHeaderProps> = ({
  trade,
  partner,
  formatDate,
}) => {
  const navigate = useNavigate();

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
      case 'ACCEPTED': {
        const iAmConfirmed = trade.isSender ? trade.senderCompleted : trade.receiverCompleted;
        const partnerConfirmed = trade.isSender ? trade.receiverCompleted : trade.senderCompleted;

        if (iAmConfirmed && !partnerConfirmed) {
          return (
            <span
              className="trade-status-pill status-partial"
              style={{ fontSize: '0.95rem', padding: '0.5rem 1rem', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
            >
              <ClockIcon size={16} />
              <span>Вы подтвердили получение (Ожидание партнёра)</span>
            </span>
          );
        }
        if (!iAmConfirmed && partnerConfirmed) {
          return (
            <span
              className="trade-status-pill status-partner-ready"
              style={{ fontSize: '0.95rem', padding: '0.5rem 1rem', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}
            >
              <CheckCircleIcon size={16} />
              <span>Партнёр подтвердил получение книг!</span>
            </span>
          );
        }
        return (
          <span
            className="trade-status-pill status-accepted"
            style={{ fontSize: '0.95rem', padding: '0.5rem 1rem', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
          >
            <CheckCircleIcon size={16} />
            <span>Согласован (Условия зафиксированы)</span>
          </span>
        );
      }
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

  return (
    <>
      {/* Navigation Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to="/trades" className="trade-back-btn">
          <ChevronLeftIcon size={16} />
          <span>Назад к списку трейдов</span>
        </Link>
      </div>

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {trade.status === 'PENDING' && (
            <button
              type="button"
              className="btn-trade-counter-top"
              onClick={() => navigate(`/trades/new?counterTradeId=${trade.id}`)}
              title="Изменить состав книг и предложить новые условия обмена"
            >
              <TradeIcon size={16} />
              <span>Изменить условия обмена</span>
            </button>
          )}
          {renderStatusBadge(trade.status)}
        </div>
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
    </>
  );
};

export default TradeDetailsHeader;
