import mongoose from "mongoose";
import Group from "../models/GroupModel";
import { Request, Response } from "express";

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
    const { name, currentUserId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(currentUserId) || !name.toString()) {
      res.status(400).json({ message: "Invalid input data" });
      return;
    }

    const group = new Group({
      name,
      createdBy: currentUserId,
      members: [currentUserId], // Initially, the creator is the only member
    });

    await group.save();
    const response: GroupResponse = {
      id: group._id.toString(), // Convert ObjectId to string
      name: group.name,
      createdBy: group.createdBy.toString(), // Convert ObjectId to string
      members: group.members.map((member) => member.toString()), // Assuming members are ObjectIds
    };

    res.status(201).json(response);
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

  // Validate inputs
  if (
    !mongoose.Types.ObjectId.isValid(groupId) ||
    !mongoose.Types.ObjectId.isValid(newMemberId) ||
    !mongoose.Types.ObjectId.isValid(adminId)
  ) {
    res.status(400).json({ message: "Invalid input data" });
    return;
  }

  try {
    const session = await mongoose.startSession(); // Start a session for transaction
    session.startTransaction();

    const group = await Group.findById(groupId).session(session);

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

    const updatedGroup = await Group.findOneAndUpdate(
      { _id: groupId },
      { $addToSet: { members: newMemberId } },
      { new: true, session }
    );

    if (!updatedGroup) {
      await session.abortTransaction();
      throw new Error("Failed to add member to the group");
    }

    await session.commitTransaction(); // Commit the transaction

    const response: GroupResponse = {
      id: updatedGroup._id.toString(),
      name: updatedGroup.name,
      createdBy: updatedGroup.createdBy.toString(),
      members: updatedGroup.members.map((member) => member.toString()),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(
      "An error occurred while adding a member to the group:",
      error
    ); // Logging the error
    res.status(500).json({
      message: "An error occurred while adding a member to the group.",
    });
  }
};

export const removeMemberFromGroup = async (
  req: Request,
  res: Response<GroupResponse | ErrorResponse>
): Promise<void> => {
  const { groupId, memberIdToRemove, adminId } = req.body;
  let session: mongoose.mongo.ClientSession;
  // Validate inputs
  if (
    !mongoose.Types.ObjectId.isValid(groupId) ||
    !mongoose.Types.ObjectId.isValid(memberIdToRemove) ||
    !mongoose.Types.ObjectId.isValid(adminId)
  ) {
    res.status(400).json({ message: "Invalid input data" });
    return;
  }

  try {
    session = await mongoose.startSession(); // Start a session for transaction
    session.startTransaction();

    // Check for group existence and admin rights before attempting to remove a member
    const groupCheck = await Group.findById(groupId, null, { session });
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

    // Using findOneAndUpdate with $pull to ensure atomicity and avoid race conditions, and returning the updated document
    const updatedGroup = await Group.findOneAndUpdate(
      { _id: groupId },
      { $pull: { members: memberIdToRemove } },
      { new: true, session }
    );

    if (!updatedGroup) {
      await session.abortTransaction();
      throw new Error("Failed to remove member from the group");
    }

    await session.commitTransaction(); // Commit the transaction

    const response: GroupResponse = {
      id: updatedGroup._id.toString(),
      name: updatedGroup.name,
      createdBy: updatedGroup.createdBy.toString(),
      members: updatedGroup.members.map((member) => member.toString()),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(
      "An error occurred while removing a member from the group:",
      error
    ); // Logging the error
    res.status(500).json({
      message: "An error occurred while removing a member from the group.",
    });
  } finally {
    await session.endSession(); // Always end the session
  }
};
