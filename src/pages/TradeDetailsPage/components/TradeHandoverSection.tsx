import React, { useState } from 'react';
import type { TradeMessage, TradePartner } from '../../../types/trade';
import {
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
  CheckIcon,
  CloseIcon,
  SendIcon,
} from '../../../components/icons';

export interface HandoverAgreement {
  agreedLocation: string | null;
  agreedTime: string | null;
  pendingLocation: { text: string; senderId: string; senderName: string } | null;
  pendingTime: { text: string; senderId: string; senderName: string } | null;
}

export function parseHandoverFromMessages(messages: TradeMessage[]): HandoverAgreement {
  let agreedLocation: string | null = null;
  let agreedTime: string | null = null;
  let pendingLocation: { text: string; senderId: string; senderName: string } | null = null;
  let pendingTime: { text: string; senderId: string; senderName: string } | null = null;

  for (const msg of messages) {
    const text = msg.text || '';

    // Check location confirmation
    if (text.startsWith('✅ Точка встречи согласована:')) {
      agreedLocation = text.replace('✅ Точка встречи согласована:', '').trim();
      pendingLocation = null;
    } else if (text.startsWith('📍 Предложение точки передачи:')) {
      const loc = text.replace('📍 Предложение точки передачи:', '').trim();
      pendingLocation = {
        text: loc,
        senderId: msg.senderId,
        senderName: msg.sender?.username || 'Партнёр',
      };
      agreedLocation = null;
    }

    // Check time confirmation
    if (text.startsWith('✅ Время встречи согласовано:')) {
      agreedTime = text.replace('✅ Время встречи согласовано:', '').trim();
      pendingTime = null;
    } else if (text.startsWith('🕒 Предложение времени встречи:')) {
      const t = text.replace('🕒 Предложение времени встречи:', '').trim();
      pendingTime = {
        text: t,
        senderId: msg.senderId,
        senderName: msg.sender?.username || 'Партнёр',
      };
      agreedTime = null;
    }
  }

  return { agreedLocation, agreedTime, pendingLocation, pendingTime };
}

interface HandoverBannerProps {
  handover: HandoverAgreement;
  partner?: TradePartner;
}

export const HandoverBanner: React.FC<HandoverBannerProps> = ({ handover, partner }) => {
  const isBothAgreed = Boolean(handover.agreedLocation && handover.agreedTime);

  return (
    <div className={`trade-handover-widget ${isBothAgreed ? 'all-agreed' : ''}`}>
      <div className="handover-widget-header">
        <span className="handover-widget-title">
          <MapPinIcon size={18} />
          <span>Согласование встречи и передачи книг</span>
        </span>
        {isBothAgreed && (
          <span className="handover-cell-status status-agreed">
            <CheckCircleIcon size={14} />
            <span>Готово к встрече</span>
          </span>
        )}
      </div>

      <div className="handover-grid">
        {/* Location cell */}
        <div
          className={`handover-cell ${
            handover.agreedLocation ? 'agreed' : handover.pendingLocation ? 'pending' : ''
          }`}
        >
          <div className="handover-cell-label">
            <MapPinIcon size={14} />
            <span>Точка передачи (Место)</span>
          </div>
          <div className="handover-cell-value">
            {handover.agreedLocation ? (
              <span>{handover.agreedLocation}</span>
            ) : handover.pendingLocation ? (
              <span>{handover.pendingLocation.text}</span>
            ) : (
              <span style={{ color: '#94a3b8', fontWeight: 400 }}>Не назначено</span>
            )}
          </div>
          <div>
            {handover.agreedLocation ? (
              <span className="handover-cell-status status-agreed">
                <CheckIcon size={13} />
                <span>Согласовано</span>
              </span>
            ) : handover.pendingLocation ? (
              <span className="handover-cell-status status-pending">
                <ClockIcon size={13} />
                <span>Ожидает согласия ({handover.pendingLocation.senderName})</span>
              </span>
            ) : (
              <span className="handover-cell-status status-empty">Требуется согласовать</span>
            )}
          </div>
        </div>

        {/* Time cell */}
        <div
          className={`handover-cell ${
            handover.agreedTime ? 'agreed' : handover.pendingTime ? 'pending' : ''
          }`}
        >
          <div className="handover-cell-label">
            <ClockIcon size={14} />
            <span>Время встречи</span>
          </div>
          <div className="handover-cell-value">
            {handover.agreedTime ? (
              <span>{handover.agreedTime}</span>
            ) : handover.pendingTime ? (
              <span>{handover.pendingTime.text}</span>
            ) : (
              <span style={{ color: '#94a3b8', fontWeight: 400 }}>Не назначено</span>
            )}
          </div>
          <div>
            {handover.agreedTime ? (
              <span className="handover-cell-status status-agreed">
                <CheckIcon size={13} />
                <span>Согласовано</span>
              </span>
            ) : handover.pendingTime ? (
              <span className="handover-cell-status status-pending">
                <ClockIcon size={13} />
                <span>Ожидает согласия ({handover.pendingTime.senderName})</span>
              </span>
            ) : (
              <span className="handover-cell-status status-empty">Требуется согласовать</span>
            )}
          </div>
        </div>
      </div>

      {isBothAgreed && (
        <div className="handover-celebration-banner">
          <CheckCircleIcon size={18} />
          <span>
            🎉 Точка и время встречи согласованы с @{partner?.username}! Возьмите с собой книги к
            указанному времени.
          </span>
        </div>
      )}
    </div>
  );
};

