import React, { useState } from 'react';
import type { Book } from '../types/book';
import { TrashIcon } from './icons';
import { Modal } from './ui';
import { useTranslation } from '../i18n';

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
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    if (loading) return;
    setError('');
    onClose();
  };

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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton={!loading}
      maxWidth={440}
    >
      <div className="delete-modal-content">
        <div className="delete-modal-icon">
          <TrashIcon size={28} />
        </div>

        <h3 className="delete-modal-title">
          {language === 'en' ? 'Delete book?' : 'Удалить книгу?'}
        </h3>

        <p className="delete-modal-text">
          {language === 'en' ? 'Are you sure you want to delete ' : 'Вы действительно хотите удалить книгу '}
          <strong className="delete-highlight">«{book.title}»</strong> ({book.author})?
        </p>

        <p className="delete-modal-warning">
          {language === 'en'
            ? 'This action cannot be undone. The book will be permanently removed from your library.'
            : 'Это действие нельзя будет отменить. Книга навсегда удалится из вашей библиотеки.'}
        </p>

        {error && <div className="modal-error-banner">{error}</div>}

        <div className="delete-modal-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={handleClose}
            disabled={loading}
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className="btn-delete-confirm"
            onClick={handleDelete}
            disabled={loading}
          >
            <TrashIcon size={16} />
            <span>{loading ? t('common.loading') : t('common.delete')}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
