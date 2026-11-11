import React, { useState } from 'react';
import type { TradeMessage, TradePartner } from '../../../types/trade';
import {
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
  CheckIcon,
  CloseIcon,
  SendIcon,
} from '../../../components/icons';
import { useTranslation, translate } from '../../../i18n';

export interface HandoverAgreement {
  agreedLocation: string | null;
  agreedTime: string | null;
  pendingLocation: { text: string; senderId: string; senderName: string } | null;
  pendingTime: { text: string; senderId: string; senderName: string } | null;
}

export const LOC_AGREE_REGEX = /Meeting location agreed:\s*(.*)/i;
export const LOC_PROP_REGEX = /Meeting location proposal:\s*(.*)/i;
export const TIME_AGREE_REGEX = /Meeting time agreed:\s*(.*)/i;
export const TIME_PROP_REGEX = /Meeting time proposal:\s*(.*)/i;

export function parseHandoverFromMessages(messages: TradeMessage[]): HandoverAgreement {
  let agreedLocation: string | null = null;
  let agreedTime: string | null = null;
  let pendingLocation: { text: string; senderId: string; senderName: string } | null = null;
  let pendingTime: { text: string; senderId: string; senderName: string } | null = null;

  for (const msg of messages) {
    const text = msg.text || '';

    // Check location confirmation
    const agreeLocMatch = text.match(LOC_AGREE_REGEX);
    if (agreeLocMatch) {
      agreedLocation = agreeLocMatch[1].trim();
      pendingLocation = null;
    } else {
      const propLocMatch = text.match(LOC_PROP_REGEX);
      if (propLocMatch) {
        pendingLocation = {
          text: propLocMatch[1].trim(),
          senderId: msg.senderId,
          senderName: msg.sender?.username || translate('common.partner'),
        };
        agreedLocation = null;
      }
    }

    // Check time confirmation
    const agreeTimeMatch = text.match(TIME_AGREE_REGEX);
    if (agreeTimeMatch) {
      agreedTime = agreeTimeMatch[1].trim();
      pendingTime = null;
    } else {
      const propTimeMatch = text.match(TIME_PROP_REGEX);
      if (propTimeMatch) {
        pendingTime = {
          text: propTimeMatch[1].trim(),
          senderId: msg.senderId,
          senderName: msg.sender?.username || translate('common.partner'),
        };
        agreedTime = null;
      }
    }
  }

  return { agreedLocation, agreedTime, pendingLocation, pendingTime };
}

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
        {/* Location cell */}
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

        {/* Time cell */}
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
          <span>
            {t('handover.celebrationNotice', { username: partner?.username || '' })}
          </span>
        </div>
      )}
    </div>
  );
};

interface HandoverToolbarProps {
  onSendProposal: (text: string) => Promise<void>;
  disabled?: boolean;
}

