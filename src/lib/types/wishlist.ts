
import { Tender } from './tenderiq';

export interface WishlistItem extends Tender {
  addedAt: string; // ISO date string
}

export interface HistoryItem extends Tender {
  viewedAt: string; // ISO date string
  lastAction: 'viewed' | 'analyzed' | 'downloaded';
}

export interface WishlistResponse {
  count: number;
  items: WishlistItem[];
}

export interface HistoryResponse {
  count: number;
  items: HistoryItem[];
}
