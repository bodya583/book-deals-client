import React from 'react';
import { ChevronLeftIcon } from '../../components/icons';
import { Toast } from '../../components/Toast';
import { useTradeOffer, computeBooksHash } from './hooks/useTradeOffer';
import { TradeOfferPartnerHeader } from './components/TradeOfferPartnerHeader';
import { TradeOfferTable } from './components/TradeOfferTable';
import { TradeInventoryDrawer } from './components/TradeInventoryDrawer';
import { TradeOfferFooter } from './components/TradeOfferFooter';
import { useTranslation } from '../../i18n';
import './TradeOfferPage.css';

export { computeBooksHash };

export const TradeOfferPage: React.FC = () => {
  const { t } = useTranslation();
  const { meta, partner, books, inventory, composer, toasts } = useTradeOffer();

  return (
    <div className="trades-page">
      <Toast toasts={toasts.items} onRemove={toasts.remove} />

      <div className="trades-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="trade-back-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', padding: 0 }}
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = '/trades';
              }
            }}
          >
            <ChevronLeftIcon size={16} />
            <span>{t('offer.backToTrades')}</span>
          </button>
        </div>

        <TradeOfferPartnerHeader
          selectedPartner={partner.selected}
          partnerBooksCount={books.partnerCount}
        />

        <TradeOfferTable
          selectedPartner={partner.selected}
          offeredBookIds={books.offeredIds}
          targetBookIds={books.targetIds}
          stagedOfferedBooks={books.stagedOffered}
          stagedTargetBooks={books.stagedTarget}
          toggleOfferedBook={books.toggleOffered}
          toggleTargetBook={books.toggleTarget}
        />

        <TradeInventoryDrawer
          partner={partner.selected}
          inventory={inventory}
          books={books}
        />

        <TradeOfferFooter
          message={composer.message}
          setMessage={composer.setMessage}
          offeredCount={books.offeredIds.length}
          targetCount={books.targetIds.length}
          isTradeUnchanged={meta.isTradeUnchanged}
          submitting={meta.submitting}
          counterTradeId={meta.counterTradeId}
          onSubmit={composer.submit}
        />
      </div>
    </div>
  );
};

export default TradeOfferPage;
