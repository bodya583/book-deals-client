/**
 * Formats a publication year into user-friendly localized text.
 * Handles historical BC dates (e.g. -500 -> "500 г. до н. э.")
 * and standard modern years (e.g. 1997 -> "1997 г.").
 */
export function formatBookYear(year: number | string | null | undefined): string {
  if (year === null || year === undefined || year === '') return '';
  const num = typeof year === 'number' ? year : parseInt(String(year).trim(), 10);
  if (isNaN(num)) return '';

  if (num < 0) {
    return `${Math.abs(num)} г. до н. э.`;
  }
  return `${num} г.`;
}
