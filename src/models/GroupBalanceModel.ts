import mongoose, { Document, Schema, Model } from "mongoose";

interface ITransaction {
  paidBy: mongoose.Types.ObjectId;
  amount: number;
  timestamp: Date;
  participants: mongoose.Types.ObjectId[];
}

export interface IBalanceEntry {
  user: mongoose.Types.ObjectId;
  owesTo: {
    user: mongoose.Types.ObjectId;
    amount: number;
  }[];
}

export interface IGroupBalance extends Document {
  group: mongoose.Types.ObjectId;
  transactions: ITransaction[];
  balances: IBalanceEntry[];
}

// Define the Transaction schema
const transactionSchema = new Schema<ITransaction>({
  paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

// Define the Balance Entry schema
const balanceEntrySchema = new Schema<IBalanceEntry>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  owesTo: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      amount: { type: Number, required: true },
    },
  ],
});

// Define the Group Balance schema
const groupBalanceSchema = new Schema<IGroupBalance>({
  group: { type: Schema.Types.ObjectId, ref: "Group", required: true },
  transactions: [transactionSchema],
  balances: [balanceEntrySchema],
});

const GroupBalance: Model<IGroupBalance> = mongoose.model<IGroupBalance>(
  "GroupBalance",
  groupBalanceSchema
);
export default GroupBalance;
