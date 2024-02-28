import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response";

import { findOrCreateNetBalance } from "../utils/personalExpenseHelper";
import UserBalance from "../models/UserBalanceModel";
import User from "../models/UserModel";
import {
  BalanceSummary,
  BalanceEntry,
} from "../interfaces/personalExpenseInterface";

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

export const getPersonalExpensesByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.params.userId;

  try {
    const balances = await UserBalance.find({ users: userId });

    // First, create the summary object
    const summary: BalanceSummary = balances.reduce(
      (acc: BalanceSummary, balance) => {
        const otherUserId = balance.users
          .find((id) => id.toString() !== userId)
          .toString();
        const balanceAmount =
          balance.users[0].toString() === userId
            ? balance.balance
            : -balance.balance;
        acc[otherUserId] = acc[otherUserId] || { owes: 0, owed: 0 };
        if (balanceAmount > 0) {
          acc[otherUserId].owed += balanceAmount;
        } else {
          acc[otherUserId].owes += Math.abs(balanceAmount);
        }
        return acc;
      },
      {}
    );

    // Then, enhance the summary with user details
    const balanceEntries: Promise<BalanceEntry>[] = Object.keys(summary).map(
      async (otherUserId) => {
        const user = await User.findById(userId)
          .select("+name +email +avatarUrl") // Include fields if they were excluded by default
          .populate("groups");
        console.log(user);
        const { owes, owed } = summary[otherUserId];
        return {
          otherUserId,
          userDetails: user
            ? { name: user.name, email: user.email }
            : undefined,
          owes,
          owed,
        };
      }
    );

    // Resolve all promises to get the final array of balance entries
    const resolvedBalanceEntries = await Promise.all(balanceEntries);

    return successResponse(
      res,
      resolvedBalanceEntries,
      "Fetched personal expenses"
    );
  } catch (error) {
    console.error("Failed to fetch personal expenses:", error);
    return errorResponse(res, "Failed to fetch personal expenses", 500);
  }
};
