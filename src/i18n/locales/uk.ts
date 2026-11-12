import type { TranslationDictionary } from '../types';
import { common } from './uk/common';
import { books } from './uk/books';
import { booksUi } from './uk/booksUi';
import { trades } from './uk/trades';
import { data } from './uk/data';

export const uk: TranslationDictionary = {
  ...common,
  ...books,
  ...booksUi,
  ...trades,
  ...data,
};
