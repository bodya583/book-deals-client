import React, { useState } from 'react';
import { MapPinIcon, MapPinOffIcon, ShieldCheckIcon } from '../../../components/icons';
import { setLocation, clearLocation } from '../../../api/usersApi';
import { useAuthStore } from '../../../store/authStore';

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
  const updateUser = useAuthStore((s) => s.updateUser);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const hasLocation = latitude !== null && longitude !== null;

  const handleSetLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Геолокация не поддерживается вашим браузером');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setMessage('Определяем координаты...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lng } = pos.coords;
          const updatedUser = await setLocation(lat, lng);
          updateUser({ latitude: updatedUser.latitude, longitude: updatedUser.longitude });
          onLocationChange(updatedUser.latitude, updatedUser.longitude);
          setStatus('success');
          setMessage(`Сохранено: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`);
          setTimeout(() => setMessage(''), 3000);
        } catch {
          setStatus('error');
          setMessage('Не удалось сохранить координаты');
        }
      },
      (err) => {
        setStatus('error');
        if (err.code === 1) {
          setMessage('Доступ к геолокации запрещён');
        } else if (err.code === 2) {
          setMessage('Не удалось определить местоположение');
        } else {
          setMessage('Превышено время ожидания');
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
      setMessage('Не удалось удалить координаты');
    }
  };

  return (
    <div className="location-section">
      <div className="location-controls">
        {hasLocation ? (
          <>
            <div className="location-badge location-badge--active">
              <MapPinIcon size={14} />
              <span>Локация установлена</span>
            </div>
            <button
              type="button"
              className="location-btn location-btn--update"
              onClick={handleSetLocation}
              disabled={status === 'loading'}
              title="Обновить координаты"
            >
              {status === 'loading' ? (
                <span className="location-spinner" />
              ) : (
                <MapPinIcon size={15} />
              )}
              Обновить
            </button>
            <button
              type="button"
              className="location-btn location-btn--remove"
              onClick={handleClearLocation}
              disabled={status === 'loading'}
              title="Удалить координаты"
            >
              <MapPinOffIcon size={15} />
              Удалить
            </button>
          </>
        ) : (
          <>
            <div className="location-badge location-badge--none">
              <MapPinOffIcon size={14} />
              <span>Локация не установлена</span>
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
              {status === 'loading' ? 'Определяем...' : 'Поделиться локацией'}
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
        <span>Ваши координаты приватны — они используются только для поиска ближайших книг и не видны другим пользователям.</span>
      </p>
    </div>
  );
};

export default LocationButton;
