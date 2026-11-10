import React, { useState } from 'react';
import type { Genre } from '../../../../types/book';
import { TagIcon, ChevronDownIcon, CheckIcon } from '../../../../components/icons';

interface GenreFilterPopoverProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  selectedGenres: string[];
  onToggleGenre: (genre: string) => void;
  onClearGenres: () => void;
  strictGenres: boolean;
  onStrictGenresChange: (strict: boolean) => void;
  availableGenres: Genre[];
}

export const GenreFilterPopover: React.FC<GenreFilterPopoverProps> = ({
  isOpen,
  onToggleOpen,
  selectedGenres,
  onToggleGenre,
  onClearGenres,
  strictGenres,
  onStrictGenresChange,
  availableGenres,
}) => {
  const [genreSearch, setGenreSearch] = useState('');

  const filteredGenres = availableGenres.filter((g) =>
    g.name.toLowerCase().includes(genreSearch.toLowerCase().trim())
  );

  return (
    <div className="filter-popover-anchor">
      <button
        type="button"
        id="filter-genres-button"
        className={`filter-trigger-btn ${selectedGenres.length > 0 ? 'active' : ''}`}
        onClick={onToggleOpen}
        title="Фильтр по литературным жанрам"
      >
        <TagIcon size={15} />
        <span className="filter-trigger-text">Жанры</span>
        <span className="filter-trigger-slot">
          {selectedGenres.length > 0 ? (
            <span className="filter-count-badge">{selectedGenres.length}</span>
          ) : (
            <ChevronDownIcon size={14} className={`filter-chevron ${isOpen ? 'open' : ''}`} />
          )}
        </span>
      </button>

      {isOpen && (
        <div className="filter-popover-menu filter-popover-genres" onClick={(e) => e.stopPropagation()}>
          <div className="popover-header">
            <div className="popover-header-title">
              <TagIcon size={15} />
              <span>Фильтр по жанрам</span>
            </div>
            {selectedGenres.length > 0 && (
              <button
                type="button"
                onClick={onClearGenres}
                className="popover-clear-btn"
              >
                Очистить ({selectedGenres.length})
              </button>
            )}
          </div>

          {/* Strict match checkbox toggle: 1 и 2 и 3 VS 1 или 2 или 3 */}
          <div className="strict-toggle-box">
            <label className="strict-checkbox-label">
              <input
                type="checkbox"
                checked={strictGenres}
                onChange={(e) => onStrictGenresChange(e.target.checked)}
                className="strict-checkbox-input"
              />
              <div className="strict-checkbox-info">
                <span className="strict-title">
                  Жёсткая выборка
                </span>
                <span className="strict-subtitle">
                  {strictGenres
                    ? 'Книга обязана содержать ВСЕ выбранные жанры одновременно'
                    : 'Книга может содержать ЛЮБОЙ из выбранных жанров'}
                </span>
              </div>
            </label>
          </div>

          {/* Quick search in genres */}
          <div className="popover-search-box">
            <input
              type="text"
              placeholder="Найти жанр в списке..."
              value={genreSearch}
              onChange={(e) => setGenreSearch(e.target.value)}
              className="popover-search-input"
            />
          </div>

          {/* Genres checklist */}
          <div className="popover-checklist">
            {filteredGenres.length === 0 ? (
              <div className="popover-empty-list">Жанры не найдены</div>
            ) : (
              filteredGenres.map((g) => {
                const isChecked = selectedGenres.includes(g.name);
                return (
                  <label
                    key={g.id || g.name}
                    className={`popover-check-item ${isChecked ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleGenre(g.name)}
                    />
                    <span className="check-custom">
                      {isChecked && <CheckIcon size={12} />}
                    </span>
                    <span className="check-label-text">{g.name}</span>
                    {g._count?.books !== undefined && g._count.books > 0 && (
                      <span className="check-item-count">{g._count.books}</span>
                    )}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
