import express from "express";
import {
  addMemberToGroup,
  createGroup,
  removeMemberFromGroup,
} from "../controllers/groupController";
const router = express.Router();

router.route("/").post(createGroup);

router.route("/:groupId/members").post(addMemberToGroup);
router.route("/removeMembers").delete(removeMemberFromGroup);

export default router;
