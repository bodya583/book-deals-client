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
      setGeoError('Геолокация не поддерживается вашим браузером');
      return;
    }
    setGeoLoading(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        onNearCenterChange({
          name: 'Моя геопозиция',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        onNearMeChange(true);
      },
      (err) => {
        setGeoLoading(false);
        setGeoError(
          err.code === 1
            ? 'Доступ к геопозиции отклонен'
            : 'Не удалось определить местоположение'
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
        title="Фильтр по населённым пунктам и дистанции"
      >
        <MapPinIcon size={15} />
        <span className="filter-trigger-text">Локация</span>
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
              <span>По городам</span>
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
              <span>По дистанции</span>
              {nearMe && <span className="location-tab-dot" />}
            </button>
          </div>

          {locTab === 'settlement' ? (
            /* Tab 1: Населённые пункты */
            <div className="location-tab-content">
              <div className="popover-search-wrap">
                <SearchIcon size={14} className="popover-search-icon" />
                <input
                  type="text"
                  placeholder="Поиск населённого пункта..."
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
                  <div className="popover-empty-notice">Населённый пункт не найден</div>
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
                        <span className="check-label-text">{s.name}</span>
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
                    Сбросить выбор городов ({selectedSettlements.length})
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Tab 2: По дистанции / радиусу */
            <div className="location-tab-content location-radius-content">
              {/* Точка отсчёта */}
              <div className="location-origin-box">
                <div className="location-origin-title">Точка отсчёта:</div>

                <div className="location-origin-choices">
                  {/* 1. Моя геопозиция */}
                  <button
                    type="button"
                    className={`location-origin-chip ${nearCenter === null ? 'selected' : ''}`}
                    onClick={() => onNearCenterChange(null)}
                  >
                    <NavigationIcon size={13} />
                    <span>Моя геопозиция</span>
                  </button>

                  {/* 2. Города как опорные точки */}
                  {availableSettlements.slice(0, 5).map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      className={`location-origin-chip ${nearCenter?.name === s.name ? 'selected' : ''}`}
                      onClick={() => onNearCenterChange({ name: s.name, lat: s.latitude, lng: s.longitude })}
                    >
                      <span>{s.name}</span>
                    </button>
                  ))}
                </div>

                {/* Status / prompt */}
                {nearCenter === null ? (
                  userHasCoords ? (
                    <div className="location-origin-status location-origin-status--ok">
                      <CheckIcon size={13} />
                      <span>Геопозиция сохранена ({userCoords?.latitude?.toFixed(2)}°, {userCoords?.longitude?.toFixed(2)}°)</span>
                    </div>
                  ) : (
                    <div className="location-origin-status location-origin-status--prompt">
                      <span>Локация пока не определена.</span>
                      <button
                        type="button"
                        className="location-geo-trigger-btn"
                        onClick={handleRequestLocation}
                        disabled={geoLoading}
                      >
                        <NavigationIcon size={13} />
                        <span>{geoLoading ? 'Определяем...' : 'Определить где я'}</span>
                      </button>
                      {geoError && <div className="location-geo-error">{geoError}</div>}
                    </div>
                  )
                ) : (
                  <div className="location-origin-status location-origin-status--city">
                    Ищем вокруг: <strong>{nearCenter.name}</strong>
                  </div>
                )}
              </div>

              {/* Радиус ползунок */}
              <div className="location-radius-slider-wrap">
                <div className="location-radius-info">
                  <span className="location-radius-title">Дистанция:</span>
                  <span className="location-radius-num">{radius} км</span>
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
                      {preset} км
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle activation button */}
              <div className="location-radius-action-row">
                {nearMe ? (
                  <button
                    type="button"
                    className="btn-danger-outline btn-full-width"
                    onClick={() => onNearMeChange(false)}
                  >
                    <CloseIcon size={13} />
                    <span>Отключить фильтр дистанции</span>
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
                    Искать в радиусе {radius} км
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
