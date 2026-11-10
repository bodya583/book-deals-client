import React from 'react';
import type { Book } from '../../../types/book';
import { BookOpenIcon, ArrowLeftRightIcon } from '../../../components/icons';

interface SteamTradeMatrixProps {
  myBooksToGive: Book[];
  myBooksToReceive: Book[];
}

export const SteamTradeMatrix: React.FC<SteamTradeMatrixProps> = ({
  myBooksToGive,
  myBooksToReceive,
}) => {
  return (
    <div className="steam-trade-table">
      <div className="steam-table-header">
        <span className="steam-table-title">Состав обмена</span>
      </div>

      <div className="steam-matrix-grid">
        {/* What I give */}
        <div className="steam-side-box">
          <div className="steam-side-header">
            <span className="steam-side-label" style={{ color: '#dc2626' }}>
              Вы отдаёте ({myBooksToGive.length})
            </span>
          </div>
          {myBooksToGive.length === 0 ? (
            <div className="steam-slot-empty">Ни одной книги</div>
          ) : (
            <div className="steam-slots-container">
              {myBooksToGive.map((book) => (
                <div key={book.id} className="steam-slot-item" style={{ cursor: 'default' }}>
                  {book.coverURL ? (
                    <img src={book.coverURL} alt={book.title} className="steam-slot-cover" />
                  ) : (
                    <div className="steam-slot-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpenIcon size={24} color="#64748b" />
                    </div>
                  )}
                  <span className="steam-slot-title">{book.title}</span>
                  <span style={{ fontSize: '0.72rem', color: '#666660' }}>{book.author}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Center */}
        <div className="steam-matrix-divider">
          <div className="steam-exchange-bubble">
            <ArrowLeftRightIcon size={22} />
          </div>
        </div>

        {/* What I receive */}
        <div className="steam-side-box">
          <div className="steam-side-header">
            <span className="steam-side-label" style={{ color: '#2d6a4f' }}>
              Вы получаете ({myBooksToReceive.length})
            </span>
          </div>
          {myBooksToReceive.length === 0 ? (
            <div className="steam-slot-empty">Ни одной книги</div>
          ) : (
            <div className="steam-slots-container">
              {myBooksToReceive.map((book) => (
                <div key={book.id} className="steam-slot-item" style={{ cursor: 'default' }}>
                  {book.coverURL ? (
                    <img src={book.coverURL} alt={book.title} className="steam-slot-cover" />
                  ) : (
                    <div className="steam-slot-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpenIcon size={24} color="#64748b" />
                    </div>
                  )}
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
