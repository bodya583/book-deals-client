import React, { useState } from 'react';
import { MapPinIcon, MapPinOffIcon, ShieldCheckIcon } from '../../../components/icons';
import { setLocation, clearLocation } from '../../../api/usersApi';
import { useAuthStore } from '../../../store/authStore';
import { useTranslation } from '../../../i18n';

interface LocationButtonProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number | null, lng: number | null) => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export const LocationButton: React.FC<LocationButtonProps> = ({
  latitude,
  longitude,
  onLocationChange,
}) => {
  const { t } = useTranslation();
  const updateUser = useAuthStore((s) => s.updateUser);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const hasLocation = latitude !== null && longitude !== null;

  const handleSetLocation = () => {
    if (!navigator.geolocation) {
      setMessage(t('filters.location.gpsUnsupported'));
      setStatus('error');
      return;
    }

    setStatus('loading');
    setMessage(t('filters.location.gpsDetecting'));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lng } = pos.coords;
          const updatedUser = await setLocation(lat, lng);
          updateUser({ latitude: updatedUser.latitude, longitude: updatedUser.longitude });
          onLocationChange(updatedUser.latitude, updatedUser.longitude);
          setStatus('success');
          setMessage(t('profile.locationSavedMsg', { lat: lat.toFixed(4), lng: lng.toFixed(4) }));
          setTimeout(() => setMessage(''), 3000);
        } catch {
          setStatus('error');
          setMessage(t('profile.locationSaveError'));
        }
      },
      (err) => {
        setStatus('error');
        if (err.code === 1) {
          setMessage(t('profile.locationDeniedError'));
        } else if (err.code === 2) {
          setMessage(t('profile.locationUnavailableError'));
        } else {
          setMessage(t('profile.locationTimeoutError'));
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleClearLocation = async () => {
    setStatus('loading');
    try {
      const updatedUser = await clearLocation();
      updateUser({ latitude: null, longitude: null });
      onLocationChange(updatedUser.latitude, updatedUser.longitude);
      setStatus('idle');
      setMessage('');
    } catch {
      setStatus('error');
      setMessage(t('profile.locationClearError'));
    }
  };

  return (
    <div className="location-section">
      <div className="location-controls">
        {hasLocation ? (
          <>
            <div className="location-badge location-badge--active">
              <MapPinIcon size={14} />
              <span>{t('profile.locationSet')}</span>
            </div>
            <button
              type="button"
              className="location-btn location-btn--update"
              onClick={handleSetLocation}
              disabled={status === 'loading'}
              title={t('profile.updateCoordsTitle')}
            >
              {status === 'loading' ? (
                <span className="location-spinner" />
              ) : (
                <MapPinIcon size={15} />
              )}
              {t('profile.updateCoordsBtn')}
            </button>
            <button
              type="button"
              className="location-btn location-btn--remove"
              onClick={handleClearLocation}
              disabled={status === 'loading'}
              title={t('profile.deleteCoordsTitle')}
            >
              <MapPinOffIcon size={15} />
              {t('common.delete')}
            </button>
          </>
        ) : (
          <>
            <div className="location-badge location-badge--none">
              <MapPinOffIcon size={14} />
              <span>{t('profile.locationNotSet')}</span>
            </div>
            <button
              type="button"
              className="location-btn location-btn--set"
              onClick={handleSetLocation}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <span className="location-spinner" />
              ) : (
                <MapPinIcon size={15} />
              )}
              {status === 'loading' ? t('profile.detectingLocation') : t('profile.shareLocationBtn')}
            </button>
          </>
        )}
      </div>

      {message && (
        <p className={`location-message location-message--${status === 'error' ? 'error' : 'success'}`}>
          {message}
        </p>
      )}

      <p className="location-hint" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <ShieldCheckIcon size={14} />
        <span>{t('profile.locationPrivacyHint')}</span>
      </p>
    </div>
  );
};

export default LocationButton;
