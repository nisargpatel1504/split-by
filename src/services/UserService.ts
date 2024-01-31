import { ClientSession } from "mongoose";
import Group from "../models/GroupModel";
import User from "../models/UserModel";

// src/services/userService.ts
export const findUserById = async (userId: string) => {
  return await User.findById(userId);
};

export const findUserByIdAndUpdate = async (
  userId,
  groupId,
  session: ClientSession
) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      { $addToSet: { groups: groupId } },
      { session, new: true }
    );

    return updatedUser;
  } catch (error) {
    console.error("Error adding user to group:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const findUserByIdAndDeleteGroupId = async (
  userId,
  groupId,
  session: ClientSession
) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      { $pull: { groups: groupId } },
      { session, new: true }
    );

    return updatedUser;
  } catch (error) {
    console.error("Error adding user to group:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};
