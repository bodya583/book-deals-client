import React from 'react';
import { UserIcon, BookOpenIcon, SearchIcon, CheckIcon } from '../../../components/icons';
import type { TradePartner } from '../../../types/trade';
import { BookCover, EmptyState } from '../../../components/ui';
import { useTranslation } from '../../../i18n';
import type {
  TradeOfferBooksController,
  TradeOfferInventoryController,
} from '../hooks/useTradeOffer';

interface TradeInventoryDrawerProps {
  partner: TradePartner | null;
  inventory: TradeOfferInventoryController;
  books: TradeOfferBooksController;
}

export const TradeInventoryDrawer: React.FC<TradeInventoryDrawerProps> = ({
  partner,
  inventory,
  books,
}) => {
  const { t } = useTranslation();
  const partnerName = partner?.username || t('common.partner').toLowerCase();

  return (
    <div className="steam-inventory-box">
      <div className="inventory-tabs">
        <button
          type="button"
          className={`inventory-tab-btn ${inventory.tab === 'my' ? 'active' : ''}`}
          onClick={() => inventory.setTab('my')}
        >
          <UserIcon size={18} />
          <span>{t('offer.drawerYourTab', { count: books.myCount })}</span>
        </button>

        <button
          type="button"
          className={`inventory-tab-btn ${inventory.tab === 'partner' ? 'active' : ''}`}
          onClick={() => inventory.setTab('partner')}
        >
          <BookOpenIcon size={18} />
          <span>
            {t('offer.drawerPartnerTab', { username: partnerName, count: books.partnerCount })}
          </span>
        </button>
      </div>

      <div className="inventory-toolbar">
        <div className="inventory-search-wrap">
          <SearchIcon size={16} className="inventory-search-icon" />
          <input
            type="text"
            placeholder={
              inventory.tab === 'my'
                ? t('offer.drawerSearchMy')
                : t('offer.drawerSearchPartner', { username: partnerName })
            }
            value={inventory.searchFilter}
            onChange={(e) => inventory.setSearchFilter(e.target.value)}
            className="inventory-search-input"
          />
        </div>
        <span style={{ fontSize: '0.85rem', color: '#666660' }}>{t('offer.drawerHint')}</span>
      </div>

      {inventory.loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666660' }}>
          {t('common.loading')}
        </div>
      ) : inventory.filtered.length === 0 ? (
        <EmptyState
          compact
          icon={<BookOpenIcon size={32} />}
          title={inventory.tab === 'my' ? t('offer.drawerEmptyMyTitle') : t('offer.drawerEmptyPartnerTitle')}
          description={
            inventory.tab === 'my' ? t('offer.drawerEmptyMyDesc') : t('offer.drawerEmptyPartnerDesc')
          }
        />
      ) : (
        <div className="inventory-grid">
          {inventory.filtered.map((book) => {
            const isSelected =
              inventory.tab === 'my'
                ? books.offeredIds.includes(book.id)
                : books.targetIds.includes(book.id);

            return (
              <div
                key={book.id}
                className={`inventory-card ${isSelected ? 'in-trade' : ''}`}
                onClick={() =>
                  inventory.tab === 'my'
                    ? books.toggleOffered(book.id)
                    : books.toggleTarget(book.id)
                }
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
