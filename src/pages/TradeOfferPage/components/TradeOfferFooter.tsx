import React from 'react';
import { MessageSquareIcon, TradeIcon } from '../../../components/icons';

interface TradeOfferFooterProps {
  message: string;
  setMessage: (msg: string) => void;
  offeredCount: number;
  targetCount: number;
  isTradeUnchanged: boolean;
  submitting: boolean;
  counterTradeId: string;
  onSubmit: (e: React.FormEvent) => void;
}

export const TradeOfferFooter: React.FC<TradeOfferFooterProps> = ({
  message,
  setMessage,
  offeredCount,
  targetCount,
  isTradeUnchanged,
  submitting,
  counterTradeId,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="steam-action-footer">
      <div className="trade-message-group">
        <label className="trade-message-label" htmlFor="trade-message">
          <MessageSquareIcon size={16} />
          <span>Сообщение партнеру (необязательно):</span>
        </label>
        <textarea
          id="trade-message"
          className="trade-message-textarea"
          placeholder="Привет! Предлагаю обменяться книгами. Могу отправить по почте или встретиться лично."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
        />
      </div>

      <div className="trade-footer-bottom">
        <div className="trade-summary-pills">
          <span className="summary-pill pill-give">
            Вы отдаёте: {offeredCount} {offeredCount === 1 ? 'книгу' : 'книг'}
          </span>
          <span className="summary-pill pill-get">
            Вы получаете: {targetCount} {targetCount === 1 ? 'книгу' : 'книг'}
          </span>
          {isTradeUnchanged && (
            <span
              style={{
                fontSize: '0.825rem',
                color: '#b45309',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontWeight: 500,
              }}
            >
              Состав книг не изменён. Измените книги для отправки.
            </span>
          )}
        </div>

        <button
          type="submit"
          className="btn-steam-submit"
          disabled={submitting || (offeredCount === 0 && targetCount === 0) || isTradeUnchanged}
          style={
            counterTradeId
              ? isTradeUnchanged
                ? { background: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' }
                : { background: '#2563eb', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)' }
              : undefined
          }
          title={
            isTradeUnchanged
              ? 'Состав книг не изменился. Добавьте или удалите книги, чтобы отправить встречное предложение'
              : undefined
          }
        >
          <TradeIcon size={18} />
          <span>
            {submitting
              ? 'Отправка...'
              : counterTradeId
              ? isTradeUnchanged
                ? 'Состав книг не изменён'
                : 'Отправить встречное предложение'
              : 'Предложить обмен'}
          </span>
        </button>
      </div>
    </form>
  );
};
