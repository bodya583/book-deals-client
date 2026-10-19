import React from 'react';
import useProfilePage from './hooks/useProfilePage';
import ProfileHero from './components/ProfileHero';
import ProfileStats from './components/ProfileStats';
import ProfileBooksSection from './components/ProfileBooksSection';
import BooksModals from '../../components/BooksModals';
import '../books.css';

export const ProfilePage: React.FC = () => {
  const {
    user,
    userId,
    books,
    loading,
    navigate,
    handleLogout,
    formatDate,
    getInitials,
    modalsState,
    modalsActions,
    toasts,
    removeToast,
  } = useProfilePage();

  return (
    <div className="books-main-container">
      {/* 1. Profile Hero Info */}
      <ProfileHero
        user={user}
        initials={getInitials(user?.username)}
        formattedDate={formatDate(user?.createdAt)}
        onNavigateBooks={() => navigate('/')}
        onLogout={handleLogout}
      />

      {/* 2. Stats Bar */}
      <ProfileStats
        totalBooks={books.length}
        lastAddedDate={
          books.length > 0 && books[0].createdAt
            ? formatDate(books[0].createdAt)
            : 'Пока нет книг'
        }
      />

      {/* 3. Books Section */}
      <ProfileBooksSection
        books={books}
        loading={loading}
        onAddBook={modalsActions.openCreate}
        onViewBook={modalsActions.openDetails}
        onEditBook={modalsActions.openEdit}
        onDeleteBook={modalsActions.openDelete}
      />

      {/* 4. Modals & Toasts Container */}
      <BooksModals
        state={modalsState}
        actions={modalsActions}
        currentUserId={userId}
        toasts={toasts}
        onRemoveToast={removeToast}
      />
    </div>
  );
};

export default ProfilePage;
