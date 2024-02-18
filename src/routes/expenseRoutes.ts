import express from "express";
import {
  addPersonalExpense,
  getPersonalExpensesByUserId,
} from "../controllers/personalExpenseController";
const router = express.Router();
import {
  validateInputs,
  isValidObjectId,
  isNonEmptyString,
  isNonEmptyNumber,
  isBoolean,
  areValidObjectIds,
} from "../utils/validationInputs";

router.route("/").post(
  validateInputs({
    fromUserId: isValidObjectId,
    toUserId: isValidObjectId,
    amount: isNonEmptyNumber,
    description: isNonEmptyString,
  }),
  addPersonalExpense
);

router.route("/:userId").get(getPersonalExpensesByUserId);

export default router;
