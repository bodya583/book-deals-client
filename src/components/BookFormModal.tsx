import React from 'react';
import { createPortal } from 'react-dom';
import type { Book, BookFormData } from '../types/book';
import { BOOK_LANGUAGES } from '../types/book';
import { CloseIcon, BookOpenIcon, GlobeIcon, CalendarIcon } from './icons';
import { useTranslation } from '../i18n';
import { useBookForm } from './BookForm/useBookForm';
import { BookGenresField } from './BookForm/BookGenresField';
import { BookCoverPreviewColumn } from './BookForm/BookCoverPreviewColumn';

interface BookFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialBook?: Book | null;
  onClose: () => void;
  onSubmit: (formData: BookFormData) => Promise<void>;
}

const FormContent: React.FC<Omit<BookFormModalProps, 'isOpen'>> = ({
  mode,
  initialBook,
  onClose,
  onSubmit,
}) => {
  const { t, tBookLanguage } = useTranslation();
  const { fields, genres, cover, status, handleSubmit } = useBookForm({
    mode,
    initialBook,
    onClose,
    onSubmit,
  });

  return (
    <div className="modal-container modal-form" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="modal-close-btn"
        onClick={onClose}
        disabled={status.loading}
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
            {mode === 'create' ? t('bookForm.createSubtitle') : t('bookForm.editSubtitle')}
          </p>
        </div>
      </div>

      {status.error && <div className="modal-error-banner">{status.error}</div>}

      <form onSubmit={handleSubmit} className="book-modal-form">
        <div className="modal-form-grid">
          <div className="modal-form-fields">
            <div className="form-group">
              <label htmlFor="book-title">
                {t('bookForm.titleLabel')} <span className="required-star">*</span>
              </label>
              <input
                id="book-title"
                type="text"
                placeholder={t('bookForm.titlePlaceholder')}
                value={fields.title}
                onChange={(e) => fields.setTitle(e.target.value)}
                disabled={status.loading}
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
                value={fields.author}
                onChange={(e) => fields.setAuthor(e.target.value)}
                disabled={status.loading}
                required
              />
            </div>

            <div className="form-row-two-cols">
              <div className="form-group">
                <label htmlFor="book-language" className="label-with-icon">
                  <GlobeIcon size={15} />
                  <span>{t('bookForm.languageLabel')}</span>
                </label>
                <select
                  id="book-language"
                  value={fields.language}
                  onChange={(e) => fields.setLanguage(e.target.value)}
                  disabled={status.loading}
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
                  value={fields.year}
                  onChange={(e) => fields.setYear(e.target.value)}
                  disabled={status.loading}
                />
              </div>
            </div>

            <BookGenresField
              selected={genres.selected}
              available={genres.available}
              onToggle={genres.toggle}
              onRemove={genres.remove}
            />

            <div className="form-group">
              <label htmlFor="book-description">{t('bookForm.descriptionLabel')}</label>
              <textarea
                id="book-description"
                rows={3}
                placeholder={t('bookForm.descriptionPlaceholder')}
                value={fields.description}
                onChange={(e) => fields.setDescription(e.target.value)}
                disabled={status.loading}
              />
            </div>
          </div>

          <BookCoverPreviewColumn
            preview={{
              title: fields.title,
              author: fields.author,
              language: fields.language,
              year: fields.year,
              selectedGenres: genres.selected,
            }}
            cover={cover}
            loading={status.loading}
          />
        </div>

        <div className="modal-form-actions">
          <button
            type="button"
            className="modal-btn modal-btn-outline"
            onClick={onClose}
            disabled={status.loading}
          >
            {t('common.cancel')}
          </button>
          <button type="submit" className="modal-btn modal-btn-primary" disabled={status.loading}>
            {status.loading ? (
              <>
                <span className="spinner-small" />
                <span>{status.loadingStatus || t('common.loading')}</span>
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

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <FormContent
        key={mode === 'edit' && initialBook ? initialBook.id : 'create'}
        mode={mode}
        initialBook={initialBook}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </div>,
    document.body
  );
};

export default BookFormModal;
