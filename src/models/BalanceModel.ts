import mongoose, { Document, Schema } from "mongoose";

interface IBalance extends Document {
  user: mongoose.Schema.Types.ObjectId;
  amount: number; // Positive if the user is owed money, negative if they owe money
  group: mongoose.Schema.Types.ObjectId; // The group or context in which this balance applies
}

const balanceSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
});

const Balance = mongoose.model<IBalance>("Balance", balanceSchema);

export default Balance;
