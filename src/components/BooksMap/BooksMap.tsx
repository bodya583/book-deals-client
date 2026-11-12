import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Book } from '../../types/book';
import {
  resolveBookBaseCoordinates,
  cloakCoordinates,
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

interface UserLocationGroup {
  key: string;
  userId: string;
  username: string;
  city?: string | null;
  baseLat: number;
  baseLng: number;
  cloakedLat: number;
  cloakedLng: number;
  books: Book[];
}

interface ClusterGroup {
  centerLat: number;
  centerLng: number;
  locations: UserLocationGroup[];
  totalBooks: number;
}

function computeClusters(
  map: L.Map,
  locations: UserLocationGroup[],
  zoom: number
): ClusterGroup[] {
  if (zoom >= 10) {
    return locations.map((loc) => ({
      centerLat: loc.cloakedLat,
      centerLng: loc.cloakedLng,
      locations: [loc],
      totalBooks: loc.books.length,
    }));
  }

  const clusters: ClusterGroup[] = [];
  const clusterDist = 45;

  for (const loc of locations) {
    const pLoc = map.project([loc.cloakedLat, loc.cloakedLng], zoom);
    let bestCluster: ClusterGroup | null = null;
    let minDist = Infinity;

    for (const cluster of clusters) {
      const pCluster = map.project([cluster.centerLat, cluster.centerLng], zoom);
      const d = Math.hypot(pLoc.x - pCluster.x, pLoc.y - pCluster.y);
      if (d < clusterDist && d < minDist) {
        minDist = d;
        bestCluster = cluster;
      }
    }

    if (bestCluster) {
      bestCluster.locations.push(loc);
      bestCluster.totalBooks += loc.books.length;
      let sumLat = 0;
      let sumLng = 0;
      for (const l of bestCluster.locations) {
        sumLat += l.cloakedLat;
        sumLng += l.cloakedLng;
      }
      bestCluster.centerLat = sumLat / bestCluster.locations.length;
      bestCluster.centerLng = sumLng / bestCluster.locations.length;
    } else {
      clusters.push({
        centerLat: loc.cloakedLat,
        centerLng: loc.cloakedLng,
        locations: [loc],
        totalBooks: loc.books.length,
      });
    }
  }

  return clusters;
}

export const BooksMap: React.FC<BooksMapProps> = ({ books, userCoords, onViewBook }) => {
  const { t, language } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.FeatureGroup | null>(null);

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

  useEffect(() => {
    const map = mapInstanceRef.current;
    const featureGroup = layerGroupRef.current;
    if (!map || !featureGroup) return;

    const userLocationsMap = new Map<string, UserLocationGroup>();

    books.forEach((book) => {
      const baseCoords = resolveBookBaseCoordinates(book.user);
      if (!baseCoords) return;

      const userId = book.user?.id || `${baseCoords[0].toFixed(4)}_${baseCoords[1].toFixed(4)}`;
      const key = userId;

      let group = userLocationsMap.get(key);
      if (!group) {
        const [cloakedLat, cloakedLng] = cloakCoordinates(baseCoords[0], baseCoords[1], key);
        group = {
          key,
          userId,
          username: book.user?.username || 'reader',
          city: book.user?.city || null,
          baseLat: baseCoords[0],
          baseLng: baseCoords[1],
          cloakedLat,
          cloakedLng,
          books: [],
        };
        userLocationsMap.set(key, group);
      }
      group.books.push(book);
    });

    const userLocations = Array.from(userLocationsMap.values());

    const renderMarkers = () => {
      featureGroup.clearLayers();

      if (userCoords?.latitude && userCoords?.longitude) {
        const userMarker = L.marker([userCoords.latitude, userCoords.longitude], {
          icon: L.divIcon({
            className: 'user-map-marker-container',
            html: `<div class="user-map-marker" title="${t('map.userMarkerTitle')}"></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          }),
          zIndexOffset: 1000,
        }).bindPopup(
          `<b>${t('map.youAreHere')}</b><br/><span style="font-size:0.8rem;color:#64748b;">${t('map.youAreHereSubtitle')}</span>`
        );
        featureGroup.addLayer(userMarker);
      }

      if (userLocations.length === 0) return;

      const currentZoom = map.getZoom();
      const clusters = computeClusters(map, userLocations, currentZoom);

      clusters.forEach((cluster) => {
        if (cluster.locations.length > 1) {
          const clusterMarker = L.marker([cluster.centerLat, cluster.centerLng], {
            riseOnHover: true,
            icon: L.divIcon({
              className: 'book-cluster-div-icon',
              html: `
                <div class="book-map-cluster-marker" title="${t('map.clusterTooltip', { count: cluster.totalBooks })}">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;margin-right:2px;vertical-align:-1px;"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  <span class="cluster-count">${cluster.totalBooks}</span>
                </div>
              `,
              iconSize: [46, 46],
              iconAnchor: [23, 23],
            }),
          });

          const clusterPopupDiv = document.createElement('div');
          clusterPopupDiv.className = 'book-popup-card multi-books-popup';
          clusterPopupDiv.innerHTML = `
            <div class="multi-popup-header">
              <div class="multi-popup-user">
                <span class="multi-popup-username">${t('map.clusterPopupHeader', { count: cluster.totalBooks, users: cluster.locations.length })}</span>
              </div>
              <div class="multi-popup-badges">
                <span class="multi-popup-count-badge">${t('map.userBooksCount', { count: cluster.totalBooks })}</span>
              </div>
            </div>
            <div class="multi-popup-list"></div>
          `;

          const clusterListContainer = clusterPopupDiv.querySelector('.multi-popup-list')!;
          const allClusterBooks = cluster.locations.flatMap((l) => l.books);

          allClusterBooks.slice(0, 30).forEach((b) => {
            const item = document.createElement('div');
            item.className = 'multi-popup-item';
            item.innerHTML = `
              ${
                b.coverURL
                  ? `<img src="${b.coverURL}" class="multi-popup-thumb" alt="${b.title}" onerror="this.style.display='none'" />`
                  : `<div class="multi-popup-thumb-placeholder"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>`
              }
              <div class="multi-popup-item-info">
                <span class="multi-popup-item-title" title="${b.title}">${b.title}</span>
                <span class="multi-popup-item-author" title="${b.author}">${b.author}</span>
              </div>
            `;
            const itemBtn = document.createElement('button');
            itemBtn.className = 'multi-popup-item-btn';
            itemBtn.textContent = t('map.viewBook');
            itemBtn.onclick = () => onViewBook(b);
            item.appendChild(itemBtn);
            clusterListContainer.appendChild(item);
          });

          const clusterPopup = L.popup({
            minWidth: 290,
            maxWidth: 320,
            autoPan: true,
            autoPanPadding: [20, 85],
          }).setContent(clusterPopupDiv);

          clusterMarker.bindPopup(clusterPopup);

          clusterMarker.on('click', () => {
            const zoomNow = map.getZoom();
            if (zoomNow < 15) {
              const bounds = L.latLngBounds(
                cluster.locations.map((loc) => [loc.cloakedLat, loc.cloakedLng])
              );
              if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
                map.setView(
                  [cluster.centerLat, cluster.centerLng],
                  Math.max(11, zoomNow + 3),
                  { animate: true }
                );
              } else {
                map.fitBounds(bounds.pad(0.35), { maxZoom: 14, animate: true });
              }
            } else {
              clusterMarker.openPopup();
            }
          });

          featureGroup.addLayer(clusterMarker);
        } else {
          const loc = cluster.locations[0];

          let distKm: number | null = null;
          if (userCoords?.latitude && userCoords?.longitude) {
            distKm = calculateDistanceKm(
              userCoords.latitude,
              userCoords.longitude,
              loc.baseLat,
              loc.baseLng
            );
          }
          const distanceLabel = getDiscreteDistanceLabel(distKm, language);

          const circle = L.circle([loc.cloakedLat, loc.cloakedLng], {
            radius: 750,
            color: '#2d6a4f',
            weight: 1.5,
            opacity: 0.45,
            dashArray: '5, 5',
            fillColor: '#2d6a4f',
            fillOpacity: 0.12,
          });

          const markerHtml =
            loc.books.length > 1
              ? `<div class="book-map-marker has-count" title="@${loc.username} — ${t('map.userBooksCount', { count: loc.books.length })} (${t('map.clickPinHint')})">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  <span class="marker-count-badge">${loc.books.length}</span>
                </div>`
              : `<div class="book-map-marker" title="${loc.books[0].title} — ${loc.books[0].author} (${t('map.clickPinHint')})">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </div>`;

          const marker = L.marker([loc.cloakedLat, loc.cloakedLng], {
            riseOnHover: true,
            icon: L.divIcon({
              className: 'book-div-icon',
              html: markerHtml,
              iconSize: loc.books.length > 1 ? [40, 40] : [36, 36],
              iconAnchor: loc.books.length > 1 ? [20, 20] : [18, 18],
            }),
          });

          marker.on('mouseover', () => circle.setStyle({ weight: 2.5, fillOpacity: 0.25 }));
          marker.on('mouseout', () => circle.setStyle({ weight: 1.5, fillOpacity: 0.12 }));
          circle.on('mouseover', () => circle.setStyle({ weight: 2.5, fillOpacity: 0.25 }));
          circle.on('mouseout', () => circle.setStyle({ weight: 1.5, fillOpacity: 0.12 }));

          const popupDiv = document.createElement('div');

          if (loc.books.length === 1) {
            const singleBook = loc.books[0];
            popupDiv.className = 'book-popup-card';
            popupDiv.innerHTML = `
              <div class="book-popup-header">
                ${
                  singleBook.coverURL
                    ? `<img src="${singleBook.coverURL}" class="book-popup-cover" alt="${singleBook.title}" onerror="this.style.display='none'" />`
                    : `<div class="book-popup-cover" style="display:flex;align-items:center;justify-content:center;color:#64748b;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>`
                }
                <div class="book-popup-meta">
                  <h4 class="book-popup-title" title="${singleBook.title}">${singleBook.title}</h4>
                  <span class="book-popup-author" title="${singleBook.author}">${singleBook.author}</span>
                  <div class="book-popup-badges-row">
                    <span class="book-popup-distance-badge" title="${t('map.distanceBadgeTitle')}">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-1px;margin-right:3px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${distanceLabel}
                    </span>
                    <span class="book-popup-zone-badge" title="${t('map.zoneNotice')}">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-1px;margin-right:2px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>~750m
                    </span>
                  </div>
                </div>
              </div>
            `;

            const viewBtn = document.createElement('button');
            viewBtn.className = 'book-popup-btn';
            viewBtn.textContent = t('map.bookDetailsBtn');
            viewBtn.onclick = () => onViewBook(singleBook);
            popupDiv.appendChild(viewBtn);

            const popup = L.popup({
              minWidth: 260,
              autoPan: true,
              autoPanPadding: [20, 85],
            }).setContent(popupDiv);

            marker.bindPopup(popup);
            circle.bindPopup(popup);

            marker.on('click', () => marker.openPopup());
            circle.on('click', () => marker.openPopup());
          } else {
            popupDiv.className = 'book-popup-card multi-books-popup';
            popupDiv.innerHTML = `
              <div class="multi-popup-header">
                <div class="multi-popup-user">
                  <span class="multi-popup-username">@${loc.username}</span>
                  ${loc.city ? `<span class="multi-popup-city">• ${loc.city}</span>` : ''}
                </div>
                <div class="multi-popup-badges">
                  <span class="multi-popup-count-badge">${t('map.userBooksCount', { count: loc.books.length })}</span>
                  <span class="book-popup-distance-badge" title="${t('map.distanceBadgeTitle')}">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-1px;margin-right:2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${distanceLabel}
                  </span>
                  <span class="book-popup-zone-badge" title="${t('map.zoneNotice')}">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-1px;margin-right:2px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>~750m
                  </span>
                </div>
              </div>
              <div class="multi-popup-list"></div>
            `;

            const listContainer = popupDiv.querySelector('.multi-popup-list')!;
            loc.books.forEach((b) => {
              const item = document.createElement('div');
              item.className = 'multi-popup-item';
              item.innerHTML = `
                ${
                  b.coverURL
                    ? `<img src="${b.coverURL}" class="multi-popup-thumb" alt="${b.title}" onerror="this.style.display='none'" />`
                    : `<div class="multi-popup-thumb-placeholder"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>`
                }
                <div class="multi-popup-item-info">
                  <span class="multi-popup-item-title" title="${b.title}">${b.title}</span>
                  <span class="multi-popup-item-author" title="${b.author}">${b.author}</span>
                </div>
              `;
              const itemBtn = document.createElement('button');
              itemBtn.className = 'multi-popup-item-btn';
              itemBtn.textContent = t('map.viewBook');
              itemBtn.onclick = () => onViewBook(b);
              item.appendChild(itemBtn);
              listContainer.appendChild(item);
            });

            const popup = L.popup({
              minWidth: 290,
              maxWidth: 320,
              autoPan: true,
              autoPanPadding: [20, 85],
            }).setContent(popupDiv);

            marker.bindPopup(popup);
            circle.bindPopup(popup);

            marker.on('click', () => marker.openPopup());
            circle.on('click', () => marker.openPopup());
          }

          featureGroup.addLayer(circle);
          featureGroup.addLayer(marker);
        }
      });
    };

    map.on('zoomend', renderMarkers);
    renderMarkers();

    if (featureGroup.getLayers().length > 0) {
      try {
        map.fitBounds(featureGroup.getBounds().pad(0.12));
      } catch {
      }
    }

    return () => {
      map.off('zoomend', renderMarkers);
    };
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
          <span className="map-privacy-hint-pill">{t('map.clickPinHint')}</span>
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
