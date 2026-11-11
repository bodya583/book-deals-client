import { useI18nStore } from './i18nStore';

export const useTranslation = () => {
  const language = useI18nStore((s) => s.language);
  const setLanguage = useI18nStore((s) => s.setLanguage);
  const toggleLanguage = useI18nStore((s) => s.toggleLanguage);
  const t = useI18nStore((s) => s.t);

  return {
    language,
    setLanguage,
    toggleLanguage,
    t,
  };
};

export { useI18nStore } from './i18nStore';
export type { SupportedLanguage, TranslationDictionary } from './types';
