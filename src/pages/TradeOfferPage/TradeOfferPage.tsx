import React from 'react';
import { Link } from 'react-router-dom';
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
          <Link to="/trades" className="trade-back-btn">
            <ChevronLeftIcon size={16} />
            <span>{t('offer.backToTrades')}</span>
          </Link>
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
