import { useState } from 'react';
import { acceptTrade, completeTrade, rejectTrade, cancelTrade } from '../../../api/tradesApi';
import { queryClient } from '../../../utils/queryClient';
import { useTranslation } from '../../../i18n';

export const useTradeActions = (
  addToast: (text: string, type?: 'success' | 'error' | 'info') => void
) => {
  const { t, tApiError } = useTranslation();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectModalTradeId, setRejectModalTradeId] = useState<string | null>(null);

  const runAction = async (
    tradeId: string,
    fn: () => Promise<void>,
    fallbackErrorKey: string
  ) => {
    try {
      setLoadingId(tradeId);
      await fn();
      queryClient.invalidate('trades');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t(fallbackErrorKey);
      addToast(tApiError(message), 'error');
    } finally {
      setLoadingId(null);
    }
  };

  const accept = async (tradeId: string) => {
    if (!window.confirm(t('trades.toasts.acceptConfirm'))) return;
    await runAction(
      tradeId,
      async () => {
        await acceptTrade(tradeId);
        addToast(t('trades.toasts.acceptSuccess'), 'success');
      },
      'trades.toasts.acceptError'
    );
  };

  const complete = async (tradeId: string) => {
    if (!window.confirm(t('trades.toasts.completeConfirm'))) return;
    await runAction(
      tradeId,
      async () => {
        const updated = await completeTrade(tradeId);
        addToast(
          updated.status === 'COMPLETED'
            ? t('trades.toasts.completeSuccessBoth')
            : t('trades.toasts.completeSuccessWaiting'),
          updated.status === 'COMPLETED' ? 'success' : 'info'
        );
      },
      'trades.toasts.completeError'
    );
  };

  const reject = (tradeId: string) => setRejectModalTradeId(tradeId);

  const confirmReject = async (reason?: string) => {
    if (!rejectModalTradeId) return;
    const targetId = rejectModalTradeId;
    await runAction(
      targetId,
      async () => {
        await rejectTrade(targetId, reason);
        addToast(t('trades.toasts.rejectSuccess'), 'success');
        setRejectModalTradeId(null);
      },
      'trades.toasts.rejectError'
    );
  };

  const cancel = async (tradeId: string) => {
    if (!window.confirm(t('trades.toasts.cancelConfirm'))) return;
    await runAction(
      tradeId,
      async () => {
        await cancelTrade(tradeId);
        addToast(t('trades.toasts.cancelSuccess'), 'success');
      },
      'trades.toasts.cancelError'
    );
  };

  return {
    loadingId,
    rejectModalTradeId,
    setRejectModalTradeId,
    accept,
    complete,
    reject,
    confirmReject,
    cancel,
  };
};
