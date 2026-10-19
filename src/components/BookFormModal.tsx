import React, { useState, useEffect } from 'react';
import type { Book, BookFormData } from '../types/book';
import { CloseIcon, BookOpenIcon, SparklesIcon } from './icons';

interface BookFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialBook?: Book | null;
  onClose: () => void;
  onSubmit: (formData: BookFormData) => Promise<void>;
}

const PRESET_COVERS = [
  {
    name: 'Изумрудный переплет',
    url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Старинный фолиант',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Минимализм',
    url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'Атмосферный кофе',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600&auto=format&fit=crop',
  },
];

interface FormContentProps {
  mode: 'create' | 'edit';
  initialBook?: Book | null;
  onClose: () => void;
  onSubmit: (formData: BookFormData) => Promise<void>;
}

const FormContent: React.FC<FormContentProps> = ({
  mode,
  initialBook,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState(mode === 'edit' && initialBook ? initialBook.title || '' : '');
  const [author, setAuthor] = useState(mode === 'edit' && initialBook ? initialBook.author || '' : '');
  const [description, setDescription] = useState(
    mode === 'edit' && initialBook ? initialBook.description || '' : ''
  );
  const [coverURL, setCoverURL] = useState(
    mode === 'edit' && initialBook ? initialBook.coverURL || '' : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState(false);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Пожалуйста, укажите название книги');
      return;
    }
    if (!author.trim()) {
      setError('Пожалуйста, укажите автора книги');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onSubmit({
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        coverURL: coverURL.trim(),
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Произошла ошибка при сохранении книги';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-container modal-form"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="modal-close-btn"
        onClick={onClose}
        disabled={loading}
        aria-label="Закрыть"
      >
        <CloseIcon size={20} />
      </button>

      <div className="modal-header">
        <div className="modal-header-icon">
          <BookOpenIcon size={22} />
        </div>
        <div>
          <h3 className="modal-title">
            {mode === 'create' ? 'Добавить новую книгу' : 'Редактировать книгу'}
          </h3>
          <p className="modal-subtitle">
            {mode === 'create'
              ? 'Заполните информацию о книге, чтобы добавить её в вашу библиотеку'
              : 'Внесите необходимые изменения в информацию о книге'}
          </p>
        </div>
      </div>

      {error && <div className="modal-error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="book-modal-form">
        <div className="modal-form-grid">
          {/* Form Fields */}
          <div className="modal-form-fields">
            <div className="form-group">
              <label htmlFor="book-title">
                Название книги <span className="required-star">*</span>
              </label>
              <input
                id="book-title"
                type="text"
                placeholder="Например, «Мастер и Маргарита»"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="book-author">
                Автор <span className="required-star">*</span>
              </label>
              <input
                id="book-author"
                type="text"
                placeholder="Например, Михаил Булгаков"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="book-cover">Ссылка на обложку (URL)</label>
              <input
                id="book-cover"
                type="url"
                placeholder="https://example.com/cover.jpg"
                value={coverURL}
                onChange={(e) => {
                  setCoverURL(e.target.value);
                  setPreviewError(false);
                }}
                disabled={loading}
              />

              {/* Preset covers picker */}
              <div className="preset-covers">
                <span className="preset-label">
                  <SparklesIcon size={14} /> Выбрать готовую обложку:
                </span>
                <div className="preset-chips">
                  {PRESET_COVERS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      className={`preset-chip ${coverURL === preset.url ? 'active' : ''}`}
                      onClick={() => {
                        setCoverURL(preset.url);
                        setPreviewError(false);
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="book-description">Описание книги</label>
              <textarea
                id="book-description"
                rows={4}
                placeholder="Краткое описание сюжета, ваши впечатления или заметки..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Live Cover Preview */}
          <div className="modal-form-preview">
            <span className="preview-heading">Предпросмотр обложки</span>
            <div className="preview-cover-card">
              {coverURL && !previewError ? (
                <img
                  src={coverURL}
                  alt="Предпросмотр"
                  className="preview-img"
                  onError={() => setPreviewError(true)}
                />
              ) : (
                <div className="preview-fallback">
                  <BookOpenIcon size={40} className="preview-fallback-icon" />
                  <span className="preview-fallback-title">
                    {title || 'Название книги'}
                  </span>
                  <span className="preview-fallback-author">
                    {author || 'Автор'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="modal-form-actions">
          <button
            type="button"
            className="modal-btn modal-btn-outline"
            onClick={onClose}
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="modal-btn modal-btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small" />
                <span>Сохранение...</span>
              </>
            ) : (
              <span>{mode === 'create' ? 'Добавить книгу' : 'Сохранить изменения'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  mode,
  initialBook,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <FormContent
        key={mode === 'edit' && initialBook ? initialBook.id : 'create'}
        mode={mode}
        initialBook={initialBook}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default BookFormModal;
