import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenIcon, SearchIcon, PlusIcon } from '../../../components/icons';
import BookCard from '../../../components/BookCard';
import { useTranslation } from '../../../i18n';
import type { Book } from '../../../types/book';
import type { ProfileUser } from './ProfileHero';
import type { ProfileBooksFiltersController } from '../hooks/useProfileBooks';
import { ProfileBooksFilterBar } from './ProfileBooksFilterBar';
import { ProfileBookCard } from './ProfileBookCard';

interface ProfileBooksState {
  source: Book[];
  filtered: Book[];
  availableGenres: string[];
  togglingBookId: string | null;
  toggleTradeStatus: (book: Book) => void;
}

interface ProfileBooksSectionProps {
  isOtherUser: boolean;
  activeUser: ProfileUser | null;
  loading: boolean;
  books: ProfileBooksState;
  filters: ProfileBooksFiltersController;
  onSelectBook: (book: Book) => void;
  onAddBook: () => void;
}

export const ProfileBooksSection: React.FC<ProfileBooksSectionProps> = ({
  isOtherUser,
  activeUser,
  loading,
  books,
  filters,
  onSelectBook,
  onAddBook,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className={isOtherUser ? 'profile-books-section' : 'profile-books-section--own'}>
      <div className="profile-books-header">
        <div className="profile-books-header-info">
          <h2 className="profile-books-title">
            {isOtherUser
              ? t('profile.userBooksTitle', { count: books.source.length })
              : t('profile.myBooksTitle', { count: books.source.length })}
          </h2>
          <p className="profile-books-subtitle">
            {isOtherUser ? t('profile.userBooksSubtitle') : t('profile.myBooksSubtitle')}
          </p>
        </div>

        {!isOtherUser && (
          <button
            type="button"
            className="btn-primary-action profile-books-header-action"
            onClick={onAddBook}
          >
            <PlusIcon size={18} />
            <span>{t('profile.addBookBtn')}</span>
          </button>
        )}
      </div>

      {isOtherUser && loading ? (
        <div className="profile-loading-state">{t('profile.loadingUserBooks')}</div>
      ) : books.source.length === 0 ? (
        <div className="trades-empty-state">
          <BookOpenIcon size={36} />
          <h3 className="empty-state-title">
            {isOtherUser ? t('profile.userHasNoBooks') : t('profile.myHasNoBooks')}
          </h3>
          <p className="empty-state-text">
            {isOtherUser ? t('profile.userNoBooksText') : t('profile.myNoBooksText')}
          </p>
          {!isOtherUser && (
            <button
              type="button"
              className="btn-primary-action"
              onClick={onAddBook}
              style={{ marginTop: '0.75rem' }}
            >
              <PlusIcon size={18} />
              <span>{t('profile.addBookBtn')}</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <ProfileBooksFilterBar
            filters={filters}
            availableGenres={books.availableGenres}
            sourceBooks={books.source}
            filteredCount={books.filtered.length}
            isOtherUser={isOtherUser}
          />

          {books.filtered.length === 0 ? (
            <div className="trades-empty-state">
              <SearchIcon size={36} />
              <h3 className="empty-state-title">{t('profile.noFilteredBooksTitle')}</h3>
              <p className="empty-state-text">{t('profile.noFilteredBooksText')}</p>
              <button
                type="button"
                onClick={filters.reset}
                className="btn-trade-details"
                style={{ marginTop: '0.75rem' }}
              >
                {t('profile.resetFilters')}
              </button>
            </div>
          ) : isOtherUser ? (
            <div className="books-grid">
              {books.filtered.map((book) => (
                <BookCard
                  key={book.id}
                  book={{
                    ...book,
                    user:
                      book.user ||
                      (activeUser
                        ? {
                            id: activeUser.id,
                            username: activeUser.username,
                            city: activeUser.city,
                            photoURL: activeUser.photoURL,
                          }
                        : null),
                  }}
                  isOwner={false}
                  onView={onSelectBook}
                  onTrade={(b) => navigate(`/trades/new?partnerId=${activeUser?.id}&bookId=${b.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="profile-own-books-grid">
              {books.filtered.map((book) => (
                <ProfileBookCard
                  key={book.id}
                  book={book}
                  toggling={books.togglingBookId === book.id}
                  onView={onSelectBook}
                  onToggleTradeStatus={books.toggleTradeStatus}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};
