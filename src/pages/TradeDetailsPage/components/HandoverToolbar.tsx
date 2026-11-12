import React, { useState } from 'react';
import { MapPinIcon, ClockIcon, CalendarIcon, CloseIcon, SendIcon } from '../../../components/icons';
import { useTranslation } from '../../../i18n';

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
