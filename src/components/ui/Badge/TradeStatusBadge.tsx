import React from 'react';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '../../icons';

export interface TradeStatusBadgeProps {
  status: string;
  isSender?: boolean;
  senderCompleted?: boolean;
  receiverCompleted?: boolean;
  partnerUsername?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export const TradeStatusBadge: React.FC<TradeStatusBadgeProps> = ({
  status,
  isSender,
  senderCompleted,
  receiverCompleted,
  partnerUsername,
  size = 'md',
  className = '',
  style,
}) => {
  const iconSize = size === 'lg' ? 18 : size === 'sm' ? 14 : 16;
  const padding = size === 'lg' ? '0.5rem 1rem' : size === 'sm' ? '0.25rem 0.6rem' : '0.4rem 0.85rem';
  const fontSize = size === 'lg' ? '0.95rem' : size === 'sm' ? '0.775rem' : '0.85rem';

  const baseStyle: React.CSSProperties = {
    padding,
    fontSize,
    ...style,
  };

  switch (status) {
    case 'PENDING':
      return (
        <span
          className={`trade-status-pill status-pending ${className}`}
          style={baseStyle}
        >
          <ClockIcon size={iconSize} />
          <span>Ожидает ответа (Возможны изменения)</span>
        </span>
      );

    case 'AGREED':
    case 'ACCEPTED': {
      const iAmConfirmed = isSender ? senderCompleted : receiverCompleted;
      const partnerConfirmed = isSender ? receiverCompleted : senderCompleted;

      if (iAmConfirmed && !partnerConfirmed) {
        return (
          <span
            className={`trade-status-pill status-partial ${className}`}
            style={{
              ...baseStyle,
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
            }}
          >
            <ClockIcon size={iconSize} />
            <span>
              Вы подтвердили получение (Ожидание {partnerUsername ? `@${partnerUsername}` : 'партнёра'})
            </span>
          </span>
        );
      }

      if (!iAmConfirmed && partnerConfirmed) {
        return (
          <span
            className={`trade-status-pill status-partner-ready ${className}`}
            style={{
              ...baseStyle,
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
            }}
          >
            <CheckCircleIcon size={iconSize} />
            <span>
              {partnerUsername ? `@${partnerUsername}` : 'Партнёр'} подтвердил(а) получение книг!
            </span>
          </span>
        );
      }

      return (
        <span
          className={`trade-status-pill status-accepted ${className}`}
          style={{
            ...baseStyle,
            background: '#fef3c7',
            color: '#92400e',
            border: '1px solid #fde68a',
          }}
        >
          <CheckCircleIcon size={iconSize} />
          <span>Согласован (Условия зафиксированы)</span>
        </span>
      );
    }

    case 'COMPLETED':
      return (
        <span
          className={`trade-status-pill status-completed ${className}`}
          style={{
            ...baseStyle,
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
          }}
        >
          <CheckCircleIcon size={iconSize} />
          <span>Завершён (Книги получены)</span>
        </span>
      );

    case 'REJECTED':
      return (
        <span
          className={`trade-status-pill status-rejected ${className}`}
          style={baseStyle}
        >
          <XCircleIcon size={iconSize} />
          <span>Предложение отклонено</span>
        </span>
      );

    case 'CANCELLED':
      return (
        <span
          className={`trade-status-pill status-cancelled ${className}`}
          style={baseStyle}
        >
          <XCircleIcon size={iconSize} />
          <span>Предложение отозвано</span>
        </span>
      );

    default:
      return null;
  }
};

export default TradeStatusBadge;
