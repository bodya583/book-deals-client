import React from 'react';
import { MessageSquareIcon, TradeIcon } from '../../../components/icons';
import type { TradePartner } from '../../../types/trade';
import { HandoverBanner } from './HandoverBanner';
import { HandoverToolbar } from './HandoverToolbar';
import { ProposalBubbleContent } from './ProposalBubbleContent';
import { Avatar, EmptyState } from '../../../components/ui';
import { useTranslation } from '../../../i18n';
import type { TradeChatController, TradeHandoverController } from '../hooks/useTradeChat';

export interface TradeChatSectionProps {
  partner?: TradePartner;
  currentUser: { id: string; username?: string; photoURL?: string | null } | null;
  chat: TradeChatController;
  handover: TradeHandoverController;
  formatMessageTime: (isoString?: string) => string;
}

export const TradeChatSection: React.FC<TradeChatSectionProps> = ({
  partner,
  currentUser,
  chat,
  handover,
  formatMessageTime,
}) => {
  const { t } = useTranslation();

  return (
    <div className="trade-chat-section">
      <div className="trade-chat-header">
        <div>
          <h3 className="trade-chat-title">
            <span className="trade-chat-title-icon">
              <MessageSquareIcon size={20} />
            </span>
            <span>{t('tradeDetails.chatTitle')}</span>
          </h3>
          <span className="trade-chat-subtitle">
            {t('tradeDetails.chatSubtitle', { username: partner?.username || '' })}
          </span>
        </div>
      </div>

      <HandoverBanner handover={handover.agreement} partner={partner} />

      <div className="trade-chat-messages">
        {chat.loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888880' }}>
            {t('common.loading')}
          </div>
        ) : chat.messages.length === 0 ? (
          <EmptyState
            compact
            icon={<MessageSquareIcon size={28} />}
            title={t('tradeDetails.emptyChatTitle')}
            description={t('tradeDetails.emptyChatDesc')}
          />
        ) : (
          chat.messages.map((msg) => {
            if (msg.isSelfOnly) {
              return (
                <div key={msg.id} className="trade-chat-self-notice-row">
                  <div className="trade-chat-self-notice-pill">
                    <span className="self-notice-badge">{t('tradeDetails.onlyForYouBadge')}</span>
                    <span className="self-notice-text">{msg.text}</span>
                  </div>
                </div>
              );
            }

            const isMine = msg.senderId === currentUser?.id;

            return (
              <div key={msg.id} className={`trade-chat-bubble-row ${isMine ? 'mine' : 'theirs'}`}>
                {!isMine && (
                  <Avatar
                    photoURL={msg.sender?.photoURL}
                    username={msg.sender?.username}
                    size={36}
                    className="trade-chat-avatar"
                  />
                )}
                <div className={`trade-chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
                  <div className="trade-chat-meta">
                    <span className="trade-chat-sender-name">
                      {isMine ? t('common.you') : `@${msg.sender?.username}`}
                    </span>
                  </div>
                  <ProposalBubbleContent
                    msg={msg}
                    isMine={isMine}
                    isLatestLocation={msg.id === handover.lastLocationProposalId}
                    isLatestTime={msg.id === handover.lastTimeProposalId}
                    onAcceptLocation={handover.acceptLocation}
                    onAcceptTime={handover.acceptTime}
                  />
                  <span className="trade-chat-time">{formatMessageTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={chat.endRef} />
      </div>

      <HandoverToolbar onSendProposal={chat.sendCustomMessage} disabled={chat.sending} />

      <form onSubmit={chat.sendMessage} className="trade-chat-form">
        <input
          type="text"
          className="trade-chat-input"
          placeholder={t('tradeDetails.chatPlaceholder')}
          value={chat.text}
          onChange={(e) => chat.setText(e.target.value)}
          disabled={chat.sending}
        />
        <button
          type="submit"
          className="btn-chat-send"
          disabled={!chat.text.trim() || chat.sending}
        >
          <TradeIcon size={16} />
          <span>{chat.sending ? t('common.loading') : t('tradeDetails.sendBtn')}</span>
        </button>
      </form>
    </div>
  );
};

export default TradeChatSection;
