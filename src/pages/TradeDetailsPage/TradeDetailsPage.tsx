import React from 'react';
import { Link } from 'react-router-dom';
import { Toast } from '../../components/Toast';
import RejectTradeModal from '../../components/RejectTradeModal';
import { useTradeDetails } from './hooks/useTradeDetails';
import { TradeDetailsHeader } from './components/TradeDetailsHeader';
import { SteamTradeMatrix } from './components/SteamTradeMatrix';
import { TradeDetailsFooterActions } from './components/TradeDetailsFooterActions';
import { TradeChatSection } from './components/TradeChatSection';
import { useTranslation } from '../../i18n';
import './TradeDetailsPage.css';

export const TradeDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, trade, chat, handover, actions, toasts } = useTradeDetails();

  if (trade.loading) {
    return (
      <div className="trades-page-container">
        <div style={{ textAlign: 'center', padding: '4rem', color: '#666660' }}>
          {t('common.loading')}
        </div>
      </div>
    );
  }

  if (!trade.data) {
    return (
      <div className="trades-page-container">
        <div style={{ textAlign: 'center', padding: '4rem', color: '#666660' }}>
          <p>{t('common.notFound')}</p>
          <Link to="/trades" className="btn-trade-details" style={{ marginTop: '1rem' }}>
            {t('tradeDetails.backToTrades')}
          </Link>
        </div>
      </div>
    );
  }

  const tradeItem = trade.data;
  const partner = tradeItem.isSender ? tradeItem.receiver : tradeItem.sender;
  const myBooksToGive = tradeItem.isSender ? tradeItem.offeredBooks : tradeItem.requestedBooks;
  const myBooksToReceive = tradeItem.isSender ? tradeItem.requestedBooks : tradeItem.offeredBooks;

  return (
    <div className="trades-page-container">
      <Toast toasts={toasts.items} onRemove={toasts.remove} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="trade-card" style={{ padding: '2rem' }}>
          <TradeDetailsHeader
            trade={tradeItem}
            partner={partner}
            formatDate={trade.formatDate}
          />

          <SteamTradeMatrix
            myBooksToGive={myBooksToGive}
            myBooksToReceive={myBooksToReceive}
          />

          <TradeDetailsFooterActions
            trade={tradeItem}
            partner={partner}
            actionLoading={trade.actionLoading}
            onAccept={actions.accept}
            onReject={actions.openReject}
            onComplete={actions.complete}
            onCancel={actions.cancel}
          />
        </div>

        <TradeChatSection
          partner={partner}
          currentUser={currentUser}
          chat={chat}
          handover={handover}
          formatMessageTime={trade.formatMessageTime}
        />
      </div>

      <RejectTradeModal
        isOpen={actions.rejectModalOpen}
        onClose={() => actions.setRejectModalOpen(false)}
        onConfirm={actions.confirmReject}
        loading={trade.actionLoading}
      />
    </div>
  );
};

export default TradeDetailsPage;
