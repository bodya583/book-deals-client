import React, { useState } from 'react';
import { BookOpenIcon } from '../../icons';
import { useTranslation } from '../../../i18n';

export interface BookCoverProps {
  coverURL?: string | null;
  title?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  iconSize?: number;
}

const SIZE_PRESETS = {
  xs: { width: 36, height: 50, iconSize: 18 },
  sm: { width: 48, height: 68, iconSize: 22 },
  md: { width: 64, height: 90, iconSize: 28 },
  lg: { width: 100, height: 140, iconSize: 36 },
};

export const BookCover: React.FC<BookCoverProps> = ({
  coverURL,
  title,
  size,
  width,
  height,
  className = '',
  style,
  iconSize,
}) => {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);
  const resolvedTitle = title ?? t('bookCard.coverAltFallback');

  const preset = size ? SIZE_PRESETS[size] : undefined;
  const finalWidth = width ?? preset?.width;
  const finalHeight = height ?? preset?.height;
  const finalIconSize = iconSize ?? preset?.iconSize ?? 24;

  const containerStyle: React.CSSProperties = {
    ...(finalWidth ? { width: finalWidth, minWidth: finalWidth } : {}),
    ...(finalHeight ? { height: finalHeight, minHeight: finalHeight } : {}),
    borderRadius: '6px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    position: 'relative',
    flexShrink: 0,
    ...style,
  };

  if (coverURL && !imgError) {
    return (
      <div className={`ui-book-cover ${className}`} style={containerStyle}>
        <img
          src={coverURL}
          alt={resolvedTitle}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`ui-book-cover ui-book-cover-placeholder ${className}`}
      style={containerStyle}
      title={resolvedTitle}
    >
      <BookOpenIcon size={finalIconSize} color="#64748b" />
    </div>
  );
};

export default BookCover;
