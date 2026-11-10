import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Trade } from '../../../types/trade';
import {
  TradeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '../../../components/icons';

interface TradeDetailsFooterActionsProps {
  trade: Trade;
  partner: any;
  actionLoading: boolean;
  onAccept: () => void;
  onReject: () => void;
  onComplete: () => void;
  onCancel: () => void;
}

export const TradeDetailsFooterActions: React.FC<TradeDetailsFooterActionsProps> = ({
  trade,
  partner,
  actionLoading,
  onAccept,
  onReject,
  onComplete,
  onCancel,
}) => {
  const navigate = useNavigate();

  return (
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
              onClick={onReject}
            >
              <XCircleIcon size={16} />
              <span>Отклонить предложение</span>
            </button>
            <button
              type="button"
              className="btn-trade-accept"
              disabled={actionLoading}
              onClick={onAccept}
              style={{ padding: '0.7rem 1.5rem', fontSize: '1rem' }}
            >
              <CheckCircleIcon size={18} />
              <span>Согласовать обмен</span>
            </button>
          </>
        )}

        {(trade.status === 'AGREED' || trade.status === 'ACCEPTED') && (() => {
          const iAmConfirmed = trade.isSender ? trade.senderCompleted : trade.receiverCompleted;
          const partnerConfirmed = trade.isSender ? trade.receiverCompleted : trade.senderCompleted;

          if (iAmConfirmed) {
            return (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '0.65rem 1.15rem', borderRadius: '8px', fontSize: '0.925rem', fontWeight: 600 }}>
                <ClockIcon size={18} />
                <span>Вы подтвердили получение. Ожидается подтверждение от @{partner?.username || 'партнёра'}.</span>
              </div>
            );
          }

          return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {partnerConfirmed && (
                <span style={{ fontSize: '0.875rem', color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircleIcon size={16} />
                  @{partner?.username} уже подтвердил(а) получение!
                </span>
              )}
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
                onClick={onComplete}
                title="Подтвердить получение книг"
              >
                <CheckCircleIcon size={18} />
                <span>{partnerConfirmed ? 'Подтвердить получение и завершить обмен' : 'Книги получены'}</span>
              </button>
            </div>
          );
        })()}

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
            onClick={onCancel}
          >
            <XCircleIcon size={16} />
            <span>Отозвать предложение</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TradeDetailsFooterActions;
