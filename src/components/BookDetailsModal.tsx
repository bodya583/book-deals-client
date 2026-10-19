import React, { useEffect, useState } from 'react';
import type { Book } from '../types/book';
import { CloseIcon, EditIcon, TrashIcon, BookOpenIcon, CalendarIcon, UserIcon, GlobeIcon, TagIcon } from './icons';

interface BookDetailsModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  isOwner?: boolean;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
  book,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  isOwner = true,
}) => {
  const [errorBookId, setErrorBookId] = useState<string | null>(null);
  const imgError = book ? errorBookId === book.id : false;

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !book) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container modal-details"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <CloseIcon size={20} />
        </button>

        <div className="book-popup-layout">
          {/* Cover Section */}
          <div className="book-popup-cover-col">
            <div className="book-popup-cover-box">
              {book.coverURL && !imgError ? (
                <img
                  src={book.coverURL}
                  alt={book.title}
                  className="book-popup-cover-img"
                  onError={() => setErrorBookId(book.id)}
                />
              ) : (
                <div className="book-popup-cover-fallback">
                  <BookOpenIcon size={48} className="popup-fallback-icon" />
                  <span className="popup-fallback-title">{book.title}</span>
                  <span className="popup-fallback-author">{book.author}</span>
                </div>
              )}
            </div>
            
            {book.user?.username && (
              <div className="book-popup-owner-card">
                <div className="book-popup-owner-avatar">
                  <UserIcon size={14} />
                </div>
                <div className="book-popup-owner-info">
                  <span className="owner-label">Добавил(а):</span>
                  <span className="owner-name">{book.user.username}</span>
                </div>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="book-popup-info-col">
            <div className="book-popup-header">
              <span className="book-popup-author-badge">{book.author}</span>
              <h2 className="book-popup-title">{book.title}</h2>
              {book.year && (
                <div className="book-popup-meta-item">
                  <CalendarIcon size={15} />
                  <span>Год издания: <strong>{book.year} г.</strong></span>
                </div>
              )}
              {book.createdAt && (
                <div className="book-popup-meta-item">
                  <CalendarIcon size={15} />
                  <span>Добавлено: {formatDate(book.createdAt)}</span>
                </div>
              )}
              {book.language && (
                <div className="book-popup-meta-item">
                  <GlobeIcon size={15} />
                  <span>Язык: <strong>{book.language}</strong></span>
                </div>
              )}
            </div>

            {/* Genres Section */}
            {book.genres && book.genres.length > 0 && (
              <div className="book-popup-genres-box">
                <h4 className="description-heading">
                  <TagIcon size={14} /> Жанры
                </h4>
                <div className="book-popup-genres-list">
                  {book.genres.map((g) => (
                    <span key={g.id || g.name} className="book-popup-genre-pill">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="book-popup-description-box">
              <h4 className="description-heading">Описание</h4>
              {book.description ? (
                <p className="book-popup-description-text">{book.description}</p>
              ) : (
                <p className="book-popup-description-text text-muted">
                  У этой книги пока нет описания. Вы можете добавить его через форму редактирования.
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="book-popup-actions">
              {isOwner && (
                <>
                  <button
                    type="button"
                    className="modal-btn modal-btn-secondary"
                    onClick={() => {
                      onClose();
                      onEdit(book);
                    }}
                  >
                    <EditIcon size={16} />
                    <span>Редактировать</span>
                  </button>
                  <button
                    type="button"
                    className="modal-btn modal-btn-danger"
                    onClick={() => {
                      onClose();
                      onDelete(book);
                    }}
                  >
                    <TrashIcon size={16} />
                    <span>Удалить</span>
                  </button>
                </>
              )}
              <button
                type="button"
                className="modal-btn modal-btn-outline"
                onClick={onClose}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsModal;
