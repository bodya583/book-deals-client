import React from 'react';
import useBooksPage from './hooks/useBooksPage';
import BooksHeader from './components/BooksHeader';
import BooksToolbar from './components/BooksToolbar';
import BooksEmptyState from './components/BooksEmptyState';
import BookCard from '../../components/BookCard';
import BooksModals from '../../components/BooksModals';
import '../books.css';

export const BooksPage: React.FC = () => {
  const {
    userId,
    books,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    handleManualRefresh,
    modalsState,
    modalsActions,
    toasts,
    removeToast,
  } = useBooksPage();

  return (
    <div className="books-main-container">
      {/* 1. Header */}
      <BooksHeader onAddBook={modalsActions.openCreate} />

      {/* 2. Toolbar (Search & Stats) */}
      <BooksToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        count={books.length}
      />

      {/* 3. Error Banner */}
      {error && (
        <div className="books-error-card">
          <p>{error}</p>
          <button type="button" onClick={handleManualRefresh} className="btn-retry">
            Попробовать снова
          </button>
        </div>
      )}

      {/* 4. Content Area (Loading / Empty / Grid) */}
      {loading ? (
        <div className="books-loading-state">
          <div className="books-spinner" />
          <p>Загрузка книг вашей библиотеки...</p>
        </div>
      ) : books.length === 0 ? (
        <BooksEmptyState
          isSearch={Boolean(debouncedSearch)}
          searchQuery={debouncedSearch}
          onClearSearch={() => setSearchQuery('')}
          onAddBook={modalsActions.openCreate}
        />
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isOwner={book.userId === userId || !book.userId}
              onView={modalsActions.openDetails}
              onEdit={modalsActions.openEdit}
              onDelete={modalsActions.openDelete}
            />
          ))}
        </div>
      )}

      {/* 5. Modals & Toasts Container */}
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

export default BooksPage;
