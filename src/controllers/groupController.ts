import mongoose from "mongoose";
import Group from "../models/GroupModel";
import User from "../models/UserModel";
import { Request, Response } from "express";

export const addUserToGroups = async (req: Request, res: Response) => {
  const { userId, name } = req.body as { userId: string; name: string };

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const group = new Group({
      name,
      createdBy: userId,
      members: [userId],
    });

    await group.save();
    user.groups.push(group._id as mongoose.Types.ObjectId);
    await user.save();

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
