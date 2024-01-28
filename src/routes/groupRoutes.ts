import express from "express";
const { addUserToGroups } = require("../controllers/groups");
const router = express.Router();

router.route("/").post(addUserToGroups);

export default router;
