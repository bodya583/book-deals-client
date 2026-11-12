import type { TranslationDictionary } from '../types';
import { common } from './en/common';
import { books } from './en/books';
import { booksUi } from './en/booksUi';
import { trades } from './en/trades';
import { data } from './en/data';

export const en: TranslationDictionary = {
  ...common,
  ...books,
  ...booksUi,
  ...trades,
  ...data,
};
