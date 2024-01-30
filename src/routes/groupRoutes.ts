import express from "express";
import {
  addMemberToGroup,
  createGroup,
  removeMemberFromGroup,
} from "../controllers/groupController";
import { isNonEmptyString, validateInputs } from "../utils/validationInputs";
import { isValidObjectId } from "mongoose";
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
router.route("/removeMembers").delete(
  validateInputs({
    groupId: isValidObjectId,
    adminId: isValidObjectId,
    memberIdToRemove: isValidObjectId,
  }),
  removeMemberFromGroup
);

export default router;
