import React from 'react';
import { useNavigate } from 'react-router-dom';
import useBooksPage from './hooks/useBooksPage';
import BooksHeader from './components/BooksHeader';
import BooksToolbar from './components/BooksToolbar';
import BooksEmptyState from './components/BooksEmptyState';
import BookCard from '../../components/BookCard';
import BooksModals from '../../components/BooksModals';
import '../books.css';

interface BooksPageProps {
  scope?: 'my' | 'all';
}

export const BooksPage: React.FC<BooksPageProps> = ({ scope = 'my' }) => {
  const navigate = useNavigate();
  const {
    userId,
    books,
    genres,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    // Genres filter
    selectedGenres,
    setSelectedGenres,
    toggleGenre,
    strictGenres,
    setStrictGenres,
    // Languages filter
    selectedLanguages,
    setSelectedLanguages,
    toggleLanguage,
    // Year filter
    yearFrom,
    setYearFrom,
    yearTo,
    setYearTo,
    setYearRange,
    // Global filter resets & state
    resetFilters,
    hasActiveFilters,
    handleManualRefresh,
    modalsState,
    modalsActions,
    toasts,
    removeToast,
  } = useBooksPage({ scope });

  return (
    <div className="books-main-container">
      {/* 1. Header with Scope Switch & Add Book Action */}
      <BooksHeader
        scope={scope}
        onScopeChange={(newScope) => navigate(newScope === 'all' ? '/catalog' : '/my-books')}
        onAddBook={modalsActions.openCreate}
      />

      {/* 2. Toolbar (Search, Multi-Genres with strict toggle, Multi-Languages, Year Range, Stats) */}
      <BooksToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedGenres={selectedGenres}
        onToggleGenre={toggleGenre}
        onClearGenres={() => setSelectedGenres([])}
        strictGenres={strictGenres}
        onStrictGenresChange={setStrictGenres}
        availableGenres={genres}
        selectedLanguages={selectedLanguages}
        onToggleLanguage={toggleLanguage}
        onClearLanguages={() => setSelectedLanguages([])}
        yearFrom={yearFrom}
        onYearFromChange={setYearFrom}
        yearTo={yearTo}
        onYearToChange={setYearTo}
        onSetYearRange={setYearRange}
        onClearYears={() => setYearRange('', '')}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
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
          <p>{scope === 'all' ? 'Загрузка общего каталога книг...' : 'Загрузка книг вашей библиотеки...'}</p>
        </div>
      ) : books.length === 0 ? (
        <BooksEmptyState
          scope={scope}
          isFiltered={hasActiveFilters}
          searchQuery={debouncedSearch}
          selectedGenres={selectedGenres}
          strictGenres={strictGenres}
          selectedLanguages={selectedLanguages}
          yearFrom={yearFrom}
          yearTo={yearTo}
          onResetFilters={resetFilters}
          onAddBook={modalsActions.openCreate}
        />
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isOwner={Boolean(userId && book.userId === userId)}
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
