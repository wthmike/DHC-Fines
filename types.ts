export interface Player {
  id: string;
  name: string;
  totalOwed: number; // Stored in pounds (£)
  isU18?: boolean;   // Whether player is under 18 (eligible for 1/2 price fines)
  isHidden?: boolean; // Whether player is hidden from public view while preserving fines
}

export interface PlayerSessionState {
  generalFines: number;  // Count of 25p fines (capped at 10 = £2.50)
  greenCards: number;    // £2.00 each
  yellowCards: number;   // £5.00 each
  redCards: number;      // £20.00 each
  isDotd: boolean;       // +50p Dick of the Day
  isMotm: boolean;       // -50p Man of the Match off fines
  itemBrought: boolean;  // If false, optional item fine (£1.00)
  isU18: boolean;        // If true, 1/2 price on total fines!
  isPaidOff: boolean;    // If true, paid off at pub right now
  addedAmount: number;   // Final calculated session fine
  tags: string[];        // Event tags for badges & receipts
}

export interface SessionData {
  [playerId: string]: PlayerSessionState;
}

export interface SessionTransaction {
  playerId: string;
  playerName: string;
  amount: number;
  generalFines?: number;
  greenCards?: number;
  yellowCards?: number;
  redCards?: number;
  isDotd?: boolean;
  isMotm?: boolean;
  isU18?: boolean;
  tags: string[];
  isPaidOff?: boolean;
}

export interface SessionRecord {
  id: string;
  timestamp: number;
  opponent: string;
  type?: 'MATCH' | 'PAYMENT';
  theme?: string; // Theme of the week selected by MOM
  transactions: SessionTransaction[];
}

export enum ViewState {
  LEADERBOARD = 'LEADERBOARD',
  RULES = 'RULES',
  ADMIN_PANEL = 'ADMIN_PANEL',
  SESSION_SETUP = 'SESSION_SETUP',
  ACTIVE_SESSION = 'ACTIVE_SESSION'
}
