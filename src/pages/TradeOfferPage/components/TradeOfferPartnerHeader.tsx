import React from 'react';
import { MapPinIcon } from '../../../components/icons';
import type { TradePartner } from '../../../types/trade';
import { Avatar } from '../../../components/ui';
import { useTranslation } from '../../../i18n';

interface TradeOfferPartnerHeaderProps {
  selectedPartner: TradePartner | null;
  partnerBooksCount: number;
}

export const TradeOfferPartnerHeader: React.FC<TradeOfferPartnerHeaderProps> = ({
  selectedPartner,
  partnerBooksCount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="trade-partner-card">
      <div className="partner-card-left">
        <Avatar
          photoURL={selectedPartner?.photoURL}
          username={selectedPartner?.username}
          size={44}
        />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              {t('offer.partnerLabel', { username: selectedPartner?.username || t('common.reader') })}
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
            {t('offer.partnerBooksCount', { count: partnerBooksCount })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TradeOfferPartnerHeader;
