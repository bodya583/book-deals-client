import React from 'react';
import { TradeIcon, ArrowLeftRightIcon, BookOpenIcon } from '../../../components/icons';
import type { Book } from '../../../types/book';
import type { TradePartner } from '../../../types/trade';

interface TradeOfferTableProps {
  selectedPartner: TradePartner | null;
  offeredBookIds: string[];
  targetBookIds: string[];
  stagedOfferedBooks: Book[];
  stagedTargetBooks: Book[];
  toggleOfferedBook: (bookId: string) => void;
  toggleTargetBook: (bookId: string) => void;
}

export const TradeOfferTable: React.FC<TradeOfferTableProps> = ({
  selectedPartner,
  offeredBookIds,
  targetBookIds,
  stagedOfferedBooks,
  stagedTargetBooks,
  toggleOfferedBook,
  toggleTargetBook,
}) => {
  return (
    <div className="steam-trade-table">
      <div className="steam-table-header">
        <h2 className="steam-table-title">
          <TradeIcon size={20} />
          <span>Стол обмена</span>
        </h2>
      </div>

      <div className="steam-matrix-grid">
        {/* Left Box: Your items to give */}
        <div className="steam-side-box">
          <div className="steam-side-header">
            <span className="steam-side-label">Ваше предложение (Вы отдаёте)</span>
            <span className="steam-side-count">{offeredBookIds.length} выбрано</span>
          </div>

          {stagedOfferedBooks.length === 0 ? (
            <div className="steam-slot-empty">
              <BookOpenIcon size={28} />
              <span>Перетащите или нажмите на книги из вашего инвентаря ниже, чтобы предложить их</span>
            </div>
          ) : (
            <div className="steam-slots-container">
              {stagedOfferedBooks.map((book) => (
                <div
                  key={book.id}
                  className="steam-slot-item"
                  onClick={() => toggleOfferedBook(book.id)}
                  title="Нажмите, чтобы убрать из предложения"
                >
                  <div className="steam-remove-overlay">
                    <span>Убрать</span>
                  </div>
                  {book.coverURL ? (
                    <img src={book.coverURL} alt={book.title} className="steam-slot-cover" />
                  ) : (
                    <div
                      className="steam-slot-cover"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <BookOpenIcon size={24} color="#64748b" />
                    </div>
                  )}
                  <span className="steam-slot-title">{book.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Center: Direction exchange indicator */}
        <div className="steam-matrix-divider">
          <div className="steam-exchange-bubble">
            <ArrowLeftRightIcon size={22} />
          </div>
        </div>

        {/* Right Box: Partner's items to receive */}
        <div className="steam-side-box">
          <div className="steam-side-header">
            <span className="steam-side-label">
              Предложение партнера (@{selectedPartner?.username || 'читатель'})
            </span>
            <span className="steam-side-count" style={{ color: '#4ade80' }}>
              {targetBookIds.length} выбрано
            </span>
          </div>

          {stagedTargetBooks.length === 0 ? (
            <div className="steam-slot-empty">
              <BookOpenIcon size={28} />
              <span>Выберите книги партнера из вкладки «Инвентарь партнера»</span>
            </div>
          ) : (
            <div className="steam-slots-container">
              {stagedTargetBooks.map((book) => (
                <div
                  key={book.id}
                  className="steam-slot-item"
                  onClick={() => toggleTargetBook(book.id)}
                  title="Нажмите, чтобы убрать из запроса"
                >
                  <div className="steam-remove-overlay">
                    <span>Убрать</span>
                  </div>
                  {book.coverURL ? (
                    <img src={book.coverURL} alt={book.title} className="steam-slot-cover" />
                  ) : (
                    <div
                      className="steam-slot-cover"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <BookOpenIcon size={24} color="#64748b" />
                    </div>
                  )}
                  <span className="steam-slot-title">{book.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
