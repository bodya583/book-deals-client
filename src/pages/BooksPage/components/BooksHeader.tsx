import React from 'react';
import { PlusIcon } from '../../../components/icons';

interface BooksHeaderProps {
  onAddBook: () => void;
}

export const BooksHeader: React.FC<BooksHeaderProps> = ({ onAddBook }) => {
  return (
    <section className="books-hero-header">
      <div className="books-hero-text">
        <h1 className="books-hero-title">Моя библиотека</h1>
        <p className="books-hero-subtitle">
          Книги на вашем аккаунте. Читайте, управляйте и пополняйте свою коллекцию.
        </p>
      </div>

      <div className="books-hero-actions">
        <button
          id="add-book-hero-btn"
          type="button"
          className="btn-primary-action"
          onClick={onAddBook}
        >
          <PlusIcon size={20} />
          <span>Добавить книгу</span>
        </button>
      </div>
    </section>
  );
};

export default BooksHeader;
