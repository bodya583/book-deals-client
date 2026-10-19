import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { getBooks, createBook, updateBook, deleteBook } from '../api/booksApi';
import type { Book, BookFormData } from '../types/book';
import Navbar from '../components/Navbar';
import BookCard from '../components/BookCard';
import BookDetailsModal from '../components/BookDetailsModal';
import BookFormModal from '../components/BookFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Toast, { type ToastMessage } from '../components/Toast';
import { PlusIcon, SearchIcon, BookOpenIcon, CloseIcon } from '../components/icons';
import './books.css';

export const BooksPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals state
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    book: Book | null;
  }>({
    isOpen: false,
    mode: 'create',
    book: null,
  });
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch books belonging to this user whenever userId or debouncedSearch changes
  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    getBooks({
      userId,
      search: debouncedSearch.trim() || undefined,
    })
      .then((data) => {
        if (isMounted) {
          setBooks(data.books || []);
          setError('');
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Не удалось загрузить книги';
          setError(msg);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId, debouncedSearch]);

  const handleManualRefresh = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getBooks({
        userId,
        search: debouncedSearch.trim() || undefined,
      });
      setBooks(data.books || []);
      setError('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не удалось загрузить книги';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Create Book
  const handleCreateSubmit = async (formData: BookFormData) => {
    const newBook = await createBook(formData);
    setBooks((prev) => [newBook, ...prev]);
    showToast(`Книга «${newBook.title}» успешно добавлена в библиотеку!`);
  };

  // Handle Update Book
  const handleUpdateSubmit = async (formData: BookFormData) => {
    if (!formModal.book) return;
    const updated = await updateBook(formModal.book.id, formData);
    setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    if (selectedBook?.id === updated.id) {
      setSelectedBook(updated);
    }
    showToast(`Книга «${updated.title}» успешно обновлена!`);
  };

  // Handle Delete Book
  const handleDeleteConfirm = async (bookId: string) => {
    await deleteBook(bookId);
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    if (selectedBook?.id === bookId) {
      setSelectedBook(null);
    }
    showToast('Книга успешно удалена из библиотеки', 'info');
  };

  return (
    <div className="books-page">
      <Navbar />

      <main className="books-main-container">
        {/* Page Header */}
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
              onClick={() => setFormModal({ isOpen: true, mode: 'create', book: null })}
            >
              <PlusIcon size={20} />
              <span>Добавить книгу</span>
            </button>
          </div>
        </section>

        {/* Toolbar: Search, Filters, Count */}
        <section className="books-toolbar">
          <div className="books-search-wrapper">
            <SearchIcon size={18} className="books-search-icon" />
            <input
              id="books-search-input"
              type="text"
              placeholder="Поиск по названию или автору..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="books-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="books-search-clear"
                onClick={() => setSearchQuery('')}
                title="Очистить поиск"
              >
                <CloseIcon size={16} />
              </button>
            )}
          </div>

          <div className="books-stats-badge">
            <BookOpenIcon size={16} />
            <span>
              {books.length === 1
                ? '1 книга'
                : books.length > 1 && books.length < 5
                ? `${books.length} книги`
                : `${books.length} книг`}
            </span>
          </div>
        </section>

        {/* Error message */}
        {error && (
          <div className="books-error-card">
            <p>{error}</p>
            <button type="button" onClick={handleManualRefresh} className="btn-retry">
              Попробовать снова
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="books-loading-state">
            <div className="books-spinner" />
            <p>Загрузка книг вашей библиотеки...</p>
          </div>
        ) : books.length === 0 ? (
          /* Empty state */
          <div className="books-empty-card">
            <div className="empty-icon-box">
              <BookOpenIcon size={48} />
            </div>
            {debouncedSearch ? (
              <>
                <h3 className="empty-title">Ничего не найдено</h3>
                <p className="empty-desc">
                  По запросу «<strong>{debouncedSearch}</strong>» книг не найдено. Попробуйте изменить параметры поиска.
                </p>
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => setSearchQuery('')}
                >
                  Очистить поиск
                </button>
              </>
            ) : (
              <>
                <h3 className="empty-title">В вашей библиотеке пока нет книг</h3>
                <p className="empty-desc">
                  Добавьте свои любимые книги, чтобы создать персональную полку для чтения!
                </p>
                <button
                  id="add-first-book-btn"
                  type="button"
                  className="btn-primary-action"
                  onClick={() => setFormModal({ isOpen: true, mode: 'create', book: null })}
                >
                  <PlusIcon size={20} />
                  <span>Добавить первую книгу</span>
                </button>
              </>
            )}
          </div>
        ) : (
          /* Books Grid */
          <div className="books-grid">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isOwner={book.userId === user?.id || !book.userId}
                onView={(b) => setSelectedBook(b)}
                onEdit={(b) => setFormModal({ isOpen: true, mode: 'edit', book: b })}
                onDelete={(b) => setDeletingBook(b)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Book Details Modal Popup */}
      <BookDetailsModal
        book={selectedBook}
        isOpen={!!selectedBook}
        isOwner={selectedBook?.userId === user?.id || !selectedBook?.userId}
        onClose={() => setSelectedBook(null)}
        onEdit={(b) => setFormModal({ isOpen: true, mode: 'edit', book: b })}
        onDelete={(b) => setDeletingBook(b)}
      />

      {/* Book Add / Edit Modal */}
      <BookFormModal
        isOpen={formModal.isOpen}
        mode={formModal.mode}
        initialBook={formModal.book}
        onClose={() => setFormModal({ isOpen: false, mode: 'create', book: null })}
        onSubmit={formModal.mode === 'create' ? handleCreateSubmit : handleUpdateSubmit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        book={deletingBook}
        isOpen={!!deletingBook}
        onClose={() => setDeletingBook(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default BooksPage;
