import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useProfilePage from './hooks/useProfilePage';
import ProfileHero, { type ProfileUser } from './components/ProfileHero';
import { useAuthStore } from '../../store/authStore';
import { getUserProfileById } from '../../api/usersApi';
import { setBookTradeStatus } from '../../api/booksApi';
import api from '../../api/axiosInstance';
import type { Book } from '../../types/book';
import { formatBookYear } from '../../types/book';
import {
  TradeIcon,
  BookOpenIcon,
  ChevronLeftIcon,
  SearchIcon,
  LockIcon,
  CheckIcon,
  CloseIcon,
} from '../../components/icons';
import BookDetailsModal from '../../components/BookDetailsModal';
import BookCard from '../../components/BookCard';
import { useTranslation } from '../../i18n';
import '../books.css';
import '../trades.css';

export const ProfilePage: React.FC = () => {
  const { userId: routeUserId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { t, language } = useTranslation();

  const {
    user: myUser,
    formatDate,
    getInitials,
  } = useProfilePage();

  const isOtherUser = Boolean(routeUserId && routeUserId !== currentUser?.id);

  const [otherUser, setOtherUser] = useState<ProfileUser | null>(null);
  const [otherBooks, setOtherBooks] = useState<Book[]>([]);
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [togglingBookId, setTogglingBookId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(isOtherUser);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    if (!isOtherUser || !routeUserId) return;

    const fetchOtherProfile = async () => {
      try {
        setLoading(true);
        const [profileData, booksRes] = await Promise.all([
          getUserProfileById(routeUserId),
          api.get('/books', { params: { userId: routeUserId, limit: 100 } }),
        ]);

        setOtherUser(profileData);
        const books = booksRes.data.books || booksRes.data || [];
        // Only books marked for exchange are visible to other users
        setOtherBooks(books.filter((b: Book) => b.isForTrade !== false));
      } catch {
        // Fallback or error handled gracefully
      } finally {
        setLoading(false);
      }
    };

    fetchOtherProfile();
  }, [isOtherUser, routeUserId]);

  useEffect(() => {
    if (isOtherUser) return;

    const fetchMyBooks = async () => {
      try {
        if (!currentUser?.id) return;
        const res = await api.get('/books', { params: { userId: currentUser.id, limit: 100 } });
        setMyBooks(res.data.books || res.data || []);
      } catch {
        // ignore
      }
    };

    fetchMyBooks();
  }, [isOtherUser, currentUser?.id]);

  const handleToggleTradeStatus = async (book: Book) => {
    const nextStatus = !(book.isForTrade ?? true);
    try {
      setTogglingBookId(book.id);
      await setBookTradeStatus(book.id, nextStatus);
      setMyBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, isForTrade: nextStatus } : b))
      );
    } catch {
      // ignore
    } finally {
      setTogglingBookId(null);
    }
  };

  const activeUser = isOtherUser ? otherUser : myUser;

  // Filter state for books in profile
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tradeFilter, setTradeFilter] = useState<'all' | 'for_trade' | 'hidden'>('all');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');

  const sourceBooks = isOtherUser ? otherBooks : myBooks;

  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    sourceBooks.forEach((b) => {
      b.genres?.forEach((g) => {
        if (g.name) set.add(g.name);
      });
    });
    return Array.from(set).sort();
  }, [sourceBooks]);

  const filteredBooks = useMemo(() => {
    return sourceBooks
      .filter((book) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = book.title?.toLowerCase().includes(q);
          const matchesAuthor = book.author?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesAuthor) return false;
        }

        if (!isOtherUser && tradeFilter !== 'all') {
          const inTrade = book.isForTrade !== false;
          if (tradeFilter === 'for_trade' && !inTrade) return false;
          if (tradeFilter === 'hidden' && inTrade) return false;
        }

        if (genreFilter !== 'all') {
          const hasGenre = book.genres?.some((g) => g.name === genreFilter);
          if (!hasGenre) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title_asc') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (sortBy === 'title_desc') {
          return (b.title || '').localeCompare(a.title || '');
        }
        if (sortBy === 'year_desc') {
          return (b.year || 0) - (a.year || 0);
        }
        if (sortBy === 'year_asc') {
          return (a.year || 0) - (b.year || 0);
        }
        return 0;
      });
  }, [sourceBooks, searchQuery, tradeFilter, genreFilter, sortBy, isOtherUser]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || (!isOtherUser && tradeFilter !== 'all') || genreFilter !== 'all' || sortBy !== 'default'
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setTradeFilter('all');
    setGenreFilter('all');
    setSortBy('default');
  };

  const renderFilterBar = () => (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e4e4e0',
        borderRadius: '14px',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      }}
    >
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div
          style={{
            flex: 1,
            minWidth: '240px',
            display: 'flex',
            alignItems: 'center',
            background: '#f8f8f5',
            border: '1px solid #e0e0da',
            borderRadius: '10px',
            padding: '0.55rem 0.85rem',
            gap: '0.5rem',
          }}
        >
          <SearchIcon size={18} />
          <input
            type="text"
            placeholder={t('profile.searchBooksPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '0.92rem',
              fontFamily: 'inherit',
              color: '#1a1a1a',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#888880',
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.9rem',
              }}
              title={t('common.clearSearch')}
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>

        {availableGenres.length > 0 && (
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            style={{
              padding: '0.55rem 0.85rem',
              background: '#f8f8f5',
              border: '1px solid #e0e0da',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              color: '#1a1a1a',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">{t('profile.allGenres', { count: availableGenres.length })}</option>
            {availableGenres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        )}

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            background: '#f8f8f5',
            border: '1px solid #e0e0da',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontFamily: 'inherit',
            color: '#1a1a1a',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="default">{t('profile.sortDefault')}</option>
          <option value="title_asc">{t('profile.sortTitleAsc')}</option>
          <option value="title_desc">{t('profile.sortTitleDesc')}</option>
          <option value="year_desc">{t('profile.sortYearDesc')}</option>
          <option value="year_asc">{t('profile.sortYearAsc')}</option>
        </select>
      </div>

      {!isOtherUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: '#666660', marginRight: '0.25rem' }}>
            {t('profile.bookStatusLabel')}
          </span>
          <button
            type="button"
            onClick={() => setTradeFilter('all')}
            className={`trade-tab-btn ${tradeFilter === 'all' ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.825rem' }}
          >
            {t('profile.allBooksTab')} ({myBooks.length})
          </button>
          <button
            type="button"
            onClick={() => setTradeFilter('for_trade')}
            className={`trade-tab-btn ${tradeFilter === 'for_trade' ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <CheckIcon size={13} />
            <span>{t('profile.forTradeTab')} ({myBooks.filter((b) => b.isForTrade !== false).length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTradeFilter('hidden')}
            className={`trade-tab-btn ${tradeFilter === 'hidden' ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <LockIcon size={13} />
            <span>{t('profile.collectionTab')} ({myBooks.filter((b) => b.isForTrade === false).length})</span>
          </button>
        </div>
      )}

      {hasActiveFilters && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #f0f0eb',
            paddingTop: '0.75rem',
            fontSize: '0.85rem',
            color: '#666660',
          }}
        >
          <span>{t('profile.foundCount', { count: filteredBooks.length, total: sourceBooks.length })}</span>
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              background: 'none',
              border: 'none',
              color: '#2d6a4f',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              padding: 0,
            }}
          >
            {t('profile.resetFilters')}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="books-main-container">
      {/* Back button if visiting someone else's profile */}
      {isOtherUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <button
            type="button"
            className="trade-back-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => navigate(-1)}
          >
            <ChevronLeftIcon size={16} />
            <span>{t('common.back')}</span>
          </button>
        </div>
      )}

      {/* Profile Hero Card */}
      <ProfileHero
        user={activeUser}
        initials={getInitials(activeUser?.username)}
        formattedDate={formatDate(activeUser?.createdAt)}
        isOtherUser={isOtherUser}
        bookCount={isOtherUser ? otherBooks.length : myBooks.filter((b) => b.isForTrade !== false).length}
      />

      {/* If viewing someone else: show their books available for trade */}
      {isOtherUser && (
        <section style={{ marginTop: '2rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>
                {t('profile.userBooksTitle', { count: otherBooks.length })}
              </h2>
              <p style={{ margin: '0.25rem 0 0', color: '#666660', fontSize: '0.9rem' }}>
                {t('profile.userBooksSubtitle')}
              </p>
            </div>

            {activeUser && (
              <button
                type="button"
                className="btn-new-trade"
                style={{ background: '#2d6a4f' }}
                onClick={() => navigate(`/trades/new?partnerId=${activeUser.id}`)}
              >
                <TradeIcon size={18} />
                <span>{t('profile.proposeTradeWithUser')}</span>
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#666660' }}>
              {t('profile.loadingUserBooks')}
            </div>
          ) : otherBooks.length === 0 ? (
            <div className="trades-empty-state">
              <BookOpenIcon size={36} />
              <h3 className="empty-state-title">{t('profile.userHasNoBooks')}</h3>
              <p className="empty-state-text">
                {t('profile.userNoBooksText')}
              </p>
            </div>
          ) : (
            <>
              {renderFilterBar()}

              {filteredBooks.length === 0 ? (
                <div className="trades-empty-state">
                  <SearchIcon size={36} />
                  <h3 className="empty-state-title">{t('profile.noFilteredBooksTitle')}</h3>
                  <p className="empty-state-text">
                    {t('profile.noFilteredBooksText')}
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="btn-trade-details"
                    style={{ marginTop: '0.75rem' }}
                  >
                    {t('profile.resetFilters')}
                  </button>
                </div>
              ) : (
                <div className="books-grid">
                  {filteredBooks.map((book) => {
                    const enrichedBook: Book = {
                      ...book,
                      user: book.user || (activeUser ? {
                        id: activeUser.id,
                        username: activeUser.username,
                        city: activeUser.city,
                        photoURL: activeUser.photoURL,
                      } : null),
                    };

                    return (
                      <BookCard
                        key={book.id}
                        book={enrichedBook}
                        isOwner={!isOtherUser}
                        onView={(b) => setSelectedBook(b)}
                        onTrade={isOtherUser ? (b) => navigate(`/trades/new?partnerId=${activeUser?.id}&bookId=${b.id}`) : undefined}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* If viewing own profile: show my books with filters and toggle for profile exchange readiness */}
      {!isOtherUser && (
        <section style={{ marginTop: '2.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>
                {t('profile.myBooksTitle', { count: myBooks.length })}
              </h2>
              <p style={{ margin: '0.25rem 0 0', color: '#666660', fontSize: '0.9rem' }}>
                {t('profile.myBooksSubtitle')}
              </p>
            </div>
            <Link to="/catalog" className="btn-new-trade" style={{ background: '#2d6a4f' }}>
              <span>{t('profile.addBookBtn')}</span>
            </Link>
          </div>

          {myBooks.length === 0 ? (
            <div className="trades-empty-state">
              <BookOpenIcon size={36} />
              <h3 className="empty-state-title">{t('profile.myHasNoBooks')}</h3>
              <p className="empty-state-text">
                {t('profile.myNoBooksText')}
              </p>
            </div>
          ) : (
            <>
              {renderFilterBar()}

              {filteredBooks.length === 0 ? (
                <div className="trades-empty-state">
                  <SearchIcon size={36} />
                  <h3 className="empty-state-title">{t('profile.noFilteredBooksTitle')}</h3>
                  <p className="empty-state-text">
                    {t('profile.noFilteredBooksText')}
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="btn-trade-details"
                    style={{ marginTop: '0.75rem' }}
                  >
                    {t('profile.resetFilters')}
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {filteredBooks.map((book) => {
                    const inTrade = book.isForTrade !== false;
                    return (
                      <div
                        key={book.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e4e4e0',
                          borderRadius: '14px',
                          padding: '1.2rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          {book.coverURL ? (
                            <img
                              src={book.coverURL}
                              alt={book.title}
                              style={{
                                width: '64px',
                                height: '92px',
                                borderRadius: '6px',
                                objectFit: 'cover',
                                flexShrink: 0,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '64px',
                                height: '92px',
                                borderRadius: '6px',
                                background: '#f0f0eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#888880',
                                flexShrink: 0,
                              }}
                            >
                              <BookOpenIcon size={24} />
                            </div>
                          )}

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden' }}>
                            <div style={{ marginBottom: '4px' }}>
                              {inTrade ? (
                                <span
                                  style={{
                                    background: '#ecfdf5',
                                    color: '#047857',
                                    border: '1px solid #a7f3d0',
                                    fontSize: '0.725rem',
                                    padding: '2px 7px',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <CheckIcon size={11} />
                                  <span>{t('profile.inProfileBadge')}</span>
                                </span>
                              ) : (
                                <span
                                  style={{
                                    background: '#f8fafc',
                                    color: '#475569',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.725rem',
                                    padding: '2px 7px',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <LockIcon size={11} />
                                  <span>{t('profile.onlyForYouBadge')}</span>
                                </span>
                              )}
                            </div>

                            <span style={{ fontSize: '0.78rem', color: '#777770', fontWeight: 500 }}>
                              {book.author}
                            </span>
                            <h4
                              style={{
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                margin: 0,
                                color: '#1a1a1a',
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {book.title}
                            </h4>
                            {book.year && (
                              <span style={{ fontSize: '0.75rem', color: '#888880' }}>
                                {formatBookYear(book.year, language)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderTop: '1px solid #f0f0eb',
                            paddingTop: '0.85rem',
                            gap: '0.5rem',
                          }}
                        >
                          <button
                            type="button"
                            className="btn-trade-details"
                            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                            onClick={() => setSelectedBook(book)}
                          >
                            {t('common.details')}
                          </button>

                          {inTrade ? (
                            <button
                              type="button"
                              className="btn-card-profile-untrade"
                              disabled={togglingBookId === book.id}
                              onClick={() => handleToggleTradeStatus(book)}
                              title={t('profile.untradeTitle')}
                            >
                              {t('profile.untradeBtn')}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-new-trade"
                              style={{
                                padding: '0.45rem 0.85rem',
                                fontSize: '0.825rem',
                                background: '#2d6a4f',
                              }}
                              disabled={togglingBookId === book.id}
                              onClick={() => handleToggleTradeStatus(book)}
                              title={t('profile.tradeTitle')}
                            >
                              {t('profile.tradeBtn')}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Book details modal when clicking Details on user's book */}
      <BookDetailsModal
        book={selectedBook}
        isOpen={Boolean(selectedBook)}
        onClose={() => setSelectedBook(null)}
        onEdit={() => {}}
        onDelete={() => {}}
        isOwner={false}
      />
    </div>
  );
};

export default ProfilePage;
