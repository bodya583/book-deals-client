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
  const {
    trade,
    loading,
    actionLoading,
    toasts,
    removeToast,
    rejectModalOpen,
    setRejectModalOpen,
    currentUser,
    messages,
    messagesLoading,
    messageText,
    setMessageText,
    sendingMessage,
    messagesEndRef,
    handover,
    lastLocationProposalId,
    lastTimeProposalId,
    handleSendMessage,
    handleSendCustomMessage,
    handleAcceptLocation,
    handleAcceptTime,
    handleAccept,
    handleComplete,
    handleReject,
    handleConfirmReject,
    handleCancel,
    formatDate,
    formatMessageTime,
  } = useTradeDetails();

  if (loading) {
    return (
      <div className="trades-page-container">
        <div style={{ textAlign: 'center', padding: '4rem', color: '#666660' }}>
          {t('common.loading')}
        </div>
      </div>
    );
  }

  if (!trade) {
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

  const partner = trade.isSender ? trade.receiver : trade.sender;
  const myBooksToGive = trade.isSender ? trade.offeredBooks : trade.requestedBooks;
  const myBooksToReceive = trade.isSender ? trade.requestedBooks : trade.offeredBooks;

  return (
    <div className="trades-page-container">
      <Toast toasts={toasts} onRemove={removeToast} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Main Trade Details Card */}
        <div className="trade-card" style={{ padding: '2rem' }}>
          <TradeDetailsHeader trade={trade} partner={partner} formatDate={formatDate} />

          <SteamTradeMatrix
            myBooksToGive={myBooksToGive}
            myBooksToReceive={myBooksToReceive}
          />

          <TradeDetailsFooterActions
            trade={trade}
            partner={partner}
            actionLoading={actionLoading}
            onAccept={handleAccept}
            onReject={handleReject}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        </div>

        {/* Trade Chat Section */}
        <TradeChatSection
          partner={partner}
          handover={handover}
          messages={messages}
          messagesLoading={messagesLoading}
          currentUser={currentUser}
          lastLocationProposalId={lastLocationProposalId}
          lastTimeProposalId={lastTimeProposalId}
          messagesEndRef={messagesEndRef}
          sendingMessage={sendingMessage}
          messageText={messageText}
          setMessageText={setMessageText}
          handleSendMessage={handleSendMessage}
          handleSendCustomMessage={handleSendCustomMessage}
          handleAcceptLocation={handleAcceptLocation}
          handleAcceptTime={handleAcceptTime}
          formatMessageTime={formatMessageTime}
        />
      </div>

      <RejectTradeModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
        loading={actionLoading}
      />
    </div>
  );
};

export default TradeDetailsPage;
