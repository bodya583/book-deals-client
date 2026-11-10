import api from './axiosInstance';
import type { Trade, TradeCounts, CreateTradePayload, TradePartner, TradeMessage } from '../types/trade';

export const getTrades = async (tab?: 'requests' | 'incoming' | 'outgoing' | 'agreed' | 'completed' | 'all') => {
  const { data } = await api.get<Trade[]>('/trades', {
    params: tab && tab !== 'all' ? { tab } : undefined,
  });
  return data;
};

export const getTradeCounts = async () => {
  const { data } = await api.get<TradeCounts>('/trades/counts');
  return data;
};

export const getTradeById = async (id: string) => {
  const { data } = await api.get<Trade>(`/trades/${id}`);
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

export const rejectTrade = async (id: string) => {
  const { data } = await api.post<Trade>(`/trades/${id}/reject`);
  return data;
};

export const cancelTrade = async (id: string) => {
  const { data } = await api.post<Trade>(`/trades/${id}/cancel`);
  return data;
};

export const getTradePartners = async () => {
  const { data } = await api.get<TradePartner[]>('/trades/partners');
  return data;
};

export const counterTrade = async (originalTradeId: string, payload: CreateTradePayload) => {
  const { data } = await api.post<Trade>(`/trades/${originalTradeId}/counter`, payload);
  return data;
};

export const getTradeMessages = async (tradeId: string) => {
  const { data } = await api.get<TradeMessage[]>(`/trades/${tradeId}/messages`);
  return data;
};

export const sendTradeMessage = async (tradeId: string, text: string) => {
  const { data } = await api.post<TradeMessage>(`/trades/${tradeId}/messages`, { text });
  return data;
};

