export interface Player {
  id: string;
  name: string;
  totalOwed: number; // Stored in pence/cents (integer) to avoid floating point errors, but treated as pounds in UI logic
}

export interface SessionData {
  [playerId: string]: {
    addedAmount: number; // Amount added during this session (excluding item fine)
    isPaidOff: boolean; // If true, the final calculation zeroes everything
    tags: string[]; // Codes for events: 'MOTM', 'DOTD', 'GRN', 'YLW', 'RED'
    itemBrought: boolean; // If false, adds £1 fine. If true, no fine.
  };
}

export interface SessionRecord {
  id: string;
  timestamp: number;
  opponent: string;
  transactions: {
    playerId: string;
    playerName: string;
    amount: number;
    tags: string[];
    isPaidOff?: boolean;
  }[];
}

export enum ViewState {
  LEADERBOARD = 'LEADERBOARD',
  ADMIN_PANEL = 'ADMIN_PANEL',
  SESSION_SETUP = 'SESSION_SETUP',
  ACTIVE_SESSION = 'ACTIVE_SESSION'
}