import React, { useState, useEffect, useRef } from 'react';
import type { Book, BookFormData, Genre } from '../types/book';
import { BOOK_LANGUAGES } from '../types/book';
import { getGenres } from '../api/booksApi';
import {
  CloseIcon,
  BookOpenIcon,
  TagIcon,
  GlobeIcon,
  CalendarIcon,
  UploadIcon,
  ImageIcon,
} from './icons';

interface BookFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialBook?: Book | null;
  onClose: () => void;
  onSubmit: (formData: BookFormData) => Promise<void>;
}

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
  const [selectedFileName, setSelectedFileName] = useState<string>('');
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
  const [availableGenres, setAvailableGenres] = useState<string[]>(DEFAULT_POPULAR_GENRES);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleRemoveGenre = (genreName: string) => {
    setSelectedGenres((prev) => prev.filter((g) => g !== genreName));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setPreviewError(false);
      // Create local data URL for instantaneous live preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCoverURL(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearCover = () => {
    setCoverURL('');
    setSelectedFileName('');
    setPreviewError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
              ? 'Заполните информацию о книге, выберите обложку, жанры и язык издания'
              : 'Внесите необходимые изменения в информацию о книге'}
          </p>
        </div>
      </div>

      {error && <div className="modal-error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="book-modal-form">
        <div className="modal-form-grid">
          {/* Left Column: Form Fields */}
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
                  <GlobeIcon size={15} />
                  <span>Язык издания</span>
                </label>
                <select
                  id="book-language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={loading}
                  className="modal-select-field"
                >
                  <option value="">Не указан</option>
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
                  <CalendarIcon size={15} />
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
              <div className="genres-label-row">
                <span className="label-with-icon">
                  <TagIcon size={15} />
                  <span>Жанры</span>
                </span>
                {selectedGenres.length > 0 && (
                  <span className="selected-count-pill">{selectedGenres.length}</span>
                )}
              </div>

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

              {/* Genre selection chips cloud */}
              <div className="form-genres-quickpick">
                <div className="genres-quickpick-list">
                  {availableGenres.map((genreName) => {
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

            {/* Description */}
            <div className="form-group">
              <label htmlFor="book-description">Описание книги</label>
              <textarea
                id="book-description"
                rows={3}
                placeholder="Краткое описание сюжета, ваши впечатления или заметки..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Right Column: Cover Preview & File Upload */}
          <div className="modal-form-preview-col">
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
                  <BookOpenIcon size={44} className="preview-fallback-icon" />
                  <span className="preview-fallback-title">
                    {title || 'Название книги'}
                  </span>
                  <span className="preview-fallback-author">
                    {author || 'Автор'}
                  </span>
                </div>
              )}

              {/* Floating badges on live preview */}
              <div className="preview-meta-badges">
                {language && (
                  <span className="preview-lang-pill">
                    <GlobeIcon size={11} /> {language}
                  </span>
                )}
                {year && (
                  <span className="preview-year-pill">
                    <CalendarIcon size={11} /> {year} г.
                  </span>
                )}
                {selectedGenres.length > 0 && (
                  <span className="preview-genre-pill">
                    <TagIcon size={11} /> {selectedGenres[0]}
                    {selectedGenres.length > 1 ? ` +${selectedGenres.length - 1}` : ''}
                  </span>
                )}
              </div>
            </div>

            {/* File Upload Component */}
            <div className="cover-upload-section">
              <input
                ref={fileInputRef}
                id="book-cover-file"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleFileChange}
                disabled={loading}
                className="visually-hidden-file-input"
              />

              <button
                type="button"
                className="file-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <UploadIcon size={16} />
                <span>{coverURL ? 'Заменить файл' : 'Выбрать файл'}</span>
              </button>

              {selectedFileName ? (
                <div className="file-selected-status">
                  <ImageIcon size={13} />
                  <span className="file-name-text" title={selectedFileName}>
                    {selectedFileName}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearCover}
                    className="clear-file-btn"
                    title="Удалить файл"
                  >
                    <CloseIcon size={13} />
                  </button>
                </div>
              ) : (
                <span className="file-upload-hint">JPG, PNG, WEBP до 5 МБ</span>
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
