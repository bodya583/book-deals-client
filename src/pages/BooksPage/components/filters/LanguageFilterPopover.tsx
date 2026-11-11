import React from 'react';
import { BOOK_LANGUAGES } from '../../../../types/book';
import { GlobeIcon, ChevronDownIcon, CheckIcon } from '../../../../components/icons';
import { useTranslation } from '../../../../i18n';

interface LanguageFilterPopoverProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  selectedLanguages: string[];
  onToggleLanguage: (lang: string) => void;
  onClearLanguages: () => void;
}

export const LanguageFilterPopover: React.FC<LanguageFilterPopoverProps> = ({
  isOpen,
  onToggleOpen,
  selectedLanguages,
  onToggleLanguage,
  onClearLanguages,
}) => {
  const { t, tBookLanguage } = useTranslation();

  return (
    <div className="filter-popover-anchor">
      <button
        type="button"
        id="filter-languages-button"
        className={`filter-trigger-btn ${selectedLanguages.length > 0 ? 'active' : ''}`}
        onClick={onToggleOpen}
        title={t('filters.languages.title')}
      >
        <GlobeIcon size={15} />
        <span className="filter-trigger-text">{t('filters.languages.buttonLabel')}</span>
        <span className="filter-trigger-slot">
          {selectedLanguages.length > 0 ? (
            <span className="filter-count-badge">{selectedLanguages.length}</span>
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
            {selectedLanguages.length > 0 && (
              <button
                type="button"
                onClick={onClearLanguages}
                className="popover-clear-btn"
              >
                {t('filters.genres.clearCount', { count: selectedLanguages.length })}
              </button>
            )}
          </div>

          <div className="popover-checklist">
            {BOOK_LANGUAGES.map((lang) => {
              const isChecked = selectedLanguages.includes(lang);
              return (
                <label
                  key={lang}
                  className={`popover-check-item ${isChecked ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleLanguage(lang)}
                  />
                  <span className="check-custom">
                    {isChecked && <CheckIcon size={12} />}
                  </span>
                  <span className="check-label-text">
                    {tBookLanguage(lang)}
                  </span>
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
