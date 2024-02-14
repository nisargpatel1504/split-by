import { Types } from "mongoose";
import { IBalanceEntry } from "../models/GroupBalanceModel";

// Helper function to safely convert string to ObjectId, with error handling
const toObjectId = (id: string | Types.ObjectId): Types.ObjectId => {
  if (Types.ObjectId.isValid(id)) {
    return typeof id === "string" ? new Types.ObjectId(id) : id;
  }
  // Log error or handle it according to your application's error handling policy
  console.error(`Invalid ObjectId: ${id}`);
  throw new Error(`Invalid ObjectId: ${id}`);
};

export const calculateUpdatedBalances = (
  currentBalances: IBalanceEntry[],
  paidBy: Types.ObjectId,
  amount: number,
  participants: Types.ObjectId[],
  share: number
): IBalanceEntry[] => {
  // Validate share to be a finite number
  if (!Number.isFinite(share) || share <= 0) {
    throw new Error(
      "Invalid share calculated. Share must be a finite number greater than 0."
    );
  }

  // Map through currentBalances to ensure ObjectId type and immutability
  const updatedBalances: IBalanceEntry[] = currentBalances.map((balance) => ({
    user: toObjectId(balance.user),
    owesTo: balance.owesTo.map((owes) => ({
      user: toObjectId(owes.user),
      amount: owes.amount,
    })),
  }));

  participants.forEach((participantId) => {
    // Skip the payer as they don't owe themselves
    if (participantId.equals(paidBy)) {
      return;
    }

    let balanceEntry = updatedBalances.find((balance) =>
      balance.user.equals(participantId)
    );

    if (!balanceEntry) {
      balanceEntry = { user: participantId, owesTo: [] };
      updatedBalances.push(balanceEntry);
    }

    let owesToEntry = balanceEntry.owesTo.find((owes) =>
      owes.user.equals(paidBy)
    );

    if (owesToEntry) {
      owesToEntry.amount -= share;
      // Adjust for negative balance, implying reversal of debt
      if (owesToEntry.amount > 0) {
        owesToEntry.user = participantId;
        owesToEntry.amount = -owesToEntry.amount;
      }
    } else {
      balanceEntry.owesTo.push({ user: paidBy, amount: -share });
    }
  });

  // Return the updated balances, ensuring no negative zeros
  return updatedBalances.map((balance) => ({
    ...balance,
    owesTo: balance.owesTo.map((owes) => ({
      ...owes,
      amount: owes.amount === 0 ? 0 : owes.amount, // Corrects -0 to 0
    })),
  }));
};
