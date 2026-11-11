import React from 'react';
import { MessageSquareIcon, TradeIcon } from '../../../components/icons';
import { useTranslation } from '../../../i18n';

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
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="steam-action-footer">
      <div className="trade-message-group">
        <label className="trade-message-label" htmlFor="trade-message">
          <MessageSquareIcon size={16} />
          <span>{t('offer.messageLabel')}</span>
        </label>
        <textarea
          id="trade-message"
          className="trade-message-textarea"
          placeholder={t('offer.messagePlaceholder')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
        />
      </div>

      <div className="trade-footer-bottom">
        <div className="trade-summary-pills">
          <span className="summary-pill pill-give">
            {t('offer.giveBooksCount', { count: offeredCount })}
          </span>
          <span className="summary-pill pill-get">
            {t('offer.getBooksCount', { count: targetCount })}
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
              {t('offer.unchangedWarning')}
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
          title={isTradeUnchanged ? t('offer.unchangedTitle') : undefined}
        >
          <TradeIcon size={18} />
          <span>
            {submitting
              ? t('offer.submitting')
              : counterTradeId
              ? isTradeUnchanged
                ? t('offer.unchangedBtn')
                : t('offer.submitCounterBtn')
              : t('offer.submitOfferBtn')}
          </span>
        </button>
      </div>
    </form>
  );
};

export default TradeOfferFooter;
