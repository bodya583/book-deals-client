import React, { useState } from 'react';
import type { Settlement } from '../../../../types/book';
import { SearchIcon, CloseIcon, CheckIcon } from '../../../../components/icons';
import { useTranslation } from '../../../../i18n';
import type { LocationFilterController } from '../../hooks/booksPage.types';

interface LocationSettlementsTabProps {
  availableSettlements: Settlement[];
  location: LocationFilterController;
}

export const LocationSettlementsTab: React.FC<LocationSettlementsTabProps> = ({
  availableSettlements,
  location,
}) => {
  const { t, tCity } = useTranslation();
  const [settlementSearch, setSettlementSearch] = useState('');

  const filteredSettlements = availableSettlements.filter((s) => {
    const q = settlementSearch.toLowerCase().trim();
    return s.name.toLowerCase().includes(q) || tCity(s.name).toLowerCase().includes(q);
  });

  return (
    <div className="location-tab-content">
      <div className="popover-search-wrap">
        <SearchIcon size={14} className="popover-search-icon" />
        <input
          type="text"
          placeholder={t('filters.location.searchPlaceholder')}
          value={settlementSearch}
          onChange={(e) => setSettlementSearch(e.target.value)}
          className="popover-search-input"
        />
        {settlementSearch && (
          <button
            type="button"
            className="popover-search-clear"
            onClick={() => setSettlementSearch('')}
          >
            <CloseIcon size={12} />
          </button>
        )}
      </div>

      <div className="popover-checklist location-settlements-list">
        {filteredSettlements.length === 0 ? (
          <div className="popover-empty-notice">{t('filters.location.settlementNotFound')}</div>
        ) : (
          filteredSettlements.map((s) => {
            const isChecked = location.settlements.includes(s.name);
            return (
              <label key={s.name} className={`popover-check-item ${isChecked ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => location.toggleSettlement(s.name)}
                />
                <span className="check-custom">{isChecked && <CheckIcon size={12} />}</span>
                <span className="check-label-text">{tCity(s.name)}</span>
                {s.count !== undefined && <span className="check-item-count">{s.count}</span>}
              </label>
            );
          })
        )}
      </div>

      {location.settlements.length > 0 && (
        <div className="location-tab-footer">
          <button type="button" onClick={location.clearSettlements} className="popover-clear-btn">
            {t('filters.location.clearSettlementsCount', { count: location.settlements.length })}
          </button>
        </div>
      )}
    </div>
  );
};
