import React from 'react';
import { useTranslation } from '../../i18n';
import { GlobeIcon } from '../icons';
import './LanguageSwitcher.css';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div className="lang-switcher" role="group" aria-label={t('app.langGroupLabel')}>
      <div className="lang-switcher-icon" aria-hidden="true">
        <GlobeIcon size={16} />
      </div>
      <button
        type="button"
        className={`lang-btn ${language === 'uk' ? 'active' : ''}`}
        onClick={() => setLanguage('uk')}
        title={t('app.switchToUk')}
        aria-pressed={language === 'uk'}
      >
        UA
      </button>
      <span className="lang-divider" aria-hidden="true">/</span>
      <button
        type="button"
        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
        onClick={() => setLanguage('en')}
        title={t('app.switchToEn')}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
    </div>
  );
};
