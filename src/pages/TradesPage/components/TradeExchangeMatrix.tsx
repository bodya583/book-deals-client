import React from 'react';
import type { Book } from '../../../types/book';
import { ArrowLeftRightIcon } from '../../../components/icons';
import { BookCover } from '../../../components/ui';
import { useTranslation } from '../../../i18n';

interface TradeExchangeMatrixProps {
  myBooksToGive: Book[];
  myBooksToReceive: Book[];
}

export const TradeExchangeMatrix: React.FC<TradeExchangeMatrixProps> = ({
  myBooksToGive,
  myBooksToReceive,
}) => {
  const { t } = useTranslation();

  return (
    <div className="trade-exchange-row">
      <div className="trade-exchange-side">
        <div className="trade-side-label" style={{ color: '#b91c1c' }}>
          <span>{t('trades.card.youGive')}</span>
          <span>({myBooksToGive.length})</span>
        </div>
        <div className="trade-items-preview-grid">
          {myBooksToGive.length === 0 ? (
            <span style={{ fontSize: '0.85rem', color: '#888880', fontStyle: 'italic' }}>
              {t('trades.card.noBooksGivenGift')}
            </span>
          ) : (
            myBooksToGive.map((book) => (
              <div key={book.id} className="trade-mini-book" title={`${book.title} — ${book.author}`}>
                <BookCover
                  coverURL={book.coverURL}
                  title={book.title}
                  width={32}
                  height={44}
                  iconSize={14}
                  className="trade-mini-cover"
                />
                <div className="trade-mini-info">
                  <span className="trade-mini-title">{book.title}</span>
                  <span className="trade-mini-author">{book.author}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="trade-direction-divider" title={t('trades.card.exchangeTooltip')}>
        <ArrowLeftRightIcon size={20} />
      </div>

      <div className="trade-exchange-side">
        <div className="trade-side-label" style={{ color: '#15803d' }}>
          <span>{t('trades.card.youGet')}</span>
          <span>({myBooksToReceive.length})</span>
        </div>
        <div className="trade-items-preview-grid">
          {myBooksToReceive.length === 0 ? (
            <span style={{ fontSize: '0.85rem', color: '#888880', fontStyle: 'italic' }}>
              {t('trades.card.noBooksRequestedGift')}
            </span>
          ) : (
            myBooksToReceive.map((book) => (
              <div key={book.id} className="trade-mini-book" title={`${book.title} — ${book.author}`}>
                <BookCover
                  coverURL={book.coverURL}
                  title={book.title}
                  width={32}
                  height={44}
                  iconSize={14}
                  className="trade-mini-cover"
                />
                <div className="trade-mini-info">
                  <span className="trade-mini-title">{book.title}</span>
                  <span className="trade-mini-author">{book.author}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeExchangeMatrix;
