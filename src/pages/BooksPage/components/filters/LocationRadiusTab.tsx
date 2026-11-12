import React from 'react';
import type { Settlement } from '../../../../types/book';
import { NavigationIcon, CheckIcon, CloseIcon } from '../../../../components/icons';
import { useTranslation } from '../../../../i18n';
import type { LocationFilterController } from '../../hooks/booksPage.types';

interface LocationRadiusTabProps {
  availableSettlements: Settlement[];
  location: LocationFilterController;
  userCoords?: { latitude: number | null; longitude: number | null };
  geoLoading: boolean;
  geoError: string;
  onRequestLocation: () => void;
}

export const LocationRadiusTab: React.FC<LocationRadiusTabProps> = ({
  availableSettlements,
  location,
  userCoords,
  geoLoading,
  geoError,
  onRequestLocation,
}) => {
  const { t, tCity } = useTranslation();
  const userHasCoords = Boolean(userCoords?.latitude != null && userCoords?.longitude != null);

  return (
    <div className="location-tab-content location-radius-content">
      <div className="location-origin-box">
        <div className="location-origin-title">{t('filters.location.originTitle')}</div>

        <div className="location-origin-choices">
          <button
            type="button"
            className={`location-origin-chip ${location.nearCenter === null ? 'selected' : ''}`}
            onClick={() => location.setNearCenter(null)}
          >
            <NavigationIcon size={13} />
            <span>{t('filters.location.myGpsLocation')}</span>
          </button>

          {availableSettlements.slice(0, 5).map((s) => (
            <button
              key={s.name}
              type="button"
              className={`location-origin-chip ${location.nearCenter?.name === s.name ? 'selected' : ''}`}
              onClick={() =>
                location.setNearCenter({ name: s.name, lat: s.latitude, lng: s.longitude })
              }
            >
              <span>{tCity(s.name)}</span>
            </button>
          ))}
        </div>

        {location.nearCenter === null ? (
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
                onClick={onRequestLocation}
                disabled={geoLoading}
              >
                <NavigationIcon size={13} />
                <span>
                  {geoLoading ? t('filters.location.gpsDetecting') : t('filters.location.geoDetectBtn')}
                </span>
              </button>
              {geoError && <div className="location-geo-error">{geoError}</div>}
            </div>
          )
        ) : (
          <div className="location-origin-status location-origin-status--city">
            {t('filters.location.searchingAround')}{' '}
            <strong>
              {location.nearCenter.name === '__GPS__'
                ? t('filters.location.myGpsLocation')
                : tCity(location.nearCenter.name)}
            </strong>
          </div>
        )}
      </div>

      <div className="location-radius-slider-wrap">
        <div className="location-radius-info">
          <span className="location-radius-title">{t('filters.location.distanceLabel')}</span>
          <span className="location-radius-num">
            {t('filters.location.presetKm', { km: location.radius })}
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={500}
          step={5}
          value={location.radius}
          onChange={(e) => location.setRadius(Number(e.target.value))}
          className="location-radius-slider"
        />
        <div className="radius-presets-row">
          {[10, 25, 50, 100, 200].map((preset) => (
            <button
              key={preset}
              type="button"
              className={`radius-preset-chip ${location.radius === preset ? 'active' : ''}`}
              onClick={() => location.setRadius(preset)}
            >
              {t('filters.location.presetKm', { km: preset })}
            </button>
          ))}
        </div>
      </div>

      <div className="location-radius-action-row">
        {location.nearMe ? (
          <button
            type="button"
            className="btn-danger-outline btn-full-width"
            onClick={() => location.setNearMe(false)}
          >
            <CloseIcon size={13} />
            <span>{t('filters.location.disableDistanceFilter')}</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary-action btn-full-width"
            onClick={() => {
              if (location.nearCenter === null && !userHasCoords) {
                onRequestLocation();
              } else {
                location.setNearMe(true);
              }
            }}
          >
            {t('filters.location.searchWithinRadius', { radius: location.radius })}
          </button>
        )}
      </div>
    </div>
  );
};
