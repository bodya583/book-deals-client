import React, { useState } from 'react';
import type { Book } from '../types/book';
import { EditIcon, TrashIcon, EyeIcon, BookOpenIcon, GlobeIcon, TagIcon } from './icons';

interface BookCardProps {
  book: Book;
  onView: (book: Book) => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  isOwner?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onView,
  onEdit,
  onDelete,
  isOwner = true,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="book-card" onClick={() => onView(book)}>
      {/* Light podium with floating book cover */}
      <div className="book-card-podium">
        {/* Floating Language Badge */}
        {book.language && (
          <span className="book-card-lang-tag" title={`Язык издания: ${book.language}`}>
            <GlobeIcon size={11} />
            <span>{book.language}</span>
          </span>
        )}

        {/* Floating Year Badge */}
        {book.year && (
          <span className="book-card-year-tag" title={`Год издания: ${book.year}`}>
            {book.year} г.
          </span>
        )}

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

        {/* Action bar with owner controls OR subtle creator tag */}
        {isOwner ? (
          <div className="book-card-actions" onClick={(e) => e.stopPropagation()}>
            <div className="book-card-owner-actions">
              <button
                type="button"
                className="book-action-btn edit-btn"
                onClick={() => onEdit(book)}
                title="Редактировать книгу"
                aria-label="Редактировать книгу"
              >
                <EditIcon size={15} />
              </button>
              <button
                type="button"
                className="book-action-btn delete-btn"
                onClick={() => onDelete(book)}
                title="Удалить книгу"
                aria-label="Удалить книгу"
              >
                <TrashIcon size={15} />
              </button>
            </div>
          </div>
        ) : book.user?.username ? (
          <div className="book-card-actions creator-bar">
            <span className="book-card-creator" title={`Книга пользователя ${book.user.username}`}>
              <span className="creator-label">от</span>
              <span className="creator-name">@{book.user.username}</span>
            </span>
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default BookCard;
