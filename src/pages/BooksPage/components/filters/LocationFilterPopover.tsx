import React, { useState } from 'react';
import type { Settlement } from '../../../../types/book';
import {
  MapPinIcon,
  NavigationIcon,
  ChevronDownIcon,
  SearchIcon,
  CloseIcon,
  CheckIcon,
} from '../../../../components/icons';
import { useTranslation } from '../../../../i18n';

interface LocationFilterPopoverProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  availableSettlements: Settlement[];
  selectedSettlements: string[];
  onToggleSettlement: (cityName: string) => void;
  onClearSettlements: () => void;
  nearMe: boolean;
  onNearMeChange: (val: boolean) => void;
  radius: number;
  onRadiusChange: (val: number) => void;
  nearCenter: { name: string; lat: number; lng: number } | null;
  onNearCenterChange: (center: { name: string; lat: number; lng: number } | null) => void;
  userCoords?: { latitude: number | null; longitude: number | null };
}

export const LocationFilterPopover: React.FC<LocationFilterPopoverProps> = ({
  isOpen,
  onToggleOpen,
  availableSettlements,
  selectedSettlements,
  onToggleSettlement,
  onClearSettlements,
  nearMe,
  onNearMeChange,
  radius,
  onRadiusChange,
  nearCenter,
  onNearCenterChange,
  userCoords,
}) => {
  const { t, tCity } = useTranslation();
  const [settlementSearch, setSettlementSearch] = useState('');
  const [locTab, setLocTab] = useState<'settlement' | 'radius'>('settlement');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  const isLocationActive = selectedSettlements.length > 0 || nearMe;
  const locationActiveCount = selectedSettlements.length + (nearMe ? 1 : 0);
  const userHasCoords = Boolean(userCoords?.latitude != null && userCoords?.longitude != null);

  const filteredSettlements = availableSettlements.filter((s) =>
    s.name.toLowerCase().includes(settlementSearch.toLowerCase().trim())
  );

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
        onNearCenterChange({
          name: '__GPS__',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        onNearMeChange(true);
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
        <div className="filter-popover-menu filter-popover-location" onClick={(e) => e.stopPropagation()}>
          {/* Mode Tabs */}
          <div className="location-popover-tabs">
            <button
              type="button"
              className={`location-tab-btn ${locTab === 'settlement' ? 'active' : ''}`}
              onClick={() => setLocTab('settlement')}
            >
              <MapPinIcon size={14} />
              <span>{t('filters.location.settlementsTab')}</span>
              {selectedSettlements.length > 0 && (
                <span className="location-tab-pill">{selectedSettlements.length}</span>
              )}
            </button>
            <button
              type="button"
              className={`location-tab-btn ${locTab === 'radius' ? 'active' : ''}`}
              onClick={() => setLocTab('radius')}
            >
              <NavigationIcon size={14} />
              <span>{t('filters.location.radiusTab')}</span>
              {nearMe && <span className="location-tab-dot" />}
            </button>
          </div>

          {locTab === 'settlement' ? (
            /* Tab 1: Settlements */
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
                    const isChecked = selectedSettlements.includes(s.name);
                    return (
                      <label
                        key={s.name}
                        className={`popover-check-item ${isChecked ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleSettlement(s.name)}
                        />
                        <span className="check-custom">
                          {isChecked && <CheckIcon size={12} />}
                        </span>
                        <span className="check-label-text">{tCity(s.name)}</span>
                        {s.count !== undefined && (
                          <span className="check-item-count">{s.count}</span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>

              {selectedSettlements.length > 0 && (
                <div className="location-tab-footer">
                  <button
                    type="button"
                    onClick={onClearSettlements}
                    className="popover-clear-btn"
                  >
                    {t('filters.location.clearSettlementsCount', { count: selectedSettlements.length })}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Tab 2: Distance / Radius */
            <div className="location-tab-content location-radius-content">
              <div className="location-origin-box">
                <div className="location-origin-title">{t('filters.location.originTitle')}</div>

                <div className="location-origin-choices">
                  <button
                    type="button"
                    className={`location-origin-chip ${nearCenter === null ? 'selected' : ''}`}
                    onClick={() => onNearCenterChange(null)}
                  >
                    <NavigationIcon size={13} />
                    <span>{t('filters.location.myGpsLocation')}</span>
                  </button>

                  {availableSettlements.slice(0, 5).map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      className={`location-origin-chip ${nearCenter?.name === s.name ? 'selected' : ''}`}
                      onClick={() => onNearCenterChange({ name: s.name, lat: s.latitude, lng: s.longitude })}
                    >
                      <span>{tCity(s.name)}</span>
                    </button>
                  ))}
                </div>

                {nearCenter === null ? (
                  userHasCoords ? (
                    <div className="location-origin-status location-origin-status--ok">
                      <CheckIcon size={13} />
                      <span>
                        {t('filters.location.geoSaved', {
                          lat: userCoords?.latitude?.toFixed(2) ?? '',
                          lng: userCoords?.longitude?.toFixed(2) ?? '',
                        })}
                      </span>
                    </div>
                  ) : (
                    <div className="location-origin-status location-origin-status--prompt">
                      <span>{t('filters.location.geoNotDetected')}</span>
                      <button
                        type="button"
                        className="location-geo-trigger-btn"
                        onClick={handleRequestLocation}
                        disabled={geoLoading}
                      >
                        <NavigationIcon size={13} />
                        <span>{geoLoading ? t('filters.location.gpsDetecting') : t('filters.location.geoDetectBtn')}</span>
                      </button>
                      {geoError && <div className="location-geo-error">{geoError}</div>}
                    </div>
                  )
                ) : (
                  <div className="location-origin-status location-origin-status--city">
                    {t('filters.location.searchingAround')}{' '}
                    <strong>
                      {nearCenter.name === '__GPS__'
                        ? t('filters.location.myGpsLocation')
                        : tCity(nearCenter.name)}
                    </strong>
                  </div>
                )}
              </div>

              <div className="location-radius-slider-wrap">
                <div className="location-radius-info">
                  <span className="location-radius-title">{t('filters.location.distanceLabel')}</span>
                  <span className="location-radius-num">{t('filters.location.presetKm', { km: radius })}</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={500}
                  step={5}
                  value={radius}
                  onChange={(e) => onRadiusChange(Number(e.target.value))}
                  className="location-radius-slider"
                />
                <div className="radius-presets-row">
                  {[10, 25, 50, 100, 200].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`radius-preset-chip ${radius === preset ? 'active' : ''}`}
                      onClick={() => onRadiusChange(preset)}
                    >
                      {t('filters.location.presetKm', { km: preset })}
                    </button>
                  ))}
                </div>
              </div>

              <div className="location-radius-action-row">
                {nearMe ? (
                  <button
                    type="button"
                    className="btn-danger-outline btn-full-width"
                    onClick={() => onNearMeChange(false)}
                  >
                    <CloseIcon size={13} />
                    <span>{t('filters.location.disableDistanceFilter')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-primary-action btn-full-width"
                    onClick={() => {
                      if (nearCenter === null && !userHasCoords) {
                        handleRequestLocation();
                      } else {
                        onNearMeChange(true);
                      }
                    }}
                  >
                    {t('filters.location.searchWithinRadius', { radius })}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationFilterPopover;
