import React from 'react';
import type { User } from '../../../store/authStore';
import { CalendarIcon, BookOpenIcon, LogOutIcon } from '../../../components/icons';

interface ProfileHeroProps {
  user: User | null;
  initials: string;
  formattedDate: string;
  onNavigateBooks: () => void;
  onLogout: () => void;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  user,
  initials,
  formattedDate,
  onNavigateBooks,
  onLogout,
}) => {
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
          <div className="profile-title-row">
            <h1 className="profile-username">{user?.username || 'Пользователь'}</h1>
            <span className="profile-badge-active">Активен</span>
          </div>

          <div className="profile-meta-list">
            <div className="profile-meta-item">
              <CalendarIcon size={16} />
              <span>Зарегистрирован: {formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="profile-hero-buttons">
        <button
          type="button"
          className="btn-secondary-action"
          onClick={onNavigateBooks}
        >
          <BookOpenIcon size={18} />
          <span>Все мои книги</span>
        </button>
        <button
          type="button"
          className="btn-danger-outline"
          onClick={onLogout}
        >
          <LogOutIcon size={18} />
          <span>Выйти</span>
        </button>
      </div>
    </section>
  );
};

export default ProfileHero;
