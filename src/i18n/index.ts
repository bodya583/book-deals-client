import { useI18nStore, dictionaries } from './i18nStore';

export const useTranslation = () => {
  const language = useI18nStore((s) => s.language);
  const setLanguage = useI18nStore((s) => s.setLanguage);
  const toggleLanguage = useI18nStore((s) => s.toggleLanguage);
  const t = useI18nStore((s) => s.t);
  const dict = dictionaries[language] || dictionaries.uk;

  return {
    language,
    setLanguage,
    toggleLanguage,
    t,
    dict,
  };
};

export { useI18nStore, translate, getDictionary } from './i18nStore';
export type { SupportedLanguage, TranslationDictionary } from './types';