interface HandoverToolbarProps {
  onSendProposal: (text: string) => Promise<void>;
  disabled?: boolean;
}

export const HandoverToolbar: React.FC<HandoverToolbarProps> = ({ onSendProposal, disabled }) => {
  const [activeTab, setActiveTab] = useState<'none' | 'location' | 'time'>('none');
  const [locationInput, setLocationInput] = useState('');
  const [timeInput, setTimeInput] = useState('');

  const quickLocations = [
    'Центральный вход в ТРЦ',
    'Парк Шевченко (у главного фонтана)',
    'Центральный книжный магазин',
    'Возле станции метро',
    'Кофейня в центре города',
  ];

  const quickTimes = [
    'Сегодня в 18:30',
    'Завтра в 12:00',
    'Завтра в 18:00',
    'В эту субботу в 14:00',
    'В это воскресенье в 15:00',
  ];

  const handleSendLocation = async () => {
    const val = locationInput.trim();
    if (!val || disabled) return;
    await onSendProposal(`📍 Предложение точки передачи: ${val}`);
    setLocationInput('');
    setActiveTab('none');
  };

  const handleSendTime = async () => {
    const val = timeInput.trim();
    if (!val || disabled) return;
    await onSendProposal(`🕒 Предложение времени встречи: ${val}`);
    setTimeInput('');
    setActiveTab('none');
  };

  return (
    <div>
      {/* Inline Forms */}
      {activeTab === 'location' && (
        <div className="handover-inline-form">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPinIcon size={16} />
              <span>Предложить место или ориентир для передачи книг</span>
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('none')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <CloseIcon size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="trade-chat-input"
              placeholder="Введите точный адрес, парк или ориентир..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSendLocation())}
              autoFocus
            />
            <button
              type="button"
              className="btn-chat-send"
              style={{ borderRadius: '10px', padding: '0.6rem 1rem' }}
              disabled={!locationInput.trim() || disabled}
              onClick={handleSendLocation}
            >
              <SendIcon size={14} />
              <span>Предложить</span>
            </button>
          </div>

          <div className="handover-chips-row">
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Быстрый выбор:</span>
            {quickLocations.map((loc) => (
              <button
                key={loc}
                type="button"
                className="handover-chip"
                onClick={() => setLocationInput(loc)}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'time' && (
        <div className="handover-inline-form">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CalendarIcon size={16} />
              <span>Предложить удобное время для встречи</span>
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('none')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <CloseIcon size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="trade-chat-input"
              placeholder="Например: Завтра в 18:00, или выберите ниже..."
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSendTime())}
              autoFocus
            />
            <button
              type="button"
              className="btn-chat-send"
              style={{ borderRadius: '10px', padding: '0.6rem 1rem', background: '#2563eb' }}
              disabled={!timeInput.trim() || disabled}
              onClick={handleSendTime}
            >
              <SendIcon size={14} />
              <span>Предложить</span>
            </button>
          </div>

          <div className="handover-chips-row">
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Быстрый выбор:</span>
            {quickTimes.map((tm) => (
              <button
                key={tm}
                type="button"
                className="handover-chip"
                onClick={() => setTimeInput(tm)}
              >
                {tm}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar buttons */}
      <div className="handover-actions-bar">
        <button
          type="button"
          className={`btn-handover-action ${activeTab === 'location' ? 'active' : ''}`}
          onClick={() => setActiveTab(activeTab === 'location' ? 'none' : 'location')}
          disabled={disabled}
        >
          <MapPinIcon size={15} />
          <span>📍 Предложить место встречи</span>
        </button>

        <button
          type="button"
          className={`btn-handover-action ${activeTab === 'time' ? 'active' : ''}`}
          onClick={() => setActiveTab(activeTab === 'time' ? 'none' : 'time')}
          disabled={disabled}
        >
          <ClockIcon size={15} />
          <span>🕒 Предложить время встречи</span>
        </button>
      </div>
    </div>
  );
};

export const renderProposalBubbleContent = (
  msg: TradeMessage,
  isMine: boolean,
  onAcceptLocation: (loc: string) => Promise<void>,
  onAcceptTime: (timeStr: string) => Promise<void>
): React.ReactNode => {
  const text = msg.text || '';

  // Location proposal
  if (text.startsWith('📍 Предложение точки передачи:')) {
    const loc = text.replace('📍 Предложение точки передачи:', '').trim();
    return (
      <div className="chat-proposal-card loc-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }}>
          <MapPinIcon size={16} />
          <span>Предложение точки передачи</span>
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{loc}</div>
        {!isMine ? (
          <button
            type="button"
            className="btn-accept-proposal"
            onClick={() => onAcceptLocation(loc)}
            title="Принять предложенное место встречи"
          >
            <CheckIcon size={14} />
            <span>Согласовать это место</span>
          </button>
        ) : (
          <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
            Вы предложили это место. Ожидается ответ партнёра.
          </span>
        )}
      </div>
    );
  }

  // Location confirmed
  if (text.startsWith('✅ Точка встречи согласована:')) {
    const loc = text.replace('✅ Точка встречи согласована:', '').trim();
    return (
      <div className="chat-proposal-card confirm-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }}>
          <CheckCircleIcon size={16} />
          <span>Точка встречи согласована!</span>
        </div>
        <div style={{ fontSize: '0.925rem', fontWeight: 600 }}>📍 {loc}</div>
      </div>
    );
  }

  // Time proposal
  if (text.startsWith('🕒 Предложение времени встречи:')) {
    const tm = text.replace('🕒 Предложение времени встречи:', '').trim();
    return (
      <div className="chat-proposal-card time-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }}>
          <ClockIcon size={16} />
          <span>Предложение времени встречи</span>
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{tm}</div>
        {!isMine ? (
          <button
            type="button"
            className="btn-accept-proposal"
            style={{ background: '#2563eb' }}
            onClick={() => onAcceptTime(tm)}
            title="Принять предложенное время встречи"
          >
            <CheckIcon size={14} />
            <span>Согласовать это время</span>
          </button>
        ) : (
          <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
            Вы предложили это время. Ожидается ответ партнёра.
          </span>
        )}
      </div>
    );
  }

  // Time confirmed
  if (text.startsWith('✅ Время встречи согласовано:')) {
    const tm = text.replace('✅ Время встречи согласовано:', '').trim();
    return (
      <div className="chat-proposal-card confirm-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem' }}>
          <CheckCircleIcon size={16} />
          <span>Время встречи согласовано!</span>
        </div>
        <div style={{ fontSize: '0.925rem', fontWeight: 600 }}>🕒 {tm}</div>
      </div>
    );
  }

  // Regular plain message
  return <div>{text}</div>;
};
