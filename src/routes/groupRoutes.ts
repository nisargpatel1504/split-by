import express from "express";
import { addUserToGroups } from "../controllers/groupController";
const router = express.Router();

router.route("/").post(addUserToGroups);

export default router;
