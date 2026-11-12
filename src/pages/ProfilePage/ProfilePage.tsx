import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useProfilePage from './hooks/useProfilePage';
import { useProfileBooks } from './hooks/useProfileBooks';
import ProfileHero from './components/ProfileHero';
import { ProfileBooksSection } from './components/ProfileBooksSection';
import { useAuthStore } from '../../store/authStore';
import { ChevronLeftIcon } from '../../components/icons';
import BooksModals from '../../components/BooksModals';
import { useTranslation } from '../../i18n';
import '../books.css';
import '../trades.css';
import './styles/ProfileBooks.css';

export const ProfilePage: React.FC = () => {
  const { userId: routeUserId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { t } = useTranslation();

  const { user: myUser, formatDate, getInitials } = useProfilePage();
  const { isOtherUser, otherUser, loading, books, filters, modals, toasts } = useProfileBooks(
    routeUserId,
    currentUser?.id
  );

  const activeUser = isOtherUser ? otherUser : myUser;
  const heroBookCount = isOtherUser
    ? books.source.length
    : books.source.filter((b) => b.isForTrade !== false).length;

  return (
    <div className="books-main-container">
      {isOtherUser && (
        <div className="profile-back-row">
          <button
            type="button"
            className="trade-back-btn profile-back-btn"
            onClick={() => navigate(-1)}
          >
            <ChevronLeftIcon size={16} />
            <span>{t('common.back')}</span>
          </button>
        </div>
      )}

      <ProfileHero
        user={activeUser}
        initials={getInitials(activeUser?.username)}
        formattedDate={formatDate(activeUser?.createdAt)}
        isOtherUser={isOtherUser}
        bookCount={heroBookCount}
      />

      <ProfileBooksSection
        isOtherUser={isOtherUser}
        activeUser={activeUser}
        loading={loading}
        books={books}
        filters={filters}
        onSelectBook={modals.actions.openDetails}
        onAddBook={modals.actions.openCreate}
      />

      <BooksModals
        state={modals.state}
        actions={modals.actions}
        currentUserId={currentUser?.id}
        toasts={toasts.items}
        onRemoveToast={toasts.remove}
      />
    </div>
  );
};

export default ProfilePage;
