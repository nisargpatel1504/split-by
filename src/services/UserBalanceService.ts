import mongoose, { ClientSession } from "mongoose";
import UserBalance from "../models/UserBalanceModel"; // Ensure this path is correct

/**
 * Updates user balances in bulk within a group and fetches the updated balances.
 *
 * @param {string[]} involvedMembers - Array of member IDs involved in the transaction.
 * @param {string} payerId - ID of the member who paid.
 * @param {string} groupId - ID of the group where the transaction occurred.
 * @param {number} splitAmount - The amount to be split among the involved members.
 * @param {mongoose.ClientSession} session - Mongoose transaction session.
 * @returns {Promise<Document[]>} - The updated user balance documents.
 */
export const updateBalancesInBulk = async (
  involvedMembers,
  payerId,
  groupId,
  splitAmount,
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
    await UserBalance.bulkWrite(balanceUpdates, { session });
  }

  // Fetch the updated balances for involved members excluding the payer
  const updatedBalances = await UserBalance.find({
    user: { $in: involvedMembers.filter((memberId) => memberId !== payerId) },
    group: groupId,
  }).session(session);

  return updatedBalances;
};

export const findUserBalanceByPayerId = async (
  payerId: string,
  session: ClientSession
) => {
  try {
    const query = UserBalance.find({ user: payerId });
    if (session) {
      query.session(session);
    }
    const userBalance = await query;
    return userBalance;
  } catch (error) {
    console.error("Error finding group by ID:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};
