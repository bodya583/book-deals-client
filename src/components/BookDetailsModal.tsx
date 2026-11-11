import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../types/book';
import { formatBookYear } from '../types/book';
import { CloseIcon, EditIcon, TrashIcon, BookOpenIcon, CalendarIcon, UserIcon, GlobeIcon, TagIcon, TradeIcon, MapPinIcon } from './icons';
import { useTranslation } from '../i18n';

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
  const navigate = useNavigate();
  const { t, language, tGenre, tBookLanguage, tCity } = useTranslation();
  const [errorBookId, setErrorBookId] = useState<string | null>(null);
  const imgError = book ? errorBookId === book.id : false;

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll and compensate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !book) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(language === 'en' ? 'en-US' : 'uk-UA', {
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
          aria-label={t('common.close')}
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
              <div
                className="book-popup-owner-card"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  const uId = book.user?.id || book.userId;
                  if (uId) {
                    onClose();
                    navigate(`/profile/${uId}`);
                  }
                }}
                title={t('bookCard.viewProfileTitle', { username: book.user.username })}
              >
                <div className="book-popup-owner-avatar">
                  <UserIcon size={14} />
                </div>
                <div className="book-popup-owner-info">
                  <span className="owner-label">{t('bookDetails.ownerLabel')}</span>
                  <span className="owner-name" style={{ textDecoration: 'underline text-decoration-color: transparent' }}>
                    @{book.user.username}
                  </span>
                  {book.user.city && (
                    <span className="owner-city" style={{ fontSize: '0.78rem', color: '#2d6a4f', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px', fontWeight: 500 }}>
                      <MapPinIcon size={12} />
                      <span>{tCity(book.user.city)}</span>
                    </span>
                  )}
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
                  <span>{t('bookDetails.yearLabel')} <strong>{formatBookYear(book.year, language)}</strong></span>
                </div>
              )}
              {book.createdAt && (
                <div className="book-popup-meta-item">
                  <CalendarIcon size={15} />
                  <span>{t('bookDetails.addedLabel')} {formatDate(book.createdAt)}</span>
                </div>
              )}
              {book.language && (
                <div className="book-popup-meta-item">
                  <GlobeIcon size={15} />
                  <span>{t('bookDetails.langLabel')} <strong>{tBookLanguage(book.language)}</strong></span>
                </div>
              )}
            </div>

            {/* Genres Section */}
            {book.genres && book.genres.length > 0 && (
              <div className="book-popup-genres-box">
                <h4 className="description-heading">
                  <TagIcon size={14} /> {t('bookDetails.genresLabel')}
                </h4>
                <div className="book-popup-genres-list">
                  {book.genres.map((g) => (
                    <span key={g.id || g.name} className="book-popup-genre-pill">
                      {tGenre(g.name)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="book-popup-description-box">
              <h4 className="description-heading">{t('bookDetails.descriptionLabel')}</h4>
              {book.description ? (
                <p className="book-popup-description-text">{book.description}</p>
              ) : (
                <p className="book-popup-description-text text-muted">
                  {t('bookDetails.noDescription')}
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
                    <span>{t('bookDetails.editBook')}</span>
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
                    <span>{t('bookDetails.deleteBook')}</span>
                  </button>
                </>
              )}
              {!isOwner && book.userId && (
                <button
                  type="button"
                  className="modal-btn"
                  style={{
                    background: '#2d6a4f',
                    color: '#ffffff',
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontWeight: 600,
                  }}
                  onClick={() => {
                    onClose();
                    navigate(`/trades/new?partnerId=${book.userId}&bookId=${book.id}`);
                  }}
                >
                  <TradeIcon size={16} />
                  <span>{t('bookDetails.proposeTrade')}</span>
                </button>
              )}
              <button
                type="button"
                className="modal-btn modal-btn-outline"
                onClick={onClose}
              >
                {t('bookDetails.close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsModal;
