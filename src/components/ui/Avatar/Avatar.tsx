import React, { useState } from 'react';
import { useTranslation } from '../../../i18n';

export interface AvatarProps {
  photoURL?: string | null;
  username?: string | null;
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

const SIZE_MAP: Record<string, number> = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

export const Avatar: React.FC<AvatarProps> = ({
  photoURL,
  username,
  size = 'md',
  className = '',
  style,
  alt,
}) => {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);

  const dimension = typeof size === 'number' ? size : SIZE_MAP[size] || 40;
  const displayName = username?.trim() || t('common.user');
  const initials = displayName
    .replace(/^@/, '')
    .slice(0, 2)
    .toUpperCase();

  const containerStyle: React.CSSProperties = {
    width: dimension,
    height: dimension,
    minWidth: dimension,
    minHeight: dimension,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: dimension * 0.38,
    userSelect: 'none',
    flexShrink: 0,
    ...style,
  };

  if (photoURL && !imgError) {
    return (
      <div className={`ui-avatar ${className}`} style={containerStyle} title={displayName}>
        <img
          src={photoURL}
          alt={alt || displayName}
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
    <div className={`ui-avatar ui-avatar-fallback ${className}`} style={containerStyle} title={displayName}>
      <span>{initials}</span>
    </div>
  );
};

export default Avatar;
