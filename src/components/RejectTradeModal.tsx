import React, { useState } from 'react';
import { XCircleIcon, CloseIcon } from './icons';

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
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(reason.trim() || undefined);
    setReason('');
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', padding: '1.75rem', width: '92%' }}
      >
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Закрыть">
          <CloseIcon size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem', color: '#dc2626' }}>
          <XCircleIcon size={24} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#111827' }}>
            Отклонить предложение обмена
          </h3>
        </div>

        <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
          Вы можете оставить комментарий для партнёра с объяснением причины отказа. Он отобразится в чате трейда.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
            Причина отклонения (необязательно):
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Например: эту книгу уже пообещал другому читателю, или не подошли предложенные книги..."
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
              Отмена
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
              <span>{loading ? 'Отклонение...' : 'Отклонить обмен'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectTradeModal;
