import React, { useEffect } from 'react';
import { CloseIcon } from './icons';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = setTimeout(() => {
      onRemove(toasts[0].id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toasts, onRemove]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type}`}>
          <div className="toast-indicator" />
          <p className="toast-text">{toast.text}</p>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => onRemove(toast.id)}
            aria-label="Закрыть уведомление"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
