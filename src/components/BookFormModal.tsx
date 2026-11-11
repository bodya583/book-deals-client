import React, { useState, useEffect, useRef } from 'react';
import type { Book, BookFormData, Genre } from '../types/book';
import { BOOK_LANGUAGES, formatBookYear } from '../types/book';
import { getGenres } from '../api/booksApi';
import { uploadBookCover } from '../api/uploadApi';
import {
  CloseIcon,
  BookOpenIcon,
  TagIcon,
  GlobeIcon,
  CalendarIcon,
  UploadIcon,
  ImageIcon,
  CheckIcon,
  PlusIcon,
} from './icons';
import { useTranslation, dictionaries } from '../i18n';

interface BookFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialBook?: Book | null;
  onClose: () => void;
  onSubmit: (formData: BookFormData) => Promise<void>;
}

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
  const { t, language: currentLang, tGenre, tBookLanguage, tApiError } = useTranslation();
  const defaultPopular = dictionaries.en.bookForm.popularGenres;

  const [title, setTitle] = useState(mode === 'edit' && initialBook ? initialBook.title || '' : '');
  const [author, setAuthor] = useState(mode === 'edit' && initialBook ? initialBook.author || '' : '');
  const [description, setDescription] = useState(
    mode === 'edit' && initialBook ? initialBook.description || '' : ''
  );
  const [coverURL, setCoverURL] = useState(
    mode === 'edit' && initialBook ? initialBook.coverURL || '' : ''
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
  const [availableGenres, setAvailableGenres] = useState<string[]>(defaultPopular);

  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
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
        // Fallback to defaultPopular
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle ESC key press & body scroll locking
  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
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
      setSelectedFile(file);
      setSelectedFileName(file.name);
      setPreviewError(false);
      setError('');
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
    setSelectedFile(null);
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
      setError(t('bookForm.errTitleRequired'));
      return;
    }
    if (!author.trim()) {
      setError(t('bookForm.errAuthorRequired'));
      return;
    }

    setError('');
    setLoading(true);

    try {
      let finalCoverURL = coverURL.trim();

      // If user selected a new file, upload it to Cloudinary first
      if (selectedFile) {
        setLoadingStatus(t('bookForm.uploadingCover'));
        try {
          const uploadRes = await uploadBookCover(selectedFile);
          finalCoverURL = uploadRes.url;
        } catch (uploadErr: any) {
          const uploadMsg =
            uploadErr?.response?.data?.message ||
            uploadErr?.message ||
            t('bookForm.errUploadFailed');
          setError(tApiError(uploadMsg));
          setLoading(false);
          setLoadingStatus('');
          return;
        }
      } else if (finalCoverURL.startsWith('data:')) {
        // Clear local base64 fallback if not backed by a selectedFile
        finalCoverURL = '';
      }

      setLoadingStatus(t('bookForm.savingBook'));
      await onSubmit({
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        coverURL: finalCoverURL,
        language: language.trim() || undefined,
        year: year.trim() && !isNaN(parseInt(year.trim(), 10)) ? parseInt(year.trim(), 10) : undefined,
        genres: selectedGenres,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('bookForm.errSaveFailed');
      setError(tApiError(msg));
    } finally {
      setLoading(false);
      setLoadingStatus('');
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
        aria-label={t('common.close')}
      >
        <CloseIcon size={20} />
      </button>

      <div className="modal-header">
        <div className="modal-header-icon">
          <BookOpenIcon size={22} />
        </div>
        <div>
          <h3 className="modal-title">
            {mode === 'create' ? t('bookForm.createTitle') : t('bookForm.editTitle')}
          </h3>
          <p className="modal-subtitle">
            {mode === 'create'
              ? t('bookForm.createSubtitle')
              : t('bookForm.editSubtitle')}
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
                {t('bookForm.titleLabel')} <span className="required-star">*</span>
              </label>
              <input
                id="book-title"
                type="text"
                placeholder={t('bookForm.titlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="book-author">
                {t('bookForm.authorLabel')} <span className="required-star">*</span>
              </label>
              <input
                id="book-author"
                type="text"
                placeholder={t('bookForm.authorPlaceholder')}
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
                  <span>{t('bookForm.languageLabel')}</span>
                </label>
                <select
                  id="book-language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={loading}
                  className="modal-select-field"
                >
                  <option value="">{t('bookForm.languageNotSet')}</option>
                  {BOOK_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {tBookLanguage(lang)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year of Publication */}
              <div className="form-group">
                <label htmlFor="book-year" className="label-with-icon">
                  <CalendarIcon size={15} />
                  <span>{t('bookForm.yearLabel')}</span>
                </label>
                <input
                  id="book-year"
                  type="number"
                  placeholder={t('bookForm.yearPlaceholder')}
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
                  <span>{t('bookForm.genresLabel')}</span>
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
                      {tGenre(genre)}
                      <button
                        type="button"
                        onClick={() => handleRemoveGenre(genre)}
                        className="remove-genre-btn"
                        title={t('bookForm.removeGenre', { genre: tGenre(genre) })}
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
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        {isSelected ? <CheckIcon size={12} /> : <PlusIcon size={12} />}
                        <span>{tGenre(genreName)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="book-description">{t('bookForm.descriptionLabel')}</label>
              <textarea
                id="book-description"
                rows={3}
                placeholder={t('bookForm.descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Right Column: Cover Preview & File Upload */}
          <div className="modal-form-preview-col">
            <span className="preview-heading">
              {t('bookCard.previewHeading')}
            </span>
            <div className="preview-cover-card">
              {coverURL && !previewError ? (
                <img
                  src={coverURL}
                  alt={title || t('bookCard.coverAltFallback')}
                  className="preview-img"
                  onError={() => setPreviewError(true)}
                />
              ) : (
                <div className="preview-fallback">
                  <BookOpenIcon size={44} className="preview-fallback-icon" />
                  <span className="preview-fallback-title">
                    {title || t('bookCard.previewTitleFallback')}
                  </span>
                  <span className="preview-fallback-author">
                    {author || t('bookCard.previewAuthorFallback')}
                  </span>
                </div>
              )}

              {/* Floating badges on live preview */}
              <div className="preview-meta-badges">
                {language && (
                  <span className="preview-lang-pill">
                    <GlobeIcon size={11} /> {tBookLanguage(language)}
                  </span>
                )}
                {year && (
                  <span className="preview-year-pill">
                    <CalendarIcon size={11} /> {formatBookYear(year, currentLang)}
                  </span>
                )}
                {selectedGenres.length > 0 && (
                  <span className="preview-genre-pill">
                    <TagIcon size={11} /> {tGenre(selectedGenres[0])}
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
                <span>
                  {coverURL ? t('bookCard.replaceFile') : t('bookCard.selectFile')}
                </span>
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
                    title={t('common.remove')}
                  >
                    <CloseIcon size={13} />
                  </button>
                </div>
              ) : (
                <span className="file-upload-hint">JPG, PNG, WEBP &le; 5 MB</span>
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
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="modal-btn modal-btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small" />
                <span>{loadingStatus || t('common.loading')}</span>
              </>
            ) : (
              <span>{mode === 'create' ? t('bookForm.submitCreate') : t('bookForm.submitEdit')}</span>
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
