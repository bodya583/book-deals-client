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
import { useTranslation } from '../../../i18n';

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
  const { t, tCity } = useTranslation();

  return (
    <>
      {/* Navigation Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to="/trades" className="trade-back-btn">
          <ChevronLeftIcon size={16} />
          <span>{t('tradeDetails.backToTrades')}</span>
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
                {t('tradeDetails.titleWithPartner', { username: partner?.username || '' })}
              </h1>
              {partner?.city && (
                <span style={{ fontSize: '0.9rem', color: '#666660', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MapPinIcon size={14} />
                  <span>{tCity(partner.city)}</span>
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.85rem', color: '#888880' }}>
              {t('tradeDetails.createdAt', { date: formatDate(trade.createdAt) })}
              {trade.status === 'ACCEPTED' && ` • ${t('tradeDetails.updatedAt', { date: formatDate(trade.updatedAt) })}`}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {trade.status === 'PENDING' && (
            <button
              type="button"
              className="btn-trade-counter-top"
              onClick={() => navigate(`/trades/new?counterTradeId=${trade.id}`)}
              title={t('trades.card.counterBtn')}
            >
              <TradeIcon size={16} />
              <span>{t('trades.card.counterBtn')}</span>
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
              {t('tradeDetails.noteFrom', { username: trade.sender?.username || '' })}
            </strong>
            <span>«{trade.message}»</span>
          </div>
        </div>
      )}
    </>
  );
};

export default TradeDetailsHeader;
