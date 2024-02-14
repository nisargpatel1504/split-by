import { ClientSession } from "mongoose";
import GroupBalance from "../models/GroupBalanceModel";

export const updateGroupBalancesInBulk = async (
  involvedMembers,
  payerId,
  groupId,
  splitAmount,
  category,
  description,
  session
) => {
  // Prepare the operations for bulkWrite, excluding the payer from the operations
  const balanceUpdates = involvedMembers.reduce((ops, memberId) => {
    if (memberId !== payerId) {
      ops.push({
        updateOne: {
          filter: { user: memberId, owesTo: payerId, group: groupId },
          update: { $inc: { amount: -splitAmount } },
          upsert: true,
        },
      });
    }
    return ops;
  }, []);

  // Execute bulk update if there are operations to perform
  if (balanceUpdates.length > 0) {
    await GroupBalance.bulkWrite(balanceUpdates, { session });
  }

  // Fetch the updated balances for involved members excluding the payer
  const updatedBalances = await GroupBalance.find({
    user: { $in: involvedMembers.filter((memberId) => memberId !== payerId) },
    group: groupId,
    category,
    description,
  }).session(session);

  return updatedBalances;
};

export const findGroupBalanceById = async (
  groupId: string,
  session: ClientSession
) => {
  try {
    const query = GroupBalance.find({ group: groupId });
    if (session) {
      query.session(session);
    }
    const groupBalance = await query;
    return groupBalance;
  } catch (error) {
    console.error("Error finding group by ID:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};
