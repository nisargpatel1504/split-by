import { Request, Response, response } from "express";
import Expense from "../models/ExpenseModel";
import UserBalance from "../models/UserBalanceModel"; // Assuming you have a model to track balances
import {
  findExpenseById,
  findExpenseByIdAndDelete,
} from "../services/ExpenseService";
import { errorResponse, successResponse } from "../utils/response";
import mongoose from "mongoose";

const adjustUserBalance = async (
  userId: string,
  owesToId: string,
  amount: number,
  session: mongoose.ClientSession
) => {
  let userOwesToBalance = await UserBalance.findOne({
    user: userId,
    owesTo: owesToId,
  }).session(session);

  let owesToUserBalance = await UserBalance.findOne({
    user: owesToId,
    owesTo: userId,
  }).session(session);

  // Calculate the net balance considering both directions and the new transaction amount
  let netAmount =
    (userOwesToBalance ? userOwesToBalance.amount : 0) +
    (owesToUserBalance ? -owesToUserBalance.amount : 0) +
    amount;

  // Decide the direction of the net balance
  if (netAmount < 0) {
    // User owes to owesToId
    if (!userOwesToBalance) {
      // Create a new balance if it doesn't exist
      userOwesToBalance = new UserBalance({
        user: userId,
        owesTo: owesToId,
        amount: netAmount,
      });
      await userOwesToBalance.save({ session });
    } else {
      // Update the existing balance
      userOwesToBalance.amount = netAmount;
      await userOwesToBalance.save({ session });
    }
    // Delete the reverse balance if it exists, as it's settled by this transaction
    if (owesToUserBalance) {
      await owesToUserBalance.deleteOne({ session });
    }
  } else if (netAmount > 0) {
    // owesToId owes to User
    if (!owesToUserBalance) {
      // Create a new balance in the reverse direction if it doesn't exist
      owesToUserBalance = new UserBalance({
        user: owesToId,
        owesTo: userId,
        amount: netAmount,
      });
      await owesToUserBalance.save({ session });
    } else {
      // Update the existing reverse balance
      owesToUserBalance.amount = netAmount;
      await owesToUserBalance.save({ session });
    }
    // Delete the original balance if it exists, as it's settled by this transaction
    if (userOwesToBalance) {
      await userOwesToBalance.deleteOne({ session });
    }
  } else {
    // Balances are settled
    if (userOwesToBalance) {
      await userOwesToBalance.deleteOne({ session });
    }
    if (owesToUserBalance) {
      await owesToUserBalance.deleteOne({ session });
    }
  }
};
export const createPersonalExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { payer, amount, participants, isPaidByUser, category, description } =
      req.body;

    const splitAmount = isPaidByUser ? amount / 2 : amount;

    const expense = new Expense({
      payer,
      amount,
      participants,
      category,
      description,
    });
    await expense.save({ session });

    // Adjust user balances
    const amountToAdjust = -splitAmount; // The participant owes this amount to the payer
    await adjustUserBalance(participants, payer, amountToAdjust, session);

    await session.commitTransaction();
    successResponse(res, expense, "Expense created successfully");
  } catch (error) {
    await session.abortTransaction();
    errorResponse(res, error.message);
  } finally {
    session.endSession();
  }
};
export const getPersonalExpenseById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const expense = await findExpenseById(req.params.id);
    if (!expense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePersonalExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // First, find the expense to get its details before deletion
    const expenseID = req.params.id;
    if (!expenseID) res.status(500).json({ message: "Invalid Id" });
    const expense = await findExpenseById(req.params.id);
    if (!expense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    // Calculate the split amount based on the expense details
    const splitAmount = expense.amount / expense.participants.length;

    // Prepare bulk operations to adjust balances
    const balanceAdjustments = expense.participants
      .map((participantId) => {
        if (participantId !== expense.payer) {
          // For participants, decrease their debt to the payer
          return {
            updateOne: {
              filter: { user: participantId, owesTo: expense.payer },
              update: { $inc: { amount: splitAmount } }, // Increase balance since the debt is removed
            },
          };
        } else {
          // No operation needed for the payer in this context
          return null;
        }
      })
      .filter((op) => op !== null); // Remove null operations

    // Perform bulk update if there are balances to adjust
    if (balanceAdjustments.length > 0) {
      await UserBalance.bulkWrite(balanceAdjustments);
    }

    // After adjusting balances, delete the expense
    await findExpenseByIdAndDelete(expenseID);
    successResponse(res, null, "Expense deleted successfully");
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ message: error.message });
  }
};
