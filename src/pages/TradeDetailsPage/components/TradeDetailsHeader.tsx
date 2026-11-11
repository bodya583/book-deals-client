import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Trade } from '../../../types/trade';
import {
  TradeIcon,
  ChevronLeftIcon,
  MapPinIcon,
  MessageSquareIcon,
} from '../../../components/icons';
import { Avatar, TradeStatusBadge } from '../../../components/ui';

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Avatar
            photoURL={partner?.photoURL}
            username={partner?.username}
            size={48}
          />

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

          <TradeStatusBadge
            status={trade.status}
            isSender={trade.isSender}
            senderCompleted={trade.senderCompleted}
            receiverCompleted={trade.receiverCompleted}
            partnerUsername={partner?.username}
            size="lg"
          />
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
