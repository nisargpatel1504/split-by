import UserBalance from "../models/UserBalanceModel";

export async function findOrCreateNetBalance(users) {
  let netBalance = await UserBalance.findOne({
    users: { $all: users },
  });
  if (!netBalance) {
    netBalance = new UserBalance({ users, balance: 0, transactions: [] });
  }
  return netBalance;
}
