const mongoose = require("mongoose");

const userBalanceSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of 2 user IDs
  balance: { type: Number, default: 0 }, // Positive if the first user in the array owes money to the second, negative otherwise
  transactions: [
    {
      fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      amount: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now },
      description: { type: String, default: "" },
    },
  ],
});
userBalanceSchema.index({ users: 1 });
const UserBalance = mongoose.model("UserBalance", userBalanceSchema);

export default UserBalance;
