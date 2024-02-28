export interface BalanceSummary {
  [otherUserId: string]: {
    owes: number;
    owed: number;
  };
}

export interface BalanceEntry {
  otherUserId: string;
  userDetails?: { name: string; email?: string }; // Optional user details
  owes: number;
  owed: number;
}
