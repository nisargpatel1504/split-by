import express from "express";
import {
  addMemberToGroup,
  createGroup,
  removeMemberFromGroup,
} from "../controllers/groupController";
import { isNonEmptyString, validateInputs } from "../utils/validationInputs";
import { isValidObjectId } from "mongoose";
import { checkGroupExistence } from "../middleware/checkGroupExistence";
const router = express.Router();

router.route("/").post(
  validateInputs({
    name: isNonEmptyString,
    currentUserId: isValidObjectId,
  }),
  createGroup
);

router.route("/:groupId/members").post(
  validateInputs({
    newMemberId: isValidObjectId,
    adminId: isValidObjectId,
    groupId: isValidObjectId,
  }),
  addMemberToGroup
);
router.route("/removeMembers/:groupId").delete(
  checkGroupExistence,
  validateInputs({
    adminId: isValidObjectId,
    memberIdToRemove: isValidObjectId,
  }),

  removeMemberFromGroup
);

export default router;
