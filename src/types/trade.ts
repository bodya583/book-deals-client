import type { Book } from './book';

export type TradeStatus = 'PENDING' | 'AGREED' | 'COMPLETED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface TradePartner {
  id: string;
  username: string;
  photoURL?: string | null;
  city?: string | null;
  bookCount?: number;
}

export interface TradeItem {
  id: string;
  bookId: string;
  side: 'OFFERED' | 'REQUESTED';
  book: Book;
}

export interface Trade {
  id: string;
  senderId: string;
  sender: TradePartner;
  receiverId: string;
  receiver: TradePartner;
  status: TradeStatus;
  message?: string | null;
  createdAt: string;
  updatedAt: string;
  offeredBooks: Book[];
  requestedBooks: Book[];
  items?: TradeItem[];
  isSender?: boolean;
  isReceiver?: boolean;
  senderCompleted?: boolean;
  receiverCompleted?: boolean;
  agreedLocationHash?: string;
  agreedTimeHash?: string;
}

export interface TradeCounts {
  incoming: number;
  outgoing: number;
  requests?: number;
  agreed: number;
  completed: number;
  total: number;
}

export interface CreateTradePayload {
  receiverId: string;
  offerBookIds: string[];
  targetBookIds: string[];
  message?: string;
}

export interface TradeMessage {
  id: string;
  tradeId: string;
  senderId: string;
  sender: TradePartner;
  text: string;
  createdAt: string;
  isSelfOnly?: boolean;
}
