import mongoose from "mongoose";
import { findGroupById } from "../services/GroupService";
import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response";
import { updateBalancesInBulk } from "../services/UserBalanceService";
import {
  GroupExpenseRequest,
  GroupExpenseResponse,
} from "../interfaces/groupExpensesInterface";
import { ErrorResponse } from "../interfaces/commonInterface";
// Define interfaces for better type checking and readability

export const addExpenseToGroupAndUpdateBalances = async (
  req: Request<{}, {}, GroupExpenseRequest>, // Using the defined interface for req.body
  res: Response<GroupExpenseResponse | ErrorResponse>
): Promise<void> => {
  const { groupId, payerId, involvedMembers, amount } = req.body;

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

    // Update balances in bulk
    await updateBalancesInBulk(
      involvedMembers,
      payerId,
      groupId,
      splitAmount,
      session
    );

    await session.commitTransaction();

    // Construct the success response details
    const responseDetails = { amount, groupId, payerId, involvedMembers };
    successResponse(res, {
      message: "Expense Added Successfully",
      details: responseDetails,
    });
  } catch (error) {
    // Handle all errors uniformly
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    errorResponse(res, error.message);
  } finally {
    // Ensure session is always ended
    session.endSession();
  }
};
