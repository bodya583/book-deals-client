import React from 'react';
import type { TradePartner } from '../../../types/trade';
import { MapPinIcon, ClockIcon, CheckCircleIcon, CheckIcon } from '../../../components/icons';
import { useTranslation } from '../../../i18n';
import type { HandoverAgreement } from './handoverParser';

interface HandoverBannerProps {
  handover: HandoverAgreement;
  partner?: TradePartner;
}

export const HandoverBanner: React.FC<HandoverBannerProps> = ({ handover, partner }) => {
  const { t } = useTranslation();
  const isBothAgreed = Boolean(handover.agreedLocation && handover.agreedTime);

  return (
    <div className={`trade-handover-widget ${isBothAgreed ? 'all-agreed' : ''}`}>
      <div className="handover-widget-header">
        <span className="handover-widget-title">
          <MapPinIcon size={18} />
          <span>{t('handover.title')}</span>
        </span>
        {isBothAgreed && (
          <span className="handover-cell-status status-agreed">
            <CheckCircleIcon size={14} />
            <span>{t('handover.readyStatus')}</span>
          </span>
        )}
      </div>

      <div className="handover-grid">
        <div
          className={`handover-cell ${
            handover.agreedLocation ? 'agreed' : handover.pendingLocation ? 'pending' : ''
          }`}
        >
          <div className="handover-cell-label">
            <MapPinIcon size={14} />
            <span>{t('handover.locLabel')}</span>
          </div>
          <div className="handover-cell-value">
            {handover.agreedLocation ? (
              <span>{handover.agreedLocation}</span>
            ) : handover.pendingLocation ? (
              <span>{handover.pendingLocation.text}</span>
            ) : (
              <span style={{ color: '#94a3b8', fontWeight: 400 }}>{t('handover.notSet')}</span>
            )}
          </div>
          <div>
            {handover.agreedLocation ? (
              <span className="handover-cell-status status-agreed">
                <CheckIcon size={13} />
                <span>{t('handover.agreedStatus')}</span>
              </span>
            ) : handover.pendingLocation ? (
              <span className="handover-cell-status status-pending">
                <ClockIcon size={13} />
                <span>{t('handover.waitingPartner', { name: handover.pendingLocation.senderName })}</span>
              </span>
            ) : (
              <span className="handover-cell-status status-empty">{t('handover.needsAgreement')}</span>
            )}
          </div>
        </div>

        <div
          className={`handover-cell ${
            handover.agreedTime ? 'agreed' : handover.pendingTime ? 'pending' : ''
          }`}
        >
          <div className="handover-cell-label">
            <ClockIcon size={14} />
            <span>{t('handover.timeLabel')}</span>
          </div>
          <div className="handover-cell-value">
            {handover.agreedTime ? (
              <span>{handover.agreedTime}</span>
            ) : handover.pendingTime ? (
              <span>{handover.pendingTime.text}</span>
            ) : (
              <span style={{ color: '#94a3b8', fontWeight: 400 }}>{t('handover.notSet')}</span>
            )}
          </div>
          <div>
            {handover.agreedTime ? (
              <span className="handover-cell-status status-agreed">
                <CheckIcon size={13} />
                <span>{t('handover.agreedStatus')}</span>
              </span>
            ) : handover.pendingTime ? (
              <span className="handover-cell-status status-pending">
                <ClockIcon size={13} />
                <span>{t('handover.waitingPartner', { name: handover.pendingTime.senderName })}</span>
              </span>
            ) : (
              <span className="handover-cell-status status-empty">{t('handover.needsAgreement')}</span>
            )}
          </div>
        </div>
      </div>

      {isBothAgreed && (
        <div className="handover-celebration-banner">
          <CheckCircleIcon size={18} />
          <span>{t('handover.celebrationNotice', { username: partner?.username || '' })}</span>
        </div>
      )}
    </div>
  );
};
