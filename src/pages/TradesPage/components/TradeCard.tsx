import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Trade } from '../../../types/trade';
import {
  MapPinIcon,
  MessageSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '../../../components/icons';
import { TradeExchangeMatrix } from './TradeExchangeMatrix';
import { Avatar, TradeStatusBadge, TradeRoleBadge } from '../../../components/ui';
import { useTranslation } from '../../../i18n';

export interface TradeCardActions {
  accept: (tradeId: string) => void;
  complete: (tradeId: string) => void;
  reject: (tradeId: string) => void;
  cancel: (tradeId: string) => void;
}

interface TradeCardProps {
  trade: Trade;
  currentUser: { id: string; username?: string } | null;
  currentTab: string;
  badgeCount: number;
  actionLoading: boolean;
  formatDate: (dateStr?: string) => string;
  actions: TradeCardActions;
}

export const TradeCard: React.FC<TradeCardProps> = ({
  trade,
  currentUser,
  currentTab,
  badgeCount,
  actionLoading,
  formatDate,
  actions,
}) => {
  const navigate = useNavigate();
  const { t, tCity } = useTranslation();

  const isSender =
    trade.senderId === currentUser?.id || (trade.isSender && trade.receiverId !== currentUser?.id);
  const rawPartner = isSender ? trade.receiver : trade.sender;
  const partner =
    rawPartner?.id === currentUser?.id
      ? trade.sender?.id === currentUser?.id
        ? trade.receiver
        : trade.sender
      : rawPartner;

  if (
    trade.senderId === trade.receiverId ||
    trade.sender?.id === trade.receiver?.id ||
    partner?.id === currentUser?.id
  ) {
    return null;
  }

  const isPartnerInitiator = !isSender;
  const myBooksToGive = (isSender ? trade.offeredBooks : trade.requestedBooks) || [];
  const myBooksToReceive = (isSender ? trade.requestedBooks : trade.offeredBooks) || [];

  return (
    <article
      className="trade-card"
      style={{ cursor: 'pointer', position: 'relative' }}
      onClick={() => navigate(`/trades/${trade.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(`/trades/${trade.id}`);
        }
      }}
      title={t('trades.card.openCardTitle')}
      tabIndex={0}
      role="button"
    >
      {badgeCount > 0 && (
        <span
          className="trade-card-badge-circle"
          title={
            badgeCount === 1
              ? t('trades.card.newNotificationOne', { count: badgeCount })
              : t('trades.card.newNotificationMany', { count: badgeCount })
          }
        >
          {badgeCount}
        </span>
      )}

      <div className="trade-card-header">
        <Link
          to={partner?.id ? `/profile/${partner.id}` : '#'}
          className="trade-card-user-info"
          onClick={(e) => e.stopPropagation()}
          style={{ textDecoration: 'none', color: 'inherit' }}
          title={t('bookCard.viewProfileTitle', { username: partner?.username || '' })}
        >
          <Avatar photoURL={partner?.photoURL} username={partner?.username} size={40} />
          <div className="trade-user-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="trade-user-name">@{partner?.username || t('common.reader')}</span>
              {partner?.city && (
                <span style={{ fontSize: '0.8rem', color: '#666660', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <MapPinIcon size={12} />
                  <span>{tCity(partner.city)}</span>
                </span>
              )}
            </div>
            <div className="trade-date-meta">
              <span>{isPartnerInitiator ? t('trades.badges.incoming') : t('trades.badges.outgoing')}</span>
              <span>•</span>
              <span>{formatDate(trade.createdAt)}</span>
            </div>
          </div>
        </Link>

        <div className="trade-card-header-badges">
          <TradeRoleBadge
            status={trade.status}
            isSender={Boolean(isSender)}
            senderCompleted={trade.senderCompleted}
            receiverCompleted={trade.receiverCompleted}
            currentTab={currentTab}
          />
          <TradeStatusBadge
            status={trade.status}
            isSender={Boolean(isSender)}
            senderCompleted={trade.senderCompleted}
            receiverCompleted={trade.receiverCompleted}
            partnerUsername={partner?.username}
            size="sm"
          />
        </div>
      </div>

      <TradeExchangeMatrix myBooksToGive={myBooksToGive} myBooksToReceive={myBooksToReceive} />

      {trade.message && (
        <div className="trade-card-message">
          <span style={{ flexShrink: 0, marginTop: '2px', color: '#2d6a4f', display: 'inline-flex' }}>
            <MessageSquareIcon size={16} />
          </span>
          <span>«{trade.message}»</span>
        </div>
      )}

      <div className="trade-card-actions">
        {trade.status === 'PENDING' && trade.isReceiver && !isSender && (
          <>
            <button
              type="button"
              className="btn-trade-reject"
              disabled={actionLoading}
              onClick={(e) => {
                e.stopPropagation();
                actions.reject(trade.id);
              }}
            >
              <XCircleIcon size={16} />
              <span>{t('trades.card.rejectBtn')}</span>
            </button>
            <button
              type="button"
              className="btn-trade-accept"
              disabled={actionLoading}
              onClick={(e) => {
                e.stopPropagation();
                actions.accept(trade.id);
              }}
            >
              <CheckCircleIcon size={16} />
              <span>{t('trades.card.acceptBtn')}</span>
            </button>
          </>
        )}

        {(trade.status === 'AGREED' || trade.status === 'ACCEPTED') && (() => {
          const iAmConfirmed = isSender ? trade.senderCompleted : trade.receiverCompleted;
          const partnerConfirmed = isSender ? trade.receiverCompleted : trade.senderCompleted;

          if (iAmConfirmed) {
            return (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.825rem', color: '#b45309', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ClockIcon size={14} />
                  <span>{t('trades.card.youConfirmedWaitingShort')}</span>
                </span>
                <button
                  type="button"
                  className="btn-trade-reject"
                  disabled={actionLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.reject(trade.id);
                  }}
                >
                  <XCircleIcon size={14} />
                  <span>{t('trades.card.rejectBtn')}</span>
                </button>
              </div>
            );
          }

          return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              {partnerConfirmed && (
                <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircleIcon size={14} />
                  <span>{t('trades.card.partnerConfirmedShort')}</span>
                </span>
              )}
              <button
                type="button"
                className="btn-trade-reject"
                disabled={actionLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  actions.reject(trade.id);
                }}
              >
                <XCircleIcon size={14} />
                <span>{t('trades.card.rejectBtn')}</span>
              </button>
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
                disabled={actionLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  actions.complete(trade.id);
                }}
                title={t('trades.card.completeBtn')}
              >
                <CheckCircleIcon size={16} />
                <span>
                  {partnerConfirmed ? t('trades.card.completeBtnFinish') : t('trades.card.completeBtnReceived')}
                </span>
              </button>
            </div>
          );
        })()}

        {trade.status === 'COMPLETED' && (
          <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircleIcon size={16} />
            <span>{t('tradeDetails.footerCompleted')}</span>
          </span>
        )}

        {trade.status === 'PENDING' && isSender && (
          <button
            type="button"
            className="btn-trade-cancel"
            disabled={actionLoading}
            onClick={(e) => {
              e.stopPropagation();
              actions.cancel(trade.id);
            }}
            title={t('trades.card.cancelTooltip')}
          >
            <XCircleIcon size={16} />
            <span>{t('trades.card.cancelBtn')}</span>
          </button>
        )}
      </div>
    </article>
  );
};

export default TradeCard;
