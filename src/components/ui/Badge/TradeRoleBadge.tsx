import React from 'react';

export interface TradeRoleBadgeProps {
  status: string;
  isSender: boolean;
  senderCompleted?: boolean;
  receiverCompleted?: boolean;
  currentTab?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const TradeRoleBadge: React.FC<TradeRoleBadgeProps> = ({
  status,
  isSender,
  senderCompleted,
  receiverCompleted,
  currentTab,
  className = '',
  style,
}) => {
  if (currentTab === 'requests' || status === 'PENDING') {
    if (!isSender) {
      return (
        <span
          className={`trade-role-badge role-action-needed ${className}`}
          style={style}
          title="Вам поступило предложение — требуется ваш ответ или согласование"
        >
          <span className="role-dot role-dot-needed" />
          <span>Требует вашего ответа</span>
        </span>
      );
    }
    return (
      <span
        className={`trade-role-badge role-waiting ${className}`}
        style={style}
        title="Вы отправили предложение — ожидается ответ партнёра"
      >
        <span className="role-dot role-dot-waiting" />
        <span>Ожидание партнёра</span>
      </span>
    );
  }

  if (currentTab === 'agreed' || status === 'AGREED' || status === 'ACCEPTED') {
    const iAmConfirmed = isSender ? senderCompleted : receiverCompleted;
    const partnerConfirmed = isSender ? receiverCompleted : senderCompleted;

    if (partnerConfirmed && !iAmConfirmed) {
      return (
        <span
          className={`trade-role-badge role-action-needed ${className}`}
          style={style}
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
          className={`trade-role-badge role-waiting ${className}`}
          style={style}
          title="Вы подтвердили передачу. Ожидается подтверждение от партнёра."
        >
          <span className="role-dot role-dot-waiting" />
          <span>Ожидание подтверждения партнёра</span>
        </span>
      );
    }
    return (
      <span
        className={`trade-role-badge role-action-needed ${className}`}
        style={style}
        title="Встретьтесь и подтвердите обмен после получения книг"
      >
        <span className="role-dot role-dot-needed" />
        <span>Ожидает физической встречи</span>
      </span>
    );
  }

  if (status === 'COMPLETED') {
    return (
      <span
        className={`trade-role-badge role-completed ${className}`}
        style={{
          background: '#ecfdf5',
          color: '#065f46',
          border: '1px solid #a7f3d0',
          ...style,
        }}
        title="Обе стороны подтвердили получение книг"
      >
        <span
          className="role-dot"
          style={{ background: '#10b981' }}
        />
        <span>Сделка успешно закрыта</span>
      </span>
    );
  }

  return null;
};

export default TradeRoleBadge;
