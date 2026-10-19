import React, { useState } from 'react';
import type { Book } from '../types/book';
import { EditIcon, TrashIcon, EyeIcon, BookOpenIcon, CalendarIcon } from './icons';

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <article className="book-card" onClick={() => onView(book)}>
      {/* Cover Image or Fallback */}
      <div className="book-card-cover-wrapper">
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
            <BookOpenIcon size={36} className="book-cover-placeholder-icon" />
            <span className="book-cover-placeholder-title">{book.title}</span>
            <span className="book-cover-placeholder-author">{book.author}</span>
          </div>
        )}
        <div className="book-card-overlay">
          <button
            type="button"
            className="book-card-overlay-btn"
            onClick={(e) => {
              e.stopPropagation();
              onView(book);
            }}
            title="Открыть описание книги"
          >
            <EyeIcon size={18} />
            <span>Подробнее</span>
          </button>
        </div>
      </div>

      {/* Book details */}
      <div className="book-card-content">
        <div className="book-card-meta">
          <span className="book-card-author">{book.author}</span>
          {book.createdAt && (
            <span className="book-card-date" title={`Добавлено: ${new Date(book.createdAt).toLocaleString('ru-RU')}`}>
              <CalendarIcon size={13} />
              {formatDate(book.createdAt)}
            </span>
          )}
        </div>

        <h3 className="book-card-title" title={book.title}>
          {book.title}
        </h3>

        {book.description ? (
          <p className="book-card-description">{book.description}</p>
        ) : (
          <p className="book-card-description empty">Описание книги не указано</p>
        )}

        {/* Action bar for user */}
        <div className="book-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="book-action-btn view-btn"
            onClick={() => onView(book)}
            title="Открыть книгу"
          >
            <EyeIcon size={16} />
            <span>Открыть</span>
          </button>

          {isOwner && (
            <div className="book-card-owner-actions">
              <button
                type="button"
                className="book-action-btn edit-btn"
                onClick={() => onEdit(book)}
                title="Редактировать книгу"
                aria-label="Редактировать книгу"
              >
                <EditIcon size={16} />
              </button>
              <button
                type="button"
                className="book-action-btn delete-btn"
                onClick={() => onDelete(book)}
                title="Удалить книгу"
                aria-label="Удалить книгу"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default BookCard;
