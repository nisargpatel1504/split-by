import { Request, Response } from "express";
import Expense from "../models/ExpenseModel";
import UserBalance from "../models/BalanceModel"; // Assuming you have a model to track balances

export const createExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { payer, amount, participants, isPaidByUser } = req.body;

    if (isPaidByUser) {
      participants.push(payer);
    }
    console.log(participants.length);
    const splitAmount = amount / participants.length;
    console.log(splitAmount);
    const expense = new Expense({
      ...req.body,
    });
    await expense.save();

    const balanceUpdates = participants
      .filter((participantId: string) => participantId !== payer)
      .map((participantId: string) => ({
        updateOne: {
          filter: { user: participantId, owesTo: payer },
          update: { $inc: { amount: -splitAmount } },
          upsert: true,
        },
      }));
    console.log("balance updates", balanceUpdates);
    if (balanceUpdates.length > 0) {
      await UserBalance.bulkWrite(balanceUpdates);
    }

    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getExpenseById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const expense = await Expense.find({ payer: req.params.id });
    if (!expense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // First, find the expense to get its details before deletion
    const expenseID = req.params.id;
    if (!expenseID) res.status(500).json({ message: "Invalid Id" });
    const expense = await Expense.findById(req.params.id);
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
    console.log(JSON.stringify(balanceAdjustments));
    // Perform bulk update if there are balances to adjust
    if (balanceAdjustments.length > 0) {
      await UserBalance.bulkWrite(balanceAdjustments);
    }

    // After adjusting balances, delete the expense
    await Expense.findOneAndDelete({ _id: expenseID });

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ message: error.message });
  }
};
