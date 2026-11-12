import React from 'react';
import type { TradeMessage } from '../../../types/trade';
import { MapPinIcon, ClockIcon, CheckCircleIcon, CheckIcon } from '../../../components/icons';
import { useTranslation } from '../../../i18n';
import {
  LOC_AGREE_REGEX,
  LOC_PROP_REGEX,
  TIME_AGREE_REGEX,
  TIME_PROP_REGEX,
} from './handoverParser';

interface ProposalBubbleContentProps {
  msg: TradeMessage;
  isMine: boolean;
  isLatestLocation: boolean;
  isLatestTime: boolean;
  onAcceptLocation: (loc: string) => Promise<void>;
  onAcceptTime: (timeStr: string) => Promise<void>;
}

export const ProposalBubbleContent: React.FC<ProposalBubbleContentProps> = ({
  msg,
  isMine,
  isLatestLocation,
  isLatestTime,
  onAcceptLocation,
  onAcceptTime,
}) => {
  const { t } = useTranslation();
  const text = msg.text || '';

  const propLocMatch = text.match(LOC_PROP_REGEX);
  if (propLocMatch) {
    const loc = propLocMatch[1].trim();
    return (
      <div className="chat-proposal-card loc-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }}>
          <MapPinIcon size={16} />
          <span>{t('handover.chatBubbleLocTitle')}</span>
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{loc}</div>
        {!isMine ? (
          isLatestLocation ? (
            <button
              type="button"
              className="btn-accept-proposal"
              onClick={() => onAcceptLocation(loc)}
              title={t('handover.acceptLocBtn')}
            >
              <CheckIcon size={14} />
              <span>{t('handover.acceptLocBtn')}</span>
            </button>
          ) : (
            <span className="proposal-superseded-tag" title={t('handover.supersededTag')}>
              {t('handover.supersededTag')}
            </span>
          )
        ) : (
          <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
            {isLatestLocation ? t('handover.youProposedLocWaiting') : t('handover.youProposedLocOld')}
          </span>
        )}
      </div>
    );
  }

  const agreeLocMatch = text.match(LOC_AGREE_REGEX);
  if (agreeLocMatch) {
    return (
      <div className="chat-proposal-card confirm-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }}>
          <CheckCircleIcon size={16} />
          <span>{t('handover.chatBubbleLocAgreed')}</span>
        </div>
        <div style={{ fontSize: '0.925rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPinIcon size={14} />
          <span>{agreeLocMatch[1].trim()}</span>
        </div>
      </div>
    );
  }

  const propTimeMatch = text.match(TIME_PROP_REGEX);
  if (propTimeMatch) {
    const tm = propTimeMatch[1].trim();
    return (
      <div className="chat-proposal-card time-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }}>
          <ClockIcon size={16} />
          <span>{t('handover.chatBubbleTimeTitle')}</span>
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{tm}</div>
        {!isMine ? (
          isLatestTime ? (
            <button
              type="button"
              className="btn-accept-proposal"
              style={{ background: '#2563eb' }}
              onClick={() => onAcceptTime(tm)}
              title={t('handover.acceptTimeBtn')}
            >
              <CheckIcon size={14} />
              <span>{t('handover.acceptTimeBtn')}</span>
            </button>
          ) : (
            <span className="proposal-superseded-tag" title={t('handover.supersededTag')}>
              {t('handover.supersededTag')}
            </span>
          )
        ) : (
          <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
            {isLatestTime ? t('handover.youProposedTimeWaiting') : t('handover.youProposedTimeOld')}
          </span>
        )}
      </div>
    );
  }

  const agreeTimeMatch = text.match(TIME_AGREE_REGEX);
  if (agreeTimeMatch) {
    return (
      <div className="chat-proposal-card confirm-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }}>
          <CheckCircleIcon size={16} />
          <span>{t('handover.chatBubbleTimeAgreed')}</span>
        </div>
        <div style={{ fontSize: '0.925rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ClockIcon size={14} />
          <span>{agreeTimeMatch[1].trim()}</span>
        </div>
      </div>
    );
  }

  const declinedMatch = text.match(/^🚫 Trade offer declined\.\s*Reason:\s*(.*)/i);
  if (declinedMatch) {
    return <div>{t('handover.systemDeclinedReason', { reason: declinedMatch[1].trim() })}</div>;
  }

  if (/^🔄 Counter-offer proposed:\s*book selection updated/i.test(text)) {
    return <div>{t('handover.systemCounterUpdated')}</div>;
  }

  return <div>{text}</div>;
};
