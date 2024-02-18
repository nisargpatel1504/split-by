import { findGroupById } from "../services/GroupService";
import { errorResponse } from "../utils/response";

const Group = require("../models/GroupModel"); // Adjust the path to your Group model

export const checkGroupExistence = async (req, res, next) => {
  const groupId = req.params.groupId; // Adjust depending on how you've defined the route parameter
  const { adminId } = req.body;
  console.log(adminId);
  try {
    const group = await findGroupById(groupId);
    if (adminId !== group.createdBy.toString()) {
      res.status(403).json({
        message: "User has no right to remove members from the group",
      });
      return;
    }
    if (!group) {
      return errorResponse(res, "Group not found", 404);
    }

    req.group = group;
    next();
  } catch (error) {
    console.error("Error checking group existence:", error);
    return errorResponse(res, "Failed to check group existence", 500);
  }
};
