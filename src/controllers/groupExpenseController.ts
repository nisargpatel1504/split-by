import mongoose from "mongoose";
import UserBalance from "../models/BalanceModel";
import { findGroupById } from "../services/GroupService";
import { findUserByIdAndUpdate } from "../services/UserService";

export async function addExpenseToGroupAndUpdateBalances(
  groupId,
  payerId,
  amount,
  involvedMembers
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const group = await findGroupById(groupId, session);
    if (!group.members.includes(payerId)) {
      throw new Error("Payer is not a member of the group");
    }
    if (!group.members.includes(involvedMembers)) {
      throw new Error("Involved members are not a member of the group");
    }
    // Calculate split amount
    const splitAmount = amount / involvedMembers.length;

    // Prepare balance updates
    const balanceUpdates = involvedMembers
      .map((memberId: string) => {
        if (memberId !== payerId) {
          return {
            updateOne: {
              filter: { user: memberId, owesTo: payerId, groupId },
              update: { $inc: { amount: -splitAmount } },
              upsert: true,
            },
          };
        }
      })
      .filter(Boolean); // Remove non-updates

    // Bulk update balances
    if (balanceUpdates.length > 0) {
      await UserBalance.bulkWrite(balanceUpdates, { session });
    }

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
