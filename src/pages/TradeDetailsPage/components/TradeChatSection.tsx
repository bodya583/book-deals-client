import React from 'react';
import { MessageSquareIcon, TradeIcon } from '../../../components/icons';
import type { TradePartner, TradeMessage } from '../../../types/trade';
import {
  HandoverBanner,
  HandoverToolbar,
  renderProposalBubbleContent,
  type HandoverAgreement,
} from './TradeHandoverSection';

export interface TradeChatSectionProps {
  partner?: TradePartner;
  handover: HandoverAgreement;
  messages: TradeMessage[];
  messagesLoading: boolean;
  currentUser: { id: string; username?: string; photoURL?: string | null } | null;
  lastLocationProposalId?: string;
  lastTimeProposalId?: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  sendingMessage: boolean;
  messageText: string;
  setMessageText: (val: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  handleSendCustomMessage: (text: string) => Promise<void>;
  handleAcceptLocation: (text: string) => Promise<void>;
  handleAcceptTime: (text: string) => Promise<void>;
  formatMessageTime: (isoString?: string) => string;
}

export const TradeChatSection: React.FC<TradeChatSectionProps> = ({
  partner,
  handover,
  messages,
  messagesLoading,
  currentUser,
  lastLocationProposalId,
  lastTimeProposalId,
  messagesEndRef,
  sendingMessage,
  messageText,
  setMessageText,
  handleSendMessage,
  handleSendCustomMessage,
  handleAcceptLocation,
  handleAcceptTime,
  formatMessageTime,
}) => {
  return (
    <div className="trade-chat-section">
      <div className="trade-chat-header">
        <div>
          <h3 className="trade-chat-title">
            <span className="trade-chat-title-icon">
              <MessageSquareIcon size={20} />
            </span>
            <span>Чат по сделке</span>
          </h3>
          <span className="trade-chat-subtitle">
            Обсуждение деталей сделки и передачи книг с @{partner?.username}
          </span>
        </div>
      </div>

      {/* Handover Agreement Status Banner */}
      <HandoverBanner handover={handover} partner={partner} />

      <div className="trade-chat-messages">
        {messagesLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888880' }}>
            Загрузка сообщений...
          </div>
        ) : messages.length === 0 ? (
          <div className="trade-chat-empty">
            <MessageSquareIcon size={28} />
            <span>Пока нет сообщений в этом трейде</span>
            <span style={{ fontSize: '0.8rem', color: '#999990' }}>
              Напишите сообщение или предложите время и точку передачи книг
            </span>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.isSelfOnly) {
              return (
                <div key={msg.id} className="trade-chat-self-notice-row">
                  <div className="trade-chat-self-notice-pill">
                    <span className="self-notice-badge">Только для вас</span>
                    <span className="self-notice-text">{msg.text}</span>
                  </div>
                </div>
              );
            }

            const isMine = msg.senderId === currentUser?.id;
            const isLatestLocation = msg.id === lastLocationProposalId;
            const isLatestTime = msg.id === lastTimeProposalId;

            return (
              <div
                key={msg.id}
                className={`trade-chat-bubble-row ${isMine ? 'mine' : 'theirs'}`}
              >
                {!isMine && (
                  <div className="trade-chat-avatar">
                    {msg.sender?.photoURL ? (
                      <img src={msg.sender.photoURL} alt={msg.sender.username} />
                    ) : (
                      <span>{(msg.sender?.username || 'П').slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                )}
                <div className={`trade-chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
                  <div className="trade-chat-meta">
                    <span className="trade-chat-sender-name">
                      {isMine ? 'Вы' : `@${msg.sender?.username}`}
                    </span>
                  </div>
                  {renderProposalBubbleContent(
                    msg,
                    isMine,
                    isLatestLocation,
                    isLatestTime,
                    handleAcceptLocation,
                    handleAcceptTime
                  )}
                  <span className="trade-chat-time">{formatMessageTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Handover Toolbar (Propose location/time) */}
      <HandoverToolbar
        onSendProposal={handleSendCustomMessage}
        disabled={sendingMessage}
      />

      <form onSubmit={handleSendMessage} className="trade-chat-form">
        <input
          type="text"
          className="trade-chat-input"
          placeholder="Напишите сообщение партнеру по сделке..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          disabled={sendingMessage}
        />
        <button
          type="submit"
          className="btn-chat-send"
          disabled={!messageText.trim() || sendingMessage}
        >
          <TradeIcon size={16} />
          <span>{sendingMessage ? 'Отправка...' : 'Отправить'}</span>
        </button>
      </form>
    </div>
  );
};
