import { create } from 'zustand';
import type { SupportedLanguage, TranslationDictionary } from './types';
import { ru } from './locales/ru';
import { en } from './locales/en';

const dictionaries: Record<SupportedLanguage, TranslationDictionary> = {
  ru,
  en,
};

const STORAGE_KEY = 'bookswap_lang';

const getInitialLanguage = (): SupportedLanguage => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ru' || saved === 'en') {
      return saved;
    }
    const navLang = navigator.language?.toLowerCase();
    if (navLang?.startsWith('en')) {
      return 'en';
    }
  } catch {
    // ignore localStorage errors
  }
  return 'ru';
};

interface I18nState {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

export const useI18nStore = create<I18nState>((set, get) => ({
  language: getInitialLanguage(),

  setLanguage: (lang: SupportedLanguage) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch {
      // ignore
    }
    set({ language: lang });
  },

  toggleLanguage: () => {
    const next = get().language === 'ru' ? 'en' : 'ru';
    get().setLanguage(next);
  },

  t: (path: string, params?: Record<string, string | number>): string => {
    const { language } = get();
    const dict = dictionaries[language] || dictionaries.ru;
    const fallbackDict = dictionaries.ru;

    const resolve = (obj: any, keys: string[]): string | undefined => {
      let current = obj;
      for (const k of keys) {
        if (!current || typeof current !== 'object') return undefined;
        current = current[k];
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
  },
}));
