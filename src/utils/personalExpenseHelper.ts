import mongoose from "mongoose";
import UserBalance from "../models/UserBalanceModel";
import User from "../models/UserModel";
import { BalanceEntry } from "../interfaces/personalExpenseInterface";

export async function findOrCreateNetBalance(users) {
  let netBalance = await UserBalance.findOne({
    users: { $all: users },
  });
  if (!netBalance) {
    netBalance = new UserBalance({ users, balance: 0, transactions: [] });
  }
  return netBalance;
}

// export function createBalanceSummary(
//   userId: string,
//   balances: (typeof UserBalance)[]
// ) {
//   return balances.reduce((acc, balance) => {
//     const otherUserId = balance.users
//       .find((id) => id.toString() !== userId)
//       .toString();
//     const balanceAmount =
//       balance.users[0].toString() === userId
//         ? balance.balance
//         : -balance.balance;
//     acc[otherUserId] = acc[otherUserId] || { owes: 0, owed: 0 };
//     acc[otherUserId].owed += Math.max(balanceAmount, 0);
//     acc[otherUserId].owes += Math.max(-balanceAmount, 0);
//     return acc;
//   }, {});
// }

// export async function fetchUserDetailsForSummary(
//   summary: ReturnType<typeof createBalanceSummary>
// ) {
//   const otherUserIds = Object.keys(summary).map(
//     (id) => new mongoose.Types.ObjectId(id)
//   );
//   return User.find({ _id: { $in: otherUserIds } })
//     .select("name email avatarUrl")
//     .populate("groups")
//     .exec();
// }
// export function mapUserDetailsToBalanceEntries(
//   users: (typeof User)[],
//   summary: ReturnType<typeof createBalanceSummary>
// ) {
//   return Object.entries(summary).map(([otherUserId, { owes, owed }]) => {
//     const userDetails = users.find(
//       (user) => (user as any)._id.toString() === otherUserId
//     );
//     return {
//       otherUserId,
//       userDetails: userDetails
//         ? { name: userDetails.name, email: userDetails.email }
//         : undefined,
//       owes,
//       owed,
//     };
//   });
// }
