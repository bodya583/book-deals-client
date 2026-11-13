import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '../../icons';
import { useTranslation } from '../../../i18n';
import './Modal.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: number | string;
  showCloseButton?: boolean;
  className?: string;
  zIndex?: number;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  maxWidth = 480,
  showCloseButton = true,
  className = '',
  zIndex = 2000,
}) => {
  const { t } = useTranslation();
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`modal-content ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
          padding: '1.75rem',
          width: '92%',
        }}
      >
        {showCloseButton && (
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <CloseIcon size={16} />
          </button>
        )}

        {(title || icon) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '0.75rem',
            }}
          >
            {icon}
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#111827',
                }}
              >
                {title}
              </h3>
            )}
          </div>
        )}

        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
