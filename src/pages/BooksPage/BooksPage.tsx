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
  } = useBooksPage();

  return (
    <div className="books-main-container">
      {/* 1. Header */}
      <BooksHeader onAddBook={modalsActions.openCreate} />

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
          <p>Загрузка книг вашей библиотеки...</p>
        </div>
      ) : books.length === 0 ? (
        <BooksEmptyState
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
