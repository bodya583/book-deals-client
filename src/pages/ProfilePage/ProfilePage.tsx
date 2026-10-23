import React from 'react';
import useProfilePage from './hooks/useProfilePage';
import ProfileHero from './components/ProfileHero';
import '../books.css';

export const ProfilePage: React.FC = () => {
  const {
    user,
    formatDate,
    getInitials,
  } = useProfilePage();

  return (
    <div className="books-main-container">
      <ProfileHero
        user={user}
        initials={getInitials(user?.username)}
        formattedDate={formatDate(user?.createdAt)}
      />
    </div>
  );
};

export default ProfilePage;
