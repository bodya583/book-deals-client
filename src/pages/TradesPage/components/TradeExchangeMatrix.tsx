import React from 'react';
import type { Book } from '../../../types/book';
import { ArrowLeftRightIcon } from '../../../components/icons';
import { BookCover } from '../../../components/ui';

interface TradeExchangeMatrixProps {
  myBooksToGive: Book[];
  myBooksToReceive: Book[];
}

export const TradeExchangeMatrix: React.FC<TradeExchangeMatrixProps> = ({
  myBooksToGive,
  myBooksToReceive,
}) => {
  return (
    <div className="trade-exchange-row">
      {/* Left: What I Give */}
      <div className="trade-exchange-side">
        <div className="trade-side-label" style={{ color: '#b91c1c' }}>
          <span>Вы отдаёте:</span>
          <span>({myBooksToGive.length})</span>
        </div>
        <div className="trade-items-preview-grid">
          {myBooksToGive.length === 0 ? (
            <span style={{ fontSize: '0.85rem', color: '#888880', fontStyle: 'italic' }}>
              Ничего не отдаете (дар от партнера)
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

      {/* Center: Exchange Icon */}
      <div className="trade-direction-divider" title="Предметы на предметы, без валюты">
        <ArrowLeftRightIcon size={20} />
      </div>

      {/* Right: What I Receive */}
      <div className="trade-exchange-side">
        <div className="trade-side-label" style={{ color: '#15803d' }}>
          <span>Вы получаете:</span>
          <span>({myBooksToReceive.length})</span>
        </div>
        <div className="trade-items-preview-grid">
          {myBooksToReceive.length === 0 ? (
            <span style={{ fontSize: '0.85rem', color: '#888880', fontStyle: 'italic' }}>
              Ничего не запрашиваете (подарок партнеру)
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
