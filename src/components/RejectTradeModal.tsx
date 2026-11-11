import React, { useState } from 'react';
import { XCircleIcon } from './icons';
import { Modal } from './ui';
import { useTranslation } from '../i18n';

interface RejectTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  loading?: boolean;
}

export const RejectTradeModal: React.FC<RejectTradeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const { t, language } = useTranslation();
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(reason.trim() || undefined);
    setReason('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('modals.rejectModalTitle')}
      icon={<XCircleIcon size={24} color="#dc2626" />}
      maxWidth={480}
    >
      <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
        {language === 'en'
          ? 'You can leave a note for your trade partner explaining the reason. It will appear in the trade chat.'
          : 'Ви можете залишити коментар для партнера з поясненням причини відмови. Він зʼявиться у чаті угоди.'}
      </p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
          {language === 'en' ? 'Reason (optional):' : 'Причина відхилення (необов’язково):'}
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('modals.rejectReasonPlaceholder')}
          rows={3}
          style={{
            width: '100%',
            borderRadius: '10px',
            border: '1px solid #d1d5db',
            padding: '0.65rem 0.85rem',
            fontSize: '0.9rem',
            lineHeight: 1.4,
            resize: 'vertical',
            boxSizing: 'border-box',
            outline: 'none',
            fontFamily: 'inherit',
            marginBottom: '1.25rem',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn-card-profile-details"
            onClick={onClose}
            disabled={loading}
            style={{ padding: '0.6rem 1.1rem' }}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="btn-trade-reject"
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.25rem',
              fontSize: '0.9rem',
            }}
          >
            <XCircleIcon size={16} />
            <span>{loading ? t('common.loading') : t('modals.rejectConfirmBtn')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RejectTradeModal;
