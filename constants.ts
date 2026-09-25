export const FINE_AMOUNTS = {
  GENERAL_FINE: 0.25,        // 25p per general fine
  GENERAL_FINE_CAP: 2.50,    // General fines capped at £2.50
  GREEN_CARD: 2.00,          // £2.00
  YELLOW_CARD: 5.00,         // £5.00
  RED_CARD: 20.00,           // £20.00
  DOTD: 0.50,                // 50p Dick of the Day
  MOTM_DISCOUNT: 0.50,       // -50p Man of the Match off fines
  U18_DISCOUNT_RATE: 0.5,    // 1/2 price fines for U18s (50% off)
  ITEM_FINE: 1.00,           // £1.00 kit/item missing fine
};

export const BANKING_DETAILS = {
  accountName: "Michael Dicken",
  sortCode: "04-00-03",
  accountNumber: "76851045",
  reference: "DHC",
  bankName: "Duchy Bank",
  team: "Duchy HC — Men's 1s",
};

// Initial seed players if database is clean
export const INITIAL_PLAYERS = [
  { id: '1', name: 'Michael Dicken', totalOwed: 0, isU18: false },
  { id: '2', name: 'Will H', totalOwed: 2.50, isU18: false },
  { id: '3', name: 'Sammy T', totalOwed: 0, isU18: true },
  { id: '4', name: 'Harry B', totalOwed: 5.00, isU18: false },
  { id: '5', name: 'Alex M', totalOwed: 0, isU18: false },
];
