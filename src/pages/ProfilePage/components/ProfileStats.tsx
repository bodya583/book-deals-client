import React from 'react';
import { BookOpenIcon, CalendarIcon, UserIcon } from '../../../components/icons';

interface ProfileStatsProps {
  totalBooks: number;
  lastAddedDate: string;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  totalBooks,
  lastAddedDate,
}) => {
  return (
    <section className="profile-stats-grid">
      <div className="profile-stat-box">
        <div className="stat-icon-wrapper stat-icon-emerald">
          <BookOpenIcon size={24} />
        </div>
        <div>
          <span className="stat-label">Всего книг на аккаунте</span>
          <h3 className="stat-value">{totalBooks}</h3>
        </div>
      </div>

      <div className="profile-stat-box">
        <div className="stat-icon-wrapper stat-icon-amber">
          <CalendarIcon size={24} />
        </div>
        <div>
          <span className="stat-label">Последнее добавление</span>
          <h3 className="stat-value">{lastAddedDate}</h3>
        </div>
      </div>

      <div className="profile-stat-box">
        <div className="stat-icon-wrapper stat-icon-blue">
          <UserIcon size={24} />
        </div>
        <div>
          <span className="stat-label">Роль пользователя</span>
          <h3 className="stat-value">Читатель</h3>
        </div>
      </div>
    </section>
  );
};

export default ProfileStats;
