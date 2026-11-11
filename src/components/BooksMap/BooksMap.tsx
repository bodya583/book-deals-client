import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Book } from '../../types/book';
import {
  resolveBookBaseCoordinates,
  disperseAndCloakCoordinates,
  calculateDistanceKm,
  getDiscreteDistanceLabel,
} from '../../utils/geoPrivacy';
import { ShieldCheckIcon, NavigationIcon } from '../icons';
import { useTranslation } from '../../i18n';
import './BooksMap.css';

interface BooksMapProps {
  books: Book[];
  userCoords?: { latitude: number | null; longitude: number | null };
  onViewBook: (book: Book) => void;
}

export const BooksMap: React.FC<BooksMapProps> = ({ books, userCoords, onViewBook }) => {
  const { t, language } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.FeatureGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = userCoords?.latitude || 50.4501;
    const initialLng = userCoords?.longitude || 30.5234;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const featureGroup = L.featureGroup().addTo(map);
    layerGroupRef.current = featureGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  // Update Markers & Fuzzy Zones when books, userCoords, or language change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const featureGroup = layerGroupRef.current;
    if (!map || !featureGroup) return;

    featureGroup.clearLayers();

    // 1. Add current user marker if coordinates are available
    if (userCoords?.latitude && userCoords?.longitude) {
      const userMarker = L.marker([userCoords.latitude, userCoords.longitude], {
        icon: L.divIcon({
          className: 'user-map-marker-container',
          html: `<div class="user-map-marker" title="${t('map.userMarkerTitle')}"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        }),
        zIndexOffset: 1000,
      }).bindPopup(`<b>${t('map.youAreHere')}</b><br/><span style="font-size:0.8rem;color:#64748b;">${t('map.youAreHereSubtitle')}</span>`);

      featureGroup.addLayer(userMarker);
    }

    // 2. Group books by base coordinates to avoid overlapping markers
    const locationGroups = new Map<string, Book[]>();
    books.forEach((book) => {
      const baseCoords = resolveBookBaseCoordinates(book.user);
      if (!baseCoords) return;
      const key = `${baseCoords[0].toFixed(3)}_${baseCoords[1].toFixed(3)}`;
      const arr = locationGroups.get(key) || [];
      arr.push(book);
      locationGroups.set(key, arr);
    });

    // 3. Render each book with Spatial Cloaking & Golden Angle Neighborhood Dispersion
    locationGroups.forEach((groupBooks) => {
      groupBooks.forEach((book, indexInGroup) => {
        const baseCoords = resolveBookBaseCoordinates(book.user);
        if (!baseCoords) return;

        const [cloakedLat, cloakedLng] = disperseAndCloakCoordinates(
          baseCoords[0],
          baseCoords[1],
          book.id,
          indexInGroup,
          groupBooks.length
        );

        let distKm: number | null = null;
        if (userCoords?.latitude && userCoords?.longitude) {
          distKm = calculateDistanceKm(
            userCoords.latitude,
            userCoords.longitude,
            baseCoords[0],
            baseCoords[1]
          );
        }
        const distanceLabel = getDiscreteDistanceLabel(distKm, language);

        const circle = L.circle([cloakedLat, cloakedLng], {
          radius: 750,
          color: '#2d6a4f',
          weight: 1.5,
          opacity: 0.45,
          dashArray: '5, 5',
          fillColor: '#2d6a4f',
          fillOpacity: 0.12,
        });

        const marker = L.marker([cloakedLat, cloakedLng], {
          riseOnHover: true,
          icon: L.divIcon({
            className: 'book-div-icon',
            html: `<div class="book-map-marker" title="${book.title} — ${book.author}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          }),
        });

        marker.on('click', () => {
          map.setView([cloakedLat, cloakedLng], Math.max(map.getZoom(), 12), { animate: true });
        });
        circle.on('click', () => {
          map.setView([cloakedLat, cloakedLng], Math.max(map.getZoom(), 12), { animate: true });
        });

        marker.on('mouseover', () => {
          circle.setStyle({ weight: 2.5, fillOpacity: 0.25 });
        });
        marker.on('mouseout', () => {
          circle.setStyle({ weight: 1.5, fillOpacity: 0.12 });
        });
        circle.on('mouseover', () => {
          circle.setStyle({ weight: 2.5, fillOpacity: 0.25 });
        });
        circle.on('mouseout', () => {
          circle.setStyle({ weight: 1.5, fillOpacity: 0.12 });
        });

        const popupDiv = document.createElement('div');
        popupDiv.className = 'book-popup-card';
        popupDiv.innerHTML = `
          <div class="book-popup-header">
            ${
              book.coverURL
                ? `<img src="${book.coverURL}" class="book-popup-cover" alt="${book.title}" />`
                : `<div class="book-popup-cover" style="display:flex;align-items:center;justify-content:center;color:#64748b;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>`
            }
            <div class="book-popup-meta">
              <h4 class="book-popup-title" title="${book.title}">${book.title}</h4>
              <span class="book-popup-author" title="${book.author}">${book.author}</span>
              <span class="book-popup-distance-badge" title="${t('map.distanceBadgeTitle')}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-1px;margin-right:3px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${distanceLabel}
              </span>
            </div>
          </div>
        `;

        const viewBtn = document.createElement('button');
        viewBtn.className = 'book-popup-btn';
        viewBtn.textContent = t('map.bookDetailsBtn');
        viewBtn.onclick = () => onViewBook(book);
        popupDiv.appendChild(viewBtn);

        const popup = L.popup({ minWidth: 260, autoPan: true, autoPanPadding: [20, 85] }).setContent(popupDiv);
        marker.bindPopup(popup);
        circle.bindPopup(popup);

        featureGroup.addLayer(circle);
        featureGroup.addLayer(marker);
      });
    });

    if (featureGroup.getLayers().length > 0) {
      try {
        map.fitBounds(featureGroup.getBounds().pad(0.12));
      } catch {
        // Fallback
      }
    }
  }, [books, userCoords, onViewBook, t, language]);

  const handleCenterOnUser = () => {
    if (mapInstanceRef.current && userCoords?.latitude && userCoords?.longitude) {
      mapInstanceRef.current.setView([userCoords.latitude, userCoords.longitude], 13, {
        animate: true,
      });
    }
  };

  const handleFitAll = () => {
    if (mapInstanceRef.current && layerGroupRef.current) {
      try {
        mapInstanceRef.current.fitBounds(layerGroupRef.current.getBounds().pad(0.12), {
          animate: true,
        });
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="books-map-wrapper">
      <div className="map-privacy-banner">
        <div className="map-privacy-text">
          <ShieldCheckIcon size={20} color="#166534" />
          <span>
            <span className="map-privacy-strong">{t('map.privacyBannerStrong')}</span>
            {t('map.privacyBannerText')}
          </span>
        </div>

        <div className="map-controls-group">
          {userCoords?.latitude && userCoords?.longitude && (
            <button
              type="button"
              className="btn-map-control"
              onClick={handleCenterOnUser}
              title={t('map.centerOnMeTitle')}
            >
              <NavigationIcon size={14} />
              <span>{t('map.centerOnMeBtn')}</span>
            </button>
          )}

          <button
            type="button"
            className="btn-map-control"
            onClick={handleFitAll}
            title={t('map.fitAllTitle')}
          >
            <span>{t('map.fitAllBtn')}</span>
          </button>
        </div>
      </div>

      <div ref={mapContainerRef} className="books-map-container" />
    </div>
  );
};

export default BooksMap;
