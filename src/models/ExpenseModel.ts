import mongoose, { Document, Schema } from "mongoose";

interface IExpense extends Document {
  amount: number;
  description: string;
  category: string;
  date: Date;
  payer: mongoose.Schema.Types.ObjectId;
  participants: mongoose.Schema.Types.ObjectId[];
}

const expenseSchema: Schema = new Schema({
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  payer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Expense = mongoose.model<IExpense>("Expense", expenseSchema);

export default Expense;
