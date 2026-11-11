import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string | React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  compact = false,
  className = '',
  style,
}) => {
  return (
    <div
      className={`ui-empty-state trades-empty-state ${compact ? 'compact' : ''} ${className}`}
      style={{
        padding: compact ? '2rem 1rem' : '3.5rem 1.5rem',
        ...style,
      }}
    >
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title" style={{ fontSize: compact ? '1.05rem' : '1.25rem' }}>
        {title}
      </h3>
      {description && (
        <div className="empty-state-text" style={{ fontSize: compact ? '0.85rem' : '0.95rem' }}>
          {description}
        </div>
      )}
      {action && <div className="empty-state-action" style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  );
};

export default EmptyState;
