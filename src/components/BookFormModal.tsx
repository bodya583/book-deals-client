import React, { useState, useEffect } from 'react';
import type { Book, BookFormData, Genre } from '../types/book';
import { BOOK_LANGUAGES } from '../types/book';
import { getGenres } from '../api/booksApi';
import { CloseIcon, BookOpenIcon, SparklesIcon, TagIcon, GlobeIcon, PlusIcon, CalendarIcon } from './icons';

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

const DEFAULT_POPULAR_GENRES = [
  'Художественная литература',
  'Фантастика',
  'Фэнтези',
  'Детектив',
  'Триллер / Ужасы',
  'Приключения',
  'Роман / Проза',
  'Классическая литература',
  'Научная литература',
  'Биография / Мемуары',
  'История',
  'Психология / Саморазвитие',
  'Бизнес / Финансы',
  'Философия',
  'Поэзия',
  'Детская литература',
  'Компьютерные технологии / IT',
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
  const [language, setLanguage] = useState<string>(
    mode === 'edit' && initialBook?.language ? initialBook.language : ''
  );
  const [year, setYear] = useState<string>(
    mode === 'edit' && initialBook?.year ? String(initialBook.year) : ''
  );
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    mode === 'edit' && initialBook?.genres
      ? initialBook.genres.map((g) => g.name)
      : []
  );
  const [customGenreInput, setCustomGenreInput] = useState('');
  const [availableGenres, setAvailableGenres] = useState<string[]>(DEFAULT_POPULAR_GENRES);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState(false);

  // Fetch all genres from server to stay in sync with DB
  useEffect(() => {
    let isMounted = true;
    getGenres()
      .then((data: Genre[]) => {
        if (isMounted && data && data.length > 0) {
          const names = data.map((g) => g.name);
          setAvailableGenres(names);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_POPULAR_GENRES
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

  const toggleGenre = (genreName: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreName)
        ? prev.filter((g) => g !== genreName)
        : [...prev, genreName]
    );
  };

  const handleAddCustomGenre = () => {
    const trimmed = customGenreInput.trim();
    if (!trimmed) return;
    if (!selectedGenres.includes(trimmed)) {
      setSelectedGenres((prev) => [...prev, trimmed]);
    }
    if (!availableGenres.includes(trimmed)) {
      setAvailableGenres((prev) => [...prev, trimmed]);
    }
    setCustomGenreInput('');
  };

  const handleRemoveGenre = (genreName: string) => {
    setSelectedGenres((prev) => prev.filter((g) => g !== genreName));
  };

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
        language: language.trim() || undefined,
        year: year.trim() && !isNaN(parseInt(year.trim(), 10)) ? parseInt(year.trim(), 10) : undefined,
        genres: selectedGenres,
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
              ? 'Заполните информацию о книге, укажите жанры, язык и год издания для удобного поиска'
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

            {/* Language & Year row */}
            <div className="form-row-two-cols">
              {/* Language Selector */}
              <div className="form-group">
                <label htmlFor="book-language" className="label-with-icon">
                  <GlobeIcon size={16} />
                  <span>Язык издания</span>
                </label>
                <select
                  id="book-language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={loading}
                  className="modal-select-field"
                >
                  <option value="">Не указан (Любой)</option>
                  {BOOK_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year of Publication */}
              <div className="form-group">
                <label htmlFor="book-year" className="label-with-icon">
                  <CalendarIcon size={16} />
                  <span>Год издания</span>
                </label>
                <input
                  id="book-year"
                  type="number"
                  placeholder="Например, 1967"
                  min="1"
                  max="2100"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Genres Section */}
            <div className="form-group">
              <label className="label-with-icon">
                <TagIcon size={16} />
                <span>Жанры</span>
                {selectedGenres.length > 0 && (
                  <span className="selected-count-pill">{selectedGenres.length}</span>
                )}
              </label>

              {/* Selected Genres Chips */}
              {selectedGenres.length > 0 && (
                <div className="form-selected-genres">
                  {selectedGenres.map((genre) => (
                    <span key={genre} className="selected-genre-chip">
                      {genre}
                      <button
                        type="button"
                        onClick={() => handleRemoveGenre(genre)}
                        className="remove-genre-btn"
                        title={`Удалить ${genre}`}
                      >
                        <CloseIcon size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add Custom Genre input */}
              <div className="custom-genre-row">
                <input
                  type="text"
                  placeholder="Добавить свой жанр..."
                  value={customGenreInput}
                  onChange={(e) => setCustomGenreInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomGenre();
                    }
                  }}
                  disabled={loading}
                  className="custom-genre-input"
                />
                <button
                  type="button"
                  onClick={handleAddCustomGenre}
                  disabled={!customGenreInput.trim() || loading}
                  className="add-custom-genre-btn"
                  title="Добавить жанр"
                >
                  <PlusIcon size={15} />
                  <span>Добавить</span>
                </button>
              </div>

              {/* Quick-Pick Popular Genres */}
              <div className="form-genres-quickpick">
                <span className="genres-quickpick-title">Популярные жанры:</span>
                <div className="genres-quickpick-list">
                  {availableGenres.slice(0, 15).map((genreName) => {
                    const isSelected = selectedGenres.includes(genreName);
                    return (
                      <button
                        key={genreName}
                        type="button"
                        onClick={() => toggleGenre(genreName)}
                        className={`genre-quick-chip ${isSelected ? 'selected' : ''}`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {genreName}
                      </button>
                    );
                  })}
                </div>
              </div>
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
            <span className="preview-heading">Предпросмотр карточки</span>
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

              {/* Floating badges in preview */}
              <div className="preview-meta-badges">
                {language && (
                  <span className="preview-lang-pill">
                    <GlobeIcon size={12} /> {language}
                  </span>
                )}
                {year && (
                  <span className="preview-year-pill">
                    <CalendarIcon size={12} /> {year} г.
                  </span>
                )}
                {selectedGenres.length > 0 && (
                  <span className="preview-genre-pill">
                    <TagIcon size={12} /> {selectedGenres[0]}
                    {selectedGenres.length > 1 ? ` +${selectedGenres.length - 1}` : ''}
                  </span>
                )}
              </div>
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
