import React from 'react';
import type { Book, BookFormData } from '../types/book';
import BookDetailsModal from './BookDetailsModal';
import BookFormModal from './BookFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import Toast, { type ToastMessage } from './Toast';

export interface BooksModalsState {
  selectedBook: Book | null;
  formModal: {
    isOpen: boolean;
    mode: 'create' | 'edit';
    book: Book | null;
  };
  deletingBook: Book | null;
}

export interface BooksModalsActions {
  closeDetails: () => void;
  openCreate: () => void;
  openEdit: (book: Book) => void;
  closeForm: () => void;
  openDelete: (book: Book) => void;
  closeDelete: () => void;
  submitForm: (formData: BookFormData) => Promise<void>;
  confirmDelete: (bookId: string) => Promise<void>;
}

interface BooksModalsProps {
  state: BooksModalsState;
  actions: BooksModalsActions;
  currentUserId?: string | null;
  toasts: ToastMessage[];
  onRemoveToast: (id: string) => void;
}

export const BooksModals: React.FC<BooksModalsProps> = ({
  state,
  actions,
  currentUserId,
  toasts,
  onRemoveToast,
}) => {
  const isOwner = state.selectedBook
    ? state.selectedBook.userId === currentUserId || !state.selectedBook.userId
    : true;

  return (
    <>
      {/* Book Details Modal Popup */}
      <BookDetailsModal
        book={state.selectedBook}
        isOpen={Boolean(state.selectedBook)}
        isOwner={isOwner}
        onClose={actions.closeDetails}
        onEdit={actions.openEdit}
        onDelete={actions.openDelete}
      />

      {/* Book Add / Edit Modal */}
      <BookFormModal
        isOpen={state.formModal.isOpen}
        mode={state.formModal.mode}
        initialBook={state.formModal.book}
        onClose={actions.closeForm}
        onSubmit={actions.submitForm}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        book={state.deletingBook}
        isOpen={Boolean(state.deletingBook)}
        onClose={actions.closeDelete}
        onConfirm={actions.confirmDelete}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={onRemoveToast} />
    </>
  );
};

export default BooksModals;
