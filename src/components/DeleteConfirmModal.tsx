import React, { useState, useEffect } from 'react';
import type { Book } from '../types/book';
import { CloseIcon, TrashIcon } from './icons';

interface DeleteConfirmModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookId: string) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  book,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setError('');
    onClose();
  };

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !book) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await onConfirm(book.id);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не удалось удалить книгу';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => !loading && handleClose()} role="dialog" aria-modal="true">
      <div
        className="modal-container modal-delete"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={handleClose}
          disabled={loading}
          aria-label="Закрыть"
        >
          <CloseIcon size={20} />
        </button>

        <div className="delete-modal-content">
          <div className="delete-modal-icon">
            <TrashIcon size={28} />
          </div>

          <h3 className="delete-modal-title">Удалить книгу?</h3>
          
          <p className="delete-modal-text">
            Вы действительно хотите удалить книгу <strong className="delete-highlight">«{book.title}»</strong> ({book.author})?
          </p>
          
          <p className="delete-modal-warning">
            Это действие нельзя будет отменить. Книга навсегда удалится из вашей библиотеки.
          </p>

          {error && <div className="modal-error-banner">{error}</div>}

          <div className="delete-modal-actions">
            <button
              type="button"
              className="modal-btn modal-btn-outline"
              onClick={handleClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="button"
              className="modal-btn modal-btn-danger"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small" />
                  <span>Удаление...</span>
                </>
              ) : (
                <>
                  <TrashIcon size={16} />
                  <span>Да, удалить</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
