import React from 'react';
import type { TabType } from '../hooks/useTradesPage';
import type { TradeCounts } from '../../../types/trade';
import { InboxIcon, HandshakeIcon, ArchiveIcon } from '../../../components/icons';
import { useTranslation } from '../../../i18n';

interface TradesSidebarProps {
  currentTab: TabType;
  counts: TradeCounts;
  onTabChange: (tab: TabType) => void;
}

export const TradesSidebar: React.FC<TradesSidebarProps> = ({
  currentTab,
  counts,
  onTabChange,
}) => {
  const { t } = useTranslation();
  const totalRequests = counts.requests ?? (counts.incoming + counts.outgoing);

  return (
    <aside className="trades-sidebar">
      <nav className="trades-sidebar-nav" aria-label="Категории обменов">
        <button
          type="button"
          className={`trades-sidebar-item ${currentTab === 'requests' ? 'active' : ''}`}
          onClick={() => onTabChange('requests')}
        >
          <div className="sidebar-item-left">
            <InboxIcon size={17} />
            <span>{t('trades.tabs.requests')}</span>
          </div>
          <span
            className={`sidebar-badge ${counts.incoming > 0 ? 'badge-highlight' : ''}`}
            title={
              counts.incoming > 0
                ? `${counts.incoming} требуют вашего ответа (всего: ${totalRequests})`
                : `Всего запросов: ${totalRequests}`
            }
          >
            {totalRequests}
          </span>
        </button>

        <button
          type="button"
          className={`trades-sidebar-item ${currentTab === 'agreed' ? 'active' : ''}`}
          onClick={() => onTabChange('agreed')}
        >
          <div className="sidebar-item-left">
            <HandshakeIcon size={17} />
            <span>{t('trades.tabs.agreed')}</span>
          </div>
          <span className={`sidebar-badge ${counts.agreed > 0 ? 'badge-agreed' : ''}`}>
            {counts.agreed}
          </span>
        </button>

        <button
          type="button"
          className={`trades-sidebar-item ${currentTab === 'completed' ? 'active' : ''}`}
          onClick={() => onTabChange('completed')}
        >
          <div className="sidebar-item-left">
            <ArchiveIcon size={17} />
            <span>{t('trades.tabs.completed')}</span>
          </div>
          <span className="sidebar-badge">{counts.completed}</span>
        </button>
      </nav>
    </aside>
  );
};

export default TradesSidebar;
