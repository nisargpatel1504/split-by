import mongoose, { Model, Schema } from "mongoose";

export interface GroupDocument extends Document {
  name: string;
  createdBy: mongoose.Schema.Types.ObjectId;
  members: mongoose.Schema.Types.ObjectId[];
  createdAt?: Date;
}

// Define the User model interface
interface GroupModel extends Model<GroupDocument> {}

const groupSchema = new Schema({
  name: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

const Group = mongoose.model<GroupDocument, GroupModel>("Group", groupSchema);

export default Group;
