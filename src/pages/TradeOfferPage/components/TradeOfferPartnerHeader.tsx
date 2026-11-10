import React from 'react';
import { MapPinIcon } from '../../../components/icons';
import type { TradePartner } from '../../../types/trade';

interface TradeOfferPartnerHeaderProps {
  selectedPartner: TradePartner | null;
  partnerBooksCount: number;
}

export const TradeOfferPartnerHeader: React.FC<TradeOfferPartnerHeaderProps> = ({
  selectedPartner,
  partnerBooksCount,
}) => {
  return (
    <div className="trade-partner-card">
      <div className="partner-card-left">
        <div className="trade-user-avatar" style={{ width: 44, height: 44 }}>
          {selectedPartner?.photoURL ? (
            <img src={selectedPartner.photoURL} alt={selectedPartner.username} />
          ) : (
            <span>{(selectedPartner?.username || 'П').slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              Обмен с {selectedPartner?.username ? `@${selectedPartner.username}` : 'читателем'}
            </span>
            {selectedPartner?.city && (
              <span
                style={{
                  fontSize: '0.85rem',
                  color: '#666660',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <MapPinIcon size={13} />
                <span>{selectedPartner.city}</span>
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.85rem', color: '#666660' }}>
            Книг для обмена у партнера: {partnerBooksCount}
          </span>
        </div>
      </div>
    </div>
  );
};
