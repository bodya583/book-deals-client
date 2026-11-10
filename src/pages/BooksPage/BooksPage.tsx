import React, { useState } from 'react';
import useBooksPage from './hooks/useBooksPage';
import BooksHeader from './components/BooksHeader';
import BooksToolbar from './components/BooksToolbar';
import BooksPagination from './components/BooksPagination';
import BooksEmptyState from './components/BooksEmptyState';
import BookCard from '../../components/BookCard';
import BooksMap from '../../components/BooksMap/BooksMap';
import BooksModals from '../../components/BooksModals';
import '../books.css';

interface BooksPageProps {
  scope?: 'my' | 'all';
}

export const BooksPage: React.FC<BooksPageProps> = ({ scope = 'my' }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const {
    user,
    userId,
    books,
    genres,
    loading,
    isFetching,
    error,
    // Pagination
    pagination,
    changePage,
    changeLimit,
    // Search & Filters
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    selectedGenres,
    setSelectedGenres,
    toggleGenre,
    strictGenres,
    setStrictGenres,
    selectedLanguages,
    setSelectedLanguages,
    toggleLanguage,
    yearFrom,
    setYearFrom,
    yearTo,
    setYearTo,
    setYearRange,
    settlements,
    selectedSettlements,
    toggleSettlement,
    clearSettlements,
    nearMe,
    setNearMe,
    radius,
    setRadius,
    nearCenter,
    setNearCenter,
    sortBy,
    setSortBy,
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
      {/* 1. Header with Add Book Action */}
      <BooksHeader
        scope={scope}
        onAddBook={modalsActions.openCreate}
      />

      {/* 2. Toolbar (Search, Multi-Genres with strict toggle, Multi-Languages, Year Range, Settlements & Distance, Stats) */}
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
        availableSettlements={settlements}
        selectedSettlements={selectedSettlements}
        onToggleSettlement={toggleSettlement}
        onClearSettlements={clearSettlements}
        nearMe={nearMe}
        onNearMeChange={setNearMe}
        radius={radius}
        onRadiusChange={setRadius}
        nearCenter={nearCenter}
        onNearCenterChange={setNearCenter}
        userCoords={{ latitude: user?.latitude ?? null, longitude: user?.longitude ?? null }}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
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

      {/* 4. Top Pagination (Pages selector & limit on page & view switcher) */}
      {!loading && (books.length > 0 || isFetching) && (
        <BooksPagination
          pagination={pagination}
          onPageChange={changePage}
          onLimitChange={changeLimit}
          variant="top"
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}

      {/* 5. Content Area (Loading / Empty / Map / Grid) */}
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
      ) : viewMode === 'map' ? (
        <div className="books-map-section" style={{ margin: '1rem 0' }}>
          <BooksMap
            books={books}
            userCoords={{ latitude: user?.latitude ?? null, longitude: user?.longitude ?? null }}
            onViewBook={modalsActions.openDetails}
          />
        </div>
      ) : (
        <div className={`books-grid ${isFetching ? 'is-fetching' : ''}`}>
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

      {/* 6. Bottom Pagination (Pages selector & limit on page) */}
      {!loading && (books.length > 0 || isFetching) && (
        <BooksPagination
          pagination={pagination}
          onPageChange={changePage}
          onLimitChange={changeLimit}
          variant="bottom"
        />
      )}

      {/* 7. Modals & Toasts Container */}
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
