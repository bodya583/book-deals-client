import React from 'react';
import type { Book } from '../../../types/book';
import { formatBookYear } from '../../../types/book';
import { CheckIcon, LockIcon } from '../../../components/icons';
import { BookCover } from '../../../components/ui';
import { useTranslation } from '../../../i18n';

interface ProfileBookCardProps {
  book: Book;
  toggling: boolean;
  onView: (book: Book) => void;
  onToggleTradeStatus: (book: Book) => void;
}

export const ProfileBookCard: React.FC<ProfileBookCardProps> = ({
  book,
  toggling,
  onView,
  onToggleTradeStatus,
}) => {
  const { t, language } = useTranslation();
  const inTrade = book.isForTrade !== false;

  return (
    <div className="profile-own-book-card">
      <div className="profile-own-book-main">
        <BookCover
          coverURL={book.coverURL}
          title={book.title}
          className="profile-own-book-cover"
          iconSize={24}
        />

        <div className="profile-own-book-info">
          <div style={{ marginBottom: '4px' }}>
            {inTrade ? (
              <span className="profile-book-status-badge profile-book-status-badge--trade">
                <CheckIcon size={11} />
                <span>{t('profile.inProfileBadge')}</span>
              </span>
            ) : (
              <span className="profile-book-status-badge profile-book-status-badge--hidden">
                <LockIcon size={11} />
                <span>{t('profile.onlyForYouBadge')}</span>
              </span>
            )}
          </div>

          <span className="profile-own-book-author">{book.author}</span>
          <h4 className="profile-own-book-title">{book.title}</h4>
          {book.year && (
            <span className="profile-own-book-year">{formatBookYear(book.year, language)}</span>
          )}
        </div>
      </div>

      <div className="profile-own-book-actions">
        <button
          type="button"
          className="btn-trade-details"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          onClick={() => onView(book)}
        >
          {t('common.details')}
        </button>

        <button
          type="button"
          className={inTrade ? 'btn-card-profile-untrade' : 'btn-new-trade'}
          style={inTrade ? undefined : { padding: '0.45rem 0.85rem', fontSize: '0.825rem', background: '#2d6a4f' }}
          disabled={toggling}
          onClick={() => onToggleTradeStatus(book)}
          title={inTrade ? t('profile.untradeTitle') : t('profile.tradeTitle')}
        >
          {inTrade ? t('profile.untradeBtn') : t('profile.tradeBtn')}
        </button>
      </div>
    </div>
  );
};
