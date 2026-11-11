import { useCallback } from 'react';
import { useI18nStore, dictionaries } from './i18nStore';

const lookupCaseInsensitive = (map: Record<string, string>, raw?: string | null): string => {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (map[trimmed]) return map[trimmed];
  const lower = trimmed.toLowerCase();
  for (const [key, val] of Object.entries(map)) {
    if (key.toLowerCase() === lower) {
      return val;
    }
  }
  return raw;
};

export const useTranslation = () => {
  const language = useI18nStore((s) => s.language);
  const setLanguage = useI18nStore((s) => s.setLanguage);
  const toggleLanguage = useI18nStore((s) => s.toggleLanguage);
  const t = useI18nStore((s) => s.t);
  const dict = dictionaries[language] || dictionaries.uk;

  const tGenre = useCallback(
    (genreName?: string | null): string => lookupCaseInsensitive(dict.data.genres, genreName),
    [dict]
  );

  const tBookLanguage = useCallback(
    (bookLang?: string | null): string => lookupCaseInsensitive(dict.data.languages, bookLang),
    [dict]
  );

  const tCity = useCallback(
    (city?: string | null): string => lookupCaseInsensitive(dict.data.cities, city),
    [dict]
  );

  const tApiError = useCallback(
    (errorMsg?: string | null, fallbackKey = 'common.error'): string => {
      if (!errorMsg) return t(fallbackKey);
      const mapped = dict.data.serverErrors[errorMsg];
      if (mapped) return mapped;

      if (/^Offered book .* was not found/i.test(errorMsg)) {
        return dict.data.serverErrors.ERR_OFFERED_NOT_FOUND || errorMsg;
      }
      if (/^You do not own the offered book/i.test(errorMsg)) {
        return dict.data.serverErrors.ERR_OFFERED_NOT_OWNED || errorMsg;
      }
      if (/^Requested book .* was not found/i.test(errorMsg)) {
        return dict.data.serverErrors.ERR_TARGET_NOT_FOUND || errorMsg;
      }
      if (/^Requested book .* does not belong to the trade partner/i.test(errorMsg)) {
        return dict.data.serverErrors.ERR_TARGET_NOT_PARTNER || errorMsg;
      }
      if (/^Requested book .* is not open for trade/i.test(errorMsg)) {
        return dict.data.serverErrors.ERR_TARGET_CLOSED || errorMsg;
      }
      if (/^Cannot (accept|complete|reject|cancel|modify) a trade with status/i.test(errorMsg)) {
        return dict.data.serverErrors.ERR_TRADE_INVALID_STATUS || errorMsg;
      }
      if (/^Only an agreed trade can be completed/i.test(errorMsg)) {
        return dict.data.serverErrors.ERR_COMPLETE_ONLY_AGREED || errorMsg;
      }
      return errorMsg;
    },
    [dict, t]
  );

  return {
    language,
    setLanguage,
    toggleLanguage,
    t,
    dict,
    tGenre,
    tBookLanguage,
    tCity,
    tApiError,
  };
};

export { useI18nStore, translate, getDictionary, dictionaries } from './i18nStore';
export type { SupportedLanguage, TranslationDictionary } from './types';
