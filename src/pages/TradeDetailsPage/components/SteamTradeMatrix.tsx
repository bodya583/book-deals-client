import React from 'react';
import type { Book } from '../../../types/book';
import { ArrowLeftRightIcon } from '../../../components/icons';
import { BookCover } from '../../../components/ui';
import { useTranslation } from '../../../i18n';

interface SteamTradeMatrixProps {
  myBooksToGive: Book[];
  myBooksToReceive: Book[];
}

export const SteamTradeMatrix: React.FC<SteamTradeMatrixProps> = ({
  myBooksToGive,
  myBooksToReceive,
}) => {
  const { t } = useTranslation();

  return (
    <div className="steam-trade-table">
      <div className="steam-table-header">
        <span className="steam-table-title">{t('tradeDetails.matrixTitle')}</span>
      </div>

      <div className="steam-matrix-grid">
        <div className="steam-side-box">
          <div className="steam-side-header">
            <span className="steam-side-label" style={{ color: '#dc2626' }}>
              {t('trades.card.youGive')} ({myBooksToGive.length})
            </span>
          </div>
          {myBooksToGive.length === 0 ? (
            <div className="steam-slot-empty">
              {t('tradeDetails.noBooksLabel')}
            </div>
          ) : (
            <div className="steam-slots-container">
              {myBooksToGive.map((book) => (
                <div key={book.id} className="steam-slot-item" style={{ cursor: 'default' }}>
                  <BookCover
                    coverURL={book.coverURL}
                    title={book.title}
                    className="steam-slot-cover"
                    iconSize={24}
                  />
                  <span className="steam-slot-title">{book.title}</span>
                  <span style={{ fontSize: '0.72rem', color: '#666660' }}>{book.author}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="steam-matrix-divider">
          <div className="steam-exchange-bubble">
            <ArrowLeftRightIcon size={22} />
          </div>
        </div>

        <div className="steam-side-box">
          <div className="steam-side-header">
            <span className="steam-side-label" style={{ color: '#2d6a4f' }}>
              {t('trades.card.youGet')} ({myBooksToReceive.length})
            </span>
          </div>
          {myBooksToReceive.length === 0 ? (
            <div className="steam-slot-empty">
              {t('tradeDetails.noBooksLabel')}
            </div>
          ) : (
            <div className="steam-slots-container">
              {myBooksToReceive.map((book) => (
                <div key={book.id} className="steam-slot-item" style={{ cursor: 'default' }}>
                  <BookCover
                    coverURL={book.coverURL}
                    title={book.title}
                    className="steam-slot-cover"
                    iconSize={24}
                  />
                  <span className="steam-slot-title">{book.title}</span>
                  <span style={{ fontSize: '0.72rem', color: '#666660' }}>{book.author}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SteamTradeMatrix;
