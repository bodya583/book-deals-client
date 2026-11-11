import { translate, type SupportedLanguage } from '../i18n';

/**
 * Formats a publication year into user-friendly localized text.
 * Handles historical BC dates and standard modern years using i18n locale keys.
 */
export function formatBookYear(
  year: number | string | null | undefined,
  lang?: string
): string {
  if (year === null || year === undefined || year === '') return '';
  const num = typeof year === 'number' ? year : parseInt(String(year).trim(), 10);
  if (isNaN(num)) return '';

  const override = lang === 'en' || lang === 'uk' ? (lang as SupportedLanguage) : undefined;

  if (num < 0) {
    const suffix = translate('bookCard.bcSuffix', undefined, override);
    return `${Math.abs(num)} ${suffix}`.trim();
  }

  const suffix = translate('bookCard.yearSuffix', undefined, override);
  return suffix ? `${num} ${suffix}` : `${num}`;
}
