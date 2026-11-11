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
  const {
    counterTradeId,
    selectedPartner,
    partnerBooks,
    myBooks,
    offeredBookIds,
    targetBookIds,
    stagedOfferedBooks,
    stagedTargetBooks,
    toggleOfferedBook,
    toggleTargetBook,
    inventoryTab,
    setInventoryTab,
    searchFilter,
    setSearchFilter,
    filteredInventoryBooks,
    message,
    setMessage,
    isTradeUnchanged,
    loading,
    submitting,
    toasts,
    removeToast,
    handleSubmitTrade,
  } = useTradeOffer();

  return (
    <div className="trades-page">
      <Toast toasts={toasts} onRemove={removeToast} />

      <div className="trades-container">
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/trades" className="trade-back-btn">
            <ChevronLeftIcon size={16} />
            <span>{t('offer.backToTrades')}</span>
          </Link>
        </div>

        {/* Partner Info Banner */}
        <TradeOfferPartnerHeader
          selectedPartner={selectedPartner}
          partnerBooksCount={partnerBooks.length}
        />

        {/* Trade Table Matrix */}
        <TradeOfferTable
          selectedPartner={selectedPartner}
          offeredBookIds={offeredBookIds}
          targetBookIds={targetBookIds}
          stagedOfferedBooks={stagedOfferedBooks}
          stagedTargetBooks={stagedTargetBooks}
          toggleOfferedBook={toggleOfferedBook}
          toggleTargetBook={toggleTargetBook}
        />

        {/* Inventory Drawer */}
        <TradeInventoryDrawer
          inventoryTab={inventoryTab}
          setInventoryTab={setInventoryTab}
          myBooksCount={myBooks.length}
          partnerBooksCount={partnerBooks.length}
          selectedPartner={selectedPartner}
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          loading={loading}
          filteredInventoryBooks={filteredInventoryBooks}
          offeredBookIds={offeredBookIds}
          targetBookIds={targetBookIds}
          toggleOfferedBook={toggleOfferedBook}
          toggleTargetBook={toggleTargetBook}
        />

        {/* Action Footer & Submit */}
        <TradeOfferFooter
          message={message}
          setMessage={setMessage}
          offeredCount={offeredBookIds.length}
          targetCount={targetBookIds.length}
          isTradeUnchanged={isTradeUnchanged}
          submitting={submitting}
          counterTradeId={counterTradeId}
          onSubmit={handleSubmitTrade}
        />
      </div>
    </div>
  );
};

export default TradeOfferPage;
