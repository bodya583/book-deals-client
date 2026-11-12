import React from 'react';
import useBooksPage from './hooks/useBooksPage';
import BooksHeader from './components/BooksHeader';
import BooksToolbar from './components/BooksToolbar';
import BooksPagination from './components/BooksPagination';
import BooksEmptyState from './components/BooksEmptyState';
import BookCard from '../../components/BookCard';
import BooksMap from '../../components/BooksMap/BooksMap';
import BooksModals from '../../components/BooksModals';
import { useTranslation } from '../../i18n';
import '../books.css';

interface BooksPageProps {
  scope?: 'my' | 'all';
}

export const BooksPage: React.FC<BooksPageProps> = ({ scope = 'my' }) => {
  const { t } = useTranslation();
  const { auth, catalog, pagination, filters, modals, toasts } = useBooksPage({ scope });
  const { viewMode } = filters.display;
  const userCoords = {
    latitude: auth.user?.latitude ?? null,
    longitude: auth.user?.longitude ?? null,
  };

  return (
    <div className="books-main-container">
      <BooksHeader scope={scope} onAddBook={modals.actions.openCreate} />

      <BooksToolbar
        filters={filters}
        availableGenres={catalog.genres}
        availableSettlements={catalog.settlements}
        userCoords={userCoords}
      />

      {catalog.error && (
        <div className="books-error-card">
          <p>{catalog.error}</p>
          <button type="button" onClick={catalog.refresh} className="btn-retry">
            {t('common.tryAgain')}
          </button>
        </div>
      )}

      {!catalog.loading && (catalog.books.length > 0 || catalog.isFetching) && (
        <BooksPagination
          pagination={pagination}
          display={filters.display}
          variant="top"
        />
      )}

      {catalog.loading ? (
        <div className="books-loading-state">
          <div className="books-spinner" />
          <p>{scope === 'all' ? t('catalog.loadingCatalog') : t('catalog.loadingMyBooks')}</p>
        </div>
      ) : catalog.books.length === 0 ? (
        <BooksEmptyState scope={scope} filters={filters} onAddBook={modals.actions.openCreate} />
      ) : viewMode === 'map' ? (
        <div className="books-map-section" style={{ margin: '1rem 0' }}>
          <BooksMap
            books={catalog.books}
            userCoords={userCoords}
            onViewBook={modals.actions.openDetails}
          />
        </div>
      ) : (
        <div className={`books-grid ${catalog.isFetching ? 'is-fetching' : ''}`}>
          {catalog.books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isOwner={Boolean(auth.userId && book.userId === auth.userId)}
              onView={modals.actions.openDetails}
              onEdit={modals.actions.openEdit}
              onDelete={modals.actions.openDelete}
            />
          ))}
        </div>
      )}

      {viewMode === 'grid' && !catalog.loading && (catalog.books.length > 0 || catalog.isFetching) && (
        <BooksPagination pagination={pagination} display={filters.display} variant="bottom" />
      )}

      <BooksModals
        state={modals.state}
        actions={modals.actions}
        currentUserId={auth.userId}
        toasts={toasts.items}
        onRemoveToast={toasts.remove}
      />
    </div>
  );
};

export default BooksPage;