export const HandoverToolbar: React.FC<HandoverToolbarProps> = ({ onSendProposal, disabled }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'none' | 'location' | 'time'>('none');
  const [locationInput, setLocationInput] = useState('');
  const [timeInput, setTimeInput] = useState('');

  const handleSendLocation = async () => {
    const val = locationInput.trim();
    if (!val || disabled) return;
    await onSendProposal(`Meeting location proposal: ${val}`);
    setLocationInput('');
    setActiveTab('none');
  };

  const handleSendTime = async () => {
    const val = timeInput.trim();
    if (!val || disabled) return;
    await onSendProposal(`Meeting time proposal: ${val}`);
    setTimeInput('');
    setActiveTab('none');
  };

  return (
    <div>
      {/* Inline Forms */}
      {activeTab === 'location' && (
        <div className="handover-inline-form">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPinIcon size={16} />
              <span>{t('handover.proposeLocTitle')}</span>
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('none')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              title={t('common.close')}
            >
              <CloseIcon size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="trade-chat-input"
              placeholder={t('handover.locInputPlaceholder')}
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSendLocation())}
              autoFocus
            />
            <button
              type="button"
              className="btn-chat-send"
              style={{ borderRadius: '10px', padding: '0.6rem 1rem' }}
              disabled={!locationInput.trim() || disabled}
              onClick={handleSendLocation}
            >
              <SendIcon size={14} />
              <span>{t('handover.submitPropose')}</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'time' && (
        <div className="handover-inline-form">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CalendarIcon size={16} />
              <span>{t('handover.proposeTimeTitle')}</span>
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('none')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              title={t('common.close')}
            >
              <CloseIcon size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="trade-chat-input"
              placeholder={t('handover.timeInputPlaceholder')}
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSendTime())}
              autoFocus
            />
            <button
              type="button"
              className="btn-chat-send"
              style={{ borderRadius: '10px', padding: '0.6rem 1rem', background: '#2563eb' }}
              disabled={!timeInput.trim() || disabled}
              onClick={handleSendTime}
            >
              <SendIcon size={14} />
              <span>{t('handover.submitPropose')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Toolbar buttons */}
      <div className="handover-actions-bar">
        <button
          type="button"
          className={`btn-handover-action ${activeTab === 'location' ? 'active' : ''}`}
          onClick={() => setActiveTab(activeTab === 'location' ? 'none' : 'location')}
          disabled={disabled}
        >
          <MapPinIcon size={15} />
          <span>{t('handover.proposeLocBtn')}</span>
        </button>

        <button
          type="button"
          className={`btn-handover-action ${activeTab === 'time' ? 'active' : ''}`}
          onClick={() => setActiveTab(activeTab === 'time' ? 'none' : 'time')}
          disabled={disabled}
        >
          <ClockIcon size={15} />
          <span>{t('handover.proposeTimeBtn')}</span>
        </button>
      </div>
    </div>
  );
};

export const ProposalBubbleContent: React.FC<{
  msg: TradeMessage;
  isMine: boolean;
  isLatestLocation: boolean;
  isLatestTime: boolean;
  onAcceptLocation: (loc: string) => Promise<void>;
  onAcceptTime: (timeStr: string) => Promise<void>;
}> = ({
  msg,
  isMine,
  isLatestLocation,
  isLatestTime,
  onAcceptLocation,
  onAcceptTime,
}) => {
  const { t } = useTranslation();
  const text = msg.text || '';

  // Location proposal
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

  // Location confirmed
  const agreeLocMatch = text.match(LOC_AGREE_REGEX);
  if (agreeLocMatch) {
    const loc = agreeLocMatch[1].trim();
    return (
      <div className="chat-proposal-card confirm-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }}>
          <CheckCircleIcon size={16} />
          <span>{t('handover.chatBubbleLocAgreed')}</span>
        </div>
        <div style={{ fontSize: '0.925rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPinIcon size={14} />
          <span>{loc}</span>
        </div>
      </div>
    );
  }

  // Time proposal
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

  // Time confirmed
  const agreeTimeMatch = text.match(TIME_AGREE_REGEX);
  if (agreeTimeMatch) {
    const tm = agreeTimeMatch[1].trim();
    return (
      <div className="chat-proposal-card confirm-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }}>
          <CheckCircleIcon size={16} />
          <span>{t('handover.chatBubbleTimeAgreed')}</span>
        </div>
        <div style={{ fontSize: '0.925rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ClockIcon size={14} />
          <span>{tm}</span>
        </div>
      </div>
    );
  }

  // Backend system notices
  const declinedMatch = text.match(/^🚫 Trade offer declined\.\s*Reason:\s*(.*)/i);
  if (declinedMatch) {
    return <div>{t('handover.systemDeclinedReason', { reason: declinedMatch[1].trim() })}</div>;
  }

  if (/^🔄 Counter-offer proposed:\s*book selection updated/i.test(text)) {
    return <div>{t('handover.systemCounterUpdated')}</div>;
  }

  // Regular plain message
  return <div>{text}</div>;
};

export const renderProposalBubbleContent = (
  msg: TradeMessage,
  isMine: boolean,
  isLatestLocation: boolean,
  isLatestTime: boolean,
  onAcceptLocation: (loc: string) => Promise<void>,
  onAcceptTime: (timeStr: string) => Promise<void>
): React.ReactNode => {
  return (
    <ProposalBubbleContent
      msg={msg}
      isMine={isMine}
      isLatestLocation={isLatestLocation}
      isLatestTime={isLatestTime}
      onAcceptLocation={onAcceptLocation}
      onAcceptTime={onAcceptTime}
    />
  );
};
