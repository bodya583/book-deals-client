import React, { useState } from 'react';
import type { User } from '../../../store/authStore';
import { CalendarIcon } from '../../../components/icons';
import LocationButton from './LocationButton';

interface ProfileHeroProps {
  user: User | null;
  initials: string;
  formattedDate: string;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  user,
  initials,
  formattedDate,
}) => {
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
          <h1 className="profile-username">{user?.username || 'Пользователь'}</h1>

          <div className="profile-meta-list">
            <div className="profile-meta-item">
              <CalendarIcon size={16} />
              <span>Зарегистрирован: {formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Actions — Location controls */}
      {user && (
        <div className="profile-hero-actions">
          <LocationButton
            latitude={localLat}
            longitude={localLng}
            onLocationChange={handleLocationChange}
          />
        </div>
      )}
    </section>
  );
};

export default ProfileHero;
