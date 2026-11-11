import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../types/book';
import { formatBookYear } from '../types/book';
import { EditIcon, TrashIcon, EyeIcon, BookOpenIcon, GlobeIcon, TagIcon, TradeIcon, MapPinIcon } from './icons';
import { useTranslation } from '../i18n';

interface BookCardProps {
  book: Book;
  onView: (book: Book) => void;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  onTrade?: (book: Book) => void;
  isOwner?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onView,
  onEdit,
  onDelete,
  onTrade,
  isOwner = true,
}) => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [imgError, setImgError] = useState(false);

  return (
    <article className="book-card" onClick={() => onView(book)}>
      {/* Light podium with floating book cover */}
      <div className="book-card-podium">
        {/* Podium Top Header: Language & Year Badges (above cover, clean contrast) */}
        <div className="book-card-podium-header">
          {book.language ? (
            <span className="book-card-lang-tag" title={`Язык издания: ${book.language}`}>
              <GlobeIcon size={11} />
              <span>{book.language}</span>
            </span>
          ) : (
            <span className="book-card-tag-spacer" />
          )}

          {book.year && (
            <span className="book-card-year-tag" title={`Год издания: ${formatBookYear(book.year)}`}>
              {formatBookYear(book.year)}
            </span>
          )}
        </div>

        {/* Floating Book Cover (Vertical 2:3 with soft drop-shadow) */}
        <div className="book-card-floating-cover">
          {book.coverURL && !imgError ? (
            <img
              src={book.coverURL}
              alt={book.title}
              className="book-card-cover-img"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="book-card-cover-placeholder">
              <BookOpenIcon size={32} className="book-cover-placeholder-icon" />
              <span className="book-cover-placeholder-title">{book.title}</span>
              <span className="book-cover-placeholder-author">{book.author}</span>
            </div>
          )}

          {/* Hover hint */}
          <div className="book-card-overlay">
            <span className="book-card-hover-hint">
              <EyeIcon size={13} />
              <span>Подробнее</span>
            </span>
          </div>
        </div>
      </div>

      {/* Book details */}
      <div className="book-card-content">
        {/* Author */}
        <div className="book-card-meta">
          <span className="book-card-author" title={book.author}>
            {book.author}
          </span>
        </div>

        {/* Title */}
        <h3 className="book-card-title" title={book.title}>
          {book.title}
        </h3>

        {/* Location */}
        {book.user?.city && (
          <div className="book-card-location">
            <span className="book-card-city" title={`Населённый пункт: ${book.user.city}`}>
              <MapPinIcon size={12} className="inline-location-icon" />
              <span>{book.user.city}</span>
            </span>
          </div>
        )}

        {/* Short description with 2-line ellipsis */}
        <p className="book-card-description" title={book.description || undefined}>
          {book.description ? book.description : <span className="book-card-description-empty">Описание пока не добавлено</span>}
        </p>

        {/* Genres row */}
        {book.genres && book.genres.length > 0 && (
          <div className="book-card-genres">
            {book.genres.slice(0, 2).map((genre) => (
              <span key={genre.id || genre.name} className="book-card-genre-pill">
                <TagIcon size={10} />
                <span>{genre.name}</span>
              </span>
            ))}
            {book.genres.length > 2 && (
              <span
                className="book-card-genre-more"
                title={book.genres.slice(2).map((g) => g.name).join(', ')}
              >
                +{book.genres.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Action bar with owner controls OR guest trade bar OR subtle creator tag */}
        {isOwner ? (
          <div className="book-card-actions" onClick={(e) => e.stopPropagation()}>
            <div className="book-card-owner-actions">
              {onEdit && (
                <button
                  type="button"
                  className="book-action-btn edit-btn"
                  onClick={() => onEdit(book)}
                  title="Редактировать книгу"
                  aria-label="Редактировать книгу"
                >
                  <EditIcon size={15} />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="book-action-btn delete-btn"
                  onClick={() => onDelete(book)}
                  title="Удалить книгу"
                  aria-label="Удалить книгу"
                >
                  <TrashIcon size={15} />
                </button>
              )}
            </div>
          </div>
        ) : onTrade ? (
          <div className="book-card-actions profile-trade-bar" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="btn-card-profile-details"
              onClick={() => onView(book)}
              title={t('common.details')}
            >
              {t('common.details')}
            </button>
            <button
              type="button"
              className="btn-card-profile-trade"
              onClick={() => onTrade(book)}
              title={t('trades.card.openDetails')}
            >
              <TradeIcon size={14} />
              <span>{t('nav.trades')}</span>
            </button>
          </div>
        ) : book.user?.username ? (
          <div className="book-card-actions creator-bar">
            <span
              className="book-card-creator"
              title={`@${book.user.username}`}
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                const uId = book.user?.id || book.userId;
                if (uId) navigate(`/profile/${uId}`);
              }}
            >
              <span className="creator-label">{language === 'en' ? 'by' : 'от'}</span>
              <span className="creator-name">@{book.user.username}</span>
            </span>
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default BookCard;
