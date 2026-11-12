import type { CommonSchema } from './types/common';
import type { BooksSchema } from './types/books';
import type { BooksUiSchema } from './types/booksUi';
import type { TradesSchema } from './types/trades';
import type { DataSchema } from './types/data';

export type SupportedLanguage = 'uk' | 'en';

export interface TranslationDictionary
  extends CommonSchema,
    BooksSchema,
    BooksUiSchema,
    TradesSchema,
    DataSchema {}
