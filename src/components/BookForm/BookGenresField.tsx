import React from 'react';
import { TagIcon, CloseIcon, CheckIcon, PlusIcon } from '../icons';
import { useTranslation } from '../../i18n';

interface BookGenresFieldProps {
  selected: string[];
  available: string[];
  onToggle: (genreName: string) => void;
  onRemove: (genreName: string) => void;
}

export const BookGenresField: React.FC<BookGenresFieldProps> = ({
  selected,
  available,
  onToggle,
  onRemove,
}) => {
  const { t, tGenre } = useTranslation();

  return (
    <div className="form-group">
      <div className="genres-label-row">
        <span className="label-with-icon">
          <TagIcon size={15} />
          <span>{t('bookForm.genresLabel')}</span>
        </span>
        {selected.length > 0 && <span className="selected-count-pill">{selected.length}</span>}
      </div>

      {selected.length > 0 && (
        <div className="form-selected-genres">
          {selected.map((genre) => (
            <span key={genre} className="selected-genre-chip">
              {tGenre(genre)}
              <button
                type="button"
                onClick={() => onRemove(genre)}
                className="remove-genre-btn"
                title={t('bookForm.removeGenre', { genre: tGenre(genre) })}
              >
                <CloseIcon size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="form-genres-quickpick">
        <div className="genres-quickpick-list">
          {available.map((genreName) => {
            const isSelected = selected.includes(genreName);
            return (
              <button
                key={genreName}
                type="button"
                onClick={() => onToggle(genreName)}
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
  );
};
