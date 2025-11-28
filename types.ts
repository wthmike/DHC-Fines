export interface Player {
  id: string;
  name: string;
  totalOwed: number; // Stored in pence/cents (integer) to avoid floating point errors, but treated as pounds in UI logic
}

export interface SessionData {
  [playerId: string]: {
    addedAmount: number; // Amount added during this session
    isPaidOff: boolean; // If true, the final calculation zeroes everything
    tags: string[]; // Codes for events: 'MOTM', 'DOTD', 'GRN', 'YLW', 'RED'
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
  }[];
}

export enum ViewState {
  LEADERBOARD = 'LEADERBOARD',
  ADMIN_PANEL = 'ADMIN_PANEL',
  SESSION_SETUP = 'SESSION_SETUP',
  ACTIVE_SESSION = 'ACTIVE_SESSION'
}