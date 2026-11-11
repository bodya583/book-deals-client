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
  const { t, language } = useTranslation();

  if (currentTab === 'requests' || status === 'PENDING') {
    if (!isSender) {
      return (
        <span
          className={`trade-role-badge role-action-needed ${className}`}
          style={style}
          title={language === 'en' ? 'Offer received — your response is required' : 'Вам надійшла пропозиція — потрібна ваша відповідь або узгодження'}
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
        title={language === 'en' ? 'Offer sent — awaiting partner response' : 'Ви надіслали пропозицію — очікується відповідь партнера'}
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
          title={language === 'en' ? 'Partner confirmed handover. Confirm your books received!' : 'Партнер уже підтвердив передачу книг. Підтвердьте отримання своїх!'}
        >
          <span className="role-dot role-dot-needed" />
          <span>{language === 'en' ? 'Confirm received' : 'Підтвердьте отримання'}</span>
        </span>
      );
    }
    if (iAmConfirmed && !partnerConfirmed) {
      return (
        <span
          className={`trade-role-badge role-waiting ${className}`}
          style={style}
          title={language === 'en' ? 'You confirmed receipt. Awaiting partner confirmation.' : 'Ви підтвердили отримання. Очікується підтвердження від партнера.'}
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
        title={language === 'en' ? 'Meet and confirm trade once books are received' : 'Зустріньтесь та підтвердьте обмін після отримання книг'}
      >
        <span className="role-dot role-dot-needed" />
        <span>{language === 'en' ? 'Awaiting handover' : 'Очікує особистої зустрічі'}</span>
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
        title={language === 'en' ? 'Both sides confirmed receipt of books' : 'Обидві сторони підтвердили отримання книг'}
      >
        <span
          className="role-dot"
          style={{ background: '#10b981' }}
        />
        <span>{language === 'en' ? 'Trade completed' : 'Угоду успішно закрито'}</span>
      </span>
    );
  }

  return null;
};

export default TradeRoleBadge;
