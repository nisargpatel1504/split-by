import mongoose from "mongoose";
import Group from "../models/GroupModel";
import { Request, Response } from "express";
import {
  findGroupById,
  findGroupByIdAndUpdate,
  findGroupByIdAndUpdateForDelete,
} from "../services/GroupService";
import { formatGroupResponse } from "../utils/responseFormatter";
import { errorResponse, successResponse } from "../utils/response";
import {
  findUserByIdAndDeleteGroupId,
  findUserByIdAndUpdate,
} from "../services/UserService";

interface CreateGroupRequest {
  name: string;
  currentUserId: string; // Assuming the ID is a string, adjust if necessary
}
interface ErrorResponse {
  message: string;
}
// If you have a specific structure for the group response, define it as well
interface GroupResponse {
  id: string;
  name: string;
  createdBy: string;
  members: string[];
}

export const createGroup = async (
  req: Request<{}, {}, CreateGroupRequest>, // {} for Params and Query types if not used, then your request body type
  res: Response<GroupResponse | ErrorResponse>
): Promise<void> => {
  try {
    const session = await mongoose.startSession(); // Start a session for transaction
    session.startTransaction();
    const { name, currentUserId } = req.body;

    const group = new Group({
      name,
      createdBy: currentUserId,
      members: [currentUserId], // Initially, the creator is the only member
    });

    await group.save();
    const response: GroupResponse = formatGroupResponse(group);
    const updatedUser = await findUserByIdAndUpdate(
      currentUserId,
      group.id,
      session
    );
    if (!updatedUser) {
      await session.abortTransaction();
      session.endSession();
      throw new Error("Failed to add group to user's profile");
    }
    await session.commitTransaction();

    successResponse(res, response, "Group Created Successfully");
  } catch (error) {
    res.status(400).json({
      message: "An error occurred while creating the group: " + error.message,
    });
  }
};

export const addMemberToGroup = async (
  req: Request,
  res: Response<GroupResponse | ErrorResponse>
): Promise<void> => {
  const { newMemberId, adminId } = req.body;
  const { groupId } = req.params;

  try {
    const session = await mongoose.startSession(); // Start a session for transaction
    session.startTransaction();

    const group = await findGroupById(groupId, session);

    if (!group) {
      await session.abortTransaction();
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (adminId !== group.createdBy.toString()) {
      await session.abortTransaction();
      res
        .status(403)
        .json({ message: "User has no right to add members to the group" });
      return;
    }

    if (group.members.includes(newMemberId)) {
      await session.abortTransaction();
      res.status(400).json({ message: "Member is already in the group" });
      return;
    }

    const updatedGroup = await findGroupByIdAndUpdate(
      groupId,
      newMemberId,
      session
    );

    if (!updatedGroup) {
      await session.abortTransaction();
      throw new Error("Failed to add member to the group");
    }
    const updatedUser = await findUserByIdAndUpdate(
      newMemberId,
      groupId,
      session
    );
    if (!updatedUser) {
      await session.abortTransaction();
      session.endSession();
      throw new Error("Failed to add group to user's profile");
    }

    await session.commitTransaction(); // Commit the transaction
    const response: GroupResponse = formatGroupResponse(updatedGroup);
    successResponse(res, response, "Member added successfully");
  } catch (error) {
    console.error(
      "An error occurred while adding a member to the group:",
      error
    ); // Logging the error
    errorResponse(
      res,
      "An error occurred while adding a member to the group.",
      500
    );
  }
};

export const removeMemberFromGroup = async (
  req: Request,
  res: Response<GroupResponse | ErrorResponse>
): Promise<void> => {
  const { groupId, memberIdToRemove, adminId } = req.body;
  let session: mongoose.mongo.ClientSession;

  try {
    session = await mongoose.startSession(); // Start a session for transaction
    session.startTransaction();

    // Check for group existence and admin rights before attempting to remove a member
    const groupCheck = await findGroupById(groupId, session);
    if (!groupCheck) {
      await session.abortTransaction();
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (adminId !== groupCheck.createdBy.toString()) {
      await session.abortTransaction();
      res.status(403).json({
        message: "User has no right to remove members from the group",
      });
      return;
    }
    if (!groupCheck.members.includes(memberIdToRemove)) {
      await session.abortTransaction();
      res.status(404).json({ message: "Member not found" });
      return;
    }
    // Using findOneAndUpdate with $pull to ensure atomicity and avoid race conditions, and returning the updated document

    const updatedGroup = await findGroupByIdAndUpdateForDelete(
      groupId,
      memberIdToRemove,
      session
    );

    if (!updatedGroup) {
      await session.abortTransaction();
      throw new Error("Failed to remove member from the group");
    }
    const updatedUser = await findUserByIdAndDeleteGroupId(
      memberIdToRemove,
      groupId,
      session
    );
    if (!updatedUser) {
      await session.abortTransaction();
      session.endSession();
      throw new Error("Failed to remove group to user's profile");
    }

    await session.commitTransaction(); // Commit the transaction

    const response: GroupResponse = formatGroupResponse(updatedGroup);
    successResponse(res, response, "Member removed successfully");
  } catch (error) {
    errorResponse(
      res,
      "An error occurred while removing a member from the group.",
      500
    );
  } finally {
    await session.endSession(); // Always end the session
  }
};
