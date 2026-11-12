import React from 'react';
import { BOOK_LANGUAGES } from '../../../../types/book';
import { GlobeIcon, ChevronDownIcon, CheckIcon } from '../../../../components/icons';
import { useTranslation } from '../../../../i18n';
import type { LanguagesFilterController } from '../../hooks/booksPage.types';

interface LanguageFilterPopoverProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  filter: LanguagesFilterController;
}

export const LanguageFilterPopover: React.FC<LanguageFilterPopoverProps> = ({
  isOpen,
  onToggleOpen,
  filter,
}) => {
  const { t, tBookLanguage } = useTranslation();

  return (
    <div className="filter-popover-anchor">
      <button
        type="button"
        id="filter-languages-button"
        className={`filter-trigger-btn ${filter.selected.length > 0 ? 'active' : ''}`}
        onClick={onToggleOpen}
        title={t('filters.languages.title')}
      >
        <GlobeIcon size={15} />
        <span className="filter-trigger-text">{t('filters.languages.buttonLabel')}</span>
        <span className="filter-trigger-slot">
          {filter.selected.length > 0 ? (
            <span className="filter-count-badge">{filter.selected.length}</span>
          ) : (
            <ChevronDownIcon size={14} className={`filter-chevron ${isOpen ? 'open' : ''}`} />
          )}
        </span>
      </button>

      {isOpen && (
        <div className="filter-popover-menu filter-popover-languages" onClick={(e) => e.stopPropagation()}>
          <div className="popover-header">
            <div className="popover-header-title">
              <GlobeIcon size={15} />
              <span>{t('filters.languages.title')}</span>
            </div>
            {filter.selected.length > 0 && (
              <button type="button" onClick={filter.clear} className="popover-clear-btn">
                {t('filters.genres.clearCount', { count: filter.selected.length })}
              </button>
            )}
          </div>

          <div className="popover-checklist">
            {BOOK_LANGUAGES.map((lang) => {
              const isChecked = filter.selected.includes(lang);
              return (
                <label
                  key={lang}
                  className={`popover-check-item ${isChecked ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => filter.toggle(lang)}
                  />
                  <span className="check-custom">{isChecked && <CheckIcon size={12} />}</span>
                  <span className="check-label-text">{tBookLanguage(lang)}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageFilterPopover;
