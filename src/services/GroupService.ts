import { ClientSession } from "mongodb";
import Group, { GroupDocument } from "../models/GroupModel";
import { query } from "express";

export const findGroupById = async (
  id: string,
  session?: ClientSession
): Promise<GroupDocument | null> => {
  try {
    const query = Group.findById(id);
    if (session) {
      query.session(session);
    }
    const group = await query;
    return group;
  } catch (error) {
    console.error("Error finding group by ID:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const findGroupByIdAndUpdate = async (
  groupId: string,
  newMemberId: string,
  session: ClientSession
): Promise<GroupDocument | null> => {
  try {
    const query = Group.findOneAndUpdate(
      { _id: groupId },
      { $addToSet: { members: newMemberId } },
      { new: true, session }
    );
    if (session) {
      query.session(session);
    }
    const group = await query;
    return group;
  } catch (error) {
    console.error("Error finding group by ID:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const findGroupByIdAndUpdateForDelete = async (
  groupId: string,
  memberIdToRemove: string,
  session: ClientSession
): Promise<GroupDocument | null> => {
  try {
    const query = Group.findOneAndUpdate(
      { _id: groupId },
      { $pull: { members: memberIdToRemove } },
      { new: true, session }
    );
    if (session) {
      query.session(session);
    }
    const group = await query;
    return group;
  } catch (error) {
    throw error; // Rethrow the error to be handled by the caller
  }
};
