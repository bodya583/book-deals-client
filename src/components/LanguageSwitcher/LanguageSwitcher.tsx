import React from 'react';
import { useTranslation } from '../../i18n';
import { GlobeIcon } from '../icons';
import './LanguageSwitcher.css';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="lang-switcher" role="group" aria-label="Language selection">
      <div className="lang-switcher-icon" aria-hidden="true">
        <GlobeIcon size={16} />
      </div>
      <button
        type="button"
        className={`lang-btn ${language === 'ru' ? 'active' : ''}`}
        onClick={() => setLanguage('ru')}
        title="Переключить интерфейс на русский"
        aria-pressed={language === 'ru'}
      >
        RU
      </button>
      <span className="lang-divider" aria-hidden="true">/</span>
      <button
        type="button"
        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
        onClick={() => setLanguage('en')}
        title="Switch interface to English"
        aria-pressed={language === 'en'}
      >
        EN
      </button>
    </div>
  );
};
