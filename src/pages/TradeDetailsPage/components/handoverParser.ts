import type { TradeMessage } from '../../../types/trade';
import { translate } from '../../../i18n';

export interface HandoverAgreement {
  agreedLocation: string | null;
  agreedTime: string | null;
  pendingLocation: { text: string; senderId: string; senderName: string } | null;
  pendingTime: { text: string; senderId: string; senderName: string } | null;
}

export const LOC_AGREE_REGEX = /Meeting location agreed:\s*(.*)/i;
export const LOC_PROP_REGEX = /Meeting location proposal:\s*(.*)/i;
export const TIME_AGREE_REGEX = /Meeting time agreed:\s*(.*)/i;
export const TIME_PROP_REGEX = /Meeting time proposal:\s*(.*)/i;

export function parseHandoverFromMessages(messages: TradeMessage[]): HandoverAgreement {
  let agreedLocation: string | null = null;
  let agreedTime: string | null = null;
  let pendingLocation: { text: string; senderId: string; senderName: string } | null = null;
  let pendingTime: { text: string; senderId: string; senderName: string } | null = null;

  for (const msg of messages) {
    const text = msg.text || '';

    const agreeLocMatch = text.match(LOC_AGREE_REGEX);
    if (agreeLocMatch) {
      agreedLocation = agreeLocMatch[1].trim();
      pendingLocation = null;
    } else {
      const propLocMatch = text.match(LOC_PROP_REGEX);
      if (propLocMatch) {
        pendingLocation = {
          text: propLocMatch[1].trim(),
          senderId: msg.senderId,
          senderName: msg.sender?.username || translate('common.partner'),
        };
        agreedLocation = null;
      }
    }

    const agreeTimeMatch = text.match(TIME_AGREE_REGEX);
    if (agreeTimeMatch) {
      agreedTime = agreeTimeMatch[1].trim();
      pendingTime = null;
    } else {
      const propTimeMatch = text.match(TIME_PROP_REGEX);
      if (propTimeMatch) {
        pendingTime = {
          text: propTimeMatch[1].trim(),
          senderId: msg.senderId,
          senderName: msg.sender?.username || translate('common.partner'),
        };
        agreedTime = null;
      }
    }
  }

  return { agreedLocation, agreedTime, pendingLocation, pendingTime };
}
