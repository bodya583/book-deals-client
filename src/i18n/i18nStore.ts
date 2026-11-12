import { create } from 'zustand';
import type { SupportedLanguage, TranslationDictionary } from './types';
import { uk } from './locales/uk';
import { en } from './locales/en';

export const dictionaries: Record<SupportedLanguage, TranslationDictionary> = {
  uk,
  en,
};

const STORAGE_KEY = 'bookswap_lang';

const getInitialLanguage = (): SupportedLanguage => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'uk' || saved === 'en') {
      return saved;
    }
    const candidateLanguages = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const lang of candidateLanguages) {
      if (!lang) continue;
      const lower = lang.toLowerCase();
      if (lower.startsWith('uk') || lower.startsWith('ua')) {
        return 'uk';
      }
      if (lower.startsWith('en')) {
        return 'en';
      }
    }
  } catch {
  }
  return 'uk';
};

const syncDomLocale = (lang: SupportedLanguage) => {
  try {
    document.documentElement.lang = lang;
    const dict = dictionaries[lang] || dictionaries.uk;
    document.title = dict.app.fullTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', dict.app.description);
    }
  } catch {
  }
};

const initialLanguage = getInitialLanguage();
syncDomLocale(initialLanguage);

const resolveAndFormat = (
  language: SupportedLanguage,
  path: string,
  params?: Record<string, string | number>
): string => {
  const dict = dictionaries[language] || dictionaries.uk;
  const fallbackDict = dictionaries.uk;

  const resolve = (obj: unknown, keys: string[]): string | undefined => {
    let current: unknown = obj;
    for (const k of keys) {
      if (!current || typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[k];
    }
    return typeof current === 'string' ? current : undefined;
  };

  const keys = path.split('.');
  let text = resolve(dict, keys) ?? resolve(fallbackDict, keys) ?? path;

  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      text = text.replace(new RegExp(`{{${key}}}`, 'g'), String(val));
    });
  }

  return text;
};

interface I18nState {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

export const useI18nStore = create<I18nState>((set, get) => ({
  language: initialLanguage,

  setLanguage: (lang: SupportedLanguage) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
    }
    syncDomLocale(lang);
    set({ language: lang });
  },

  toggleLanguage: () => {
    const next = get().language === 'uk' ? 'en' : 'uk';
    get().setLanguage(next);
  },

  t: (path: string, params?: Record<string, string | number>): string => {
    return resolveAndFormat(get().language, path, params);
  },
}));

export const translate = (
  path: string,
  params?: Record<string, string | number>,
  overrideLang?: SupportedLanguage
): string => {
  const lang = overrideLang ?? useI18nStore.getState().language;
  return resolveAndFormat(lang, path, params);
};

export const getDictionary = (overrideLang?: SupportedLanguage): TranslationDictionary => {
  const lang = overrideLang ?? useI18nStore.getState().language;
  return dictionaries[lang] || dictionaries.uk;
};
