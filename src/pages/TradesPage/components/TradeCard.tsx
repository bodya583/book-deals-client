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

interface TradeCardProps {
  trade: Trade;
  currentUser: { id: string; username?: string } | null;
  currentTab: string;
  badgeCount: number;
  actionLoading: boolean;
  formatDate: (dateStr?: string) => string;
  onAccept: (tradeId: string) => void;
  onComplete: (tradeId: string) => void;
  onReject: (tradeId: string) => void;
  onCancel: (tradeId: string) => void;
}

export const TradeCard: React.FC<TradeCardProps> = ({
  trade,
  currentUser,
  currentTab,
  badgeCount,
  actionLoading,
  formatDate,
  onAccept,
  onComplete,
  onReject,
  onCancel,
}) => {
  const navigate = useNavigate();

  const isSender = trade.senderId === currentUser?.id || (trade.isSender && trade.receiverId !== currentUser?.id);
  const rawPartner = isSender ? trade.receiver : trade.sender;
  const partner = rawPartner?.id === currentUser?.id
    ? (trade.sender?.id === currentUser?.id ? trade.receiver : trade.sender)
    : rawPartner;

  if (trade.senderId === trade.receiverId || trade.sender?.id === trade.receiver?.id || partner?.id === currentUser?.id) {
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
      title="Нажмите, чтобы открыть подробности сделки и чат согласования"
      tabIndex={0}
      role="button"
    >
      {/* Top-Right Notification Counter Badge */}
      {badgeCount > 0 && (
        <span
          className="trade-card-badge-circle"
          title={`${badgeCount} ${badgeCount === 1 ? 'новое сообщение или изменение условий' : 'новых сообщений или изменений'}`}
        >
          {badgeCount}
        </span>
      )}

      {/* Card Header: Partner info + status */}
      <div className="trade-card-header">
        <Link
          to={partner?.id ? `/profile/${partner.id}` : '#'}
          className="trade-card-user-info"
          onClick={(e) => e.stopPropagation()}
          style={{ textDecoration: 'none', color: 'inherit' }}
          title={`Перейти в профиль пользователя @${partner?.username}`}
        >
          <Avatar
            photoURL={partner?.photoURL}
            username={partner?.username}
            size={40}
          />
          <div className="trade-user-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="trade-user-name">
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

      {/* Steam-Style Item Exchange Matrix */}
      <TradeExchangeMatrix
        myBooksToGive={myBooksToGive}
        myBooksToReceive={myBooksToReceive}
      />

      {/* Message Quote */}
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
        {trade.status === 'PENDING' && trade.isReceiver && !isSender && (
          <>
            <button
              type="button"
              className="btn-trade-reject"
              disabled={actionLoading}
              onClick={(e) => {
                e.stopPropagation();
                onReject(trade.id);
              }}
            >
              <XCircleIcon size={16} />
              <span>Отклонить</span>
            </button>
            <button
              type="button"
              className="btn-trade-accept"
              disabled={actionLoading}
              onClick={(e) => {
                e.stopPropagation();
                onAccept(trade.id);
              }}
            >
              <CheckCircleIcon size={16} />
              <span>Согласовать обмен</span>
            </button>
          </>
        )}

        {(trade.status === 'AGREED' || trade.status === 'ACCEPTED') && (() => {
          const iAmConfirmed = isSender ? trade.senderCompleted : trade.receiverCompleted;
          const partnerConfirmed = isSender ? trade.receiverCompleted : trade.senderCompleted;

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
                disabled={actionLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete(trade.id);
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

        {trade.status === 'PENDING' && isSender && (
          <button
            type="button"
            className="btn-trade-cancel"
            disabled={actionLoading}
            onClick={(e) => {
              e.stopPropagation();
              onCancel(trade.id);
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
};

export default TradeCard;
