import React from 'react';
import { useTranslation } from '../../../i18n';

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
  const { t } = useTranslation();

  if (currentTab === 'requests' || status === 'PENDING') {
    if (!isSender) {
      return (
        <span
          className={`trade-role-badge role-action-needed ${className}`}
          style={style}
          title={t('trades.badges.yourTurnTooltip')}
        >
          <span className="role-dot role-dot-needed" />
          <span>{t('trades.badges.yourTurn')}</span>
        </span>
      );
    }
    return (
      <span
        className={`trade-role-badge role-waiting ${className}`}
        style={style}
        title={t('trades.badges.partnerTurnTooltip')}
      >
        <span className="role-dot role-dot-waiting" />
        <span>{t('trades.badges.partnerTurn')}</span>
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
          title={t('trades.badges.confirmReceivedTooltip')}
        >
          <span className="role-dot role-dot-needed" />
          <span>{t('trades.badges.confirmReceivedShort')}</span>
        </span>
      );
    }
    if (iAmConfirmed && !partnerConfirmed) {
      return (
        <span
          className={`trade-role-badge role-waiting ${className}`}
          style={style}
          title={t('trades.badges.youConfirmedTooltip')}
        >
          <span className="role-dot role-dot-waiting" />
          <span>{t('trades.badges.partnerTurn')}</span>
        </span>
      );
    }
    return (
      <span
        className={`trade-role-badge role-action-needed ${className}`}
        style={style}
        title={t('trades.badges.awaitingHandoverTooltip')}
      >
        <span className="role-dot role-dot-needed" />
        <span>{t('trades.badges.awaitingHandover')}</span>
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
        title={t('trades.badges.tradeCompletedTooltip')}
      >
        <span
          className="role-dot"
          style={{ background: '#10b981' }}
        />
        <span>{t('trades.badges.tradeCompletedShort')}</span>
      </span>
    );
  }

  return null;
};

export default TradeRoleBadge;
