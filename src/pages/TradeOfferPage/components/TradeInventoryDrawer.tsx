import React from 'react';
import { UserIcon, BookOpenIcon, SearchIcon, CheckIcon } from '../../../components/icons';
import type { Book } from '../../../types/book';
import type { TradePartner } from '../../../types/trade';
import { BookCover, EmptyState } from '../../../components/ui';
import { useTranslation } from '../../../i18n';

interface TradeInventoryDrawerProps {
  inventoryTab: 'my' | 'partner';
  setInventoryTab: (tab: 'my' | 'partner') => void;
  myBooksCount: number;
  partnerBooksCount: number;
  selectedPartner: TradePartner | null;
  searchFilter: string;
  setSearchFilter: (query: string) => void;
  loading: boolean;
  filteredInventoryBooks: Book[];
  offeredBookIds: string[];
  targetBookIds: string[];
  toggleOfferedBook: (bookId: string) => void;
  toggleTargetBook: (bookId: string) => void;
}

export const TradeInventoryDrawer: React.FC<TradeInventoryDrawerProps> = ({
  inventoryTab,
  setInventoryTab,
  myBooksCount,
  partnerBooksCount,
  selectedPartner,
  searchFilter,
  setSearchFilter,
  loading,
  filteredInventoryBooks,
  offeredBookIds,
  targetBookIds,
  toggleOfferedBook,
  toggleTargetBook,
}) => {
  const { t } = useTranslation();
  const partnerName = selectedPartner?.username || t('common.partner').toLowerCase();

  return (
    <div className="steam-inventory-box">
      <div className="inventory-tabs">
        <button
          type="button"
          className={`inventory-tab-btn ${inventoryTab === 'my' ? 'active' : ''}`}
          onClick={() => setInventoryTab('my')}
        >
          <UserIcon size={18} />
          <span>{t('offer.drawerYourTab', { count: myBooksCount })}</span>
        </button>

        <button
          type="button"
          className={`inventory-tab-btn ${inventoryTab === 'partner' ? 'active' : ''}`}
          onClick={() => setInventoryTab('partner')}
        >
          <BookOpenIcon size={18} />
          <span>
            {t('offer.drawerPartnerTab', { username: partnerName, count: partnerBooksCount })}
          </span>
        </button>
      </div>

      {/* Search bar inside inventory */}
      <div className="inventory-toolbar">
        <div className="inventory-search-wrap">
          <SearchIcon size={16} className="inventory-search-icon" />
          <input
            type="text"
            placeholder={
              inventoryTab === 'my'
                ? t('offer.drawerSearchMy')
                : t('offer.drawerSearchPartner', { username: partnerName })
            }
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="inventory-search-input"
          />
        </div>
        <span style={{ fontSize: '0.85rem', color: '#666660' }}>
          {t('offer.drawerHint')}
        </span>
      </div>

      {/* Book Cards Grid */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666660' }}>
          {t('common.loading')}
        </div>
      ) : filteredInventoryBooks.length === 0 ? (
        <EmptyState
          compact
          icon={<BookOpenIcon size={32} />}
          title={inventoryTab === 'my' ? t('offer.drawerEmptyMyTitle') : t('offer.drawerEmptyPartnerTitle')}
          description={
            inventoryTab === 'my'
              ? t('offer.drawerEmptyMyDesc')
              : t('offer.drawerEmptyPartnerDesc')
          }
        />
      ) : (
        <div className="inventory-grid">
          {filteredInventoryBooks.map((book) => {
            const isSelected =
              inventoryTab === 'my'
                ? offeredBookIds.includes(book.id)
                : targetBookIds.includes(book.id);

            return (
              <div
                key={book.id}
                className={`inventory-card ${isSelected ? 'in-trade' : ''}`}
                onClick={() => {
                  if (inventoryTab === 'my') {
                    toggleOfferedBook(book.id);
                  } else {
                    toggleTargetBook(book.id);
                  }
                }}
              >
                {isSelected && (
                  <span className="inventory-card-badge">
                    <span style={{ display: 'inline-flex', marginRight: 2 }}>
                      <CheckIcon size={12} />
                    </span>
                    {t('offer.inTradeBadge')}
                  </span>
                )}

                <BookCover
                  coverURL={book.coverURL}
                  title={book.title}
                  className="inventory-card-cover"
                  iconSize={32}
                />

                <h4 className="inventory-card-title">{book.title}</h4>
                <p className="inventory-card-author">{book.author}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TradeInventoryDrawer;
