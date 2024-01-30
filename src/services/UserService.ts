import Group from "../models/GroupModel";
import User from "../models/UserModel";

// src/services/userService.ts
export const findUserById = async (userId: string) => {
  return await User.findById(userId);
};
