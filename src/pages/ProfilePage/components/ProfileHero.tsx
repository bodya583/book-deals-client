import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, TradeIcon, BookOpenIcon, MapPinIcon } from '../../../components/icons';
import LocationButton from './LocationButton';
import { useTranslation } from '../../../i18n';

export interface ProfileUser {
  id: string;
  username: string;
  email?: string;
  photoURL?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
  createdAt?: string;
}

interface ProfileHeroProps {
  user: ProfileUser | null;
  initials: string;
  formattedDate: string;
  isOtherUser?: boolean;
  bookCount?: number;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  user,
  initials,
  formattedDate,
  isOtherUser = false,
  bookCount,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [localLat, setLocalLat] = useState<number | null>(user?.latitude ?? null);
  const [localLng, setLocalLng] = useState<number | null>(user?.longitude ?? null);

  React.useEffect(() => {
    setLocalLat(user?.latitude ?? null);
    setLocalLng(user?.longitude ?? null);
  }, [user?.latitude, user?.longitude]);

  const handleLocationChange = (lat: number | null, lng: number | null) => {
    setLocalLat(lat);
    setLocalLng(lng);
  };

  return (
    <section className="profile-hero-card">
      <div className="profile-hero-main">
        {/* Avatar */}
        <div className="profile-large-avatar">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.username}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : null}
          <span className="profile-avatar-letters">{initials}</span>
        </div>

        {/* User Info */}
        <div className="profile-hero-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 className="profile-username">@{user?.username || t('common.user')}</h1>
            {isOtherUser && (
              <span
                style={{
                  background: 'rgba(45, 106, 79, 0.1)',
                  color: '#2d6a4f',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {t('profile.memberLabel')}
              </span>
            )}
          </div>

          <div className="profile-meta-list">
            <div className="profile-meta-item">
              <CalendarIcon size={16} />
              <span>{t('profile.memberSince')}: {formattedDate}</span>
            </div>
            {user?.city && (
              <div className="profile-meta-item">
                <MapPinIcon size={16} />
                <span>{user.city}</span>
              </div>
            )}
            {bookCount !== undefined && (
              <div className="profile-meta-item">
                <BookOpenIcon size={16} />
                <span>{t('profile.booksCount')}: {bookCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Actions */}
      {user && (
        <div className="profile-hero-actions">
          {isOtherUser ? (
            <button
              type="button"
              className="btn-new-trade"
              style={{
                background: '#2d6a4f',
                padding: '0.75rem 1.4rem',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(45, 106, 79, 0.25)',
              }}
              onClick={() => navigate(`/trades/new?partnerId=${user.id}`)}
              title={`${t('profile.proposeTradeWithUser')} @${user.username}`}
            >
              <TradeIcon size={20} />
              <span>{t('profile.proposeTradeWithUser')}</span>
            </button>
          ) : (
            <LocationButton
              latitude={localLat}
              longitude={localLng}
              onLocationChange={handleLocationChange}
            />
          )}
        </div>
      )}
    </section>
  );
};

export default ProfileHero;

