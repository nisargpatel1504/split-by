import mongoose, { Types } from "mongoose";
import {
  findGroupById,
  findGroupByIdAndUpdate,
} from "../services/GroupService";
import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response";

import {
  findGroupBalanceById,
  updateGroupBalancesInBulk,
} from "../services/GroupBalanceService";
import {
  GroupExpenseRequest,
  GroupExpenseResponse,
} from "../interfaces/groupExpensesInterface";
import { ErrorResponse } from "../interfaces/commonInterface";
import redisClient from "../utils/redisClient";
import GroupBalance from "../models/GroupBalanceModel";
import { calculateUpdatedBalances } from "../utils/groupBalanceHelpers";
import { startTransaction } from "../utils/databaseHelper";
import { handleTransactionError } from "../utils/handleError";
// Define interfaces for better type checking and readability

export const addExpenseToGroupAndUpdateBalances = async (
  req: Request<{}, {}, GroupExpenseRequest>, // Using the defined interface for req.body
  res: Response<GroupExpenseResponse | ErrorResponse>
): Promise<void> => {
  // const { groupId, payerId, involvedMembers, amount } = req.body;
  const { payerId, groupId, amount, involvedMembers, category, description } =
    req.body;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const group = await findGroupById(groupId, session);
    if (!group) {
      throw new Error("Group not found");
    }

    // Validate that the payer and all involved members are part of the group
    const allMembersValid = [payerId, ...involvedMembers].every((memberId) =>
      group.members.map((member) => member.toString()).includes(memberId)
    );

    if (!allMembersValid) {
      throw new Error(
        "One or more involved members, including the payer, are not part of the group"
      );
    }

    // Calculate the amount each involved member owes
    const splitAmount = amount / involvedMembers.length;
    const updateForTotalExpense = { $inc: { totalExpenses: amount } };

    await findGroupByIdAndUpdate(groupId, updateForTotalExpense, session);
    // Update balances in bulk
    const userBalance = await updateGroupBalancesInBulk(
      involvedMembers,
      payerId,
      groupId,
      splitAmount,
      description,
      category,
      session
    );

    await session.commitTransaction();

    // Construct the success response details
    const responseDetails = {
      amount,
      groupId,
      payerId,
      involvedMembers,
      description,
      category,
    };

    const cacheKey: string = `userBalance:${payerId}`;
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(userBalance));

    return successResponse(res, responseDetails, "Expense Added Successfully");
  } catch (error) {
    // Handle all errors uniformly
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return errorResponse(res, error.message);
  } finally {
    // Ensure session is always ended
    session.endSession();
  }
};

export const getGroupUserBalance = async (
  req: Request,
  res: Response<GroupExpenseResponse | ErrorResponse>
): Promise<void> => {
  const { groupId } = req.params;

  // Try to fetch from cache first
  const cacheKey: string = `userBalance:${groupId}`;
  const cachedData: string | null = await redisClient.get(cacheKey);

  // If not in cache, fetch from database and cache the result
  try {
    const userBalance = await findGroupBalanceById(groupId, null);

    if (!userBalance) {
      return successResponse(res, "No details found");
    }

    return successResponse(res, userBalance, "Group Balance Data");
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const addGroupExpense = async (req: Request, res: Response) => {
  const { groupId, paidBy, amount, timestamp, participants } =
    req.body || req.params;
  const session = await startTransaction();
  try {
    let groupBalance = await GroupBalance.findOne({ group: groupId }).session(
      session
    );

    if (!groupBalance) {
      groupBalance = new GroupBalance({
        group: groupId,
        transactions: [],
        balances: [],
      });
    }

    groupBalance.transactions.push({ paidBy, amount, timestamp, participants });

    // Calculate each participant's share
    const share = amount / participants.length;

    // Calculate updated balances
    const updatedBalances = calculateUpdatedBalances(
      groupBalance.balances,
      new Types.ObjectId(paidBy),
      amount,
      participants.map((id) => new Types.ObjectId(id)),
      share
    );

    // Update the groupBalance with the new balances
    groupBalance.balances = updatedBalances;

    await groupBalance.save({ session });
    await session.commitTransaction();

    return successResponse(
      res,
      groupBalance,
      "Group expense added successfully"
    );
  } catch (error) {
    await handleTransactionError(session, res, "Failed to add group expense");
    return errorResponse(res, "Failed to add group expense", 500);
  } finally {
    session.endSession();
  }
};
