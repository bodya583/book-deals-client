import api from './axiosInstance';
import type { Trade, TradeCounts, CreateTradePayload, TradePartner, TradeMessage } from '../types/trade';

export interface RequestOptions {
  signal?: AbortSignal;
}

export const getTrades = async (
  tab?: 'requests' | 'incoming' | 'outgoing' | 'agreed' | 'completed' | 'all',
  options?: RequestOptions
) => {
  const { data } = await api.get<Trade[]>('/trades', {
    params: tab && tab !== 'all' ? { tab } : undefined,
    signal: options?.signal,
  });
  return data;
};

export const getTradeCounts = async (options?: RequestOptions) => {
  const { data } = await api.get<TradeCounts>('/trades/counts', {
    signal: options?.signal,
  });
  return data;
};

export const getTradeById = async (id: string, options?: RequestOptions) => {
  const { data } = await api.get<Trade>(`/trades/${id}`, {
    signal: options?.signal,
  });
  return data;
};

export const createTrade = async (payload: CreateTradePayload) => {
  const { data } = await api.post<Trade>('/trades', payload);
  return data;
};

export const acceptTrade = async (id: string) => {
  const { data } = await api.post<Trade>(`/trades/${id}/accept`);
  return data;
};

export const completeTrade = async (id: string) => {
  const { data } = await api.post<Trade>(`/trades/${id}/complete`);
  return data;
};

export const rejectTrade = async (id: string, reason?: string) => {
  const { data } = await api.post<Trade>(`/trades/${id}/reject`, { reason });
  return data;
};

export const cancelTrade = async (id: string) => {
  const { data } = await api.post<Trade>(`/trades/${id}/cancel`);
  return data;
};

export const getTradePartners = async (options?: RequestOptions) => {
  const { data } = await api.get<TradePartner[]>('/trades/partners', {
    signal: options?.signal,
  });
  return data;
};

export const counterTrade = async (originalTradeId: string, payload: CreateTradePayload) => {
  const { data } = await api.post<Trade>(`/trades/${originalTradeId}/counter`, payload);
  return data;
};

export const getTradeMessages = async (tradeId: string, options?: RequestOptions) => {
  const { data } = await api.get<TradeMessage[]>(`/trades/${tradeId}/messages`, {
    signal: options?.signal,
  });
  return data;
};

export const sendTradeMessage = async (tradeId: string, text: string) => {
  const { data } = await api.post<TradeMessage>(`/trades/${tradeId}/messages`, { text });
  return data;
};
