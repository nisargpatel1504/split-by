import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response";

import { findOrCreateNetBalance } from "../utils/personalExpenseHelper";
import UserBalance from "../models/UserBalanceModel";

export const addPersonalExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { fromUserId, toUserId, amount, description } = req.body;
  // Start a session for transaction
  try {
    const users = [fromUserId, toUserId].sort();
    const netBalance = await findOrCreateNetBalance(users);

    const sharedAmount = amount / 2;
    netBalance.transactions.push({
      fromUser: fromUserId,
      toUser: toUserId,
      amount: amount,
      description,
      timestamp: new Date(),
    });

    netBalance.balance +=
      String(fromUserId) === String(users[0]) ? sharedAmount : -sharedAmount;
    await netBalance.save();

    return successResponse(res, netBalance, "Expense added successfully");
  } catch (error) {
    // Abort the transaction in case of an error
    return errorResponse(res, "Error in adding expenses");
  }
};
interface BalanceSummary {
  [otherUserId: string]: {
    owes: number;
    owed: number;
  };
}

interface BalanceEntry {
  otherUserId: string;
  owes: number;
  owed: number;
}

export const getPersonalExpensesByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.params.userId;

  try {
    const balances = await UserBalance.find({ users: userId });

    // Use the BalanceSummary interface for the accumulator
    const summary: BalanceSummary = balances.reduce(
      (acc: BalanceSummary, balance) => {
        const otherUserId = balance.users
          .find((id) => id.toString() !== userId)
          .toString(); // Ensure toString() for comparison
        const userIndex = balance.users
          .map((id) => id.toString())
          .indexOf(userId); // Convert ObjectIds to strings
        const balanceAmount =
          userIndex === 0 ? balance.balance : -balance.balance;

        acc[otherUserId] = acc[otherUserId] || { owes: 0, owed: 0 }; // Initialize if not already present

        if (balanceAmount > 0) {
          acc[otherUserId].owed += balanceAmount;
        } else if (balanceAmount < 0) {
          acc[otherUserId].owes += Math.abs(balanceAmount);
        }

        return acc;
      },
      {}
    );

    // Convert the summary object into an array of BalanceEntry
    const balanceSummary: BalanceEntry[] = Object.entries(summary).map(
      ([otherUserId, { owes, owed }]) => ({
        otherUserId,
        owes,
        owed,
      })
    );

    successResponse(res, balanceSummary);
  } catch (error) {
    console.error("Failed to fetch personal expenses:", error);
    res.status(500).json({ message: "Failed to fetch personal expenses" });
  }
};
