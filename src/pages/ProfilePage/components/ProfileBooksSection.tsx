import React from 'react';
import type { Book } from '../../../types/book';
import BookCard from '../../../components/BookCard';
import { BookOpenIcon, PlusIcon } from '../../../components/icons';

interface ProfileBooksSectionProps {
  books: Book[];
  loading: boolean;
  onAddBook: () => void;
  onViewBook: (book: Book) => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (book: Book) => void;
}

export const ProfileBooksSection: React.FC<ProfileBooksSectionProps> = ({
  books,
  loading,
  onAddBook,
  onViewBook,
  onEditBook,
  onDeleteBook,
}) => {
  return (
    <section className="profile-books-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Книги на вашем аккаунте</h2>
          <p className="section-subtitle">
            Нажмите на любую карточку, чтобы открыть подробное описание в модальном окне
          </p>
        </div>
        <button
          type="button"
          className="btn-primary-action"
          onClick={onAddBook}
        >
          <PlusIcon size={18} />
          <span>Добавить книгу</span>
        </button>
      </div>

      {loading ? (
        <div className="books-loading-state">
          <div className="books-spinner" />
          <p>Загрузка книг профиля...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="books-empty-card">
          <div className="empty-icon-box">
            <BookOpenIcon size={44} />
          </div>
          <h3 className="empty-title">У вас пока нет добавленных книг</h3>
          <p className="empty-desc">
            Ваша персональная полка пуста. Добавьте свою первую книгу прямо сейчас!
          </p>
          <button
            type="button"
            className="btn-primary-action"
            onClick={onAddBook}
          >
            <PlusIcon size={20} />
            <span>Добавить книгу</span>
          </button>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isOwner={true}
              onView={onViewBook}
              onEdit={onEditBook}
              onDelete={onDeleteBook}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProfileBooksSection;
