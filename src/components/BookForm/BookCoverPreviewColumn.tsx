import React from 'react';
import { formatBookYear } from '../../types/book';
import { BookOpenIcon, GlobeIcon, CalendarIcon, TagIcon, UploadIcon, ImageIcon, CloseIcon } from '../icons';
import { useTranslation } from '../../i18n';

interface BookCoverPreviewColumnProps {
  preview: {
    title: string;
    author: string;
    language: string;
    year: string;
    selectedGenres: string[];
  };
  cover: {
    url: string;
    fileName: string;
    previewError: boolean;
    setPreviewError: (v: boolean) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    clear: () => void;
  };
  loading: boolean;
}

export const BookCoverPreviewColumn: React.FC<BookCoverPreviewColumnProps> = ({
  preview,
  cover,
  loading,
}) => {
  const { t, language: currentLang, tGenre, tBookLanguage } = useTranslation();

  return (
    <div className="modal-form-preview-col">
      <span className="preview-heading">{t('bookCard.previewHeading')}</span>
      <div className="preview-cover-card">
        {cover.url && !cover.previewError ? (
          <img
            src={cover.url}
            alt={preview.title || t('bookCard.coverAltFallback')}
            className="preview-img"
            onError={() => cover.setPreviewError(true)}
          />
        ) : (
          <div className="preview-fallback">
            <BookOpenIcon size={44} className="preview-fallback-icon" />
            <span className="preview-fallback-title">
              {preview.title || t('bookCard.previewTitleFallback')}
            </span>
            <span className="preview-fallback-author">
              {preview.author || t('bookCard.previewAuthorFallback')}
            </span>
          </div>
        )}

        <div className="preview-meta-badges">
          {preview.language && (
            <span className="preview-lang-pill">
              <GlobeIcon size={11} /> {tBookLanguage(preview.language)}
            </span>
          )}
          {preview.year && (
            <span className="preview-year-pill">
              <CalendarIcon size={11} /> {formatBookYear(preview.year, currentLang)}
            </span>
          )}
          {preview.selectedGenres.length > 0 && (
            <span className="preview-genre-pill">
              <TagIcon size={11} /> {tGenre(preview.selectedGenres[0])}
              {preview.selectedGenres.length > 1 ? ` +${preview.selectedGenres.length - 1}` : ''}
            </span>
          )}
        </div>
      </div>

      <div className="cover-upload-section">
        <input
          ref={cover.fileInputRef}
          id="book-cover-file"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          onChange={cover.handleFileChange}
          disabled={loading}
          className="visually-hidden-file-input"
        />

        <button
          type="button"
          className="file-upload-btn"
          onClick={() => cover.fileInputRef.current?.click()}
          disabled={loading}
        >
          <UploadIcon size={16} />
          <span>{cover.url ? t('bookCard.replaceFile') : t('bookCard.selectFile')}</span>
        </button>

        {cover.fileName ? (
          <div className="file-selected-status">
            <ImageIcon size={13} />
            <span className="file-name-text" title={cover.fileName}>
              {cover.fileName}
            </span>
            <button
              type="button"
              onClick={cover.clear}
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
  );
};
