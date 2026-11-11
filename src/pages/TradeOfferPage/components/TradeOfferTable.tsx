import React from 'react';
import { TradeIcon, ArrowLeftRightIcon, BookOpenIcon } from '../../../components/icons';
import type { Book } from '../../../types/book';
import type { TradePartner } from '../../../types/trade';
import { BookCover } from '../../../components/ui';
import { useTranslation } from '../../../i18n';

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
  const { t } = useTranslation();

  return (
    <div className="steam-trade-table">
      <div className="steam-table-header">
        <h2 className="steam-table-title">
          <TradeIcon size={20} />
          <span>{t('offer.tableTitle')}</span>
        </h2>
      </div>

      <div className="steam-matrix-grid">
        {/* Left Box: Your items to give */}
        <div className="steam-side-box">
          <div className="steam-side-header">
            <span className="steam-side-label">{t('offer.yourSideLabel')}</span>
            <span className="steam-side-count">{t('offer.selectedCount', { count: offeredBookIds.length })}</span>
          </div>

          {stagedOfferedBooks.length === 0 ? (
            <div className="steam-slot-empty">
              <BookOpenIcon size={28} />
              <span>{t('offer.emptySlotsYour')}</span>
            </div>
          ) : (
            <div className="steam-slots-container">
              {stagedOfferedBooks.map((book) => (
                <div
                  key={book.id}
                  className="steam-slot-item"
                  onClick={() => toggleOfferedBook(book.id)}
                  title={t('offer.removeOfferTooltip')}
                >
                  <div className="steam-remove-overlay">
                    <span>{t('offer.removeSlot')}</span>
                  </div>
                  <BookCover
                    coverURL={book.coverURL}
                    title={book.title}
                    className="steam-slot-cover"
                    iconSize={24}
                  />
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
              {t('offer.theirSideLabel', { username: selectedPartner?.username || t('common.reader') })}
            </span>
            <span className="steam-side-count" style={{ color: '#4ade80' }}>
              {t('offer.selectedCount', { count: targetBookIds.length })}
            </span>
          </div>

          {stagedTargetBooks.length === 0 ? (
            <div className="steam-slot-empty">
              <BookOpenIcon size={28} />
              <span>{t('offer.emptySlotsTheir')}</span>
            </div>
          ) : (
            <div className="steam-slots-container">
              {stagedTargetBooks.map((book) => (
                <div
                  key={book.id}
                  className="steam-slot-item"
                  onClick={() => toggleTargetBook(book.id)}
                  title={t('offer.removeTargetTooltip')}
                >
                  <div className="steam-remove-overlay">
                    <span>{t('offer.removeSlot')}</span>
                  </div>
                  <BookCover
                    coverURL={book.coverURL}
                    title={book.title}
                    className="steam-slot-cover"
                    iconSize={24}
                  />
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

export default TradeOfferTable;
