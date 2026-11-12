import React, { useState } from 'react';
import type { Settlement } from '../../../../types/book';
import { MapPinIcon, NavigationIcon, ChevronDownIcon } from '../../../../components/icons';
import { useTranslation } from '../../../../i18n';
import type { LocationFilterController } from '../../hooks/booksPage.types';
import { LocationSettlementsTab } from './LocationSettlementsTab';
import { LocationRadiusTab } from './LocationRadiusTab';

interface LocationFilterPopoverProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  availableSettlements: Settlement[];
  location: LocationFilterController;
  userCoords?: { latitude: number | null; longitude: number | null };
}

export const LocationFilterPopover: React.FC<LocationFilterPopoverProps> = ({
  isOpen,
  onToggleOpen,
  availableSettlements,
  location,
  userCoords,
}) => {
  const { t } = useTranslation();
  const [locTab, setLocTab] = useState<'settlement' | 'radius'>('settlement');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  const isLocationActive = location.settlements.length > 0 || location.nearMe;
  const locationActiveCount = location.settlements.length + (location.nearMe ? 1 : 0);

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(t('filters.location.gpsUnsupported'));
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        location.setNearCenter({
          name: '__GPS__',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        location.setNearMe(true);
      },
      (err) => {
        setGeoLoading(false);
        setGeoError(
          err.code === 1
            ? t('filters.location.gpsErrorDenied')
            : t('filters.location.gpsErrorFailed')
        );
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="filter-popover-anchor">
      <button
        type="button"
        id="filter-location-button"
        className={`filter-trigger-btn ${isLocationActive ? 'active' : ''}`}
        onClick={onToggleOpen}
        title={t('filters.location.title')}
      >
        <MapPinIcon size={15} />
        <span className="filter-trigger-text">{t('filters.location.buttonLabel')}</span>
        <span className="filter-trigger-slot">
          {locationActiveCount > 0 ? (
            <span className="filter-count-badge">{locationActiveCount}</span>
          ) : (
            <ChevronDownIcon size={14} className={`filter-chevron ${isOpen ? 'open' : ''}`} />
          )}
        </span>
      </button>

      {isOpen && (
        <div
          className="filter-popover-menu filter-popover-location"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="location-popover-tabs">
            <button
              type="button"
              className={`location-tab-btn ${locTab === 'settlement' ? 'active' : ''}`}
              onClick={() => setLocTab('settlement')}
            >
              <MapPinIcon size={14} />
              <span>{t('filters.location.settlementsTab')}</span>
              {location.settlements.length > 0 && (
                <span className="location-tab-pill">{location.settlements.length}</span>
              )}
            </button>
            <button
              type="button"
              className={`location-tab-btn ${locTab === 'radius' ? 'active' : ''}`}
              onClick={() => setLocTab('radius')}
            >
              <NavigationIcon size={14} />
              <span>{t('filters.location.radiusTab')}</span>
              {location.nearMe && <span className="location-tab-dot" />}
            </button>
          </div>

          {locTab === 'settlement' ? (
            <LocationSettlementsTab
              availableSettlements={availableSettlements}
              location={location}
            />
          ) : (
            <LocationRadiusTab
              availableSettlements={availableSettlements}
              location={location}
              userCoords={userCoords}
              geoLoading={geoLoading}
              geoError={geoError}
              onRequestLocation={handleRequestLocation}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default LocationFilterPopover;
