import express from "express";
import { login } from "../controllers/login";

const router = express.Router();

router.route("/").get(login);

export default router;
