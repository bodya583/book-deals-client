import React from 'react';
import { Link } from 'react-router-dom';
import { TradeIcon, BookOpenIcon } from '../../components/icons';
import Toast from '../../components/Toast';
import RejectTradeModal from '../../components/RejectTradeModal';
import { useTradesPage } from './hooks/useTradesPage';
import { TradesSidebar } from './components/TradesSidebar';
import { TradesToolbar } from './components/TradesToolbar';
import { TradeCard } from './components/TradeCard';
import { EmptyState } from '../../components/ui';
import { useTranslation } from '../../i18n';
import './TradesPage.css';

export const TradesPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, navigation, list, actions, toasts } = useTradesPage();
  const { currentTab } = navigation;

  return (
    <div className="trades-page">
      <Toast toasts={toasts.items} onRemove={toasts.remove} />

      <div className="trades-container">
        <div className="trades-header">
          <div className="trades-header-left">
            <h1 className="trades-header-title">
              <TradeIcon size={28} />
              <span>{t('trades.title')}</span>
            </h1>
            <p className="trades-header-subtitle">{t('trades.subtitle')}</p>
          </div>
        </div>

        <div className="trades-workspace-layout">
          <TradesSidebar
            currentTab={currentTab}
            counts={list.counts}
            onTabChange={navigation.changeTab}
          />

          <main className="trades-main-area">
            <TradesToolbar
              searchQuery={list.searchQuery}
              onSearchChange={list.setSearchQuery}
              sortBy={list.sortBy}
              onSortChange={list.setSortBy}
            />

            <div className="trades-section-heading">
              <h2 className="trades-section-title">
                {currentTab === 'requests' && t('trades.tabs.requests')}
                {currentTab === 'agreed' && t('trades.tabs.agreed')}
                {currentTab === 'completed' && t('trades.tabs.completed')}
              </h2>
              <span className="trades-section-counter">{list.filtered.length}</span>
            </div>

            {list.loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#666660' }}>
                {t('common.loading')}
              </div>
            ) : list.filtered.length === 0 ? (
              <EmptyState
                icon={<TradeIcon size={32} />}
                title={
                  currentTab === 'requests'
                    ? t('trades.empty.requestsTitle')
                    : currentTab === 'agreed'
                    ? t('trades.empty.agreedTitle')
                    : t('trades.empty.completedTitle')
                }
                description={
                  currentTab === 'requests'
                    ? t('trades.empty.requestsText')
                    : currentTab === 'agreed'
                    ? t('trades.empty.agreedText')
                    : t('trades.empty.completedText')
                }
                action={
                  <Link to="/books" className="btn-new-trade">
                    <BookOpenIcon size={18} />
                    <span>{t('trades.newTradeBtn')}</span>
                  </Link>
                }
              />
            ) : (
              <div className="trades-list">
                {list.filtered.map((trade) => (
                  <TradeCard
                    key={trade.id}
                    trade={trade}
                    currentUser={currentUser}
                    currentTab={currentTab}
                    badgeCount={actions.getBadgeCount(trade)}
                    actionLoading={actions.loadingId === trade.id}
                    formatDate={actions.formatDate}
                    actions={actions}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <RejectTradeModal
        isOpen={Boolean(actions.rejectModalTradeId)}
        onClose={() => actions.setRejectModalTradeId(null)}
        onConfirm={actions.confirmReject}
        loading={Boolean(actions.loadingId)}
      />
    </div>
  );
};

export default TradesPage;
