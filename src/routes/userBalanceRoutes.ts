import { isValidObjectId } from "mongoose";
import { getUserBalance } from "../controllers/userBalanceController";
import { validateInputs } from "../utils/validationInputs";
import express from "express";
const router = express.Router();
router
  .route("/:payerId")
  .get(validateInputs({ payerId: isValidObjectId }), getUserBalance);

export default router;
