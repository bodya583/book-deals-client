import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getBooks, createBook, updateBook, deleteBook } from '../api/booksApi';
import type { Book, BookFormData } from '../types/book';
import Navbar from '../components/Navbar';
import BookCard from '../components/BookCard';
import BookDetailsModal from '../components/BookDetailsModal';
import BookFormModal from '../components/BookFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Toast, { type ToastMessage } from '../components/Toast';
import {
  UserIcon,
  CalendarIcon,
  BookOpenIcon,
  PlusIcon,
  LogOutIcon,
} from '../components/icons';
import api from '../api/axiosInstance';
import './books.css';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const userId = user?.id;
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));

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

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    getBooks({ userId })
      .then((data) => {
        if (isMounted) {
          setBooks(data.books || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      logout();
      navigate('/login');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указано';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  // Handle Book CRUD actions
  const handleCreateSubmit = async (formData: BookFormData) => {
    const newBook = await createBook(formData);
    setBooks((prev) => [newBook, ...prev]);
    showToast(`Книга «${newBook.title}» успешно добавлена!`);
  };

  const handleUpdateSubmit = async (formData: BookFormData) => {
    if (!formModal.book) return;
    const updated = await updateBook(formModal.book.id, formData);
    setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    if (selectedBook?.id === updated.id) {
      setSelectedBook(updated);
    }
    showToast(`Книга «${updated.title}» успешно обновлена!`);
  };

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
        {/* Profile Card / Header Section */}
        <section className="profile-hero-card">
          <div className="profile-hero-main">
            <div className="profile-large-avatar">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.username}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
              <span className="profile-avatar-letters">{getInitials(user?.username)}</span>
            </div>

            <div className="profile-hero-info">
              <div className="profile-title-row">
                <h1 className="profile-username">{user?.username || 'Пользователь'}</h1>
                <span className="profile-badge-active">Активен</span>
              </div>

              <div className="profile-meta-list">
                <div className="profile-meta-item">
                  <CalendarIcon size={16} />
                  <span>Зарегистрирован: {formatDate(user?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Quick Actions */}
          <div className="profile-hero-buttons">
            <button
              type="button"
              className="btn-secondary-action"
              onClick={() => navigate('/')}
            >
              <BookOpenIcon size={18} />
              <span>Все мои книги</span>
            </button>
            <button
              type="button"
              className="btn-danger-outline"
              onClick={handleLogout}
            >
              <LogOutIcon size={18} />
              <span>Выйти</span>
            </button>
          </div>
        </section>

        {/* Profile Statistics Bar */}
        <section className="profile-stats-grid">
          <div className="profile-stat-box">
            <div className="stat-icon-wrapper stat-icon-emerald">
              <BookOpenIcon size={24} />
            </div>
            <div>
              <span className="stat-label">Всего книг на аккаунте</span>
              <h3 className="stat-value">{books.length}</h3>
            </div>
          </div>

          <div className="profile-stat-box">
            <div className="stat-icon-wrapper stat-icon-amber">
              <CalendarIcon size={24} />
            </div>
            <div>
              <span className="stat-label">Последнее добавление</span>
              <h3 className="stat-value">
                {books.length > 0 && books[0].createdAt
                  ? formatDate(books[0].createdAt)
                  : 'Пока нет книг'}
              </h3>
            </div>
          </div>

          <div className="profile-stat-box">
            <div className="stat-icon-wrapper stat-icon-blue">
              <UserIcon size={24} />
            </div>
            <div>
              <span className="stat-label">Роль пользователя</span>
              <h3 className="stat-value">Читатель</h3>
            </div>
          </div>
        </section>

        {/* User's Books Showcase Section */}
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
              onClick={() => setFormModal({ isOpen: true, mode: 'create', book: null })}
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
                onClick={() => setFormModal({ isOpen: true, mode: 'create', book: null })}
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
                  onView={(b) => setSelectedBook(b)}
                  onEdit={(b) => setFormModal({ isOpen: true, mode: 'edit', book: b })}
                  onDelete={(b) => setDeletingBook(b)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Book Details Modal Popup */}
      <BookDetailsModal
        book={selectedBook}
        isOpen={!!selectedBook}
        isOwner={true}
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

export default ProfilePage;
