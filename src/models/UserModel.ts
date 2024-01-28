import mongoose, { Model, Schema } from "mongoose";

interface UserDocument extends Document {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  groups: mongoose.Types.ObjectId[]; // This should match the type you've used in the schema
}

// Define the User model interface
interface UserModel extends Model<UserDocument> {}

const userSchema = new Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatarUrl: { type: String },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
});

// Create and export the User model
const User = mongoose.model<UserDocument, UserModel>("User", userSchema);

export default User;
